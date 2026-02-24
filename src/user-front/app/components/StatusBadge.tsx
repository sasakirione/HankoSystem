import type { SealRegistrationStatus } from "../lib/types";

const statusStyles: Record<SealRegistrationStatus, string> = {
  登録: "bg-green-100 text-green-800 border border-green-300",
  抹消: "bg-gray-100 text-gray-500 border border-gray-300",
  照会中: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  照会取消: "bg-red-100 text-red-700 border border-red-300",
};

type StatusBadgeProps = {
  status: SealRegistrationStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-sm font-medium ${statusStyles[status]}`}>
      {status}
    </span>
  );
}
