import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  getDoc,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { TaskItem, StudentProfile, FeedbackEntry } from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test connection on boot as mandated by Firebase skill
async function testConnection() {
  try {
    const { getDocFromServer } = await import('firebase/firestore');
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore: client is currently offline or connecting...');
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
}

const TASKS_COL = 'tasks';
const PROFILE_COL = 'profile';
const PROFILE_DOC = 'main_profile';
const FEEDBACKS_COL = 'feedbacks';

/**
 * Fetch all tasks from Firebase Firestore
 */
export async function getTasksFromFirebase(): Promise<TaskItem[]> {
  try {
    const snap = await getDocs(collection(db, TASKS_COL));
    const list: TaskItem[] = [];
    snap.forEach((d) => {
      list.push(d.data() as TaskItem);
    });
    return list.sort((a, b) => {
      const numDiff = (a.number || 0) - (b.number || 0);
      if (numDiff !== 0) return numDiff;
      const dateA = a.createdAt || a.date || '';
      const dateB = b.createdAt || b.date || '';
      const tA = dateA ? new Date(dateA).getTime() : 0;
      const tB = dateB ? new Date(dateB).getTime() : 0;
      return tB - tA;
    });
  } catch (error) {
    console.error('Error fetching tasks from Firestore:', error);
    return [];
  }
}

/**
 * Real-time listener for tasks
 */
export function subscribeToTasks(callback: (tasks: TaskItem[]) => void) {
  return onSnapshot(
    collection(db, TASKS_COL),
    (snap) => {
      const list: TaskItem[] = [];
      snap.forEach((d) => {
        list.push(d.data() as TaskItem);
      });
      list.sort((a, b) => {
        const numDiff = (a.number || 0) - (b.number || 0);
        if (numDiff !== 0) return numDiff;
        const dateA = a.createdAt || a.date || '';
        const dateB = b.createdAt || b.date || '';
        const tA = dateA ? new Date(dateA).getTime() : 0;
        const tB = dateB ? new Date(dateB).getTime() : 0;
        return tB - tA;
      });
      callback(list);
    },
    (err) => console.error('Tasks snapshot error:', err)
  );
}

/**
 * Save or update task in Firebase
 */
export async function saveTaskToFirebase(task: TaskItem): Promise<boolean> {
  try {
    const taskRef = doc(db, TASKS_COL, task.id);
    await setDoc(
      taskRef,
      {
        ...task,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error('Failed to save task to Firebase:', err);
    return false;
  }
}

/**
 * Delete task from Firebase
 */
export async function deleteTaskFromFirebase(taskId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, TASKS_COL, taskId));
    return true;
  } catch (err) {
    console.error('Failed to delete task from Firebase:', err);
    return false;
  }
}

/**
 * Fetch profile from Firebase
 */
export async function getProfileFromFirebase(): Promise<StudentProfile | null> {
  try {
    const snap = await getDoc(doc(db, PROFILE_COL, PROFILE_DOC));
    if (snap.exists()) {
      return snap.data() as StudentProfile;
    }
    return null;
  } catch (err) {
    console.error('Failed to get profile from Firebase:', err);
    return null;
  }
}

/**
 * Real-time listener for profile
 */
export function subscribeToProfile(callback: (profile: StudentProfile) => void) {
  return onSnapshot(
    doc(db, PROFILE_COL, PROFILE_DOC),
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as StudentProfile);
      }
    },
    (err) => console.error('Profile snapshot error:', err)
  );
}

/**
 * Save profile to Firebase
 */
export async function saveProfileToFirebase(profile: StudentProfile): Promise<boolean> {
  try {
    await setDoc(doc(db, PROFILE_COL, PROFILE_DOC), {
      ...profile,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to save profile to Firebase:', err);
    return false;
  }
}

/**
 * Save feedback entry to Firebase
 */
export async function saveFeedbackToFirebase(feedback: FeedbackEntry): Promise<boolean> {
  try {
    await setDoc(doc(db, FEEDBACKS_COL, feedback.id), feedback);
    return true;
  } catch (err) {
    console.error('Failed to save feedback to Firebase:', err);
    return false;
  }
}

/**
 * Subscribe to feedbacks
 */
export function subscribeToFeedbacks(callback: (feedbacks: FeedbackEntry[]) => void) {
  return onSnapshot(
    collection(db, FEEDBACKS_COL),
    (snap) => {
      const list: FeedbackEntry[] = [];
      snap.forEach((d) => list.push(d.data() as FeedbackEntry));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    },
    (err) => console.error('Feedbacks snapshot error:', err)
  );
}
