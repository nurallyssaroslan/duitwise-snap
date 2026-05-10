import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { actions, computeRemaining, detectExpense, useAppState } from "@/lib/store";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Camera, CheckCircle2, Mic, Zap } from "lucide-react";

export const Route = createFileRoute("/record")({
  component: RecordPage,
  head: () => ({ meta: [{ title: "Record Expense — DuitWise Snap" }, { name: "description", content: "Quick-tap, voice, or receipt expense logging." }] }),
});

const QUICK = [
  { cat: "Food", amount: 5 },
  { cat: "Food", amount: 10 },
  { cat: "Drink", amount: 3 },
  { cat: "Drink", amount: 5 },
  { cat: "Transport", amount: 5 },
  { cat: "Transport", amount: 10 },
  { cat: "Academic", amount: 2, label: "Printing" },
  { cat: "Academic", amount: 5, label: "Printing" },
  { cat: "Laundry", amount: 6 },
  { cat: "Shopping", amount: 10 },
];

function RecordPage() {
  const { state } = useAppState();
  const remaining = computeRemaining(state);
  const notSetup = state.startingBalance == null;

  if (notSetup) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <h2 className="text-xl font-semibold">Set up first</h2>
        <p className="mt-2 text-muted-foreground">Enter your balance and next allowance date to start tracking.</p>
        <Button asChild className="mt-4"><Link to="/setup">Go to Setup</Link></Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-2">
      <Toaster />
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-secondary/10 p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Remaining balance</p>
        <p className="text-3xl font-bold">RM {remaining.toFixed(2)}</p>
      </div>

      <Tabs defaultValue="tap">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tap"><Zap className="mr-1.5 h-4 w-4" />Quick Tap</TabsTrigger>
          <TabsTrigger value="voice"><Mic className="mr-1.5 h-4 w-4" />Voice/Text</TabsTrigger>
          <TabsTrigger value="receipt"><Camera className="mr-1.5 h-4 w-4" />Receipt</TabsTrigger>
        </TabsList>

        <TabsContent value="tap" className="mt-4">
          <QuickTap />
        </TabsContent>
        <TabsContent value="voice" className="mt-4">
          <VoiceText />
        </TabsContent>
        <TabsContent value="receipt" className="mt-4">
          <ReceiptDemo />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function QuickTap() {
  function add(cat: string, amount: number) {
    actions.addExpense(amount, cat, "tap");
    toast.success(`Expense added: ${cat} RM${amount.toFixed(2)}`);
  }
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-semibold">Quick tap expenses</h3>
      <p className="text-sm text-muted-foreground">One tap to log a common expense.</p>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {QUICK.map((q, i) => (
          <button
            key={i}
            onClick={() => add(q.cat, q.amount)}
            className="rounded-xl border border-border bg-background p-4 text-left transition hover:border-primary hover:bg-primary/5 active:scale-[0.98]"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{q.label ?? q.cat}</p>
            <p className="mt-1 text-lg font-bold text-foreground">RM {q.amount}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function VoiceText() {
  const [text, setText] = useState("");
  const [last, setLast] = useState<{ amount: number; category: string } | null>(null);

  function detect() {
    const { amount, category } = detectExpense(text);
    if (!amount || amount <= 0) {
      toast.error("Couldn't find an amount. Try: 'I spent RM12 on lunch'");
      return;
    }
    actions.addExpense(amount, category, "voice");
    setLast({ amount, category });
    setText("");
    toast.success(`Detected RM${amount.toFixed(2)} — ${category}`);
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div>
        <h3 className="font-semibold">Voice / Text input demo</h3>
        <p className="text-sm text-muted-foreground">Type naturally — we'll pull out the amount and category.</p>
      </div>
      <Input placeholder="Example: I spent RM12 on lunch" value={text} onChange={(e) => setText(e.target.value)} />
      <Button onClick={detect} className="w-full">Auto Detect Expense</Button>
      {last && (
        <div className="flex items-center gap-3 rounded-xl bg-primary/10 p-3 text-sm">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <div>
            Detected <span className="font-semibold">RM {last.amount.toFixed(2)}</span> — <span className="font-semibold">{last.category}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ReceiptDemo() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setPreview(url);
    setDone(false);
    setTimeout(() => {
      actions.addExpense(12.5, "Food", "receipt");
      setDone(true);
      toast.success("Receipt scanned: RM12.50 — Food");
    }, 800);
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div>
        <h3 className="font-semibold">Receipt upload demo</h3>
        <p className="text-sm text-muted-foreground">Demo only — extraction values are simulated.</p>
      </div>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={onFile} />
      <Button variant="outline" className="w-full" onClick={() => inputRef.current?.click()}>
        <Camera className="mr-2 h-4 w-4" /> Upload receipt image
      </Button>
      {preview && (
        <div className="grid sm:grid-cols-[120px_1fr] gap-4 items-start rounded-xl border border-border p-3">
          <img src={preview} alt="Receipt preview" className="h-32 w-full sm:w-[120px] rounded-lg object-cover" />
          <div className="text-sm space-y-1">
            {done ? (
              <>
                <p className="font-semibold text-primary">Receipt scanned successfully</p>
                <p>Detected total: <span className="font-semibold">RM 12.50</span></p>
                <p>Detected category: <span className="font-semibold">Food</span></p>
                <p className="text-xs text-muted-foreground italic">Demo extraction — values are illustrative.</p>
              </>
            ) : (
              <p className="text-muted-foreground">Scanning...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
