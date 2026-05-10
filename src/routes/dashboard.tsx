import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { actions, computeRemaining, daysLeft, useAppState } from "@/lib/store";
import { AlertTriangle, CheckCircle2, ShieldAlert, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — DuitWise Snap" }, { name: "description", content: "See your remaining balance, daily survival limit, and recent spending." }] }),
});

function Dashboard() {
  const { state } = useAppState();

  if (state.startingBalance == null) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <h2 className="text-xl font-semibold">No data yet</h2>
        <p className="mt-2 text-muted-foreground">Set up your balance to see your dashboard.</p>
        <Button asChild className="mt-4"><Link to="/setup">Go to Setup</Link></Button>
      </div>
    );
  }

  const remaining = computeRemaining(state);
  const days = daysLeft(state);
  const daily = remaining / days;

  const todayStr = new Date().toDateString();
  const todays = state.expenses.filter((e) => new Date(e.createdAt).toDateString() === todayStr);
  const spentToday = todays.reduce((a, e) => a + e.amount, 0);

  const byCat = state.expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});
  const totalSpent = Object.values(byCat).reduce((a, b) => a + b, 0);

  let status: "safe" | "caution" | "danger" = "safe";
  if (daily < 8) status = "danger";
  else if (daily < 15) status = "caution";

  const statusInfo = {
    safe: { label: "Safe", color: "bg-primary/15 text-primary border-primary/30", icon: CheckCircle2, advice: "Your spending is under control. Keep tracking daily." },
    caution: { label: "Caution", color: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30", icon: AlertTriangle, advice: "Be careful. Try to reduce non-essential spending." },
    danger: { label: "Danger", color: "bg-destructive/15 text-destructive border-destructive/30", icon: ShieldAlert, advice: "Your money may not last. Focus only on food, transport, and urgent needs." },
  }[status];

  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6 py-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Allowance date: {state.allowanceDate}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { if (confirm("Reset all data?")) actions.reset(); }}>
          <RotateCcw className="mr-1.5 h-4 w-4" /> Reset
        </Button>
      </div>

      <div className={`rounded-2xl border p-5 ${statusInfo.color}`}>
        <div className="flex items-center gap-3">
          <StatusIcon className="h-6 w-6" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide opacity-80">Survival status</p>
            <p className="text-xl font-bold">{statusInfo.label}</p>
          </div>
        </div>
        <p className="mt-3 text-sm">{statusInfo.advice}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Remaining" value={`RM ${remaining.toFixed(2)}`} />
        <Stat label="Days left" value={`${days}`} />
        <Stat label="Safe daily limit" value={`RM ${Math.max(daily, 0).toFixed(2)}`} highlight />
        <Stat label="Spent today" value={`RM ${spentToday.toFixed(2)}`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-semibold">Category breakdown</h3>
          {totalSpent === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No expenses yet. <Link to="/record" className="text-primary underline">Add one</Link>.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => {
                const pct = (amt / totalSpent) * 100;
                return (
                  <li key={cat}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{cat}</span>
                      <span className="text-muted-foreground">RM {amt.toFixed(2)}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-semibold">Recent expenses</h3>
          {state.expenses.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Nothing logged yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {state.expenses.slice(0, 8).map((e) => (
                <li key={e.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium">{e.category}</p>
                    <p className="text-xs text-muted-foreground">{new Date(e.createdAt).toLocaleString()} · {e.source}</p>
                  </div>
                  <span className="font-semibold">RM {e.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border border-border p-4 ${highlight ? "bg-primary text-primary-foreground border-primary" : "bg-card"}`}>
      <p className={`text-xs uppercase tracking-wide ${highlight ? "opacity-90" : "text-muted-foreground"}`}>{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
