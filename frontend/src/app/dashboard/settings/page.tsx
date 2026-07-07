"use client";

import { useState } from "react";
import { AppShell } from "@/components/dashboard/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useClientSession } from "@/lib/hooks/use-client-session";
import { toast } from "sonner";
import type { ClientProfileResponse } from "@/lib/api-client";

export default function SettingsPage() {
  const session = useClientSession();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["client-profile"],
    queryFn: apiClient.getClientProfile,
    enabled: session.data?.authenticated,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: {
      name: string;
      contact_person_name: string | null;
      contact_phone: string | null;
    }) => apiClient.updateClientProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-profile"] });
      toast.success("Profile updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  if (!session.data?.authenticated) {
    return (
      <AppShell audience="client">
        <div className="p-6">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Settings</h1>
          <p className="text-muted-foreground">Please sign in to view your settings.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell audience="client">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account details and company information.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Company Profile</CardTitle>
              <CardDescription>Basic information about your organization.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : profile ? (
                <ProfileSettingsForm
                  key={[
                    profile.company_name,
                    profile.contact_person_name ?? "",
                    profile.contact_phone ?? "",
                  ].join(":")}
                  profile={profile}
                  isPending={updateMutation.isPending}
                  onSave={(payload) => updateMutation.mutate(payload)}
                />
              ) : (
                <p className="text-sm text-muted-foreground">No profile data available.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>Manage your credentials and access.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground italic">
                Password management and MFA coming soon.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </AppShell>
  );
}

function ProfileSettingsForm({
  profile,
  isPending,
  onSave,
}: {
  profile: ClientProfileResponse;
  isPending: boolean;
  onSave: (payload: {
    name: string;
    contact_person_name: string | null;
    contact_phone: string | null;
  }) => void;
}) {
  const [name, setName] = useState(profile.company_name);
  const [contactPersonName, setContactPersonName] = useState(profile.contact_person_name ?? "");
  const [contactPhone, setContactPhone] = useState(profile.contact_phone ?? "");

  const hasChanges =
    name !== profile.company_name ||
    contactPersonName !== (profile.contact_person_name ?? "") ||
    contactPhone !== (profile.contact_phone ?? "");

  function handleUpdate() {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      contact_person_name: contactPersonName.trim() || null,
      contact_phone: contactPhone.trim() || null,
    });
  }

  return (
    <div className="grid gap-6">
      <Field>
        <FieldLabel htmlFor="company-name">Company name</FieldLabel>
        <Input
          id="company-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter company name"
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="contact-person-name">Contact person name</FieldLabel>
        <Input
          id="contact-person-name"
          value={contactPersonName}
          onChange={(e) => setContactPersonName(e.target.value)}
          placeholder="Enter contact person name"
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="contact-phone">Phone number</FieldLabel>
        <Input
          id="contact-phone"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          placeholder="Enter phone number"
        />
      </Field>

      <div>
        <Button size="sm" onClick={handleUpdate} disabled={isPending || !name.trim() || !hasChanges}>
          {isPending && <Spinner className="mr-2 size-3" />}
          Save
        </Button>
      </div>

      <div className="grid gap-2 border-t pt-4 text-sm">
        <div className="flex items-center justify-between border-b py-2">
          <span className="text-muted-foreground">Contact Email</span>
          <span className="font-medium">{profile.email}</span>
        </div>
        <div className="flex items-center justify-between border-b py-2">
          <span className="text-muted-foreground">Verification Phase</span>
          <span className="font-medium capitalize">{profile.phase}</span>
        </div>
        <div className="flex items-center justify-between border-b py-2">
          <span className="text-muted-foreground">Account Status</span>
          <span className={`font-medium ${profile.is_active ? "text-green-600" : "text-red-600"}`}>
            {profile.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
    </div>
  );
}
