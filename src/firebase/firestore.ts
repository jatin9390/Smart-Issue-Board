import { db } from "./config";
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    doc,
    updateDoc,
    deleteDoc
} from "firebase/firestore";

export type Priority = 'Low' | 'Medium' | 'High';
export type Status = 'Open' | 'In Progress' | 'Done';

export interface Issue {
    id?: string;
    title: string;
    description: string;
    priority: Priority;
    status: Status;
    assignedTo: string;
    createdBy: string;
    createdAt: number;
}

const COLLECTION_NAME = "issues";

// Add a new issue
export const addIssue = async (issue: Omit<Issue, "id">) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), issue);
        return docRef.id;
    } catch (error) {
        console.error("Error adding issue: ", error);
        throw error;
    }
};

// Real-time subscription to issues
export const subscribeToIssues = (callback: (issues: Issue[]) => void) => {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));

    return onSnapshot(q, (snapshot) => {
        const issues = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Issue[];
        callback(issues);
    });
};

// Update status with Business Logic validation
export const updateIssueStatus = async (id: string, newStatus: Status, currentStatus: Status) => {
    // Rule: Cannot move Open -> Done directly
    if (currentStatus === 'Open' && newStatus === 'Done') {
        throw new Error("Please move the issue to 'In Progress' before marking it Done.");
    }

    const issueRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(issueRef, { status: newStatus });
};

// Delete an issue
export const deleteIssue = async (id: string) => {
    const issueRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(issueRef);
}
