import { http, HttpResponse } from "msw";
import { publicEnv } from "@/lib/env";

const base = publicEnv.apiBaseUrl.replace(/\/$/, "");

export const handlers = [
  http.get(`${base}/api/v1/health`, () =>
    HttpResponse.json({ status: "ok", version: "test" }),
  ),

  http.post(`${base}/api/v1/verifications/start`, () =>
    HttpResponse.json({
      verification_id: "00000000-0000-0000-0000-000000000001",
      status: "pending_upload",
    }),
  ),

  http.get(
    `${base}/api/v1/verifications/:verificationId`,
    ({ params, request }) => {
      const url = new URL(request.url);
      const status = url.searchParams.get("status") ?? "processing";
      return HttpResponse.json({
        verification_id: params.verificationId,
        external_user_id: "user_123",
        metadata: {},
        status,
        checks: {
          ocr: { status: "pass", score: 0.92, detail: { name: "John Doe" } },
          face_match: { status: "pass", score: 0.68 },
          liveness: { status: "pass", score: 0.88 },
          duplicate: {
            status: "pass",
            duplicate_found: false,
            matched_external_user_id: null,
            similarity: null,
          },
          age: { status: "pass", age: 29, is_adult: true },
        },
        risk_score: 15,
        decision_reason: "All checks passed",
        created_at: "2026-06-23T10:00:00Z",
        updated_at: "2026-06-23T10:00:30Z",
      });
    },
  ),

  http.post(
    `${base}/api/v1/verifications/:verificationId/upload`,
    () =>
      HttpResponse.json({
        verification_id: "00000000-0000-0000-0000-000000000001",
        status: "processing",
      }),
    { once: false },
  ),
];
