import { Issue, Status, deleteIssue } from "@/firebase/firestore";
import StatusBadge from "./StatusBadge";

interface Props {
    issue: Issue;
    onStatusChange: (id: string, newStatus: Status, currentStatus: Status) => void;
}

export default function IssueCard({ issue, onStatusChange }: Props) {
    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this issue?")) {
            if (issue.id) {
                await deleteIssue(issue.id);
            }
        }
    }

    return (
        <div className="bg-gray-50 p-4 rounded border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 line-clamp-2">{issue.title}</h3>
                <StatusBadge priority={issue.priority} />
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-3 whitespace-pre-wrap">
                {issue.description}
            </p>

            <div className="flex justify-between items-end text-xs text-gray-500">
                <div className="w-full">
                    <p className="truncate" title={issue.assignedTo}>To: <span className="font-medium text-gray-700">{issue.assignedTo || 'Unassigned'}</span></p>
                    <p className="mt-1 truncate" title={issue.createdBy}>By: {issue.createdBy}</p>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center bg-gray-100 -mx-4 -mb-4 px-4 py-2 rounded-b">
                <select
                    value={issue.status}
                    onChange={(e) => onStatusChange(issue.id!, e.target.value as Status, issue.status)}
                    className="text-xs bg-white border border-gray-300 rounded px-2 py-1 text-gray-700 focus:outline-none focus:border-blue-500"
                >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                </select>

                <button
                    onClick={handleDelete}
                    className="text-red-500 hover:text-red-700 text-xs px-2 font-medium"
                    title="Delete Issue"
                >
                    DELETE
                </button>
            </div>
        </div>
    );
}
