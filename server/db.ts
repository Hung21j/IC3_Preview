import fs from "fs";
import path from "path";

export interface DBUser {
  id: string;
  username: string;
  password: string;
  name: string;
  className: string;
  school: string;
  role: 'admin' | 'student';
  createdAt: string;
  lastLogin?: string;
  lastLogout?: string | null;
  isOnline?: boolean;
}

export interface DBSessionLog {
  id: string;
  userId: string;
  username: string;
  name: string;
  className: string;
  school: string;
  loginTime: string;
  logoutTime?: string | null;
  durationSeconds?: number | null;
}

export interface DBExamHistory {
  id: string;
  userId: string;
  username: string;
  studentName: string;
  className: string;
  school: string;
  level: string;
  subset: string;
  mode: 'training' | 'testing';
  correctCount: number;
  wrongCount: number;
  totalCount: number;
  scorePercent: number;
  timeTaken: number;
  timestamp: string;
}

export interface DBCustomQuestion {
  id: string;
  levelId: "level-1" | "level-2" | "level-3";
  subsetId: "GM1" | "GM2" | "OT1" | "OT2" | "OT3" | "OT4" | "OT5";
  type: 'multiple_choice' | 'yes_no' | 'matching';
  text: string;
  options?: string[];
  correctAnswerText: string;
  correctKeys?: string[];
  pairs?: { left: string; right: string }[];
  explanation?: string;
  order?: number;
  createdAt: string;
  createdBy?: string;
}

