import {
  collection,
  doc,
  getDocs,
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

/**
 * Recursively cleans and removes all `undefined` values from data objects.
 * Firestore strictly rejects `undefined` values and throws:
 * "FirebaseError: Function setDoc() called with invalid data. Unsupported field value: undefined"
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === "object" && !(data instanceof Date)) {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        result[key] = sanitizeForFirestore(value);
      }
    }
    return result as T;
  }
  return data;
}

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
            isOnline: !!data.isOnline,
            sessionVersion: data.sessionVersion || 0
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
        await setDoc(doc(db, USERS_COLLECTION, u.id), sanitizeForFirestore(u));
      }
    } catch (e) {
      console.warn("Failed seeding initial cloud users:", e);
    }
  },

  async saveCloudUser(user: User, password: string): Promise<void> {
    const docRef = doc(db, USERS_COLLECTION, user.id);
    const payload = sanitizeForFirestore({
      ...user,
      password,
      updatedAt: new Date().toISOString()
    });
    await setDoc(docRef, payload, { merge: true });
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

  async forceLogoutUser(userId: string): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, userId);
  
    // Đọc dữ liệu hiện tại
    const snap = await getDocs(collection(db, USERS_COLLECTION));
  
    const target = snap.docs.find((d) => d.id === userId);
  
    if (!target) {
      throw new Error("Không tìm thấy tài khoản.");
    }
  
    const data = target.data() as any;
    const nextVersion = (data.sessionVersion || 0) + 1;
  
    // Tăng version => các thiết bị đang đăng nhập sẽ bị buộc logout
    await updateDoc(userRef, {
      isOnline: false,
      sessionVersion: nextVersion,
      lastLogout: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  
    // Đồng thời đóng các session đang hoạt động của user
    try {
      const sessionSnap = await getDocs(collection(db, SESSIONS_COLLECTION));
  
      const now = new Date().toISOString();
  
      for (const sessionDoc of sessionSnap.docs) {
        const session = sessionDoc.data() as SessionLog;
  
        if (
          session.userId === userId &&
          !session.logoutTime
        ) {
          const loginTime = new Date(session.loginTime).getTime();
          const logoutTime = new Date(now).getTime();
  
          await updateDoc(sessionDoc.ref, {
            logoutTime: now,
            durationSeconds: Math.max(
              0,
              Math.floor((logoutTime - loginTime) / 1000)
            ),
            isOnline: false
          });
        }
      }
    } catch (err) {
      console.warn("Could not close active sessions:", err);
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
    const cleanPayload = sanitizeForFirestore({
      ...question,
      updatedAt: new Date().toISOString()
    });
    await setDoc(docRef, cleanPayload);
  },

  async updateCloudQuestionOrder(questionId: string, order: number): Promise<void> {
    try {
      const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
      await updateDoc(docRef, {
        order,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Firestore updateCloudQuestionOrder error:", err);
    }
  },

  async deleteCloudQuestion(questionId: string): Promise<void> {
    const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
    await deleteDoc(docRef);
  },

  // ================= 🏆 EXAM HISTORY =================
  async getCloudExamHistory(): Promise<ExamHistoryItem[]> {
    try {
      const qRef = collection(db, EXAM_HISTORY_COLLECTION);
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
      const cleanPayload = sanitizeForFirestore({
        ...record,
        createdAtServer: serverTimestamp()
      });
      await setDoc(docRef, cleanPayload);
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
      const cleanPayload = sanitizeForFirestore({
        ...session,
        updatedAt: new Date().toISOString()
      });
      await setDoc(docRef, cleanPayload);
    } catch (err) {
      console.warn("Failed to write session log to Cloud Firestore:", err);
    }
  }
};
