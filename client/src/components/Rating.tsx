export default function Rating({
  average,
  quantity,
  size = "sm",
}: {
  average: number;
  quantity: number;
  size?: "sm" | "md";
}) {
  const rounded = Math.round(average);
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className={`flex items-center gap-1.5 ${textSize} text-ink/70`}>
      <span aria-hidden className="tracking-tight">
        {"★".repeat(rounded)}
        <span className="text-ink/25">{"★".repeat(5 - rounded)}</span>
      </span>
      <span className="text-ink/50">
        {average.toFixed(1)} ({quantity})
      </span>
    </div>
  );
}
