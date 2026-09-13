/** A single overview metric tile — desktop dashboard only, see staff-dashboard.tsx. */
export function StaffStatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="border-hairline bg-raised rounded-tile flex flex-col gap-1 border p-4">
      <span className="text-spec wdth-condensed text-secondary">{label}</span>
      <span className="text-title">{value}</span>
      {hint ? <span className="text-small text-tertiary">{hint}</span> : null}
    </div>
  )
}
