import type { TipeOrg } from "@/data/mockData";

export type DemoTarget = {
  id: string;
  name: string;
  type: TipeOrg;
};

export const pcDemoTargets: DemoTarget[] = [
  // MWC di bawah PCNU Kraksaan (14)
  { id: "mwc-banyuanyar", name: "MWCNU Banyuanyar", type: "MWC" },
  { id: "mwc-tiris-barat", name: "MWCNU Tiris Barat", type: "MWC" },
  { id: "mwc-tiris-timur", name: "MWCNU Tiris Timur", type: "MWC" },
  { id: "mwc-krucil", name: "MWCNU Krucil", type: "MWC" },
  { id: "mwc-gading", name: "MWCNU Gading", type: "MWC" },
  { id: "mwc-besuk", name: "MWCNU Besuk", type: "MWC" },
  { id: "mwc-pakuniran", name: "MWCNU Pakuniran", type: "MWC" },
  { id: "mwc-kotaanyar", name: "MWCNU Kotaanyar", type: "MWC" },
  { id: "mwc-paiton", name: "MWCNU Paiton", type: "MWC" },
  { id: "mwc-kraksaan", name: "MWCNU Kraksaan", type: "MWC" },
  { id: "mwc-krejengan", name: "MWCNU Krejengan", type: "MWC" },
  { id: "mwc-pajarakan", name: "MWCNU Pajarakan", type: "MWC" },
  { id: "mwc-maron", name: "MWCNU Maron", type: "MWC" },
  { id: "mwc-gending", name: "MWCNU Gending", type: "MWC" },
  // Lembaga PCNU Kraksaan (18)
  { id: "lpc-ldnu", name: "LDNU PCNU Kraksaan", type: "Lembaga PC" },
  { id: "lpc-lkknu", name: "LKKNU PCNU Kraksaan", type: "Lembaga PC" },
  { id: "lpc-rminu", name: "RMINU PCNU Kraksaan", type: "Lembaga PC" },
  { id: "lpc-lazisnu", name: "LAZISNU PCNU Kraksaan", type: "Lembaga PC" },
  { id: "lpc-lbmnu", name: "LBMNU PCNU Kraksaan", type: "Lembaga PC" },
  { id: "lpc-lesbuminu", name: "LESBUMINU PCNU Kraksaan", type: "Lembaga PC" },
  { id: "lpc-lfnu", name: "LFNU PCNU Kraksaan", type: "Lembaga PC" },
  { id: "lpc-lknu", name: "LKNU PCNU Kraksaan", type: "Lembaga PC" },
  { id: "lpc-lpmaarif", name: "LP Ma'arif NU PCNU Kraksaan", type: "Lembaga PC" },
  { id: "lpc-lppnu", name: "LPPNU PCNU Kraksaan", type: "Lembaga PC" },
  { id: "lpc-lptnu", name: "LPTNU PCNU Kraksaan", type: "Lembaga PC" },
  { id: "lpc-ltmnu", name: "LTMNU PCNU Kraksaan", type: "Lembaga PC" },
  { id: "lpc-ltnnu", name: "LTNNU PCNU Kraksaan", type: "Lembaga PC" },
  { id: "lpc-lwpnu", name: "LWPNU PCNU Kraksaan", type: "Lembaga PC" },
  { id: "lpc-lpnu", name: "LPNU PCNU Kraksaan", type: "Lembaga PC" },
  { id: "lpc-lakpesdamnu", name: "LAKPESDAMNU PCNU Kraksaan", type: "Lembaga PC" },
  { id: "lpc-lpbhnu", name: "LPBHNU PCNU Kraksaan", type: "Lembaga PC" },
  { id: "lpc-lpbinu", name: "LPBI NU PCNU Kraksaan", type: "Lembaga PC" },
];

export const pwDemoTargets: DemoTarget[] = [
  // Lembaga PW di bawah PWNU DI Yogyakarta (18)
  { id: "lembaga-pw-ldnu", name: "LDNU PW", type: "Lembaga PW" },
  { id: "lembaga-pw-lkknu", name: "LKKNU PW", type: "Lembaga PW" },
  { id: "lembaga-pw-rminu", name: "RMINU PW", type: "Lembaga PW" },
  { id: "lembaga-pw-lazisnu", name: "LAZISNU PW", type: "Lembaga PW" },
  { id: "lembaga-pw-lbmnu", name: "LBMNU PW", type: "Lembaga PW" },
  { id: "lembaga-pw-lesbuminu", name: "LESBUMINU PW", type: "Lembaga PW" },
  { id: "lembaga-pw-lfnu", name: "LFNU PW", type: "Lembaga PW" },
  { id: "lembaga-pw-lknu", name: "LKNU PW", type: "Lembaga PW" },
  { id: "lembaga-pw-lpmaarif", name: "LP MAARIF NU PW", type: "Lembaga PW" },
  { id: "lembaga-pw-lppnu", name: "LPPNU PW", type: "Lembaga PW" },
  { id: "lembaga-pw-lptnu", name: "LPTNU PW", type: "Lembaga PW" },
  { id: "lembaga-pw-ltmnu", name: "LTMNU PW", type: "Lembaga PW" },
  { id: "lembaga-pw-ltnnu", name: "LTNNU PW", type: "Lembaga PW" },
  { id: "lembaga-pw-lwpnu", name: "LWPNU PW", type: "Lembaga PW" },
  { id: "lembaga-pw-lpnu", name: "LPNU PW", type: "Lembaga PW" },
  { id: "lembaga-pw-lakpesdam", name: "LAKPESDAM PW", type: "Lembaga PW" },
  { id: "lembaga-pw-lpbhnu", name: "LPBHNU PW", type: "Lembaga PW" },
  { id: "lembaga-pw-lpbinu", name: "LPBI NU PW", type: "Lembaga PW" },
];

/** MWC induk pilihan saat PCNU Kraksaan mendaftarkan Ranting. */
export const kraksaanMwcOptions: { id: string; name: string }[] = pcDemoTargets
  .filter((t) => t.type === "MWC")
  .map((t) => ({ id: t.id, name: t.name }));

export function findKraksaanMwc(id?: string | null) {
  return kraksaanMwcOptions.find((m) => m.id === id);
}

export function findPcDemoTarget(targetId?: string | null) {
  return pcDemoTargets.find((item) => item.id === targetId);
}

export function findPwDemoTarget(targetId?: string | null) {
  return pwDemoTargets.find((item) => item.id === targetId);
}