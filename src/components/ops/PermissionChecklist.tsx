import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PERMISSION_GROUPS,
  PERMISSION_LABELS,
  ALL_PERMISSIONS,
  type PermissionKey,
} from "@/data/usersData";

interface Props {
  value: PermissionKey[];
  onChange: (next: PermissionKey[]) => void;
  /** When true, sections are collapsible (mobile). Defaults to true. */
  collapsibleOnMobile?: boolean;
}

export function PermissionChecklist({ value, onChange }: Props) {
  const set = new Set(value);
  const toggle = (key: PermissionKey) => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(Array.from(next));
  };
  const toggleSection = (keys: PermissionKey[], allOn: boolean) => {
    const next = new Set(set);
    keys.forEach((k) => (allOn ? next.delete(k) : next.add(k)));
    onChange(Array.from(next));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-secondary/40 px-3 py-2">
        <div>
          <p className="text-[13px] font-semibold text-foreground">Hak Akses Menu</p>
          <p className="text-[11.5px] text-muted-foreground">Centang menu yang dapat diakses oleh pengguna ini.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => onChange([...ALL_PERMISSIONS])}>
            Pilih Semua
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => onChange([])}>
            Kosongkan
          </Button>
        </div>
      </div>
      {PERMISSION_GROUPS.map((g) => (
        <SectionBlock
          key={g.section}
          section={g.section}
          items={g.items}
          checked={set}
          onToggle={toggle}
          onToggleSection={toggleSection}
        />
      ))}
    </div>
  );
}

function SectionBlock({
  section,
  items,
  checked,
  onToggle,
  onToggleSection,
}: {
  section: string;
  items: PermissionKey[];
  checked: Set<PermissionKey>;
  onToggle: (k: PermissionKey) => void;
  onToggleSection: (keys: PermissionKey[], allOn: boolean) => void;
}) {
  const [open, setOpen] = useState(true);
  const allOn = items.every((k) => checked.has(k));
  const someOn = items.some((k) => checked.has(k));

  return (
    <div className="rounded-md border border-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
      >
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allOn ? true : someOn ? "indeterminate" : false}
            onCheckedChange={(e) => {
              e !== undefined && onToggleSection(items, allOn);
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{section}</span>
          <span className="text-[11px] text-muted-foreground">({items.filter((k) => checked.has(k)).length}/{items.length})</span>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ul className="border-t border-border bg-card px-3 py-2 space-y-1.5">
          {items.map((k) => (
            <li key={k}>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm hover:bg-secondary/60">
                <Checkbox checked={checked.has(k)} onCheckedChange={() => onToggle(k)} />
                <span className="text-foreground">{PERMISSION_LABELS[k]}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
