// Firebase Configuration
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);
db = getFirestore(app);
storage = getStorage(app);

export { app, auth, db, storage };

// ========== Types ==========
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: "student" | "teacher";
  createdAt: Date;
  // Student fields
  grade?: string;
  studentId?: string;
  progress?: StudentProgress;
  // Teacher fields
  school?: string;
  teacherCode?: string;
}

export interface StudentProgress {
  completedLessons: string[];
  quizScores: Record<string, number>;
  studyTime: number; // minutes
  lastActive: Date;
  streak: number; // days
  xp: number;
  level: number;
}

export interface QuizResult {
  userId: string;
  lessonId: string;
  score: number;
  total: number;
  answers: Record<string, number>;
  completedAt: Date;
  timeSpent: number; // seconds
}
