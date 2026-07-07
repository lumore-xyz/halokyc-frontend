"use client";

import { ExternalLink, ListChecks, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { useRecentSessions } from "@/lib/hooks/use-recent-sessions";

export function RecentSessionsCard({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const { sessions, clearSessions } = useRecentSessions();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="text-muted-foreground size-4" aria-hidden />
              Recent sessions
            </CardTitle>
            <CardDescription>
              Stored only in this tab. Useful when you start a verification
              and walk away.
            </CardDescription>
          </div>
          {sessions.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={clearSessions}
              aria-label="Clear recent sessions"
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No sessions in this tab yet. Start one above.
          </p>
        ) : (
          <ul className="divide-border divide-y">
            {sessions.map((session) => (
              <li
                key={session.verification_id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate font-mono text-xs">
                    {session.verification_id}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {session.external_user_id} · {formatDate(session.created_at)}
                  </span>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    window.open(
                      `/verify?verification_id=${session.verification_id}`,
                      "_blank",
                      "noopener,noreferrer",
                    );
                  }}
                  variant="ghost"
                  size="sm"
                >
                  Open <ExternalLink data-icon="inline-end" aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
