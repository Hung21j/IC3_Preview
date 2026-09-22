import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Edit3, X, CheckCircle2, AlertCircle, Plus, Trash2 } from "lucide-react";
import { IC3Question } from "../data/ic3Questions";
import { apiService } from "../services/apiService";

interface EditQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: IC3Question | null;
  onSuccess?: (updated: IC3Question) => void;
}

export const EditQuestionModal: React.FC<EditQuestionModalProps> = ({
  isOpen,
  onClose,
  question,
  onSuccess
}) => {
  const [qLevelId, setQLevelId] = useState<"level-1" | "level-2" | "level-3">("level-1");
  const [qSubsetId, setQSubsetId] = useState<"GM1" | "GM2" | "OT1" | "OT2" | "OT3" | "OT4" | "OT5">("GM1");
  const [qType, setQType] = useState<"multiple_choice" | "yes_no" | "matching">("multiple_choice");
  const [qText, setQText] = useState("");
  const [mcOptions, setMcOptions] = useState<string[]>(["", "", "", ""]);
  const [mcCorrectKeys, setMcCorrectKeys] = useState<string[]>(["A"]);
  const [yesNoCorrect, setYesNoCorrect] = useState<"True" | "False">("True");
  const [matchingPairs, setMatchingPairs] = useState<{ left: string; right: string }[]>([
    { left: "", right: "" },
    { left: "", right: "" },
    { left: "", right: "" }
  ]);
  const [correctAnswerNote, setCorrectAnswerNote] = useState("");
  const [qOrder, setQOrder] = useState<number | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (question) {
      setQLevelId(question.levelId || "level-1");
      setQSubsetId(question.subsetId || "GM1");
      setQType(question.type || "multiple_choice");
      setQText(question.text || "");
      setCorrectAnswerNote(question.correctAnswerText || "");
      setQOrder(typeof question.order === "number" ? question.order : "");

      if (question.type === "multiple_choice") {
        if (question.options && question.options.length > 0) {
          // Normalize options to strip 'A. ', 'B. ' if desired, or keep as is
          const rawOpts = question.options.map((opt) => opt.replace(/^[A-D]\.\s*/, ""));
          while (rawOpts.length < 4) rawOpts.push("");
          setMcOptions(rawOpts.slice(0, 4));
        } else {
          setMcOptions(["", "", "", ""]);
        }
        setMcCorrectKeys(question.correctKeys || ["A"]);
      } else if (question.type === "yes_no") {
        setYesNoCorrect(question.correctKeys?.[0] === "False" ? "False" : "True");
      } else if (question.type === "matching") {
        if (question.pairs && question.pairs.length > 0) {
          setMatchingPairs(question.pairs.map((p) => ({ left: p.left, right: p.right })));
        } else {
          setMatchingPairs([
            { left: "", right: "" },
            { left: "", right: "" },
            { left: "", right: "" }
          ]);
        }
      }
    }
  }, [question]);

  if (!isOpen || !question) return null;

  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...mcOptions];
    updated[idx] = val;
    setMcOptions(updated);
  };

  const toggleCorrectKey = (key: string) => {
    if (mcCorrectKeys.includes(key)) {
      if (mcCorrectKeys.length === 1) return; // Must have at least 1 correct answer
      setMcCorrectKeys(mcCorrectKeys.filter((k) => k !== key));
    } else {
      setMcCorrectKeys([...mcCorrectKeys, key]);
    }
  };

  const handlePairChange = (idx: number, side: "left" | "right", val: string) => {
    const updated = [...matchingPairs];
    updated[idx][side] = val;
    setMatchingPairs(updated);
  };

  const addPair = () => {
    setMatchingPairs([...matchingPairs, { left: "", right: "" }]);
  };

  const removePair = (idx: number) => {
    if (matchingPairs.length <= 2) {
      alert("Cần tối thiểu 2 cặp đối tượng để ghép nối.");
      return;
    }
    setMatchingPairs(matchingPairs.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedText = qText.trim();
    if (!trimmedText) {
      setError("Vui lòng nhập nội dung câu hỏi.");
      return;
    }

    let formattedOptions: string[] | undefined = undefined;
    let finalCorrectKeys: string[] | undefined = undefined;
    let finalPairs: { left: string; right: string }[] | undefined = undefined;
    let finalAnswerText = correctAnswerNote.trim();

    if (qType === "multiple_choice") {
      const labels = ["A", "B", "C", "D"];
      const filled = mcOptions.map((opt) => opt.trim());
      if (filled.some((opt) => !opt)) {
        setError("Vui lòng nhập đầy đủ nội dung cho cả 4 lựa chọn A, B, C, D.");
        return;
      }
      formattedOptions = filled.map((opt, i) => `${labels[i]}. ${opt}`);
      finalCorrectKeys = mcCorrectKeys;
      if (!finalAnswerText) {
        finalAnswerText = formattedOptions
          .filter((_, i) => mcCorrectKeys.includes(labels[i]))
          .join(" | ");
      }
    } else if (qType === "yes_no") {
      finalCorrectKeys = [yesNoCorrect];
      if (!finalAnswerText) {
        finalAnswerText = yesNoCorrect === "True" ? "Đúng (True)" : "Sai (False)";
      }
    } else if (qType === "matching") {
      const validPairs = matchingPairs
        .map((p) => ({ left: p.left.trim(), right: p.right.trim() }))
        .filter((p) => p.left && p.right);

      if (validPairs.length < 2) {
        setError("Vui lòng nhập tối thiểu 2 cặp ghép nối hợp lệ.");
        return;
      }
      finalPairs = validPairs;
      if (!finalAnswerText) {
        finalAnswerText = validPairs.map((p) => `• ${p.left} ➔ ${p.right}`).join("\n");
      }
    }

    setIsLoading(true);
    try {
      const updated = await apiService.updateCustomQuestion(question.id, {
        levelId: qLevelId,
        subsetId: qSubsetId,
        type: qType,
        text: trimmedText,
        options: formattedOptions,
        correctKeys: finalCorrectKeys,
        pairs: finalPairs,
        correctAnswerText: finalAnswerText,
        order: typeof qOrder === "number" ? qOrder : undefined
      });

      onSuccess?.(updated);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Có lỗi xảy ra khi cập nhật câu hỏi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden font-sans my-8"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-850/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <Edit3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Chỉnh sửa / Bổ sung câu hỏi
                </h3>
                <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  Mã câu hỏi: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{question.id}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Scope selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cấp độ IC3
                </label>
                <select
                  value={qLevelId}
                  onChange={(e) => setQLevelId(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="level-1">Level 1 - Máy tính cơ bản</option>
                  <option value="level-2">Level 2 - Các ứng dụng cốt lõi</option>
                  <option value="level-3">Level 3 - Cuộc sống trực tuyến</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phân hệ đề
                </label>
                <select
                  value={qSubsetId}
                  onChange={(e) => setQSubsetId(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="GM1">GM1 - Đề thi thử số 1</option>
                  <option value="GM2">GM2 - Đề thi thử số 2</option>
                  <option value="OT1">OT1 - Bộ ôn tập 1</option>
                  <option value="OT2">OT2 - Bộ ôn tập 2</option>
                  <option value="OT3">OT3 - Bộ ôn tập 3</option>
                  <option value="OT4">OT4 - Bộ ôn tập 4</option>
                  <option value="OT5">OT5 - Bộ ôn tập 5</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Dạng câu hỏi
                </label>
                <select
                  value={qType}
                  onChange={(e) => setQType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="multiple_choice">Trắc nghiệm nhiều lựa chọn</option>
                  <option value="yes_no">Đúng / Sai (Yes / No)</option>
                  <option value="matching">Ghép nối (Matching)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Số thứ tự (STT)
                </label>
                <input
                  type="number"
                  min={1}
                  value={qOrder}
                  onChange={(e) => setQOrder(e.target.value === "" ? "" : Math.max(1, parseInt(e.target.value, 10) || 1))}
                  placeholder="Mặc định"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Question Text */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nội dung câu hỏi <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                placeholder="Nhập nội dung đề bài câu hỏi..."
                required
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            {/* Dynamic Type Fields */}
            {qType === "multiple_choice" && (
              <div className="space-y-3 p-4 bg-slate-50/70 dark:bg-slate-850/40 border border-slate-200/80 dark:border-slate-800 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    4 Lựa chọn trả lời & Đáp án đúng
                  </span>
                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
                    (Click vào chữ A, B, C, D để chọn đáp án đúng)
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {(["A", "B", "C", "D"] as const).map((letter, idx) => {
                    const isCorrect = mcCorrectKeys.includes(letter);
                    return (
                      <div key={letter} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleCorrectKey(letter)}
                          title={`Bấm để chọn/bỏ chọn ${letter} là đáp án đúng`}
                          className={`w-8 h-8 rounded-lg font-mono font-bold text-xs shrink-0 flex items-center justify-center transition cursor-pointer ${
                            isCorrect
                              ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/40"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300"
                          }`}
                        >
                          {letter}
                        </button>
                        <input
                          type="text"
                          value={mcOptions[idx]}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          placeholder={`Nội dung lựa chọn ${letter}...`}
                          required
                          className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* {qType === "yes_no" && (
              <div className="p-4 bg-slate-50/70 dark:bg-slate-850/40 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Đáp án chuẩn cho câu Đúng/Sai:
                </span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 cursor-pointer">
                    <input
                      type="radio"
                      name="yesNoCorrectEdit"
                      checked={yesNoCorrect === "True"}
                      onChange={() => setYesNoCorrect("True")}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Đúng (True / Yes)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-400 cursor-pointer">
                    <input
                      type="radio"
                      name="yesNoCorrectEdit"
                      checked={yesNoCorrect === "False"}
                      onChange={() => setYesNoCorrect("False")}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>Sai (False / No)</span>
                  </label>
                </div>
              </div>
            )}*/}

            {q.type === "yes_no" && q.statements && (
              <div className="space-y-3 pt-1">
            
                <div className="flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-slate-600" />
            
                  <span className="text-xs font-black uppercase text-slate-800 font-mono tracking-wider">
                    Hãy xác định các phát biểu sau là Đúng hay Sai:
                  </span>
                </div>
            
                <div className="overflow-hidden rounded-xl border-2 border-slate-300">
            
                  {/* HEADER */}
                  <div className="grid grid-cols-[1fr_90px_90px] bg-slate-100 border-b-2 border-slate-300">
            
                    <div className="p-3 font-black text-xs uppercase font-mono text-slate-800">
                      Các phát biểu
                    </div>
            
                    <div className="p-3 text-center font-black text-xs uppercase font-mono text-emerald-700 border-l border-slate-300">
                      Đúng
                    </div>
            
                    <div className="p-3 text-center font-black text-xs uppercase font-mono text-rose-700 border-l border-slate-300">
                      Sai
                    </div>
            
                  </div>
            
                  {/* STATEMENTS */}
                  {q.statements.map((statement, index) => {
            
                    let parsedAnswer: Record<string, string> = {};
            
                    try {
                      parsedAnswer = JSON.parse(userAns || "{}");
                    } catch {
                      parsedAnswer = {};
                    }
            
                    const selectedValue = parsedAnswer[String(index)];
            
                    const isTrueSelected = selectedValue === "True";
                    const isFalseSelected = selectedValue === "False";
            
                    const isCorrectAnswer =
                      statement.correct === selectedValue;
            
                    return (
                      <div
                        key={index}
                        className={`grid grid-cols-[1fr_90px_90px] border-b border-slate-200 last:border-b-0 transition ${
                          appMode === "training" && isChecked
                            ? isCorrectAnswer
                              ? "bg-emerald-50"
                              : "bg-rose-50"
                            : "bg-white"
                        }`}
                      >
            
                        {/* STATEMENT */}
                        <div className="p-4 flex items-center">
            
                          <span className="mr-3 w-7 h-7 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center text-xs font-black font-mono shrink-0">
                            {index + 1}
                          </span>
            
                          <span className="text-sm font-semibold leading-relaxed text-slate-900">
                            {statement.text}
                          </span>
            
                        </div>
            
                        {/* TRUE */}
                        <div className="border-l border-slate-200 flex items-center justify-center p-3">
            
                          <button
                            type="button"
                            disabled={appMode === "training" && isChecked}
                            onClick={() =>
                              handleSelectStatementAnswer(q, index, "True")
                            }
                            className={`w-8 h-8 rounded-md border-2 flex items-center justify-center transition ${
                              isTrueSelected
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : "bg-white border-slate-400 hover:border-emerald-500"
                            } ${
                              appMode === "training" && isChecked
                                ? "cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                          >
                            {isTrueSelected && (
                              <Check className="w-5 h-5" />
                            )}
                          </button>
            
                        </div>
            
                        {/* FALSE */}
                        <div className="border-l border-slate-200 flex items-center justify-center p-3">
            
                          <button
                            type="button"
                            disabled={appMode === "training" && isChecked}
                            onClick={() =>
                              handleSelectStatementAnswer(q, index, "False")
                            }
                            className={`w-8 h-8 rounded-md border-2 flex items-center justify-center transition ${
                              isFalseSelected
                                ? "bg-rose-600 border-rose-600 text-white"
                                : "bg-white border-slate-400 hover:border-rose-500"
                            } ${
                              appMode === "training" && isChecked
                                ? "cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                          >
                            {isFalseSelected && (
                              <Check className="w-5 h-5" />
                            )}
                          </button>
            
                        </div>
            
                      </div>
                    );
                  })}
            
                </div>
            
              </div>
            )}

            {qType === "matching" && (
              <div className="space-y-3 p-4 bg-slate-50/70 dark:bg-slate-850/40 border border-slate-200/80 dark:border-slate-800 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Các cặp ghép nối (Cột trái ➔ Cột phải)
                  </span>
                  <button
                    type="button"
                    onClick={addPair}
                    className="flex items-center gap-1 text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm cặp</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {matchingPairs.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-5 text-[11px] font-mono font-bold text-slate-400 text-center">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={p.left}
                        onChange={(e) => handlePairChange(idx, "left", e.target.value)}
                        placeholder="Vế trái..."
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-slate-400 font-bold">➔</span>
                      <input
                        type="text"
                        value={p.right}
                        onChange={(e) => handlePairChange(idx, "right", e.target.value)}
                        placeholder="Vế phải..."
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => removePair(idx)}
                        disabled={matchingPairs.length <= 2}
                        className="p-1 text-slate-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Explanation / Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Lời giải thích / Ghi chú đáp án
              </label>
              <textarea
                rows={2}
                value={correctAnswerNote}
                onChange={(e) => setCorrectAnswerNote(e.target.value)}
                placeholder="Nhập giải thích chi tiết vì sao đáp án đúng..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 rounded-xl text-xs font-mono font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-650 dark:hover:bg-indigo-600 transition shadow-sm cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Lưu thay đổi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
