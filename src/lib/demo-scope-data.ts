import type { TipeOrg } from "@/data/mockData";

export type DemoTarget = {
  id: string;
  name: string;
  type: TipeOrg;
};

export const pcDemoTargets: DemoTarget[] = [
  { id: "mwc-banyuanyar", name: "MWCNU Banyuanyar", type: "MWC" },
  { id: "mwc-tiris-barat", name: "MWCNU Tiris Barat", type: "MWC" },
  { id: "mwc-tiris-timur", name: "MWCNU Tiris Timur", type: "MWC" },
  { id: "mwc-krucil", name: "MWCNU Krucil", type: "MWC" },
  { id: "lpc-lazisnu", name: "LAZISNU PCNU Kraksaan", type: "Lembaga PC" },
  { id: "lpc-rminu", name: "RMINU PCNU Kraksaan", type: "Lembaga PC" },
  { id: "lpc-lpmaarif", name: "LP Ma'arif PCNU Kraksaan", type: "Lembaga PC" },
];

export const pwDemoTargets: DemoTarget[] = [
  { id: "pc-yogyakarta", name: "PCNU Kota Yogyakarta", type: "PC" },
  { id: "pc-sleman", name: "PCNU Kabupaten Sleman", type: "PC" },
  { id: "pc-bantul", name: "PCNU Bantul", type: "PC" },
  { id: "lpw-maarif", name: "LP Ma'arif PWNU DIY", type: "Lembaga PW" },
];

export function findPcDemoTarget(targetId?: string | null) {
  return pcDemoTargets.find((item) => item.id === targetId);
}

export function findPwDemoTarget(targetId?: string | null) {
  return pwDemoTargets.find((item) => item.id === targetId);
}