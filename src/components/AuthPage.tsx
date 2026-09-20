import React, { useState } from "react";
import { 
  Lock, 
  User as UserIcon, 
  School, 
  GraduationCap, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  ShieldCheck,
  Sparkles,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { apiService } from "../services/apiService";
import { User } from "../types";

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login Form States
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register Form States
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regClass, setRegClass] = useState("");
  const [regSchool, setRegSchool] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!loginUsername.trim() || !loginPassword) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }

    setIsLoading(true);
    try {
      const { user } = await apiService.login(loginUsername.trim(), loginPassword);
      onAuthSuccess(user);
    } catch (err: any) {
      setError(err.message || "Tên đăng nhập hoặc mật khẩu không chính xác.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!regUsername.trim() || !regPassword || !regName.trim() || !regClass.trim() || !regSchool.trim()) {
      setError("Vui lòng điền đầy đủ tất cả các trường thông tin.");
      return;
    }

    if (regPassword.length < 3) {
      setError("Mật khẩu nên có ít nhất 3 ký tự.");
      return;
    }

    setIsLoading(true);
    try {
      const { user } = await apiService.register({
        username: regUsername.trim().toLowerCase(),
        password: regPassword,
        name: regName.trim(),
        className: regClass.trim(),
        school: regSchool.trim()
      });
      onAuthSuccess(user);
    } catch (err: any) {
      setError(err.message || "Không thể đăng ký tài khoản. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickAccount = (u: string, p: string) => {
    setMode("login");
    setLoginUsername(u);
    setLoginPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-900 border-4 md:border-8 border-slate-200 select-none">
      <div className="w-full max-w-md">
        
        {/* Card Container */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Top Decorative Header */}
          <div className="bg-gradient-to-r from-indigo-700 via-indigo-650 to-blue-600 p-6 text-white text-center relative">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-3 border border-white/20 shadow-inner">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-black uppercase tracking-tight font-mono">
              HỆ THỐNG ÔN THI IC3
            </h1>
            <p className="text-xs text-indigo-100 mt-1 font-medium">
              Cổng đăng nhập học sinh & Quản trị viên
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 text-xs font-bold font-mono">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(null); }}
              className={`py-3 text-center transition flex items-center justify-center gap-1.5 border-b-2 ${
                mode === "login"
                  ? "border-indigo-600 text-indigo-600 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>ĐĂNG NHẬP</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setError(null); }}
              className={`py-3 text-center transition flex items-center justify-center gap-1.5 border-b-2 ${
                mode === "register"
                  ? "border-indigo-600 text-indigo-600 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>TẠO TÀI KHOẢN</span>
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 md:p-8">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {mode === "login" ? (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleLoginSubmit}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold uppercase tracking-wide text-slate-500 font-mono">
                      Tên đăng nhập (Username)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        placeholder="admin hoặc hoanglong"
                        className="w-full pl-9.5 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold uppercase tracking-wide text-slate-500 font-mono">
                      Mật khẩu (Password)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black uppercase tracking-wider font-mono shadow-md shadow-indigo-600/20 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? (
                      <span>Đang xác thực...</span>
                    ) : (
                      <>
                        <span>Đăng nhập hệ thống</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <span className="text-xs text-slate-500 font-medium">
                      Chưa có tài khoản?{" "}
                    </span>
                    <button
                      type="button"
                      onClick={() => { setMode("register"); setError(null); }}
                      className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Đăng ký ngay
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.form
                  key="register-form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleRegisterSubmit}
                  className="space-y-3.5"
                >
                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold uppercase tracking-wide text-slate-500 font-mono">
                      Họ và tên học sinh
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn An"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wide text-slate-500 font-mono">
                        Lớp học
                      </label>
                      <input
                        type="text"
                        required
                        value={regClass}
                        onChange={(e) => setRegClass(e.target.value)}
                        placeholder="Ví dụ: 6A1"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wide text-slate-500 font-mono">
                        Trường học
                      </label>
                      <input
                        type="text"
                        required
                        value={regSchool}
                        onChange={(e) => setRegSchool(e.target.value)}
                        placeholder="Ví dụ: THCS Trưng Vương"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold uppercase tracking-wide text-slate-500 font-mono">
                      Tên đăng nhập (Username)
                    </label>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="Chọn tên đăng nhập viết liền không dấu"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold uppercase tracking-wide text-slate-500 font-mono">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Tối thiểu 3 ký tự"
                        className="w-full px-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase tracking-wider font-mono shadow-md shadow-emerald-600/20 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? (
                      <span>Đang tạo tài khoản...</span>
                    ) : (
                      <>
                        <span>Hoàn tất & Đăng nhập</span>
                        <CheckCircle className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <span className="text-xs text-slate-500 font-medium">
                      Đã có tài khoản?{" "}
                    </span>
                    <button
                      type="button"
                      onClick={() => { setMode("login"); setError(null); }}
                      className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Đăng nhập ngay
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Quick Demo Access Bar */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                Đăng nhập nhanh tài khoản mẫu:
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillQuickAccount("admin", "admin123")}
                  className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[10px] font-bold font-mono transition text-left flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <div className="truncate">
                    <div className="font-extrabold text-amber-800">Admin</div>
                    <div className="text-[9px] text-amber-600">admin / admin123</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fillQuickAccount("hoanglong", "123")}
                  className="py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-lg text-[10px] font-bold font-mono transition text-left flex items-center gap-1.5"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <div className="truncate">
                    <div className="font-extrabold text-indigo-800">Học sinh</div>
                    <div className="text-[9px] text-indigo-600">hoanglong / 123</div>
                  </div>
                </button>
              </div>
            </div>

          </div>
        </motion.div>

        <div className="text-center mt-4 text-[10px] text-slate-400 font-mono">
          IC3 Digital Literacy Certification Portal • Chuẩn khảo thí Quốc tế
        </div>
      </div>
    </div>
  );
}
