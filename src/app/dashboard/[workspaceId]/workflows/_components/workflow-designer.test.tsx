import { http, HttpResponse } from "msw";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WorkflowDesigner } from "./workflow-designer";
import { server } from "@/test/msw/server";

vi.mock("@/components/dashboard/app-shell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderDesigner() {
  const client = makeQueryClient();
  return render(
    <QueryClientProvider client={client}>
      <WorkflowDesigner workspaceId="30000000-0000-0000-0000-000000000000" />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  server.use(
    http.get("/api/client/session", () =>
      HttpResponse.json({
        authenticated: true,
        userId: "00000000-0000-0000-0000-000000000000",
        organizationId: "10000000-0000-0000-0000-000000000000",
        organizationMemberId: "20000000-0000-0000-0000-000000000000",
        organizationRole: "client_owner",
      }),
    ),
    http.get("/api/client/workspaces", () =>
      HttpResponse.json([
        {
          workspace_id: "30000000-0000-0000-0000-000000000000",
          organization_id: "10000000-0000-0000-0000-000000000000",
          name: "Default Workspace",
          slug: "default",
          description: null,
          status: "active",
          created_at: "2026-06-23T10:00:00Z",
          updated_at: "2026-06-23T10:00:00Z",
        },
      ]),
    ),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("WorkflowDesigner", () => {
  it("renders the empty state when no workflows exist", async () => {
    server.use(
      http.get(
        "/api/client/workspaces/30000000-0000-0000-0000-000000000000/workflows",
        () => HttpResponse.json([]),
      ),
    );

    renderDesigner();

    expect(
      await screen.findByRole("heading", { name: /Verification policies/i }),
    ).toBeInTheDocument();
    const createButton = await screen.findByRole("button", {
      name: /Create your first workflow/i,
    });
    const cardTitles = screen.getAllByText(/No workflows yet/i);
    expect(cardTitles.length).toBeGreaterThan(0);
    expect(createButton).toBeInTheDocument();
  });

  it("lists existing workflows with their services and min_age", async () => {
    server.use(
      http.get(
        "/api/client/workspaces/30000000-0000-0000-0000-000000000000/workflows",
        () =>
          HttpResponse.json([
            {
              workflow_id: "00000000-0000-0000-0000-000000000001",
              name: "Standard KYC",
              services: ["selfie", "document", "age"],
              min_age: 18,
              auto_decide_allowed: true,
              created_at: "2026-06-23T10:00:00Z",
              updated_at: "2026-06-23T10:00:00Z",
            },
          ]),
      ),
    );

    renderDesigner();

    expect(await screen.findByText("Standard KYC")).toBeInTheDocument();
    expect(screen.getByText("selfie")).toBeInTheDocument();
    expect(screen.getByText("document")).toBeInTheDocument();
    expect(screen.getByText("age")).toBeInTheDocument();
    expect(screen.getByText("Auto-decide allowed")).toBeInTheDocument();
    expect(screen.getByText(/Min age:/)).toBeInTheDocument();
    expect(screen.getByText("18")).toBeInTheDocument();
  });

  it("creates a workflow with the right payload", async () => {
    let capturedBody: Record<string, unknown> | null = null;
    server.use(
      http.get(
        "/api/client/workspaces/30000000-0000-0000-0000-000000000000/workflows",
        () => HttpResponse.json([]),
      ),
      http.post(
        "/api/client/workspaces/30000000-0000-0000-0000-000000000000/workflows",
        async ({ request }) => {
          capturedBody = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({
            workflow_id: "00000000-0000-0000-0000-000000000099",
            name: capturedBody.name,
            services: capturedBody.services,
            min_age: capturedBody.min_age,
            auto_decide_allowed: capturedBody.auto_decide_allowed,
            agentic_mode: capturedBody.agentic_mode,
            created_at: "2026-06-23T10:00:00Z",
            updated_at: "2026-06-23T10:00:00Z",
          });
        },
      ),
    );

    const user = userEvent.setup();
    renderDesigner();

    await user.click(
      await screen.findByRole("button", { name: /Create your first workflow/i }),
    );

    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("Name"), {
      target: { value: "Age-gated KYC" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Selfie" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Document" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Age" }));
    fireEvent.change(within(dialog).getByLabelText(/Minimum age/), {
      target: { value: "21" },
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Create workflow" }),
    );

    await waitFor(() => expect(capturedBody).not.toBeNull());
    expect(capturedBody).toEqual({
      name: "Age-gated KYC",
      services: ["selfie", "document", "age"],
      min_age: 21,
      auto_decide_allowed: true,
      agentic_mode: "auto_decide",
      auto_decide_confidence_threshold: null,
    });
  });

  it("persists the selected agentic mode", async () => {
    let capturedBody: Record<string, unknown> | null = null;
    server.use(
      http.get(
        "/api/client/workspaces/30000000-0000-0000-0000-000000000000/workflows",
        () => HttpResponse.json([]),
      ),
      http.post(
        "/api/client/workspaces/30000000-0000-0000-0000-000000000000/workflows",
        async ({ request }) => {
          capturedBody = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({
            workflow_id: "00000000-0000-0000-0000-000000000101",
            name: capturedBody.name,
            services: capturedBody.services,
            auto_decide_allowed: capturedBody.auto_decide_allowed,
            agentic_mode: capturedBody.agentic_mode,
            created_at: "2026-06-23T10:00:00Z",
            updated_at: "2026-06-23T10:00:00Z",
          });
        },
      ),
    );

    const user = userEvent.setup();
    renderDesigner();

    await user.click(
      await screen.findByRole("button", { name: /Create your first workflow/i }),
    );

    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("Name"), {
      target: { value: "Shadow KYC" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Selfie" }));
    fireEvent.click(
      within(dialog).getByRole("button", { name: /Shadow/i }),
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Create workflow" }),
    );

    await waitFor(() => expect(capturedBody).not.toBeNull());
    expect(capturedBody).toMatchObject({
      name: "Shadow KYC",
      services: ["selfie"],
      agentic_mode: "shadow",
    });
  });

  it("persists an auto-decide confidence threshold", async () => {
    let capturedBody: Record<string, unknown> | null = null;
    server.use(
      http.get(
        "/api/client/workspaces/30000000-0000-0000-0000-000000000000/workflows",
        () => HttpResponse.json([]),
      ),
      http.post(
        "/api/client/workspaces/30000000-0000-0000-0000-000000000000/workflows",
        async ({ request }) => {
          capturedBody = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({
            workflow_id: "00000000-0000-0000-0000-000000000102",
            name: capturedBody.name,
            services: capturedBody.services,
            auto_decide_allowed: capturedBody.auto_decide_allowed,
            agentic_mode: capturedBody.agentic_mode,
            auto_decide_confidence_threshold:
              capturedBody.auto_decide_confidence_threshold,
            created_at: "2026-06-23T10:00:00Z",
            updated_at: "2026-06-23T10:00:00Z",
          });
        },
      ),
    );

    const user = userEvent.setup();
    renderDesigner();

    await user.click(
      await screen.findByRole("button", { name: /Create your first workflow/i }),
    );

    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("Name"), {
      target: { value: "High-confidence KYC" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Selfie" }));
    fireEvent.click(
      within(dialog).getByRole("button", { name: /Auto decide/i }),
    );
    fireEvent.change(
      within(dialog).getByLabelText(/Auto-decide confidence threshold/i),
      {
        target: { value: "0.97" },
      },
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Create workflow" }),
    );

    await waitFor(() => expect(capturedBody).not.toBeNull());
    expect(capturedBody).toMatchObject({
      name: "High-confidence KYC",
      services: ["selfie"],
      agentic_mode: "auto_decide",
      auto_decide_confidence_threshold: 0.97,
    });
  });

  it("lets a workflow block automatic agent decisions", async () => {
    let capturedBody: Record<string, unknown> | null = null;
    server.use(
      http.get(
        "/api/client/workspaces/30000000-0000-0000-0000-000000000000/workflows",
        () => HttpResponse.json([]),
      ),
      http.post(
        "/api/client/workspaces/30000000-0000-0000-0000-000000000000/workflows",
        async ({ request }) => {
          capturedBody = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({
            workflow_id: "00000000-0000-0000-0000-000000000100",
            name: capturedBody.name,
            services: capturedBody.services,
            auto_decide_allowed: capturedBody.auto_decide_allowed,
            agentic_mode: capturedBody.agentic_mode,
            created_at: "2026-06-23T10:00:00Z",
            updated_at: "2026-06-23T10:00:00Z",
          });
        },
      ),
    );

    const user = userEvent.setup();
    renderDesigner();

    await user.click(
      await screen.findByRole("button", { name: /Create your first workflow/i }),
    );

    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("Name"), {
      target: { value: "Manual-only KYC" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Selfie" }));
    await user.click(
      within(dialog).getByRole("switch", {
        name: /Automatic decisions/i,
      }),
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Create workflow" }),
    );

    await waitFor(() => expect(capturedBody).not.toBeNull());
    expect(capturedBody).toMatchObject({
      name: "Manual-only KYC",
      services: ["selfie"],
      auto_decide_allowed: false,
      agentic_mode: "disabled",
    });
  });

  it("rejects a create with no services selected", async () => {
    server.use(
      http.get(
        "/api/client/workspaces/30000000-0000-0000-0000-000000000000/workflows",
        () => HttpResponse.json([]),
      ),
    );

    const user = userEvent.setup();
    renderDesigner();

    await user.click(
      await screen.findByRole("button", { name: /Create your first workflow/i }),
    );

    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("Name"), {
      target: { value: "Empty" },
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Create workflow" }),
    );

    expect(
      await within(dialog).findByText(
        /Pick at least one service the workflow should run\./,
      ),
    ).toBeInTheDocument();
  });

  it("reveals a confirmation prompt before deleting", async () => {
    server.use(
      http.get(
        "/api/client/workspaces/30000000-0000-0000-0000-000000000000/workflows",
        () =>
          HttpResponse.json([
            {
              workflow_id: "00000000-0000-0000-0000-000000000001",
              name: "Standard KYC",
              services: ["selfie"],
              created_at: "2026-06-23T10:00:00Z",
              updated_at: "2026-06-23T10:00:00Z",
            },
          ]),
      ),
      http.delete(
        "/api/client/workspaces/30000000-0000-0000-0000-000000000000/workflows/00000000-0000-0000-0000-000000000001",
        () => new HttpResponse(null, { status: 204 }),
      ),
    );

    const user = userEvent.setup();
    renderDesigner();

    const cardDelete = await screen.findByRole("button", {
      name: /^Delete$/,
    });
    await user.click(cardDelete);

    const confirmHeading = await screen.findByText(/Delete this workflow\?/);
    const confirmPanel = confirmHeading.parentElement?.parentElement;
    expect(confirmPanel).toBeDefined();

    const confirmDelete = within(confirmPanel as HTMLElement).getByRole(
      "button",
      { name: /^Delete$/ },
    );
    await user.click(confirmDelete);
  });
});
