type Props = { progress: number }

export function ProgressBar({ progress }: Props) {
  return (
    <div
      className="h-1.5 w-full rounded-full bg-muted overflow-hidden"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={`${Math.round(progress)}% complete`}
    >
      <div
        className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
