import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Clock, 
  Award, 
  HelpCircle, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  LogOut, 
  GraduationCap, 
  RefreshCw, 
  ShieldCheck, 
  BookOpen, 
  ArrowLeft, 
  School, 
  Check, 
  X,
  AlertCircle,
  FileSpreadsheet,
  Activity,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User, SessionLog, ExamHistoryItem } from "../types";
import { IC3Question, IC3_QUESTIONS } from "../data/ic3Questions";
import { apiService } from "../services/apiService";

interface AdminDashboardProps {
  currentUser: User;
  onLogout: () => void;
  onSwitchToStudentView: () => void;
  onQuestionsUpdated?: () => void;
}

export default function AdminDashboard({ 
  currentUser, 
  onLogout, 
  onSwitchToStudentView,
  onQuestionsUpdated
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"users" | "sessions" | "history" | "questions">("users");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Data States
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalStudents: number;
    onlineCount: number;
    totalExamsTaken: number;
    totalCustomQuestions: number;
    schoolsCount: number;
    uniqueSchools: string[];
  }>({
    totalUsers: 0,
    totalStudents: 0,
    onlineCount: 0,
    totalExamsTaken: 0,
    totalCustomQuestions: 0,
    schoolsCount: 0,
    uniqueSchools: []
  });

  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
  const [examHistory, setExamHistory] = useState<ExamHistoryItem[]>([]);
  const [customQuestions, setCustomQuestions] = useState<IC3Question[]>([]);

  // Search & Filter States
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | "student" | "admin">("all");
  
  const [sessionSearch, setSessionSearch] = useState("");
  
  const [historySearch, setHistorySearch] = useState("");
  const [historyLevelFilter, setHistoryLevelFilter] = useState<string>("all");
  const [historyModeFilter, setHistoryModeFilter] = useState<string>("all");

  const [questionSearch, setQuestionSearch] = useState("");
  const [questionLevelFilter, setQuestionLevelFilter] = useState<string>("all");
  const [questionSubsetFilter, setQuestionSubsetFilter] = useState<string>("all");

  // Modal: Add User
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newClass, setNewClass] = useState("");
  const [newSchool, setNewSchool] = useState("");
  const [newRole, setNewRole] = useState<"student" | "admin">("student");

  // Add Question Form State
  const [qLevelId, setQLevelId] = useState<"level-1" | "level-2" | "level-3">("level-1");
  const [qSubsetId, setQSubsetId] = useState<"GM1" | "GM2" | "OT1" | "OT2" | "OT3" | "OT4" | "OT5">("GM1");
  const [qType, setQType] = useState<"multiple_choice" | "yes_no">("multiple_choice");
  const [qText, setQText] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correctKey, setCorrectKey] = useState("A");
  const [correctAnswerNote, setCorrectAnswerNote] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersData, sessionsData, historyData, questionsData] = await Promise.all([
        apiService.getUsersAndStats().catch(() => ({ users: [], stats: { totalUsers: 0, totalStudents: 0, onlineCount: 0, totalExamsTaken: 0, totalCustomQuestions: 0, schoolsCount: 0, uniqueSchools: [] } })),
        apiService.getSessionLogs().catch(() => []),
        apiService.getExamHistory().catch(() => []),
        apiService.getCustomQuestions().catch(() => [])
      ]);

      setUsers(usersData.users);
      setStats(usersData.stats);
      setSessionLogs(sessionsData);
      setExamHistory(historyData);
      setCustomQuestions(questionsData);
    } catch (err: any) {
      setError(err.message || "Lỗi tải dữ liệu bảng điều khiển.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const notify = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // Add User Handler
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword || !newName.trim()) {
      alert("Vui lòng nhập đầy đủ họ tên, tên đăng nhập và mật khẩu.");
      return;
    }

    try {
      await apiService.createUser({
        username: newUsername.trim().toLowerCase(),
        password: newPassword,
        name: newName.trim(),
        className: newClass.trim(),
        school: newSchool.trim(),
        role: newRole
      });
      notify("Đã thêm tài khoản mới thành công!");
      setShowAddUserModal(false);
      setNewUsername("");
      setNewPassword("");
      setNewName("");
      setNewClass("");
      setNewSchool("");
      setNewRole("student");
      loadData();
    } catch (err: any) {
      alert(err.message || "Lỗi tạo tài khoản.");
    }
  };

  // Delete User Handler
  const handleDeleteUser = async (user: User) => {
    if (user.username === "admin") {
      alert("Không thể xóa tài khoản Quản trị viên tối cao (admin).");
      return;
    }
    const ok = window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${user.name}" (@${user.username})?`);
    if (!ok) return;

    try {
      await apiService.deleteUser(user.id);
      notify(`Đã xóa tài khoản "${user.name}".`);
      loadData();
    } catch (err: any) {
      alert(err.message || "Lỗi xóa người dùng.");
    }
  };

  // Add Custom Question Handler
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim()) {
      alert("Vui lòng nhập nội dung câu hỏi.");
      return;
    }

    let options: string[] | undefined = undefined;
    let finalCorrectKeys = [correctKey];

    if (qType === "multiple_choice") {
      if (!optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
        alert("Vui lòng nhập đầy đủ 4 phương án A, B, C, D cho câu hỏi trắc nghiệm.");
        return;
      }
      options = [
        `A. ${optA.trim()}`,
        `B. ${optB.trim()}`,
        `C. ${optC.trim()}`,
        `D. ${optD.trim()}`
      ];
    } else if (qType === "yes_no") {
      finalCorrectKeys = [correctKey]; // "True" or "False"
    }

    try {
      await apiService.addCustomQuestion({
        levelId: qLevelId,
        subsetId: qSubsetId,
        type: qType,
        text: qText.trim(),
        options,
        correctAnswerText: correctAnswerNote.trim() || (options ? options.find(o => o.startsWith(correctKey)) || "" : correctKey),
        correctKeys: finalCorrectKeys,
        createdBy: currentUser.username
      });

      notify("Đã thêm câu hỏi mới vào ngân hàng đề thi thành công!");
      setQText("");
      setOptA("");
      setOptB("");
      setOptC("");
      setOptD("");
      setCorrectAnswerNote("");
      loadData();
      onQuestionsUpdated?.();
    } catch (err: any) {
      alert(err.message || "Lỗi thêm câu hỏi.");
    }
  };

  // Delete Custom Question
  const handleDeleteQuestion = async (qId: string) => {
    const ok = window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng đề?");
    if (!ok) return;

    try {
      await apiService.deleteCustomQuestion(qId);
      notify("Đã xóa câu hỏi khỏi ngân hàng.");
      loadData();
      onQuestionsUpdated?.();
    } catch (err: any) {
      alert(err.message || "Lỗi xóa câu hỏi.");
    }
  };

  // Filtered lists
  const filteredUsers = users.filter(u => {
    const matchSearch = (u.name + u.username + u.className + u.school)
      .toLowerCase()
      .includes(userSearch.toLowerCase());
    const matchRole = userRoleFilter === "all" || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  const filteredSessions = sessionLogs.filter(s => {
    return (s.name + s.username + s.className + s.school)
      .toLowerCase()
      .includes(sessionSearch.toLowerCase());
  });

  const filteredHistory = examHistory.filter(h => {
    const matchSearch = (h.studentName + h.username + h.className + h.school + h.subset)
      .toLowerCase()
      .includes(historySearch.toLowerCase());
    const matchLevel = historyLevelFilter === "all" || h.level.includes(historyLevelFilter);
    const matchMode = historyModeFilter === "all" || h.mode === historyModeFilter;
    return matchSearch && matchLevel && matchMode;
  });

  // Combined questions list (Base + Custom)
  const allMergedQuestions = [
    ...customQuestions.map(q => ({ ...q, isCustom: true })),
    ...IC3_QUESTIONS.map(q => ({ ...q, isCustom: false }))
  ];

  const filteredQuestions = allMergedQuestions.filter(q => {
    const matchSearch = q.text.toLowerCase().includes(questionSearch.toLowerCase());
    const matchLevel = questionLevelFilter === "all" || q.levelId === questionLevelFilter;
    const matchSubset = questionSubsetFilter === "all" || q.subsetId === questionSubsetFilter;
    return matchSearch && matchLevel && matchSubset;
  });

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} giây`;
    return `${mins} phút ${secs > 0 ? `${secs}s` : ""}`;
  };

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return "—";
    try {
      const d = new Date(isoString);
      return d.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 select-none border-4 md:border-8 border-slate-200">
      
      {/* 🚀 Admin Header Bar */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-extrabold tracking-tight text-slate-800 uppercase font-mono leading-none">
              TRUNG TÂM QUẢN TRỊ IC3
            </h1>
            <p className="text-[10px] text-slate-500 font-mono mt-1 font-medium">
              Quyền hạn Quản trị viên: <span className="font-bold text-amber-700">{currentUser.name}</span> (@{currentUser.username})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={onSwitchToStudentView}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold font-mono transition active:scale-95 shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Vào giao diện</span> Làm bài thi
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 rounded-lg text-xs font-bold font-mono transition active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </header>

      {/* Toast Notification Banner */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-emerald-600 text-white py-2 px-4 text-center text-xs font-bold font-mono shadow-md flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        <div className="max-w-7xl mx-auto w-full space-y-6">

          {/* 📊 Stat Cards Overview (Watch Quantity & Metrics) */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
            
            {/* Card 1: Total Users */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-[10px] font-extrabold uppercase font-mono tracking-wider">Tổng tài khoản</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black font-mono text-slate-800">
                {stats.totalUsers}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                {stats.totalStudents} học sinh • {stats.totalUsers - stats.totalStudents} admin
              </div>
            </div>

            {/* Card 2: Active Online */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-[10px] font-extrabold uppercase font-mono tracking-wider">Đang trực tuyến</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-2xl font-black font-mono text-emerald-600">
                {stats.onlineCount}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                Phiên làm việc đang mở
              </div>
            </div>

            {/* Card 3: Total Exams Completed */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-[10px] font-extrabold uppercase font-mono tracking-wider">Lượt làm bài</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black font-mono text-slate-800">
                {stats.totalExamsTaken}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                Bài kiểm tra đã nộp điểm
              </div>
            </div>

            {/* Card 4: Registered Schools */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-[10px] font-extrabold uppercase font-mono tracking-wider">Trường học</span>
                <School className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black font-mono text-slate-800">
                {stats.schoolsCount}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                Đơn vị trường tham gia
              </div>
            </div>

            {/* Card 5: Custom Questions */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-[10px] font-extrabold uppercase font-mono tracking-wider">Câu hỏi tự tạo</span>
                <HelpCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black font-mono text-emerald-650">
                {customQuestions.length}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                Tổng ngân hàng: {allMergedQuestions.length} câu
              </div>
            </div>

          </div>

          {/* 🎛️ Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 rounded-xl shadow-sm overflow-x-auto">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("users")}
                className={`py-3.5 px-3 text-xs font-bold font-mono border-b-2 transition flex items-center gap-2 shrink-0 ${
                  activeTab === "users"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>QUẢN LÝ NGƯỜI DÙNG</span>
                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full">
                  {users.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("sessions")}
                className={`py-3.5 px-3 text-xs font-bold font-mono border-b-2 transition flex items-center gap-2 shrink-0 ${
                  activeTab === "sessions"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>NHẬT KÝ ĐĂNG NHẬP / RA</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                  {sessionLogs.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`py-3.5 px-3 text-xs font-bold font-mono border-b-2 transition flex items-center gap-2 shrink-0 ${
                  activeTab === "history"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>LỊCH SỬ LÀM BÀI</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                  {examHistory.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("questions")}
                className={`py-3.5 px-3 text-xs font-bold font-mono border-b-2 transition flex items-center gap-2 shrink-0 ${
                  activeTab === "questions"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>THÊM & QUẢN LÝ CÂU HỎI</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full font-extrabold">
                  +{customQuestions.length} mới
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={loadData}
              disabled={isLoading}
              title="Làm mới dữ liệu"
              className="p-2 text-slate-400 hover:text-indigo-600 transition"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* TAB 1: USER MANAGEMENT */}
          {activeTab === "users" && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-6 space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <div className="relative w-full">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Tìm theo tên, username, lớp, trường..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  
                  <select
                    value={userRoleFilter}
                    onChange={(e: any) => setUserRoleFilter(e.target.value)}
                    className="py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="all">Tất cả vai trò</option>
                    <option value="student">Học sinh</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddUserModal(true)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold font-mono transition flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Thêm tài khoản mới</span>
                </button>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[10px] font-extrabold uppercase font-mono text-slate-500 border-y border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Trạng thái</th>
                      <th className="py-2.5 px-3">Học sinh / Tên đăng nhập</th>
                      <th className="py-2.5 px-3">Lớp</th>
                      <th className="py-2.5 px-3">Trường học</th>
                      <th className="py-2.5 px-3">Vai trò</th>
                      <th className="py-2.5 px-3">Lần đăng nhập cuối</th>
                      <th className="py-2.5 px-3 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 font-mono">
                          Không tìm thấy người dùng phù hợp.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${u.isOnline ? "bg-emerald-500 ring-2 ring-emerald-200" : "bg-slate-300"}`} />
                              <span className="text-[10px] font-mono text-slate-500">
                                {u.isOnline ? "Online" : "Offline"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-800">{u.name}</div>
                            <div className="text-[10px] font-mono text-indigo-600">@{u.username}</div>
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-700">
                            {u.className || "—"}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            {u.school || "—"}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-block text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded ${
                              u.role === "admin"
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-indigo-50 text-indigo-700 border border-indigo-150"
                            }`}>
                              {u.role === "admin" ? "Admin" : "Học sinh"}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[11px] font-mono text-slate-500">
                            {formatTime(u.lastLogin)}
                          </td>
                          <td className="py-3 px-3 text-right">
                            {u.username !== "admin" ? (
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition active:scale-95"
                                title="Xóa tài khoản"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-mono">Bảo vệ</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 2: LOGIN - LOGOUT SESSIONS */}
          {activeTab === "sessions" && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-6 space-y-4">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="relative w-full max-w-sm">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={sessionSearch}
                    onChange={(e) => setSessionSearch(e.target.value)}
                    placeholder="Tìm theo tên học sinh, username, trường..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="text-xs font-mono text-slate-500">
                  Tổng số: <strong className="text-slate-800">{filteredSessions.length}</strong> phiên
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[10px] font-extrabold uppercase font-mono text-slate-500 border-y border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Người dùng</th>
                      <th className="py-2.5 px-3">Lớp & Trường</th>
                      <th className="py-2.5 px-3">Thời gian Đăng nhập</th>
                      <th className="py-2.5 px-3">Thời gian Đăng xuất</th>
                      <th className="py-2.5 px-3">Thời lượng phiên</th>
                      <th className="py-2.5 px-3">Tình trạng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSessions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-mono">
                          Chưa ghi nhận lịch sử đăng nhập/đăng xuất nào.
                        </td>
                      </tr>
                    ) : (
                      filteredSessions.map((s) => {
                        const isActive = !s.logoutTime;
                        return (
                          <tr key={s.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-800">{s.name}</div>
                              <div className="text-[10px] font-mono text-indigo-600">@{s.username}</div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-semibold text-slate-700">{s.className || "—"}</div>
                              <div className="text-[10px] text-slate-500">{s.school || "—"}</div>
                            </td>
                            <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                              {formatTime(s.loginTime)}
                            </td>
                            <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                              {s.logoutTime ? formatTime(s.logoutTime) : (
                                <span className="text-emerald-600 font-bold">Chưa đăng xuất</span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-600">
                              {formatDuration(s.durationSeconds)}
                            </td>
                            <td className="py-3 px-3">
                              {isActive ? (
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Đang hoạt động
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                  Đã kết thúc
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: EXAM DOING HISTORY */}
          {activeTab === "history" && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-6 space-y-4">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Tìm theo tên học sinh, lớp, đề..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={historyLevelFilter}
                    onChange={(e) => setHistoryLevelFilter(e.target.value)}
                    className="py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="all">Tất cả cấp độ</option>
                    <option value="Level 1">Level 1</option>
                    <option value="Level 2">Level 2</option>
                    <option value="Level 3">Level 3</option>
                  </select>

                  <select
                    value={historyModeFilter}
                    onChange={(e) => setHistoryModeFilter(e.target.value)}
                    className="py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="all">Tất cả chế độ</option>
                    <option value="testing">Thi thử (Testing)</option>
                    <option value="training">Luyện tập (Training)</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[10px] font-extrabold uppercase font-mono text-slate-500 border-y border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Học sinh</th>
                      <th className="py-2.5 px-3">Lớp & Trường</th>
                      <th className="py-2.5 px-3">Phân môn & Đề</th>
                      <th className="py-2.5 px-3">Chế độ</th>
                      <th className="py-2.5 px-3">Kết quả & Điểm</th>
                      <th className="py-2.5 px-3">Thời gian làm</th>
                      <th className="py-2.5 px-3">Ngày giờ nộp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredHistory.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 font-mono">
                          Chưa có bản ghi kết quả bài thi nào.
                        </td>
                      </tr>
                    ) : (
                      filteredHistory.map((h) => {
                        const isPass = h.scorePercent >= 70;
                        return (
                          <tr key={h.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-800">{h.studentName}</div>
                              <div className="text-[10px] font-mono text-indigo-600">@{h.username}</div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-semibold text-slate-700">{h.className || "—"}</div>
                              <div className="text-[10px] text-slate-500">{h.school || "—"}</div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-800 text-xs">{h.level}</div>
                              <span className="inline-block text-[10px] font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 mt-0.5">
                                Đề {h.subset}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded ${
                                h.mode === "testing"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}>
                                {h.mode === "testing" ? "Thi thử" : "Luyện tập"}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <span className={`text-base font-black font-mono ${isPass ? "text-emerald-600" : "text-rose-600"}`}>
                                  {h.scorePercent}%
                                </span>
                                <span className="text-[11px] font-mono text-slate-500">
                                  ({h.correctCount}/{h.totalCount} câu)
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-600">
                              {formatDuration(h.timeTaken)}
                            </td>
                            <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                              {formatTime(h.timestamp)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 4: ADD & MANAGE QUESTIONS */}
          {activeTab === "questions" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Form: Add New Question (5 cols) */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-6 space-y-4">
                <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-sm font-bold uppercase font-mono text-slate-800">
                      Thêm câu hỏi mới
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Admin Tool
                  </span>
                </div>

                <form onSubmit={handleAddQuestion} className="space-y-3.5 text-xs">
                  
                  {/* Select Level & Subset */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold uppercase font-mono text-slate-500">
                        Cấp độ IC3
                      </label>
                      <select
                        value={qLevelId}
                        onChange={(e: any) => setQLevelId(e.target.value)}
                        className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="level-1">Level 1: Máy tính cơ bản</option>
                        <option value="level-2">Level 2: Các ứng dụng cốt lõi</option>
                        <option value="level-3">Level 3: Cuộc sống trực tuyến</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold uppercase font-mono text-slate-500">
                        Chọn Đề thi
                      </label>
                      <select
                        value={qSubsetId}
                        onChange={(e: any) => setQSubsetId(e.target.value)}
                        className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="GM1">Đề GM1</option>
                        <option value="GM2">Đề GM2</option>
                        <option value="OT1">Đề OT1</option>
                        <option value="OT2">Đề OT2</option>
                        <option value="OT3">Đề OT3</option>
                        <option value="OT4">Đề OT4</option>
                        <option value="OT5">Đề OT5</option>
                      </select>
                    </div>
                  </div>

                  {/* Question Type */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold uppercase font-mono text-slate-500">
                      Loại câu hỏi
                    </label>
                    <div className="grid grid-cols-2 gap-2 font-mono">
                      <button
                        type="button"
                        onClick={() => setQType("multiple_choice")}
                        className={`py-2 px-3 rounded-lg border text-center font-bold transition ${
                          qType === "multiple_choice"
                            ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        Trắc nghiệm (4 lựa chọn)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setQType("yes_no");
                          setCorrectKey("True");
                        }}
                        className={`py-2 px-3 rounded-lg border text-center font-bold transition ${
                          qType === "yes_no"
                            ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        Đúng / Sai (True / False)
                      </button>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold uppercase font-mono text-slate-500">
                      Nội dung câu hỏi
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={qText}
                      onChange={(e) => setQText(e.target.value)}
                      placeholder="Nhập nội dung câu hỏi IC3 cần thêm..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>

                  {/* Multiple Choice Options */}
                  {qType === "multiple_choice" && (
                    <div className="space-y-2 pt-1 border-t border-slate-100">
                      <div className="text-[10px] font-extrabold uppercase font-mono text-slate-500">
                        4 Phương án lựa chọn (A, B, C, D) & Chọn đáp án đúng:
                      </div>

                      <div className="space-y-2">
                        {[
                          { key: "A", val: optA, set: setOptA },
                          { key: "B", val: optB, set: setOptB },
                          { key: "C", val: optC, set: setOptC },
                          { key: "D", val: optD, set: setOptD }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center gap-2">
                            <label className="flex items-center gap-1 shrink-0 cursor-pointer">
                              <input
                                type="radio"
                                name="correctKey"
                                checked={correctKey === item.key}
                                onChange={() => setCorrectKey(item.key)}
                                className="text-emerald-600 focus:ring-emerald-500"
                              />
                              <span className={`w-5 h-5 rounded flex items-center justify-center font-mono font-bold text-[10px] ${
                                correctKey === item.key
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-200 text-slate-700"
                              }`}>
                                {item.key}
                              </span>
                            </label>
                            <input
                              type="text"
                              required
                              value={item.val}
                              onChange={(e) => item.set(e.target.value)}
                              placeholder={`Nội dung lựa chọn ${item.key}...`}
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Yes/No Correct Key */}
                  {qType === "yes_no" && (
                    <div className="space-y-1 pt-1 border-t border-slate-100">
                      <label className="block text-[10px] font-extrabold uppercase font-mono text-slate-500">
                        Đáp án đúng
                      </label>
                      <div className="grid grid-cols-2 gap-2 font-mono">
                        <button
                          type="button"
                          onClick={() => setCorrectKey("True")}
                          className={`py-2 rounded-lg border font-bold text-center ${
                            correctKey === "True"
                              ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                              : "bg-slate-50 border-slate-200 text-slate-600"
                          }`}
                        >
                          Đúng (True)
                        </button>
                        <button
                          type="button"
                          onClick={() => setCorrectKey("False")}
                          className={`py-2 rounded-lg border font-bold text-center ${
                            correctKey === "False"
                              ? "bg-rose-50 border-rose-500 text-rose-700"
                              : "bg-slate-50 border-slate-200 text-slate-600"
                          }`}
                        >
                          Sai (False)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Explanation Note */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold uppercase font-mono text-slate-500">
                      Giải thích / Lời giải chi tiết
                    </label>
                    <input
                      type="text"
                      value={correctAnswerNote}
                      onChange={(e) => setCorrectAnswerNote(e.target.value)}
                      placeholder="Giải thích vì sao đáp án này là đúng..."
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase tracking-wider font-mono shadow-md shadow-emerald-600/20 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Lưu vào Ngân hàng Đề</span>
                  </button>

                </form>
              </div>

              {/* Right List: Question Bank Explorer (7 cols) */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-6 space-y-4">
                <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold uppercase font-mono text-slate-800">
                      Ngân hàng câu hỏi IC3 ({filteredQuestions.length} câu)
                    </h2>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Bao gồm câu hỏi mặc định và câu hỏi do Admin vừa tạo
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={questionLevelFilter}
                      onChange={(e) => setQuestionLevelFilter(e.target.value)}
                      className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
                    >
                      <option value="all">Tất cả Level</option>
                      <option value="level-1">Level 1</option>
                      <option value="level-2">Level 2</option>
                      <option value="level-3">Level 3</option>
                    </select>

                    <select
                      value={questionSubsetFilter}
                      onChange={(e) => setQuestionSubsetFilter(e.target.value)}
                      className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
                    >
                      <option value="all">Tất cả Đề</option>
                      <option value="GM1">GM1</option>
                      <option value="GM2">GM2</option>
                      <option value="OT1">OT1</option>
                      <option value="OT2">OT2</option>
                      <option value="OT3">OT3</option>
                      <option value="OT4">OT4</option>
                      <option value="OT5">OT5</option>
                    </select>
                  </div>
                </div>

                {/* Search in bank */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={questionSearch}
                    onChange={(e) => setQuestionSearch(e.target.value)}
                    placeholder="Tìm kiếm từ khóa câu hỏi trong ngân hàng..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Questions Scrollable List */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {filteredQuestions.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 font-mono text-xs">
                      Không tìm thấy câu hỏi nào thỏa mãn điều kiện lọc.
                    </div>
                  ) : (
                    filteredQuestions.map((q: any, idx) => (
                      <div 
                        key={q.id || idx}
                        className={`p-3.5 rounded-xl border transition ${
                          q.isCustom
                            ? "bg-emerald-50/40 border-emerald-200 ring-1 ring-emerald-500/10"
                            : "bg-slate-50/60 border-slate-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono font-bold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                              Câu {idx + 1}
                            </span>
                            <span className="text-[10px] font-mono font-bold uppercase bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded">
                              {q.levelId} • {q.subsetId}
                            </span>
                            {q.isCustom && (
                              <span className="text-[10px] font-mono font-bold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded shadow-sm">
                                Admin tạo mới
                              </span>
                            )}
                          </div>

                          {q.isCustom && (
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                              title="Xóa câu hỏi tự tạo này"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <p className="text-xs font-bold text-slate-800 mb-2 leading-relaxed">
                          {q.text}
                        </p>

                        {q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-2">
                            {q.options.map((opt: string, optIdx: number) => {
                              const isCorrect = q.correctKeys?.some((k: string) => opt.startsWith(k));
                              return (
                                <div 
                                  key={optIdx} 
                                  className={`px-2 py-1 rounded text-[11px] font-medium ${
                                    isCorrect 
                                      ? "bg-emerald-100/70 border border-emerald-300 text-emerald-900 font-bold"
                                      : "bg-white border border-slate-200 text-slate-600"
                                  }`}
                                >
                                  {opt}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <div className="text-[11px] font-medium text-slate-500 bg-white p-2 rounded-lg border border-slate-100">
                          <strong className="text-slate-700">Đáp án: </strong>
                          <span>{q.correctAnswerText || q.correctKeys?.join(", ")}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>

            </div>
          )}

        </div>
      </main>

      {/* ➕ Modal: Add New User */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold uppercase font-mono text-slate-800">
                  Thêm tài khoản mới
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase font-mono text-slate-500">
                  Họ và tên
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ví dụ: Lê Thị Hoa"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold uppercase font-mono text-slate-500">
                    Lớp
                  </label>
                  <input
                    type="text"
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    placeholder="Ví dụ: 6A2"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold uppercase font-mono text-slate-500">
                    Trường học
                  </label>
                  <input
                    type="text"
                    value={newSchool}
                    onChange={(e) => setNewSchool(e.target.value)}
                    placeholder="Ví dụ: THCS Trưng Vương"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase font-mono text-slate-500">
                  Tên đăng nhập (Username)
                </label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="viết liền không dấu"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase font-mono text-slate-500">
                  Mật khẩu
                </label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mật khẩu tài khoản"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase font-mono text-slate-500">
                  Phân quyền
                </label>
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <button
                    type="button"
                    onClick={() => setNewRole("student")}
                    className={`py-2 rounded-lg border font-bold text-center ${
                      newRole === "student"
                        ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    Học sinh
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRole("admin")}
                    className={`py-2 rounded-lg border font-bold text-center ${
                      newRole === "admin"
                        ? "bg-amber-50 border-amber-500 text-amber-800"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    Quản trị viên
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="py-2.5 px-3 border border-slate-200 rounded-lg text-xs font-bold font-mono text-slate-500 hover:bg-slate-50 transition uppercase"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold font-mono transition uppercase shadow-md shadow-indigo-600/20"
                >
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
