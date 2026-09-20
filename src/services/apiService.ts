import { User, SessionLog, ExamHistoryItem } from "../types";
import { IC3Question } from "../data/ic3Questions";

const SESSION_KEY = "ic3_active_user_session";
const LOCAL_USERS_KEY = "ic3_users_db_v2";
const LOCAL_SESSIONS_KEY = "ic3_sessions_db_v2";
const LOCAL_EXAM_HISTORY_KEY = "ic3_exam_history_v2";
const LOCAL_CUSTOM_QUESTIONS_KEY = "ic3_custom_questions_v2";

export interface ActiveSession {
  user: User;
  sessionId: string;
}

interface StoredUserCredential {
  user: User;
  password: string;
}

// Initial seed accounts for offline & GitHub Pages static mode
const DEFAULT_STORED_USERS: StoredUserCredential[] = [
  {
    user: {
      id: "usr-admin",
      username: "admin",
      name: "Quản Trị Viên Hệ Thống",
      className: "Hội đồng Khảo thí",
      school: "Trung Tâm Tin Học IC3",
      role: "admin",
      createdAt: "2026-09-01T08:00:00.000Z",
      isOnline: false
    },
    password: "admin123"
  },
  {
    user: {
      id: "usr-student-1",
      username: "hoanglong",
      name: "Hoàng Long",
      className: "6A3",
      school: "THCS Trưng Vương",
      role: "student",
      createdAt: "2026-09-05T09:30:00.000Z",
      isOnline: false
    },
    password: "123"
  },
  {
    user: {
      id: "usr-student-2",
      username: "minhanh",
      name: "Trần Minh Anh",
      className: "7B1",
      school: "THCS Nguyễn Tri Phương",
      role: "student",
      createdAt: "2026-09-08T10:00:00.000Z",
      isOnline: false
    },
    password: "123"
  },
  {
    user: {
      id: "usr-student-3",
      username: "quochung",
      name: "Phan Quốc Hưng",
      className: "8A2",
      school: "THCS Thăng Long",
      role: "student",
      createdAt: "2026-09-10T14:20:00.000Z",
      isOnline: false
    },
    password: "123"
  }
];

// Helper to safely call backend API with fast fallback for static/GitHub Pages
async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ ok: boolean; data?: T; status?: number; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return { ok: false, status: res.status, error: "Non-JSON response from server" };
    }

    const data = await res.json();
    return { ok: res.ok, data, status: res.status, error: data?.error };
  } catch (err: any) {
    return { ok: false, error: err.message || "Network error" };
  }
}

// Local Storage Database Managers
function getLocalUsers(): StoredUserCredential[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not read local users DB:", e);
  }
  // Initialize default
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(DEFAULT_STORED_USERS));
  return DEFAULT_STORED_USERS;
}

function saveLocalUsers(users: StoredUserCredential[]) {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn("Could not save local users DB:", e);
  }
}

