import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { REJECTION_CATEGORY_LABEL, type RejectionCategory } from "@/data/mockData";
import { actions } from "@/lib/store";
import { toast } from "sonner";

export function RevisionRequestDialog({
  open, onOpenChange, ticketId, onDone,
}: { open: boolean; onOpenChange: (v: boolean) => void; ticketId: string; onDone?: () => void }) {
  const [decision, setDecision] = useState<"PerluPerbaikan" | "RejectedFinal">("PerluPerbaikan");
  const [category, setCategory] = useState<RejectionCategory>("SURAT_SALAH");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!note.trim()) { toast.error("Catatan reviewer wajib diisi."); return; }
    setBusy(true); await new Promise((r) => setTimeout(r, 300));
    if (decision === "PerluPerbaikan") {
      actions.requestRevision(ticketId, { category, note: note.trim() });
      toast.success(`${ticketId} diminta perbaikan.`);
    } else {
      actions.rejectFinal(ticketId, { category, note: note.trim() });
      toast.success(`${ticketId} ditolak final.`);
    }
    setBusy(false); onOpenChange(false); setNote(""); onDone?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Minta Perbaikan Pengajuan</DialogTitle>
          <DialogDescription>
            Pilih jenis keputusan dan catatan untuk dikirim ke pendaftar.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Jenis Keputusan</Label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDecision("PerluPerbaikan")}
                className={`rounded-md border p-3 text-left text-sm ${decision === "PerluPerbaikan" ? "border-primary bg-primary/5" : "border-border"}`}
              >
                <p className="font-semibold">Perlu Perbaikan</p>
                <p className="text-[11px] text-muted-foreground">Pendaftar bisa revisi & submit ulang.</p>
              </button>
              <button
                type="button"
                onClick={() => setDecision("RejectedFinal")}
                className={`rounded-md border p-3 text-left text-sm ${decision === "RejectedFinal" ? "border-destructive bg-destructive/5" : "border-border"}`}
              >
                <p className="font-semibold">Ditolak Final</p>
                <p className="text-[11px] text-muted-foreground">Pengajuan tidak bisa dilanjutkan.</p>
              </button>
            </div>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Kategori Masalah</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as RejectionCategory)}>
              <SelectTrigger className="mt-1.5 h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(REJECTION_CATEGORY_LABEL) as RejectionCategory[]).map((k) => (
                  <SelectItem key={k} value={k}>{REJECTION_CATEGORY_LABEL[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Catatan Reviewer</Label>
            <Textarea className="mt-1.5" rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tuliskan catatan yang jelas dan actionable…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button
            onClick={submit}
            disabled={busy}
            className={decision === "RejectedFinal" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
          >
            {decision === "RejectedFinal" ? "Tolak Final" : "Minta Perbaikan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
