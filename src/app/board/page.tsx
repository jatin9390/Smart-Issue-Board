"use client";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/config";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Board from "@/components/Board";
import CreateIssueModal from "@/components/CreateIssueModal";

export default function BoardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">S</div>
                            <span className="text-xl font-bold text-gray-800 tracking-tight">
                                Smart Issue Board
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex flex-col items-end mr-2">
                                <span className="text-sm font-medium text-gray-700">{user.email}</span>
                                <span className="text-xs text-gray-500">Authenticated</span>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <span>+</span> New Issue
                            </button>
                            <button
                                onClick={() => signOut(auth)}
                                className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors border-l pl-4 ml-2"
                            >
                                Log out
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <Board />
            </main>

            {isModalOpen && (
                <CreateIssueModal
                    onClose={() => setIsModalOpen(false)}
                    userEmail={user.email!}
                />
            )}
        </div>
    );
}
