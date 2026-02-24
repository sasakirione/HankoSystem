type SealPreviewProps = {
  familyName: string;
  size?: number;
};

export function SealPreview({ familyName, size = 80 }: SealPreviewProps) {
  const displayName = familyName || "印";
  const chars = Array.from(displayName);
  const isLong = chars.length >= 3;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`${familyName}の印影`}
    >
      {/* 外枠の二重丸 */}
      <circle cx="50" cy="50" r="47" fill="none" stroke="#c0392b" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="42" fill="none" stroke="#c0392b" strokeWidth="1.5" />

      {/* 名前テキスト */}
      {isLong ? (
        // 3文字以上は縦並び2列
        chars.map((ch, i) => (
          <text
            key={i}
            x="50"
            y={28 + (i % 2 === 0 ? 0 : 24) + Math.floor(i / 2) * 0}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={chars.length >= 4 ? "20" : "22"}
            fontFamily="'Noto Serif JP', serif"
            fill="#c0392b"
            fontWeight="bold"
          >
            {ch}
          </text>
        ))
      ) : chars.length === 2 ? (
        // 2文字は縦並び
        <>
          <text x="50" y="38" textAnchor="middle" dominantBaseline="middle" fontSize="24" fontFamily="'Noto Serif JP', serif" fill="#c0392b" fontWeight="bold">
            {chars[0]}
          </text>
          <text x="50" y="64" textAnchor="middle" dominantBaseline="middle" fontSize="24" fontFamily="'Noto Serif JP', serif" fill="#c0392b" fontWeight="bold">
            {chars[1]}
          </text>
        </>
      ) : (
        // 1文字
        <text x="50" y="52" textAnchor="middle" dominantBaseline="middle" fontSize="32" fontFamily="'Noto Serif JP', serif" fill="#c0392b" fontWeight="bold">
          {chars[0]}
        </text>
      )}
    </svg>
  );
}
