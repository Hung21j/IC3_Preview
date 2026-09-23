import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  Trash2, 
  Lightbulb, 
  GitCommit,
  CheckCircle,
  FileText,
  Bookmark,
  ListRestart,
  Activity,
  Cpu,
  Database,
  Layers,
  ArrowRight,
  GraduationCap
} from "lucide-react";
import QuestionInputForm from "./components/QuestionInputForm";
import QuestionResultView from "./components/QuestionResultView";
import SolvedHistoryList from "./components/SolvedHistoryList";
import IC3QuestionBank from "./components/IC3QuestionBank";
import AuthPage from "./components/AuthPage";
import AdminDashboard from "./components/AdminDashboard";
import { SolvedResponse, SavedQuestion, QuestionType, User } from "./types";
import { IC3Question } from "./data/ic3Questions";
import { apiService } from "./services/apiService";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, LogOut, KeyRound } from "lucide-react";
import { ChangePasswordModal } from "./components/ChangePasswordModal";
import { firestoreService } from "./services/firestoreService";

// Academic/solving status indicators during analysis
const STATUS_INDICATORS = [
  "OCR Scanning: Reading inputs and capturing structural data...",
  "Context mapping: Classifying question style dynamics...",
  "Core reasoning: Evaluating peer-reviewed mechanics & logic theorems...",
  "Double checking calculus: verifying mathematical operations...",
  "Pairing matching coordinates: confirming column alignments...",
  "Synthesizing structured output format...",
];

// In-app problem presets so users can instantly experience the solver
const PROBLEM_PRESETS = [
  {
    id: "preset-mcq",
    title: "Thermodynamics MCQ",
    type: "multiple_choice" as QuestionType,
    text: "Which of the following describes the thermodynamic process where no heat is transferred into or out of the system?",
    options: ["Isothermal", "Isobaric", "Adiabatic", "Isochoric"]
  },
  {
    id: "preset-yesno",
    title: "Database Constraint (True/False)",
    type: "yes_no" as QuestionType,
    text: "True or False: In a relational database, a primary key can contain null values under default configurations."
  },
  {
    id: "preset-matching",
    title: "Cell Organelle Matches",
    type: "matching" as QuestionType,
    text: "Review and pair the organelles to their correct physiological function:\nOrganelle List:\n1. Mitochondria\n2. Ribosomes\n3. Lysosomes\n\nFunctional Roles:\nA. Protein translation synthesis\nB. Chemical waste digestion & breakdown\nC. Cellular respiration & ATP energy generation"
  },
  {
    id: "preset-calc",
    title: "Calculus Solve",
    type: "general" as QuestionType,
    text: "Find the derivative of the function f(x) = x * ln(x) with respect to x, and find the valuation profile of f'(e)."
  }
];

export const IC3_LEVELS = [
  {
    id: "level-1",
    name: "Level 1: Máy tính cơ bản",
    englishName: "Computing Fundamentals",
    description: "Tìm hiểu cấu trúc máy tính, phần cứng, phần mềm, hệ điều hành (Windows), cách quản lý tệp tin thư mục và an toàn dữ liệu.",
    skills: ["Phần cứng & Thiết bị", "Hệ điều hành Windows", "Quản lý tệp tin / Thư mục", "Khái niệm bảo mật cơ bản"],
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    hoverBorder: "hover:border-emerald-400 hover:bg-emerald-50/10",
    buttonColor: "bg-emerald-600 hover:bg-emerald-500",
    ringColor: "ring-emerald-500/20",
    iconBg: "bg-emerald-600"
  },
  {
    id: "level-2",
    name: "Level 2: Các ứng dụng cốt lõi",
    englishName: "Key Applications",
    description: "Khám phá sâu các phần mềm văn phòng thông dụng nhất, kỹ năng soạn thảo văn bản và biểu diễn bảng số liệu.",
    skills: ["Microsoft Word", "Microsoft Excel", "Microsoft PowerPoint", "Đồ họa & Quản lý cơ sở dữ liệu"],
    badgeColor: "bg-indigo-50 text-indigo-800 border-indigo-200",
    hoverBorder: "hover:border-indigo-400 hover:bg-indigo-50/10",
    buttonColor: "bg-indigo-600 hover:bg-indigo-500",
    ringColor: "ring-indigo-500/20",
    iconBg: "bg-indigo-600"
  },
  {
    id: "level-3",
    name: "Level 3: Cuộc sống trực tuyến",
    englishName: "Living Online",
    description: "Nắm vững môi trường mạng máy tính, giao tiếp thư điện tử điện tử, lướt web an toàn và quy tắc công dân số.",
    skills: ["Mạng máy tính & Internet", "Thư điện tử (Email)", "Trình duyệt & Tìm kiếm nâng cao", "Hành vi mạng & Công dân số"],
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    hoverBorder: "hover:border-amber-400 hover:bg-amber-50/10",
    buttonColor: "bg-amber-600 hover:bg-amber-500",
    ringColor: "ring-amber-500/20",
    iconBg: "bg-amber-600"
  }
];

