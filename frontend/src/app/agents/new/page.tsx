"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { SignInButton, SignedIn, SignedOut, useAuth } from "@clerk/nextjs";

import { DashboardSidebar } from "@/components/organisms/DashboardSidebar";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const apiBase =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:8000";

type Agent = {
  id: string;
  name: string;
};

export default function NewAgentPage() {
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();

  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isSignedIn) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Agent name is required.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch(`${apiBase}/api/v1/agents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!response.ok) {
        throw new Error("Unable to create agent.");
      }
      const created = (await response.json()) as Agent;
      router.push(`/agents/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardShell>
      <SignedOut>
        <div className="flex h-full flex-col items-center justify-center gap-4 rounded-2xl surface-panel p-10 text-center lg:col-span-2">
          <p className="text-sm text-muted">Sign in to create an agent.</p>
          <SignInButton
            mode="modal"
            forceRedirectUrl="/agents/new"
            signUpForceRedirectUrl="/agents/new"
          >
            <Button>Sign in</Button>
          </SignInButton>
        </div>
      </SignedOut>
      <SignedIn>
        <DashboardSidebar />
        <div className="flex h-full flex-col justify-center rounded-2xl surface-panel p-8">
          <div className="mb-6 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-quiet">
              New agent
            </p>
            <h1 className="text-2xl font-semibold text-strong">
              Register an agent.
            </h1>
            <p className="text-sm text-muted">
              Agents start in provisioning until they check in.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-strong">Agent name</label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Deploy bot"
                disabled={isLoading}
              />
            </div>
            {error ? (
              <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-3 text-xs text-muted">
                {error}
              </div>
            ) : null}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating…" : "Create agent"}
            </Button>
          </form>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/agents")}
          >
            Back to agents
          </Button>
        </div>
      </SignedIn>
    </DashboardShell>
  );
}