interface DatabaseSchema {
  users: DBUser[];
  sessions: DBSessionLog[];
  history: DBExamHistory[];
  customQuestions: DBCustomQuestion[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "database.json");

// Default initial state with seed admin and students
const defaultData: DatabaseSchema = {
  users: [
    {
      id: "usr-admin",
      username: "admin",
      password: "admin123",
      name: "Quản Trị Viên Hệ Thống",
      className: "Hội đồng Khảo thí",
      school: "Trung Tâm Tin Học IC3",
      role: "admin",
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      lastLogin: new Date(Date.now() - 15 * 60000).toISOString(),
      lastLogout: null,
      isOnline: true
    },
    {
      id: "usr-student-1",
      username: "hoanglong",
      password: "123",
      name: "Hoàng Long",
      className: "6A3",
      school: "THCS Trưng Vương",
      role: "student",
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      lastLogin: new Date(Date.now() - 3 * 3600000).toISOString(),
      lastLogout: new Date(Date.now() - 2.5 * 3600000).toISOString(),
      isOnline: false
    },
    {
      id: "usr-student-2",
      username: "minhanh",
      password: "123",
      name: "Trần Minh Anh",
      className: "7B1",
      school: "THCS Nguyễn Tri Phương",
      role: "student",
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      lastLogin: new Date(Date.now() - 24 * 3600000).toISOString(),
      lastLogout: new Date(Date.now() - 23.5 * 3600000).toISOString(),
      isOnline: false
    },
    {
      id: "usr-student-3",
      username: "quochung",
      password: "123",
      name: "Phan Quốc Hưng",
      className: "8A2",
      school: "THCS Thăng Long",
      role: "student",
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      lastLogin: new Date(Date.now() - 5 * 3600000).toISOString(),
      lastLogout: new Date(Date.now() - 4 * 3600000).toISOString(),
      isOnline: false
    }
  ],
  sessions: [
    {
      id: "sess-1",
      userId: "usr-student-1",
      username: "hoanglong",
      name: "Hoàng Long",
      className: "6A3",
      school: "THCS Trưng Vương",
      loginTime: new Date(Date.now() - 3 * 3600000).toISOString(),
      logoutTime: new Date(Date.now() - 2.5 * 3600000).toISOString(),
      durationSeconds: 1800
    },
    {
      id: "sess-2",
      userId: "usr-student-2",
      username: "minhanh",
      name: "Trần Minh Anh",
      className: "7B1",
      school: "THCS Nguyễn Tri Phương",
      loginTime: new Date(Date.now() - 24 * 3600000).toISOString(),
      logoutTime: new Date(Date.now() - 23.5 * 3600000).toISOString(),
      durationSeconds: 1800
    },
    {
      id: "sess-3",
      userId: "usr-student-3",
      username: "quochung",
      name: "Phan Quốc Hưng",
      className: "8A2",
      school: "THCS Thăng Long",
      loginTime: new Date(Date.now() - 5 * 3600000).toISOString(),
      logoutTime: new Date(Date.now() - 4 * 3600000).toISOString(),
      durationSeconds: 3600
    },
    {
      id: "sess-admin-now",
      userId: "usr-admin",
      username: "admin",
      name: "Quản Trị Viên Hệ Thống",
      className: "Hội đồng Khảo thí",
      school: "Trung Tâm Tin Học IC3",
      loginTime: new Date(Date.now() - 15 * 60000).toISOString(),
      logoutTime: null,
      durationSeconds: null
    }
  ],
  history: [
    {
      id: "hist-1",
      userId: "usr-student-1",
      username: "hoanglong",
      studentName: "Hoàng Long",
      className: "6A3",
      school: "THCS Trưng Vương",
      level: "Level 1: Máy tính cơ bản",
      subset: "GM1",
      mode: "testing",
      correctCount: 26,
      wrongCount: 4,
      totalCount: 30,
      scorePercent: 87,
      timeTaken: 1420,
      timestamp: new Date(Date.now() - 2.6 * 3600000).toISOString()
    },
    {
      id: "hist-2",
      userId: "usr-student-2",
      username: "minhanh",
      studentName: "Trần Minh Anh",
      className: "7B1",
      school: "THCS Nguyễn Tri Phương",
      level: "Level 2: Các ứng dụng cốt lõi",
      subset: "OT1",
      mode: "training",
      correctCount: 20,
      wrongCount: 2,
      totalCount: 22,
      scorePercent: 91,
      timeTaken: 950,
      timestamp: new Date(Date.now() - 23.6 * 3600000).toISOString()
    },
    {
      id: "hist-3",
      userId: "usr-student-3",
      username: "quochung",
      studentName: "Phan Quốc Hưng",
      className: "8A2",
      school: "THCS Thăng Long",
      level: "Level 3: Cuộc sống trực tuyến",
      subset: "GM2",
      mode: "testing",
      correctCount: 28,
      wrongCount: 2,
      totalCount: 30,
      scorePercent: 93,
      timeTaken: 1200,
      timestamp: new Date(Date.now() - 4.2 * 3600000).toISOString()
    }
  ],
  customQuestions: [
    {
      id: "admin-q-sample-1",
      levelId: "level-1",
      subsetId: "GM1",
      type: "multiple_choice",
      text: "Đơn vị đo tốc độ xử lý xung nhịp của CPU hiện nay thông thường được tính bằng đơn vị nào?",
      options: [
        "A. Byte (B)",
        "B. Gigahertz (GHz)",
        "C. Megabit per second (Mbps)",
        "D. Revolutions per minute (RPM)"
      ],
      correctAnswerText: "Gigahertz (GHz) là đơn vị đo tần số xung nhịp làm việc của bộ vi xử lý (CPU).",
      correctKeys: ["B"],
      createdAt: new Date().toISOString(),
      createdBy: "admin"
    }
  ]
};

class DBManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadFromDisk();
  }

  private loadFromDisk(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users || defaultData.users,
          sessions: parsed.sessions || defaultData.sessions,
          history: parsed.history || defaultData.history,
          customQuestions: parsed.customQuestions || defaultData.customQuestions
        };
      }
    } catch (err) {
      console.error("Error reading database file:", err);
    }
    // Write defaults if no file or error
    this.saveToDisk(defaultData);
    return defaultData;
  }

  private saveToDisk(payload?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const dataToSave = payload || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), "utf-8");
    } catch (err) {
      console.error("Error saving database file:", err);
    }
  }

  public getUsers(): DBUser[] {
    return this.data.users;
  }

  public findUserByUsername(username: string): DBUser | undefined {
    return this.data.users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
  }

  public findUserById(id: string): DBUser | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public addUser(user: Omit<DBUser, "id" | "createdAt">): DBUser {
    const newUser: DBUser = {
      ...user,
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      isOnline: false
    };
    this.data.users.push(newUser);
    this.saveToDisk();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<DBUser>): DBUser | null {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.saveToDisk();
    return this.data.users[idx];
  }

  public deleteUser(id: string): boolean {
    const user = this.findUserById(id);
    if (!user || user.username === "admin") {
      return false; // protect primary admin
    }
    this.data.users = this.data.users.filter(u => u.id !== id);
    this.saveToDisk();
    return true;
  }

  // Session Logging
  public createSession(user: DBUser): DBSessionLog {
    const session: DBSessionLog = {
      id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: user.id,
      username: user.username,
      name: user.name,
      className: user.className,
      school: user.school,
      loginTime: new Date().toISOString(),
      logoutTime: null,
      durationSeconds: null
    };

    // Update user status
    this.updateUser(user.id, {
      lastLogin: session.loginTime,
      isOnline: true
    });

    this.data.sessions.unshift(session);
    // Keep max 500 session records
    if (this.data.sessions.length > 500) {
      this.data.sessions = this.data.sessions.slice(0, 500);
    }
    this.saveToDisk();
    return session;
  }

  public endSession(userId: string, sessionId?: string): boolean {
    const now = new Date();
    let session = sessionId ? this.data.sessions.find(s => s.id === sessionId) : null;
    
    if (!session) {
      session = this.data.sessions.find(s => s.userId === userId && !s.logoutTime);
    }

    if (session) {
      session.logoutTime = now.toISOString();
      const loginMs = new Date(session.loginTime).getTime();
      session.durationSeconds = Math.max(1, Math.round((now.getTime() - loginMs) / 1000));
    }

    this.updateUser(userId, {
      lastLogout: now.toISOString(),
      isOnline: false
    });

    this.saveToDisk();
    return true;
  }

  public getSessions(): DBSessionLog[] {
    return this.data.sessions;
  }

  // History Records
  public addExamHistory(item: Omit<DBExamHistory, "id" | "timestamp">): DBExamHistory {
    const record: DBExamHistory = {
      ...item,
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString()
    };
    this.data.history.unshift(record);
    if (this.data.history.length > 1000) {
      this.data.history = this.data.history.slice(0, 1000);
    }
    this.saveToDisk();
    return record;
  }

  public getExamHistory(): DBExamHistory[] {
    return this.data.history;
  }

  // Custom Questions Added by Admin
  public getCustomQuestions(): DBCustomQuestion[] {
    return this.data.customQuestions;
  }

  public addCustomQuestion(q: Omit<DBCustomQuestion, "id" | "createdAt">): DBCustomQuestion {
    const newQuestion: DBCustomQuestion = {
      ...q,
      id: `custom-q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    this.data.customQuestions.push(newQuestion);
    this.saveToDisk();
    return newQuestion;
  }

  public updateCustomQuestion(id: string, updates: Partial<DBCustomQuestion>): DBCustomQuestion | null {
    const target = this.data.customQuestions.find(q => q.id === id);
    if (!target) return null;

    Object.assign(target, updates);
    this.saveToDisk();
    return target;
  }

  public deleteCustomQuestion(id: string): boolean {
    const initialLen = this.data.customQuestions.length;
    this.data.customQuestions = this.data.customQuestions.filter(q => q.id !== id);
    if (this.data.customQuestions.length !== initialLen) {
      this.saveToDisk();
      return true;
    }
    return false;
  }
}

export const db = new DBManager();
