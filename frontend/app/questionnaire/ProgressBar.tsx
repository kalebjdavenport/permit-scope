type Props = {
  progress: number
  current: number
  total: number
}

export function ProgressBar({ progress, current, total }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="text-sm text-muted-foreground"
        aria-live="polite"
        aria-atomic="true"
      >
        Question {current} of {total}
      </div>
      <div
        className="h-1.5 w-full rounded-full bg-muted overflow-hidden"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
