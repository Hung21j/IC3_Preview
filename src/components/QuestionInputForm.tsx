import React, { useState, useRef } from "react";
import { 
  Sparkles, 
  UploadCloud, 
  Image as ImageIcon, 
  Trash2, 
  HelpCircle, 
  Plus, 
  X, 
  FileText,
  AlignLeft,
  CheckCircle2,
  GitCommit
} from "lucide-react";
import { QuestionType } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface QuestionInputFormProps {
  onSolve: (data: {
    questionText: string;
    questionType: QuestionType | "auto";
    image: string | null;
    options: string[];
  }) => void;
  isLoading: boolean;
}

export default function QuestionInputForm({ onSolve, isLoading }: QuestionInputFormProps) {
  const [questionText, setQuestionText] = useState("");
  const [selectedType, setSelectedType] = useState<QuestionType | "auto">("auto");
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  
  // MCQ helpers
  const [mcqOptions, setMcqOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image load
  const handleImageChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, etc.)");
      return;
    }
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = () => {
    setImage(null);
    setImageName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // MCQ Options setup
  const addMcqOption = () => {
    if (newOption.trim()) {
      setMcqOptions([...mcqOptions, newOption.trim()]);
      setNewOption("");
    }
  };

  const removeMcqOption = (index: number) => {
    setMcqOptions(mcqOptions.filter((_, idx) => idx !== index));
  };

  const clearForm = () => {
    setQuestionText("");
    setSelectedType("auto");
    removeImage();
    setMcqOptions([]);
    setNewOption("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() && !image) {
      alert("Please provide either a question description or upload an image of the question.");
      return;
    }
    onSolve({
      questionText: questionText.trim(),
      questionType: selectedType,
      image,
      options: mcqOptions
    });
  };

  return (
    <div id="solver-input-form" className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider font-mono">
              Workspace Desk // Controls
            </span>
            <h2 className="text-sm font-bold text-slate-800">Identify & Solve Question</h2>
          </div>
          <button
            type="button"
            onClick={clearForm}
            className="text-[10px] text-slate-500 hover:text-slate-800 transition-colors px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono"
          >
            RESET
          </button>
        </div>

        {/* 1. Drag & Drop Image area */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 font-mono">
            Source Image / Worksheet <span className="text-slate-400 font-normal lowercase">(optional)</span>
          </label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed rounded p-4 text-center cursor-pointer transition ${
              isDragging 
                ? "border-indigo-600 bg-indigo-50/20" 
                : image 
                  ? "border-indigo-200 bg-indigo-50/10" 
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleImageChange(e.target.files[0])}
              accept="image/*"
              className="hidden"
            />
            
            <AnimatePresence mode="wait">
              {image ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center gap-2 relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative group rounded border border-slate-200 overflow-hidden bg-slate-150">
                    <img 
                      src={image} 
                      alt="Uploaded question screen" 
                      className="max-h-36 object-contain"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-[10px] font-bold uppercase tracking-wider">Loaded context</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded text-[11px] text-slate-600 border border-slate-200 w-full justify-between">
                    <span className="truncate font-mono font-bold max-w-[150px]">{imageName}</span>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center py-2">
                  <UploadCloud className="w-5 h-5 text-slate-400 mb-1" />
                  <p className="text-xs font-bold text-slate-700">
                    Drop image or <span className="text-indigo-600 underline">browse</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Supports PNG, JPG, JPEG</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 2. Question Text */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 font-mono">
            Instructions / Question Text
          </label>
          <div className="relative">
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Paste formula / query transcript here. e.g. Solve mitochondria functions pairing or thermodynamic processes..."
              rows={3}
              className="w-full rounded border border-slate-200 px-3 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-xs font-medium"
            />
            {questionText && (
              <button
                type="button"
                onClick={() => setQuestionText("")}
                className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 p-0.5 bg-slate-100 hover:bg-slate-200 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* 3. Expected Type Selector */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 font-mono">Question Type Mapping</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5">
            {[
              { id: "auto", label: "Auto-Detect", icon: Sparkles },
              { id: "multiple_choice", label: "Multiple Choice", icon: CheckCircle2 },
              { id: "yes_no", label: "Yes / No", icon: FileText },
              { id: "matching", label: "Matching", icon: GitCommit },
              { id: "general", label: "Open Solver", icon: AlignLeft },
            ].map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedType(type.id as QuestionType | "auto")}
                  className={`flex flex-col items-center justify-center p-2 rounded border text-center transition ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold"
                      : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 mb-1 ${isSelected ? "text-indigo-600" : "text-slate-400"}`} />
                  <span className="text-[10px] tracking-tight">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Multiple Choice Manual Options Helper */}
        <AnimatePresence>
          {selectedType === "multiple_choice" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-50 rounded p-3.5 border border-slate-200/80 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-200/50">
                <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">
                  Manual Choice Columns
                </h4>
                <p className="text-[9px] text-slate-400 uppercase font-mono">Optional entries</p>
              </div>

              {/* Option adder input */}
              <div className="flex gap-1.5 mb-3">
                <input
                  type="text"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMcqOption())}
                  placeholder="e.g. Option text or mathematical formulas..."
                  className="flex-1 rounded border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={addMcqOption}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-3 py-1.5 rounded flex items-center gap-1 shrink-0 transition"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>

              {/* Options list */}
              <div className="space-y-1">
                {mcqOptions.map((opt, id) => (
                  <div 
                    key={id} 
                    className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-slate-200 text-xs text-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono bg-slate-105 text-slate-500 px-1.5 py-0.5 rounded font-bold text-[9px]">
                        {String.fromCharCode(65 + id)}
                      </span>
                      <span className="text-[11px] font-medium">{opt}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMcqOption(id)}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-0.5 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {mcqOptions.length === 0 && (
                  <p className="text-[10px] text-slate-400 italic text-center py-1">
                    Options are auto-derived if left empty.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading || (!questionText.trim() && !image)}
            className={`w-full py-3 px-4 rounded font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              isLoading || (!questionText.trim() && !image)
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                : "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer hover:shadow-sm"
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                <span>Bắt đầu</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