function getLocalSessions(): SessionLog[] {
  try {
    const raw = localStorage.getItem(LOCAL_SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalSessions(sessions: SessionLog[]) {
  try {
    localStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.warn("Could not save local sessions:", e);
  }
}

function getLocalExamHistory(): ExamHistoryItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_EXAM_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalExamHistory(history: ExamHistoryItem[]) {
  try {
    localStorage.setItem(LOCAL_EXAM_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn("Could not save local exam history:", e);
  }
}

function getLocalCustomQuestions(): IC3Question[] {
  try {
    const raw = localStorage.getItem(LOCAL_CUSTOM_QUESTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCustomQuestions(questions: IC3Question[]) {
  try {
    localStorage.setItem(LOCAL_CUSTOM_QUESTIONS_KEY, JSON.stringify(questions));
  } catch (e) {
    console.warn("Could not save local custom questions:", e);
  }
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

  // Auth: Login (Dual-mode: Server first, Local DB fallback)
  async login(username: string, password: string): Promise<{ user: User; sessionId: string }> {
    const cleanUsername = username.trim().toLowerCase();

    // 1. Try backend server
    const result = await safeFetchJson<{ success: boolean; user: User; sessionId: string; error?: string }>(
      "/api/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanUsername, password })
      }
    );

    if (result.ok && result.data?.success && result.data.user) {
      const user = result.data.user;
      const sessionId = result.data.sessionId;
      this.setActiveSession({ user, sessionId });

      // Synchronize into local storage as backup
      const localUsers = getLocalUsers();
      const existingIdx = localUsers.findIndex((u) => u.user.username === cleanUsername);
      if (existingIdx >= 0) {
        localUsers[existingIdx].user = user;
        localUsers[existingIdx].password = password;
      } else {
        localUsers.push({ user, password });
      }
      saveLocalUsers(localUsers);

      return { user, sessionId };
    }

    // If server returned explicit credentials error (e.g. wrong password), show it
    if (result.status === 400 || result.status === 401) {
      throw new Error(result.error || "Tên đăng nhập hoặc mật khẩu không chính xác.");
    }

    // 2. Static / GitHub Pages Fallback: Check Local Storage Database
    const localUsers = getLocalUsers();
    const match = localUsers.find((entry) => entry.user.username.toLowerCase() === cleanUsername);

    if (!match) {
      throw new Error("Tài khoản chưa được đăng ký trên hệ thống. Vui lòng bấm 'Tạo tài khoản mới'.");
    }

    if (match.password !== password) {
      throw new Error("Mật khẩu không chính xác. Vui lòng kiểm tra lại.");
    }

    // Create session in local DB
    const sessionId = `sess-local-${Date.now()}`;
    const updatedUser: User = {
      ...match.user,
      isOnline: true
    };

    // Update isOnline in local users list
    match.user.isOnline = true;
    saveLocalUsers(localUsers);

    // Record session log
    const sessions = getLocalSessions();
    sessions.unshift({
      id: sessionId,
      userId: updatedUser.id,
      username: updatedUser.username,
      name: updatedUser.name,
      className: updatedUser.className,
      school: updatedUser.school,
      role: updatedUser.role,
      loginTime: new Date().toISOString(),
      isOnline: true
    });
    saveLocalSessions(sessions);

    this.setActiveSession({ user: updatedUser, sessionId });
    return { user: updatedUser, sessionId };
  },

  // Auth: Register (Dual-mode: Server first, Local DB fallback)
  async register(payload: {
    username: string;
    password: string;
    name: string;
    className: string;
    school: string;
  }): Promise<{ user: User; sessionId: string }> {
    const cleanUsername = payload.username.trim().toLowerCase();

    // 1. Try backend server
    const result = await safeFetchJson<{ success: boolean; user: User; sessionId: string; error?: string }>(
      "/api/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          username: cleanUsername
        })
      }
    );

    if (result.ok && result.data?.success && result.data.user) {
      const user = result.data.user;
      const sessionId = result.data.sessionId;
      this.setActiveSession({ user, sessionId });

      // Sync to local DB
      const localUsers = getLocalUsers();
      localUsers.push({ user, password: payload.password });
      saveLocalUsers(localUsers);

      return { user, sessionId };
    }

    // If server returned a business logic error (like username already exists), rethrow it
    if (result.status === 400 && result.error) {
      throw new Error(result.error);
    }

    // 2. Static / GitHub Pages Fallback: Create account locally in localStorage
    const localUsers = getLocalUsers();
    const existing = localUsers.find((entry) => entry.user.username.toLowerCase() === cleanUsername);
    if (existing) {
      throw new Error(`Tên đăng nhập "${cleanUsername}" đã được sử dụng. Vui lòng chọn tên đăng nhập khác.`);
    }

    const newUser: User = {
      id: `usr-loc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      username: cleanUsername,
      name: payload.name.trim(),
      className: payload.className.trim(),
      school: payload.school.trim(),
      role: "student",
      createdAt: new Date().toISOString(),
      isOnline: true
    };

    localUsers.push({
      user: newUser,
      password: payload.password
    });
    saveLocalUsers(localUsers);

    // Record session log
    const sessionId = `sess-loc-${Date.now()}`;
    const sessions = getLocalSessions();
    sessions.unshift({
      id: sessionId,
      userId: newUser.id,
      username: newUser.username,
      name: newUser.name,
      className: newUser.className,
      school: newUser.school,
      role: newUser.role,
      loginTime: new Date().toISOString(),
      isOnline: true
    });
    saveLocalSessions(sessions);

    this.setActiveSession({ user: newUser, sessionId });
    return { user: newUser, sessionId };
  },

  // Auth: Logout
  async logout(): Promise<void> {
    const active = this.getActiveSession();
    if (active) {
      // 1. Notify backend if available
      safeFetchJson("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: active.user.id,
          sessionId: active.sessionId
        })
      }).catch(() => {});

      // 2. Update local session & user offline state
      const localUsers = getLocalUsers();
      const u = localUsers.find((entry) => entry.user.id === active.user.id);
      if (u) {
        u.user.isOnline = false;
        saveLocalUsers(localUsers);
      }

      const sessions = getLocalSessions();
      const s = sessions.find((item) => item.id === active.sessionId);
      if (s) {
        const now = new Date();
        s.logoutTime = now.toISOString();
        s.isOnline = false;
        const start = new Date(s.loginTime).getTime();
        const end = now.getTime();
        s.durationSeconds = Math.max(0, Math.round((end - start) / 1000));
        saveLocalSessions(sessions);
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
    // Try backend
    const result = await safeFetchJson<{
      success: boolean;
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
    }>("/api/admin/users");

    if (result.ok && result.data?.success && Array.isArray(result.data.users)) {
      return {
        users: result.data.users,
        stats: result.data.stats
      };
    }

    // Static fallback
    const localUsers = getLocalUsers().map((entry) => entry.user);
    const history = getLocalExamHistory();
    const customQuestions = getLocalCustomQuestions();

    const schoolsSet = new Set<string>();
    localUsers.forEach((u) => {
      if (u.school && u.school.trim()) {
        schoolsSet.add(u.school.trim());
      }
    });

    const stats = {
      totalUsers: localUsers.length,
      totalStudents: localUsers.filter((u) => u.role === "student").length,
      onlineCount: localUsers.filter((u) => u.isOnline).length,
      totalExamsTaken: history.length,
      totalCustomQuestions: customQuestions.length,
      schoolsCount: schoolsSet.size,
      uniqueSchools: Array.from(schoolsSet)
    };

    return { users: localUsers, stats };
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
    const cleanUsername = payload.username.trim().toLowerCase();

    // Try backend
    const result = await safeFetchJson<{ success: boolean; user: User; error?: string }>(
      "/api/admin/users",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, username: cleanUsername })
      }
    );

    if (result.ok && result.data?.success && result.data.user) {
      const u = result.data.user;
      const localUsers = getLocalUsers();
      localUsers.push({ user: u, password: payload.password });
      saveLocalUsers(localUsers);
      return u;
    }

    if (result.status === 400 && result.error) {
      throw new Error(result.error);
    }

    // Static fallback
    const localUsers = getLocalUsers();
    if (localUsers.some((u) => u.user.username.toLowerCase() === cleanUsername)) {
      throw new Error(`Tên đăng nhập "${cleanUsername}" đã tồn tại trên hệ thống.`);
    }

    const newUser: User = {
      id: `usr-loc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      username: cleanUsername,
      name: payload.name.trim(),
      className: payload.className.trim(),
      school: payload.school.trim(),
      role: payload.role,
      createdAt: new Date().toISOString(),
      isOnline: false
    };

    localUsers.push({ user: newUser, password: payload.password });
    saveLocalUsers(localUsers);
    return newUser;
  },

  // Admin: Update User Password
  async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    if (!newPassword || newPassword.trim().length === 0) {
      throw new Error("Mật khẩu không được để trống.");
    }

    // Try backend
    const result = await safeFetchJson<{ success: boolean; error?: string }>(
      `/api/admin/users/${userId}/password`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword.trim() })
      }
    );

    if (result.status === 400 || result.status === 404) {
      throw new Error(result.error || "Không thể đổi mật khẩu.");
    }

    // Update in local DB as fallback and sync
    const localUsers = getLocalUsers();
    const target = localUsers.find((u) => u.user.id === userId);
    if (target) {
      target.password = newPassword.trim();
      saveLocalUsers(localUsers);
    }
  },

  // Admin: Create Bulk Users (from Sheet/Excel)
  async createBulkUsers(
    studentList: Array<{
      name: string;
      username: string;
      password?: string;
      className?: string;
      school?: string;
    }>
  ): Promise<{ createdCount: number; createdUsers: User[]; skippedCount: number }> {
    if (!Array.isArray(studentList) || studentList.length === 0) {
      return { createdCount: 0, createdUsers: [], skippedCount: 0 };
    }

    // 1. Try backend
    const result = await safeFetchJson<{
      success: boolean;
      createdCount: number;
      createdUsers: User[];
      skippedUsers: any[];
    }>("/api/admin/users/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ users: studentList })
    });

    if (result.ok && result.data?.success && Array.isArray(result.data.createdUsers)) {
      // Sync newly created users to local DB
      const localUsers = getLocalUsers();
      for (const u of result.data.createdUsers) {
        const item = studentList.find((s) => s.username.toLowerCase() === u.username.toLowerCase());
        const pwd = item?.password || "123";
        if (!localUsers.some((x) => x.user.username.toLowerCase() === u.username.toLowerCase())) {
          localUsers.push({ user: u, password: pwd });
        }
      }
      saveLocalUsers(localUsers);

      return {
        createdCount: result.data.createdCount,
        createdUsers: result.data.createdUsers,
        skippedCount: result.data.skippedUsers?.length || 0
      };
    }

    // 2. Static / GitHub Pages Fallback: Create locally in localStorage
    const localUsers = getLocalUsers();
    const createdUsers: User[] = [];
    let skippedCount = 0;

    for (const item of studentList) {
      const cleanUsername = item.username.trim().toLowerCase();
      const cleanName = item.name.trim();
      const pwd = (item.password || "123").trim();

      if (!cleanUsername || !cleanName) {
        skippedCount++;
        continue;
      }

      // Check duplicate
      if (localUsers.some((u) => u.user.username.toLowerCase() === cleanUsername)) {
        skippedCount++;
        continue;
      }

      const newUser: User = {
        id: `usr-loc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        username: cleanUsername,
        name: cleanName,
        className: (item.className || "").trim(),
        school: (item.school || "").trim(),
        role: "student",
        createdAt: new Date().toISOString(),
        isOnline: false
      };

      localUsers.push({ user: newUser, password: pwd });
      createdUsers.push(newUser);
    }

    saveLocalUsers(localUsers);
    return {
      createdCount: createdUsers.length,
      createdUsers,
      skippedCount
    };
  },

  // Admin: Delete User
  async deleteUser(userId: string): Promise<void> {
    // Try backend
    safeFetchJson(`/api/admin/users/${userId}`, { method: "DELETE" }).catch(() => {});

    // Always delete in local DB
    const localUsers = getLocalUsers();
    const filtered = localUsers.filter((u) => u.user.id !== userId);
    saveLocalUsers(filtered);
  },

  // Admin: Get Session Logs
  async getSessionLogs(): Promise<SessionLog[]> {
    const result = await safeFetchJson<{ success: boolean; sessions: SessionLog[] }>(
      "/api/admin/sessions"
    );
    if (result.ok && result.data?.success && Array.isArray(result.data.sessions)) {
      return result.data.sessions;
    }
    return getLocalSessions();
  },

  // Admin: Get Exam Doing History
  async getExamHistory(): Promise<ExamHistoryItem[]> {
    const result = await safeFetchJson<{ success: boolean; history: ExamHistoryItem[] }>(
      "/api/admin/history"
    );
    if (result.ok && result.data?.success && Array.isArray(result.data.history)) {
      return result.data.history;
    }
    return getLocalExamHistory();
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
    const newRecord: ExamHistoryItem = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...payload,
      timestamp: new Date().toISOString()
    };

    // Save to local storage
    const localHist = getLocalExamHistory();
    localHist.unshift(newRecord);
    saveLocalExamHistory(localHist);

    // Try saving to backend
    safeFetchJson<{ success: boolean; record: ExamHistoryItem }>("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(() => {});

    return newRecord;
  },

  // Questions: Fetch custom questions
  async getCustomQuestions(): Promise<IC3Question[]> {
    const result = await safeFetchJson<{ success: boolean; customQuestions: IC3Question[] }>(
      "/api/questions"
    );
    if (result.ok && result.data?.success && Array.isArray(result.data.customQuestions)) {
      // Sync into local cache
      saveLocalCustomQuestions(result.data.customQuestions);
      return result.data.customQuestions;
    }
    return getLocalCustomQuestions();
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
    const newQ: IC3Question = {
      id: `custom-q-${Date.now()}`,
      levelId: q.levelId,
      subsetId: q.subsetId,
      type: q.type,
      text: q.text,
      options: q.options,
      correctAnswerText: q.correctAnswerText,
      correctKeys: q.correctKeys,
      pairs: q.pairs
    };

    // Try backend
    const result = await safeFetchJson<{ success: boolean; question: IC3Question }>(
      "/api/admin/questions",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(q)
      }
    );

    if (result.ok && result.data?.success && result.data.question) {
      const questions = getLocalCustomQuestions();
      questions.unshift(result.data.question);
      saveLocalCustomQuestions(questions);
      return result.data.question;
    }

    // Save locally
    const questions = getLocalCustomQuestions();
    questions.unshift(newQ);
    saveLocalCustomQuestions(questions);
    return newQ;
  },

  // Admin: Delete Question
  async deleteCustomQuestion(questionId: string): Promise<void> {
    safeFetchJson(`/api/admin/questions/${questionId}`, { method: "DELETE" }).catch(() => {});
    const questions = getLocalCustomQuestions().filter((q) => q.id !== questionId);
    saveLocalCustomQuestions(questions);
  }
};