export default function App() {
  const [activeResult, setActiveResult] = useState<SolvedResponse | null>(null);
  const [activeItem, setActiveItem] = useState<SavedQuestion | null>(null);
  const [history, setHistory] = useState<SavedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Authentication & View Management
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return apiService.getActiveSession()?.user || null;
  });
  const [currentView, setCurrentView] = useState<"student" | "admin">("student");
  const [customQuestions, setCustomQuestions] = useState<IC3Question[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [showUserChangePassword, setShowUserChangePassword] = useState(false);
  const [userToast, setUserToast] = useState<string | null>(null);

  // Level-specific accent configurations to tie the theme color all the way from Level Selection
  const isL1 = selectedLevel?.includes("Level 1");
  const isL2 = selectedLevel?.includes("Level 2");
  const isL3 = selectedLevel?.includes("Level 3");
  const accentBgLogo = isL1 ? "bg-emerald-600" : isL2 ? "bg-indigo-600" : "bg-amber-600";
  const accentBorderForm = isL1 ? "focus:border-emerald-500" : isL2 ? "focus:border-indigo-500" : "focus:border-amber-500";
  const accentSaveBtn = isL1 
    ? "text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-150" 
    : isL2 
      ? "text-indigo-600 hover:text-indigo-700 bg-indigo-50 border border-indigo-150" 
      : "text-amber-700 hover:text-amber-800 bg-amber-50 border border-amber-150";
  const accentChangeLvlBtn = isL1 
    ? "bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 text-emerald-600" 
    : isL2 
      ? "bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-605" 
      : "bg-amber-50 border border-amber-100 hover:bg-amber-100 text-amber-600";

  const loadCustomQuestions = async () => {
    try {
      const q = await apiService.getCustomQuestions();
      setCustomQuestions(q);
    } catch (e) {
      console.warn("Could not load custom questions:", e);
    }
  };

  const handleLogout = async () => {
    await apiService.logout();
    setCurrentUser(null);
    setCurrentView("student");
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === "admin") {
      setCurrentView("admin");
    } else {
      setCurrentView("student");
    }
  };

  // Load custom questions, level and history
  useEffect(() => {
    loadCustomQuestions();

    const savedLevel = localStorage.getItem("student_level_ic3");
    if (savedLevel) {
      setSelectedLevel(savedLevel);
    }

    const saved = localStorage.getItem("question_solver_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed);
        if (parsed.length > 0) {
          setActiveItem(parsed[0]);
          setActiveResult(parsed[0].result);
        }
      } catch (err) {
        console.error("Localstorage load error", err);
      }
    }
  }, []);

  // Sync back to localstorage
  const saveHistoryToStorage = (updatedHistory: SavedQuestion[]) => {
    localStorage.setItem("question_solver_history", JSON.stringify(updatedHistory));
    setHistory(updatedHistory);
  };

  // Rotating loading captions
  useEffect(() => {
    let index = 0;
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setStatusText(STATUS_INDICATORS[0]);
      interval = setInterval(() => {
        index = (index + 1) % STATUS_INDICATORS.length;
        setStatusText(STATUS_INDICATORS[index]);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (!currentUser) return;
  
    const checkRemoteLogout = async () => {
      try {
        const users = await firestoreService.getCloudUsers();
  
        const cloudUser = users.find(
          (item) => item.user.id === currentUser.id
        );
  
        if (!cloudUser) {
          await apiService.logout();
          setCurrentUser(null);
          setCurrentView("student");
          return;
        }
  
        const localVersion = currentUser.sessionVersion || 0;
        const cloudVersion = cloudUser.user.sessionVersion || 0;
  
        if (cloudVersion > localVersion) {
          await apiService.logout();
  
          setCurrentUser(null);
          setCurrentView("student");
  
          alert(
            "Tài khoản của bạn đã được quản trị viên đăng xuất."
          );
        }
      } catch (err) {
        console.warn("Remote logout check failed:", err);
      }
    };
  
    const interval = setInterval(checkRemoteLogout, 3000);
  
    return () => clearInterval(interval);
  }, [currentUser]);

  // Request analysis & solutions from full-stack backend
  const handleSolve = async (payload: {
    questionText: string;
    questionType: QuestionType | "auto";
    image: string | null;
    options: string[];
  }) => {
    setIsLoading(true);
    setError(null);
    setActiveResult(null);
    setActiveItem(null);

    try {
      const response = await fetch("/api/solve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP solve failure. Status: ${response.status}`);
      }

      const resData = await response.json();
      if (!resData.success || !resData.result) {
        throw new Error(resData.error || "Solving pipeline returned an incomplete answer.");
      }

      const result: SolvedResponse = resData.result;
      
      // Build a history model
      const newSavedItem: SavedQuestion = {
        id: "q-" + Date.now(),
        timestamp: new Date().toISOString(),
        questionText: payload.questionText || `Image solved: ${result.topic || "Academic question"}`,
        image: payload.image || undefined,
        type: result.questionType,
        result
      };

      // Prepend to history and save
      const updatedHistory = [newSavedItem, ...history.slice(0, 49)]; //cap at 50 elements
      saveHistoryToStorage(updatedHistory);
      
      setActiveItem(newSavedItem);
      setActiveResult(result);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to solve. Please double check backend configurations.");
    } finally {
      setIsLoading(false);
    }
  };

  // Preset trigger handler
  const handlePresetSelect = (preset: typeof PROBLEM_PRESETS[0]) => {
    handleSolve({
      questionText: preset.text,
      questionType: preset.type,
      image: null,
      options: preset.options || []
    });
  };

  // History item select trigger
  const handleSelectHistory = (item: SavedQuestion) => {
    setActiveItem(item);
    setActiveResult(item.result);
    // Scroll to display details cleanly
    document.getElementById("solver-workspace")?.scrollIntoView({ behavior: "smooth" });
  };

  // History item single delete
  const handleDeleteHistory = (id: string) => {
    const updated = history.filter((x) => x.id !== id);
    saveHistoryToStorage(updated);
    if (activeItem?.id === id) {
      setActiveItem(null);
      setActiveResult(null);
    }
  };

  // Clear all history
  const handleClearAllHistory = () => {
    if (confirm("Are you sure you want to wipe all history records?")) {
      saveHistoryToStorage([]);
      setActiveItem(null);
      setActiveResult(null);
    }
  };

  const startNewQuery = () => {
    setActiveItem(null);
    setActiveResult(null);
    setError(null);
    // Focus or scroll back
    document.getElementById("solver-workspace")?.scrollIntoView({ behavior: "smooth" });
  };

  if (!currentUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  if (currentUser.role === "admin" && currentView === "admin") {
    return (
      <AdminDashboard
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchToStudentView={() => setCurrentView("student")}
        onQuestionsUpdated={loadCustomQuestions}
      />
    );
  }

  if (!selectedLevel) {
    return (
      <div className="min-h-screen bg-[#f0f3f8] text-slate-900 flex items-center justify-center p-4 md:p-8 font-sans select-none border-4 md:border-8 border-slate-300">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl w-full bg-white border-2 border-slate-300 rounded-2xl p-6 md:p-8 space-y-6 md:space-y-8 shadow-sm relative overflow-hidden"
        >
          {/* Subtle decoration lines */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-700" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-slate-200 pb-5">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-indigo-700 font-mono">
                BƯỚC 2:
              </span>
              <h2 className="text-base md:text-lg font-black tracking-tight text-slate-900 uppercase font-mono">
                CHỌN CẤP ĐỘ ÔN TẬP IC3
              </h2>
              <p className="text-xs md:text-sm text-slate-700 font-semibold leading-relaxed">
                Xin chào <strong className="text-slate-950 font-black">{currentUser.name}</strong>
                {currentUser.className && <> (Lớp <strong className="text-slate-950 font-black">{currentUser.className}</strong>)</>}
                {currentUser.school && <> • <span className="text-slate-800 font-bold">{currentUser.school}</span></>}
              </p>
            </div>
            
            <div className="flex items-center gap-2.5 self-start md:self-center flex-wrap">
              <button
                type="button"
                onClick={() => setShowUserChangePassword(true)}
                className="px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold font-mono bg-[#f1f5f9] hover:bg-[#e2e8f0] border border-slate-300 text-slate-900 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Đổi mật khẩu tài khoản của bạn"
              >
                <KeyRound className="w-4 h-4 text-indigo-600" />
                <span>Đổi mật khẩu</span>
              </button>

              {currentUser.role === "admin" && (
                <button
                  type="button"
                  onClick={() => setCurrentView("admin")}
                  className="px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold font-mono bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Trang Quản Trị</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold font-mono bg-[#f1f5f9] hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 border border-slate-300 text-slate-800 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {IC3_LEVELS.map((level) => (
              <motion.div
                key={level.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  localStorage.setItem("student_level_ic3", level.name);
                  setSelectedLevel(level.name);
                }}
                className={`bg-white hover:bg-[#f8fafc] border-2 border-slate-300 hover:border-indigo-600 rounded-2xl p-5 flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden group select-none shadow-xs hover:shadow-md ${level.hoverBorder}`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className={`px-2.5 py-1 text-[11px] font-black border rounded-md uppercase font-mono ${level.badgeColor}`}>
                      {level.id.replace("-", " ")}
                    </span>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-400 group-hover:bg-indigo-600 transition-colors" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug group-hover:text-indigo-700 transition-colors">
                      {level.name}
                    </h3>
                    <p className="text-xs font-bold text-slate-500 font-mono italic">
                      {level.englishName}
                    </p>
                  </div>

                  <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-semibold">
                    {level.description}
                  </p>

                  <div className="space-y-1.5 pt-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block font-mono">
                      Chủ đề trọng tâm:
                    </span>
                    <ul className="space-y-1.5">
                      {level.skills.map((skill, sIdx) => (
                        <li key={sIdx} className="text-xs md:text-sm text-slate-800 flex items-center gap-2 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                          <span className="truncate">{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-5 mt-auto">
                  <button
                    className={`w-full py-2.5 rounded-xl text-xs md:text-sm font-black uppercase tracking-wider text-white transition duration-200 ${level.buttonColor}`}
                  >
                    Bắt đầu luyện
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center text-xs text-slate-500 font-mono border-t border-slate-300 pt-4">
            Giáo trình bám sát khung năng lực IC3 quốc tế thế hệ mới.
          </div>
        </motion.div>

        {/* Change password modal for student in Level Selection */}
        <ChangePasswordModal
          isOpen={showUserChangePassword}
          onClose={() => setShowUserChangePassword(false)}
          userId={currentUser.id}
          username={currentUser.username}
          userName={currentUser.name}
          className={currentUser.className}
          school={currentUser.school}
          onSuccess={(msg) => {
            setUserToast(msg);
            setTimeout(() => setUserToast(null), 4000);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f3f8] flex flex-col font-sans text-slate-900 border-4 md:border-8 border-slate-300">
      
      {/* 🚀 Visual Header Bar - Soft Surface, High Contrast */}
      <header className="h-16 bg-white border-b-2 border-slate-300 px-4 md:px-8 flex items-center justify-between shadow-xs z-10 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <h1 className="text-base md:text-lg font-black tracking-tight text-slate-900 leading-none">
              ÔN TẬP IC3
            </h1>
          </div>
        </div>

        {/* Header Profile Dashboard Integration */}
        <div className="flex items-center gap-2.5 md:gap-3.5 flex-wrap">
          <button
            type="button"
            onClick={() => setShowUserChangePassword(true)}
            className="p-2 px-3 rounded-xl text-xs md:text-sm bg-[#f1f5f9] hover:bg-[#e2e8f0] border border-slate-300 text-slate-900 font-bold font-mono transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Đổi mật khẩu tài khoản"
          >
            <KeyRound className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Đổi mật khẩu</span>
          </button>

          {currentUser.role === "admin" && (
            <button
              type="button"
              onClick={() => setCurrentView("admin")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold font-mono bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition active:scale-95 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Trang Quản Trị</span>
            </button>
          )}

          <div className="bg-[#f1f5f9] border border-slate-300 rounded-xl px-3.5 py-2 flex items-center gap-2.5 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0 animate-pulse" />
            <div className="text-left leading-none">
              <p className="text-xs md:text-sm font-black text-slate-950">
                {currentUser.name}
              </p>
              <p className="text-[11px] font-bold text-slate-700 mt-1 font-mono">
                {currentUser.className ? `Lớp ${currentUser.className}` : "Tài khoản"} {currentUser.school ? `• ${currentUser.school}` : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedLevel(null);
              localStorage.removeItem("student_level_ic3");
            }}
            className={`p-2 px-3 rounded-xl text-xs md:text-sm ${accentChangeLvlBtn} font-black font-mono transition cursor-pointer shadow-xs`}
          >
            Đổi Level
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="p-2 px-3 rounded-xl text-xs md:text-sm bg-[#f1f5f9] hover:bg-rose-50 hover:border-rose-300 border border-slate-300 text-rose-700 font-bold font-mono transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </header>

      {/* 🔮 Center Focused Layout Main Workspace - Single Column */}
      <main className="flex-1 overflow-y-auto bg-[#f0f3f8] py-6 px-4 md:px-8">
        <div className="max-w-4xl mx-auto w-full space-y-6">
          
          {/* 1. Main Focused Question Bank Display - Expanded */}
          {selectedLevel && (
            <div className="shadow-sm rounded-2xl overflow-hidden bg-white border-2 border-slate-300">
              <IC3QuestionBank 
                selectedLevel={selectedLevel}
                currentUser={currentUser}
                customQuestions={customQuestions}
                onOpenAdminDashboard={currentUser.role === "admin" ? () => setCurrentView("admin") : undefined}
                onSelectQuestionToSolve={(data) => {
                  handleSolve({
                    questionText: data.questionText,
                    questionType: data.questionType,
                    image: data.image,
                    options: data.options
                  });
                }}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* 2. Interactive AI Explanation Block (Placed cleanly underneath the active card) */}
          <AnimatePresence mode="wait">
            
            {/* Loading detailed solve state */}
            {isLoading && (
              <motion.div 
                key="loading-ai"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-xl border border-slate-200 p-8 text-center flex flex-col items-center justify-center min-h-[220px] space-y-4 shadow-md"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest font-mono">
                    HỆ THỐNG TRÍ TUỆ ĐANG PHÂN TÍCH...
                  </h3>
                  <p className="text-xs text-indigo-600 font-bold mt-1 max-w-md mx-auto leading-relaxed">
                    {statusText}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Error state fallback */}
            {error && !isLoading && (
              <motion.div 
                key="error-state"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 border border-rose-200 rounded-xl p-5 shadow-sm space-y-3"
              >
                <div className="flex gap-3">
                  <div className="p-1.5 bg-rose-100 text-rose-600 rounded">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-rose-800 uppercase tracking-wider font-mono">
                      CÓ LỖI XẢY RA KHI GIẢI BẰNG AI
                    </h3>
                    <p className="text-xs text-rose-700 leading-relaxed font-semibold mt-1">
                      {error}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  Bỏ qua lỗi này
                </button>
              </motion.div>
            )}

            {/* Active Rendered Explanation outputs */}
            {activeResult && !isLoading && (
              <motion.div 
                key="ai-result-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 relative"
              >
                {/* Float Close Button for the Result screen */}
                <div className="flex justify-end pr-1">
                  <button
                    onClick={() => {
                      setActiveResult(null);
                      setActiveItem(null);
                    }}
                    className="bg-slate-205 border border-slate-300 text-slate-650 hover:bg-red-50 hover:text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition"
                  >
                    Đóng giải thích AI [X]
                  </button>
                </div>

                <div className="shadow-lg rounded-xl overflow-hidden border border-indigo-100">
                  <QuestionResultView 
                    result={activeResult} 
                    student={{ name: currentUser.name, className: currentUser.className }} 
                  />
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </main>

      {/* 🚀 Distraction-Free Simple Footer */}
      <footer className="h-10 bg-slate-800 text-slate-200 flex items-center justify-between px-6 text-xs uppercase tracking-wider font-semibold font-mono shrink-0 select-none">
        <span>{currentUser.className ? `Lớp ${currentUser.className} // ` : ""}{currentUser.name} {currentUser.school ? `(${currentUser.school})` : ""}</span>        
        <span className="text-slate-300">IC3 GS6 Examination Platform</span>
      </footer>

      {/* Change Password Modal for logged-in user */}
      <ChangePasswordModal
        isOpen={showUserChangePassword}
        onClose={() => setShowUserChangePassword(false)}
        userId={currentUser.id}
        username={currentUser.username}
        userName={currentUser.name}
        className={currentUser.className}
        school={currentUser.school}
        onSuccess={(msg) => {
          setUserToast(msg);
          setTimeout(() => setUserToast(null), 4000);
        }}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {userToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-12 right-6 z-50 bg-emerald-600 text-white py-2.5 px-4 rounded-xl shadow-lg text-xs font-bold font-mono flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{userToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
