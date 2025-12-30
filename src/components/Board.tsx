"use client";
import { useEffect, useState } from "react";
import { subscribeToIssues, Issue, Status, updateIssueStatus } from "@/firebase/firestore";
import IssueCard from "./IssueCard";

const COLUMNS: Status[] = ['Open', 'In Progress', 'Done'];

export default function Board() {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const unsubscribe = subscribeToIssues((data) => {
            setIssues(data);
        });
        return () => unsubscribe();
    }, []);

    const handleStatusChange = async (id: string, newStatus: Status, currentStatus: Status) => {
        if (newStatus === currentStatus) return;

        try {
            setError("");
            await updateIssueStatus(id, newStatus, currentStatus);
        } catch (err: any) {
            setError(err.message);
            // clear error after 5 seconds
            setTimeout(() => setError(""), 5000);
        }
    };

    return (
        <div>
            {error && (
                <div className="fixed top-20 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50 flex items-center animate-bounce" role="alert">
                    <svg className="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z" /></svg>
                    <span className="block sm:inline font-medium">{error}</span>
                    <button onClick={() => setError("")} className="ml-4 font-bold opacity-50 hover:opacity-100">X</button>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {COLUMNS.map(status => (
                    <div key={status} className="bg-gray-50 p-4 rounded-xl shadow-sm min-h-[500px] flex flex-col border border-gray-200">
                        <h2 className={`font-bold text-lg mb-4 pb-2 border-b-2 flex justify-between items-center ${status === 'Open' ? 'border-blue-500 text-blue-700' :
                                status === 'In Progress' ? 'border-yellow-500 text-yellow-700' :
                                    'border-green-500 text-green-700'
                            }`}>
                            {status}
                            <span className="bg-white text-gray-600 text-xs px-2 py-1 rounded-full border shadow-sm">
                                {issues.filter(i => i.status === status).length}
                            </span>
                        </h2>
                        <div className="flex-1 space-y-3">
                            {issues.filter(i => i.status === status).map(issue => (
                                <IssueCard
                                    key={issue.id}
                                    issue={issue}
                                    onStatusChange={handleStatusChange}
                                />
                            ))}
                            {issues.filter(i => i.status === status).length === 0 && (
                                <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm">
                                    No issues
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
