export interface TodayLabels {
  masehi: string;
  hijri: string;
  short: string;
}

export function getTodayLabels(date: Date = new Date()): TodayLabels {
  const masehi = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

  const hijri = new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

  const short = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

  return { masehi, hijri, short };
}

export function formatDateLong(dateString: string | Date): string {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}
