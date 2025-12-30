"use client";
import { useEffect, useState } from "react";
import { addIssue, Issue, Priority, subscribeToIssues } from "@/firebase/firestore";

interface Props {
    onClose: () => void;
    userEmail: string;
}

export default function CreateIssueModal({ onClose, userEmail }: Props) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<Priority>("Medium");
    const [assignedTo, setAssignedTo] = useState("");

    const [existingIssues, setExistingIssues] = useState<Issue[]>([]);
    const [similarIssues, setSimilarIssues] = useState<Issue[]>([]);
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        // Fetch issues for similarity check. 
        // In a real app with thousands of issues, we might want to use Algolia or server-side simple search.
        // For this intern project (<100s of active issues), client-side filtering is performant and easiest to implement.
        const unsubscribe = subscribeToIssues((data) => {
            setExistingIssues(data.filter(i => i.status !== 'Done')); // Only check active issues
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (title.trim().length < 3) {
            setSimilarIssues([]);
            return;
        }

        const inputLower = title.toLowerCase();
        const matches = existingIssues.filter(issue => {
            const issueTitleLower = issue.title.toLowerCase();
            // Basic similarity: checks if one string contains the other
            return issueTitleLower.includes(inputLower) || inputLower.includes(issueTitleLower);
        });

        setSimilarIssues(matches);
    }, [title, existingIssues]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // If similar issues exist and user hasn't confirmed yet
        if (similarIssues.length > 0 && !showWarning) {
            setShowWarning(true);
            return;
        }

        try {
            await addIssue({
                title,
                description,
                priority,
                status: 'Open',
                assignedTo: assignedTo || userEmail, // Default to self if empty
                createdBy: userEmail,
                createdAt: Date.now()
            });
            onClose();
        } catch (e) {
            console.error(e);
            alert("Error creating issue");
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg shadow-2xl rounded-xl bg-white overflow-hidden transform transition-all">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">Create New Issue</h3>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                setShowWarning(false); // Reset warning on edit
                            }}
                            required
                            placeholder="e.g., Fix login page bug"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                    </div>

                    {/* Similarity Warning Block */}
                    {similarIssues.length > 0 && (
                        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    {/* Warning Icon */}
                                    <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3 w-full">
                                    <h3 className="text-sm font-medium text-orange-800">
                                        Similar issues found ({similarIssues.length})
                                    </h3>
                                    <div className="mt-2 text-sm text-orange-700 max-h-32 overflow-y-auto scrollbar-thin">
                                        <ul className="list-disc pl-5 space-y-1">
                                            {similarIssues.map(issue => (
                                                <li key={issue.id}>
                                                    <span className="font-medium">{issue.title}</span>
                                                    <span className="text-xs ml-2 opacity-75 bg-orange-200 px-1 rounded">{issue.status}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    {showWarning && (
                                        <p className="mt-3 font-bold text-orange-900 border-t border-orange-200 pt-2">
                                            Are you sure? Click "Create Anyway" to confirm duplication.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Describe the issue..."
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as Priority)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Assign To</label>
                            <input
                                type="email"
                                value={assignedTo}
                                onChange={(e) => setAssignedTo(e.target.value)}
                                placeholder={userEmail}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                            <p className="mt-1 text-xs text-gray-500">Leave empty to assign to yourself</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8 bg-gray-50 -mx-6 -mb-6 px-6 py-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`px-4 py-2 text-white rounded-md shadow-sm font-medium transition-colors ${showWarning
                                    ? "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
                                    : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                                }`}
                        >
                            {showWarning ? "Create Anyway" : "Create Issue"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
