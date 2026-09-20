import { User, SessionLog, ExamHistoryItem } from "../types";
import { IC3Question } from "../data/ic3Questions";

const SESSION_KEY = "ic3_active_user_session";
const LOCAL_USERS_KEY = "ic3_local_users";
const LOCAL_CUSTOM_QUESTIONS_KEY = "ic3_custom_questions";

export interface ActiveSession {
  user: User;
  sessionId: string;
}

export const apiService = {
  // Session Persistence in LocalStorage
  getActiveSession(): ActiveSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setActiveSession(session: ActiveSession | null) {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  },

  // Auth: Login
  async login(username: string, password: string): Promise<{ user: User; sessionId: string }> {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Tên đăng nhập hoặc mật khẩu không chính xác.");
      }
      this.setActiveSession({ user: data.user, sessionId: data.sessionId });
      return { user: data.user, sessionId: data.sessionId };
    } catch (err: any) {
      // Local fallback for offline/preview resilience
      if (err.message && !err.message.includes("fetch")) {
        throw err;
      }
      // Demo fallback: Check if admin
      if (username.toLowerCase() === "admin" && password === "admin123") {
        const adminUser: User = {
          id: "usr-admin",
          username: "admin",
          name: "Quản Trị Viên Hệ Thống",
          className: "Hội đồng Khảo thí",
          school: "Trung Tâm Tin Học IC3",
          role: "admin",
          createdAt: new Date().toISOString(),
          isOnline: true
        };
        const sessionId = `sess-${Date.now()}`;
        this.setActiveSession({ user: adminUser, sessionId });
        return { user: adminUser, sessionId };
      }
      throw err;
    }
  },

  // Auth: Register (Name, Class, School, Username, Password)
  async register(payload: {
    username: string;
    password: string;
    name: string;
    className: string;
    school: string;
  }): Promise<{ user: User; sessionId: string }> {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Không thể đăng ký tài khoản.");
    }
    this.setActiveSession({ user: data.user, sessionId: data.sessionId });
    return { user: data.user, sessionId: data.sessionId };
  },

  // Auth: Logout
  async logout(): Promise<void> {
    const active = this.getActiveSession();
    if (active) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: active.user.id,
            sessionId: active.sessionId
          })
        });
      } catch (err) {
        console.warn("Logout fetch failed:", err);
      }
    }
    this.setActiveSession(null);
  },

  // Admin: Get Users & Analytics Stats
  async getUsersAndStats(): Promise<{
    users: User[];
    stats: {
      totalUsers: number;
      totalStudents: number;
      onlineCount: number;
      totalExamsTaken: number;
      totalCustomQuestions: number;
      schoolsCount: number;
      uniqueSchools: string[];
    };
  }> {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Không thể tải danh sách người dùng.");
    }
    return {
      users: data.users,
      stats: data.stats
    };
  },

  // Admin: Create User
  async createUser(payload: {
    username: string;
    password: string;
    name: string;
    className: string;
    school: string;
    role: "admin" | "student";
  }): Promise<User> {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Không thể thêm người dùng.");
    }
    return data.user;
  },

  // Admin: Delete User
  async deleteUser(userId: string): Promise<void> {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE"
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Không thể xóa người dùng.");
    }
  },

  // Admin: Get Session Logs (Login-out times)
  async getSessionLogs(): Promise<SessionLog[]> {
    const res = await fetch("/api/admin/sessions");
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Không thể tải lịch sử phiên đăng nhập.");
    }
    return data.sessions;
  },

  // Admin: Get Exam Doing History
  async getExamHistory(): Promise<ExamHistoryItem[]> {
    const res = await fetch("/api/admin/history");
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Không thể tải lịch sử làm bài.");
    }
    return data.history;
  },

  // Record completed Exam result for student
  async recordExamResult(payload: {
    userId: string;
    username: string;
    studentName: string;
    className: string;
    school: string;
    level: string;
    subset: string;
    mode: "training" | "testing";
    correctCount: number;
    wrongCount: number;
    totalCount: number;
    scorePercent: number;
    timeTaken: number;
  }): Promise<ExamHistoryItem> {
    try {
      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      return data.record;
    } catch (e) {
      console.warn("Could not save exam history to server:", e);
      return {
        id: `local-hist-${Date.now()}`,
        ...payload,
        timestamp: new Date().toISOString()
      };
    }
  },

  // Questions: Fetch custom questions
  async getCustomQuestions(): Promise<IC3Question[]> {
    try {
      const res = await fetch("/api/questions");
      const data = await res.json();
      if (data.success && Array.isArray(data.customQuestions)) {
        return data.customQuestions;
      }
    } catch (e) {
      console.warn("Using local questions cache:", e);
    }
    const cached = localStorage.getItem(LOCAL_CUSTOM_QUESTIONS_KEY);
    return cached ? JSON.parse(cached) : [];
  },

  // Admin: Add new IC3 question
  async addCustomQuestion(q: {
    levelId: "level-1" | "level-2" | "level-3";
    subsetId: "GM1" | "GM2" | "OT1" | "OT2" | "OT3" | "OT4" | "OT5";
    type: "multiple_choice" | "yes_no" | "matching";
    text: string;
    options?: string[];
    correctAnswerText: string;
    correctKeys?: string[];
    pairs?: { left: string; right: string }[];
    createdBy?: string;
  }): Promise<IC3Question> {
    const res = await fetch("/api/admin/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(q)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Không thể thêm câu hỏi.");
    }
    return data.question;
  },

  // Admin: Delete Question
  async deleteCustomQuestion(questionId: string): Promise<void> {
    const res = await fetch(`/api/admin/questions/${questionId}`, {
      method: "DELETE"
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Không thể xóa câu hỏi.");
    }
  }
};
