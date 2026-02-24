// 仕様書 1.3.4: 日付型（和暦）は「元号○年○月○日」形式で表示
// 元年は「元年」（「1年」不可）
const formatter = new Intl.DateTimeFormat("ja-JP-u-ca-japanese", {
  era: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

export const formatToWareki = (isoDate: string | null | undefined): string => {
  if (!isoDate) return "—";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";
  // Intl の出力例: "令和8年2月24日" または "令和元年5月1日"
  return formatter.format(date);
};
