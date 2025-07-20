export const statusConfig = {
  todo: {
    label: "Chờ xử lý",
    variant: "secondary" as const,
    color: "bg-gray-100 text-gray-800",
  },
  in_progress: {
    label: "Đang thực hiện",
    variant: "default" as const,
    color: "bg-blue-100 text-blue-800",
  },
  done: {
    label: "Hoàn thành",
    variant: "default" as const,
    color: "bg-green-100 text-green-800",
  },
  archived: {
    label: "Đã lưu trữ",
    variant: "secondary" as const,
    color: "bg-gray-100 text-gray-600",
  },
};

export const priorityConfig = {
  low: { label: "Thấp", color: "bg-gray-100 text-gray-600" },
  medium: { label: "Trung bình", color: "bg-yellow-100 text-yellow-800" },
  high: { label: "Cao", color: "bg-orange-100 text-orange-800" },
  urgent: { label: "Khẩn cấp", color: "bg-red-100 text-red-800" },
};
