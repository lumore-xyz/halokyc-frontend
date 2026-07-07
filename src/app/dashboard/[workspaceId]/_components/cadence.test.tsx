import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Cadence } from "./cadence";

describe("Cadence", () => {
  it("renders an empty state when there are no sessions", () => {
    render(<Cadence sessions={[]} />);
    expect(
      screen.getByText(/No verifications yet/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Waiting on the first session/i }),
    ).toBeInTheDocument();
  });

  it("renders one bar per session with status colors", () => {
    render(
      <Cadence
        sessions={[
          { status: "approved" },
          { status: "manual_review" },
          { status: "rejected" },
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /3 sessions on file/i }),
    ).toBeInTheDocument();

    const legend = screen.getByRole("list");
    expect(within(legend).getByText("Approved")).toBeInTheDocument();
    expect(within(legend).getByText("Review")).toBeInTheDocument();
    expect(within(legend).getByText("Rejected")).toBeInTheDocument();
  });

  it("truncates the visible bars and reports the hidden count", () => {
    const sessions = Array.from({ length: 80 }, () => ({
      status: "approved" as const,
    }));
    render(<Cadence sessions={sessions} limit={10} />);
    expect(
      screen.getByText(/\+70 earlier/),
    ).toBeInTheDocument();
  });
});