type StatCardProps = {
  label: string;
  value: string;
  detail?: string;
  accent?: string;
};

export default function StatCard({
  label,
  value,
  detail,
  accent = "var(--accent-indigo)",
}: StatCardProps) {
  return (
    <div className="glass-card overflow-hidden rounded-3xl p-5">
      <div className="flex items-center gap-2">
        <span className="size-1.5 rounded-full" style={{ background: accent }} />
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
          {label}
        </p>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
        {value}
      </p>
      {detail ? (
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{detail}</p>
      ) : null}
    </div>
  );
}
