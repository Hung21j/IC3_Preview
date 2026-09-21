import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { User, SessionLog, ExamHistoryItem } from "../types";
import { IC3Question } from "../data/ic3Questions";

// Collection names in Firestore
const USERS_COLLECTION = "users";
const QUESTIONS_COLLECTION = "questions";
const EXAM_HISTORY_COLLECTION = "examHistory";
const SESSIONS_COLLECTION = "sessionLogs";

// Default admin and sample users to auto-seed if cloud DB is completely fresh
const DEFAULT_CLOUD_USERS = [
  {
    id: "usr-admin",
    username: "admin",
    password: "admin123",
    name: "Quản Trị Viên Hệ Thống",
    className: "Hội đồng Khảo thí",
    school: "Trung Tâm Tin Học IC3",
    role: "admin" as const,
    createdAt: new Date().toISOString(),
    isOnline: false
  },
  {
    id: "usr-student-1",
    username: "hoanglong",
    password: "123",
    name: "Hoàng Long",
    className: "6A3",
    school: "THCS Trưng Vương",
    role: "student" as const,
    createdAt: new Date().toISOString(),
    isOnline: false
  },
  {
    id: "usr-student-2",
    username: "minhanh",
    password: "123",
    name: "Trần Minh Anh",
    className: "7B1",
    school: "THCS Nguyễn Tri Phương",
    role: "student" as const,
    createdAt: new Date().toISOString(),
    isOnline: false
  },
  {
    id: "usr-student-3",
    username: "quochung",
    password: "123",
    name: "Phan Quốc Hưng",
    className: "8A2",
    school: "THCS Thăng Long",
    role: "student" as const,
    createdAt: new Date().toISOString(),
    isOnline: false
  }
];

export const firestoreService = {
  // ================= 👤 USERS & AUTH =================
  async getCloudUsers(): Promise<Array<{ user: User; password: string }>> {
    try {
      const snap = await getDocs(collection(db, USERS_COLLECTION));
      if (snap.empty) {
        // Auto seed default users on initial run
        await this.seedDefaultUsers();
        return DEFAULT_CLOUD_USERS.map((u) => ({
          user: {
            id: u.id,
            username: u.username,
            name: u.name,
            className: u.className,
            school: u.school,
            role: u.role,
            createdAt: u.createdAt,
            isOnline: u.isOnline
          },
          password: u.password
        }));
      }

      const users: Array<{ user: User; password: string }> = [];
      snap.forEach((d) => {
        const data = d.data() as any;
        users.push({
          user: {
            id: d.id,
            username: data.username,
            name: data.name,
            className: data.className || "",
            school: data.school || "",
            role: data.role || "student",
            createdAt: data.createdAt || new Date().toISOString(),
            isOnline: !!data.isOnline
          },
          password: data.password || "123"
        });
      });
      return users;
    } catch (err) {
      console.warn("Firestore getCloudUsers fallback:", err);
      return [];
    }
  },

  async seedDefaultUsers(): Promise<void> {
    try {
      for (const u of DEFAULT_CLOUD_USERS) {
        await setDoc(doc(db, USERS_COLLECTION, u.id), u);
      }
    } catch (e) {
      console.warn("Failed seeding initial cloud users:", e);
    }
  },

  async saveCloudUser(user: User, password: string): Promise<void> {
    const docRef = doc(db, USERS_COLLECTION, user.id);
    await setDoc(
      docRef,
      {
        ...user,
        password,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  },

  async updateCloudUserPassword(userId: string, newPassword: string): Promise<void> {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(docRef, {
      password: newPassword,
      updatedAt: new Date().toISOString()
    });
  },

  async deleteCloudUser(userId: string): Promise<void> {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(docRef);
  },

  async setCloudUserOnline(userId: string, isOnline: boolean): Promise<void> {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(docRef, { isOnline });
    } catch {
      // Ignore if document not found or offline
    }
  },

  // ================= 📝 CUSTOM QUESTIONS =================
  async getCloudQuestions(): Promise<IC3Question[]> {
    try {
      const qRef = collection(db, QUESTIONS_COLLECTION);
      const snap = await getDocs(qRef);
      const questions: IC3Question[] = [];
      snap.forEach((d) => {
        const data = d.data() as IC3Question;
        questions.push({
          ...data,
          id: d.id
        });
      });
      // Sort newest first
      return questions.reverse();
    } catch (err) {
      console.warn("Firestore getCloudQuestions fallback:", err);
      return [];
    }
  },

  async saveCloudQuestion(question: IC3Question): Promise<void> {
    const docRef = doc(db, QUESTIONS_COLLECTION, question.id);
    await setDoc(docRef, {
      ...question,
      updatedAt: new Date().toISOString()
    });
  },

  async deleteCloudQuestion(questionId: string): Promise<void> {
    const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
    await deleteDoc(docRef);
  },

  // ================= 🏆 EXAM HISTORY =================
  async getCloudExamHistory(): Promise<ExamHistoryItem[]> {
    try {
      const qRef = collection(db, EXAM_HISTORY_COLLECTION);
      // Query recent records
      const q = query(qRef, orderBy("timestamp", "desc"), limit(200));
      const snap = await getDocs(q).catch(async () => {
        // Fallback without orderBy in case index is pending
        return await getDocs(qRef);
      });

      const items: ExamHistoryItem[] = [];
      snap.forEach((d) => {
        const data = d.data() as ExamHistoryItem;
        items.push({
          ...data,
          id: d.id
        });
      });
      return items;
    } catch (err) {
      console.warn("Firestore getCloudExamHistory fallback:", err);
      return [];
    }
  },

  async saveCloudExamRecord(record: ExamHistoryItem): Promise<void> {
    try {
      const docRef = doc(db, EXAM_HISTORY_COLLECTION, record.id);
      await setDoc(docRef, {
        ...record,
        createdAtServer: serverTimestamp()
      });
    } catch (err) {
      console.warn("Failed to write exam record to Cloud Firestore:", err);
    }
  },

  // ================= 📋 SESSIONS LOG =================
  async getCloudSessionLogs(): Promise<SessionLog[]> {
    try {
      const qRef = collection(db, SESSIONS_COLLECTION);
      const q = query(qRef, orderBy("loginTime", "desc"), limit(200));
      const snap = await getDocs(q).catch(async () => {
        return await getDocs(qRef);
      });

      const sessions: SessionLog[] = [];
      snap.forEach((d) => {
        const data = d.data() as SessionLog;
        sessions.push({
          ...data,
          id: d.id
        });
      });
      return sessions;
    } catch (err) {
      console.warn("Firestore getCloudSessionLogs fallback:", err);
      return [];
    }
  },

  async saveCloudSession(session: SessionLog): Promise<void> {
    try {
      const docRef = doc(db, SESSIONS_COLLECTION, session.id);
      await setDoc(docRef, {
        ...session,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Failed to write session log to Cloud Firestore:", err);
    }
  }
};
