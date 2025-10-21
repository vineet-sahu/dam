interface ProgressBarProps {
  progress?: number;
  status?: "uploading" | "completed" | "error";
}

export default function ProgressBar({
  progress = 0,
  status = "uploading",
}: ProgressBarProps) {
  const getColor = (): string => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="w-full">
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-300`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-xs text-gray-500 mt-1 flex justify-between">
        <span>{progress}%</span>
        <span className="capitalize">{status}</span>
      </div>
    </div>
  );
}
