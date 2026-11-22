type Dated = { id: string; data: { date: Date } };

export const newestFirst = (a: Dated, b: Dated) => +b.data.date - +a.data.date || b.id.localeCompare(a.id);

export const monthYear = (date: Date, locale: string) =>
  date.toLocaleDateString(locale, { month: "long", year: "numeric", timeZone: "UTC" });
