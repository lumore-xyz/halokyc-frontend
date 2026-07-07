"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/empty-state";
import { StickyNoteIcon } from "lucide-react";
import { formatDate } from "@/lib/format";
import {
  useAdminSupportNotes,
  useCreateAdminSupportNote,
} from "@/lib/hooks/use-admin-console";
import { ApiError } from "@/lib/api-client";

export function AdminSupportNotes() {
  const query = useAdminSupportNotes({ limit: 50 });
  const create = useCreateAdminSupportNote();
  const [verificationId, setVerificationId] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const verificationError =
    submitted &&
    !/^[0-9a-f]{8}-/i.test(verificationId.trim())
      ? "Paste a verification id (uuid)."
      : null;
  const noteError =
    submitted && !note.trim() ? "Note text is required." : null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (verificationError || noteError) return;
    create.mutate(
      { verification_id: verificationId.trim(), note: note.trim() },
      {
        onSuccess: () => {
          toast.success("Support note saved");
          setNote("");
          setSubmitted(false);
        },
        onError: (err) => {
          if (err instanceof ApiError) {
            toast.error(`Could not save note: ${err.status}`);
          } else {
            toast.error("Could not save note");
          }
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={submit}
        className="grid gap-4 lg:grid-cols-[1fr_2fr_auto] lg:items-end"
        noValidate
      >
        <FieldGroup>
          <Field data-invalid={Boolean(verificationError) || undefined}>
            <FieldLabel htmlFor="support-note-verification">Verification id</FieldLabel>
            <Input
              id="support-note-verification"
              value={verificationId}
              onChange={(event) => setVerificationId(event.target.value)}
              placeholder="verification uuid"
              className="font-mono text-xs"
            />
          </Field>
        </FieldGroup>
        <FieldGroup>
          <Field data-invalid={Boolean(noteError) || undefined}>
            <FieldLabel htmlFor="support-note-body">Note</FieldLabel>
            <Textarea
              id="support-note-body"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={2000}
              placeholder="What did the operator observe?"
              rows={3}
            />
            <FieldDescription>
              Visible to platform_owner, business_admin, and support. The
              note lives on the verification audit log.
            </FieldDescription>
            {noteError ? <FieldError>{noteError}</FieldError> : null}
          </Field>
        </FieldGroup>
        <div>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Saving…" : "Save note"}
          </Button>
        </div>
      </form>

      {query.isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (query.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={StickyNoteIcon}
          title="No support notes yet"
          description="Notes added here land in the platform audit log and on the verification record."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Verification</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.data?.map((entry, index) => (
              <TableRow key={`${entry.verification_id}-${entry.created_at}-${index}`}>
                <TableCell>
                  <span className="font-mono text-xs">
                    {entry.verification_id.slice(0, 8)}…
                  </span>
                </TableCell>
                <TableCell className="max-w-xl text-sm">{entry.note}</TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  <Badge variant="outline">{formatDate(entry.created_at)}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}