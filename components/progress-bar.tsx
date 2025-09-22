interface ProgressBarProps {
  progress: number
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div className="h-full bg-green-600 transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="mt-1 flex justify-between text-xs text-gray-500">
        <span>Start</span>
        <span>Complete</span>
      </div>
    </div>
  )
}
