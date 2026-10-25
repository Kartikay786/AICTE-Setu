export function BrandMark() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-8 grid-cols-2 gap-0.5 rounded-lg bg-primary p-1.5" aria-hidden>
        <span className="rounded-sm bg-primary-foreground" />
        <span className="rounded-sm bg-primary-foreground/50" />
        <span className="rounded-sm bg-primary-foreground/50" />
        <span className="rounded-sm bg-primary-foreground" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-semibold tracking-tight text-foreground">AICTE Setu</span>
        <span className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Approval Portal</span>
      </span>
    </span>
  )
}
