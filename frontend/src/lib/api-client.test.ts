import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import {
  apiClient,
  ApiError,
  MAX_UPLOAD_BYTES,
  validateUploadFiles,
} from "@/lib/api-client";
import { publicEnv } from "@/lib/env";
import { server } from "@/test/msw/server";

const base = publicEnv.apiBaseUrl.replace(/\/$/, "");

function makeFile(name: string, type: string, size: number): File {
  return new File([new Uint8Array(size)], name, { type });
}

describe("apiClient.startVerification", () => {
  it("forwards X-API-Key and returns the verification id", async () => {
    let observedKey: string | null = null;
    server.use(
      http.post(`${base}/api/v1/verifications/start`, ({ request }) => {
        observedKey = request.headers.get("X-API-Key");
        return HttpResponse.json({
          verification_id: "abc",
          status: "pending_upload",
        });
      }),
    );
    const result = await apiClient.startVerification(
      {
        external_user_id: "user_1",
        workflow_id: "00000000-0000-0000-0000-000000000001",
      },
      "live_test_key",
    );
    expect(result.verification_id).toBe("abc");
    expect(observedKey).toBe("live_test_key");
  });
});

describe("apiClient.getVerification", () => {
  it("returns the verification detail", async () => {
    const result = await apiClient.getVerification(
      "00000000-0000-0000-0000-000000000001",
      "live_test_key",
    );
    expect(result.status).toBe("processing");
    expect(result.risk_score).toBe(15);
  });

  it("throws ApiError on 404", async () => {
    server.use(
      http.get(`${base}/api/v1/verifications/:id`, () =>
        HttpResponse.json({ detail: "Not found" }, { status: 404 }),
      ),
    );
    await expect(apiClient.getVerification("missing", "k")).rejects.toBeInstanceOf(
      ApiError,
    );
  });
});

describe("validateUploadFiles", () => {
  it("accepts a valid selfie + id_front", () => {
    expect(() =>
      validateUploadFiles({
        selfie: makeFile("selfie.jpg", "image/jpeg", 1024),
        idFront: makeFile("id.jpg", "image/jpeg", 2048),
      }),
    ).not.toThrow();
  });

  it("rejects oversized, wrong MIME, and empty files", () => {
    const cases = [
      makeFile("big.jpg", "image/jpeg", MAX_UPLOAD_BYTES + 1),
      makeFile("selfie.pdf", "application/pdf", 1024),
      makeFile("selfie.jpg", "image/jpeg", 0),
    ];
    for (const file of cases) {
      expect(() =>
        validateUploadFiles({
          selfie: file,
          idFront: makeFile("id.jpg", "image/jpeg", 1024),
        }),
      ).toThrow(ApiError);
    }
  });
});

describe("apiClient.uploadVerificationFiles", () => {
  it("sends multipart/form-data with a body", async () => {
    let capturedContentType: string | null = null;
    server.use(
      http.post(`${base}/api/v1/verifications/:id/upload`, ({ request }) => {
        capturedContentType = request.headers.get("Content-Type");
        return HttpResponse.json({
          verification_id: "abc",
          status: "processing",
        });
      }),
    );
    await apiClient.uploadVerificationFiles(
      "abc",
      {
        selfie: makeFile("s.jpg", "image/jpeg", 100),
        idFront: makeFile("f.jpg", "image/jpeg", 200),
        idBack: makeFile("b.jpg", "image/png", 300),
      },
      "live_key",
    );
    expect(capturedContentType).toMatch(/multipart\/form-data/);
  });

  it("rejects before hitting the network on invalid files", async () => {
    await expect(
      apiClient.uploadVerificationFiles(
        "abc",
        {
          selfie: makeFile("selfie.pdf", "application/pdf", 1024),
          idFront: makeFile("id.jpg", "image/jpeg", 1024),
        },
        "live_key",
      ),
    ).rejects.toBeInstanceOf(ApiError);
  });
});