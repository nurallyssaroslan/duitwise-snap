import { createFileRoute, Link } from "@tanstack/react-router";
import { Zap, Mic, Camera, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "DuitWise Snap — Survive Until Your Next Allowance" },
      { name: "description", content: "Track student spending with quick taps, voice, or receipt upload. See if your allowance can survive." },
    ],
  }),
});

const features = [
  { icon: Zap, title: "Quick Tap Expenses", desc: "One tap for common student expenses like food, drinks, and transport." },
  { icon: Mic, title: "Voice / Text Input", desc: "Type or say it: 'I spent RM12 on lunch' — we auto-detect amount and category." },
  { icon: Camera, title: "Receipt Upload Demo", desc: "Snap a receipt and watch it auto-fill your expense entry." },
];

function Landing() {
  return (
    <div className="space-y-16 py-6">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          Built for students
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
          Know if your money can <span className="text-primary">survive</span><br className="hidden sm:block" /> until your next allowance.
        </h1>
        <p className="mx-auto max-w-xl text-base sm:text-lg text-muted-foreground">
          Track spending with quick taps, voice/text input, or receipt upload demo. No login, no fuss — just survival math.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/setup">Start Tracking <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <Link to="/dashboard">View Demo</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          );
        })}
      </section>

      <section className="rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent p-8 text-center border border-border">
        <h2 className="text-2xl font-bold">Three steps. Zero spreadsheets.</h2>
        <p className="mt-2 text-muted-foreground">Set your balance → log expenses → see your daily survival limit.</p>
      </section>
    </div>
  );
}
