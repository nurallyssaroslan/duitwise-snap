import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { actions, useAppState } from "@/lib/store";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/setup")({
  component: SetupPage,
  head: () => ({ meta: [{ title: "Setup — DuitWise Snap" }, { name: "description", content: "Enter your current balance and next allowance date." }] }),
});

function SetupPage() {
  const { state } = useAppState();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<string>(state.startingBalance?.toString() ?? "");
  const [date, setDate] = useState<string>(state.allowanceDate ?? "");
  const [error, setError] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const b = parseFloat(balance);
    if (!balance || isNaN(b) || b <= 0) return setError("Please enter a valid balance.");
    if (!date) return setError("Please pick your next allowance date.");
    if (date < today) return setError("Allowance date must be today or later.");
    actions.setup(b, date);
    toast.success("Setup saved!");
    navigate({ to: "/record" });
  }

  return (
    <div className="mx-auto max-w-md py-4">
      <Toaster />
      <h1 className="text-3xl font-bold">Set up your wallet</h1>
      <p className="mt-2 text-muted-foreground">Tell us your current balance and when your next allowance lands.</p>

      <form onSubmit={submit} className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="balance">Current balance (RM)</Label>
          <Input id="balance" inputMode="decimal" placeholder="e.g. 250" value={balance} onChange={(e) => setBalance(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Next allowance date</Label>
          <Input id="date" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" size="lg">Save and Continue</Button>
      </form>
    </div>
  );
}
