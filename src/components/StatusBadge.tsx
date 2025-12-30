import { Priority } from "@/firebase/firestore";

export default function StatusBadge({ priority }: { priority: Priority }) {
    const colors = {
        Low: "bg-gray-100 text-gray-800",
        Medium: "bg-blue-100 text-blue-800",
        High: "bg-red-100 text-red-800",
    };

    return (
        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${colors[priority] || colors.Low}`}>
            {priority}
        </span>
    );
}
