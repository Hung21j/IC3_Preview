import React, { useState } from "react";
import { 
  History, 
  Search, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  HelpCircle, 
  Filter,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { SavedQuestion, QuestionType } from "../types";

interface SolvedHistoryListProps {
  history: SavedQuestion[];
  onSelect: (item: SavedQuestion) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  activeId?: string;
}

export default function SolvedHistoryList({ 
  history, 
  onSelect, 
  onDelete, 
  onClearAll,
  activeId
}: SolvedHistoryListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<QuestionType | "all">("all");

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.questionText.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.result.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.result.summary.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" ? true : item.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const getRelativeTime = (timestampStr: string) => {
    try {
      const date = new Date(timestampStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  };

  return (
    <div id="solver-history-panel" className="bg-white rounded-lg border border-slate-200 p-4 h-full flex flex-col">
      
      {/* Title */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-1.5 align-middle">
          <span className="text-[10px] font-bold uppercase text-slate-400 font-mono tracking-wider">
            Computations History
          </span>
          <span className="bg-slate-100 border border-slate-200 text-slate-500 px-1.5 py-0.2 rounded font-mono font-bold text-[9px] select-none">
            {history.length}
          </span>
        </div>
        {history.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-[9px] text-slate-400 hover:text-red-500 uppercase tracking-wider font-mono hover:bg-red-50 px-1.5 py-0.5 rounded border border-slate-200/50"
          >
            Wipe
          </button>
        )}
      </div>

      {/* Search and Filter bar */}
      <div className="space-y-1.5 mb-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter computations..."
            className="w-full bg-slate-50 border border-slate-200 rounded pl-8 pr-3 py-1 text-[11px] focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-700 font-medium"
          />
        </div>

        {/* Categories filters */}
        <div className="flex flex-wrap gap-1 border-b border-slate-100 pb-1.5">
          {[
            { id: "all", label: "All" },
            { id: "multiple_choice", label: "MCQ" },
            { id: "yes_no", label: "Y/N" },
            { id: "matching", label: "Pairs" },
            { id: "general", label: "Open" }
          ].map((type) => {
            const isSelected = typeFilter === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setTypeFilter(type.id as QuestionType | "all")}
                className={`py-0.5 px-2 rounded text-[9px] font-extrabold uppercase font-mono transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200/30"
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* History Items list */}
      <div className="flex-1 overflow-y-auto space-y-1 max-h-[300px] lg:max-h-[400px] pr-1 scrollbar-thin">
        {filteredHistory.map((item) => {
          const isActive = activeId === item.id;
          const { topic, confidence } = item.result;
          
          return (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className={`p-2.5 rounded border text-left cursor-pointer transition flex items-start gap-2.5 group relative overflow-clip ${
                isActive
                  ? "border-indigo-600 bg-indigo-50/15"
                  : "border-slate-150 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {/* Type Icon indicator left-side thin color strip for active state */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />
              )}

              {/* Icon badge */}
              <div className={`p-1.5 rounded shrink-0 ${
                isActive ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-500 border border-slate-250"
              }`}>
                {item.type === "multiple_choice" ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : item.type === "yes_no" ? (
                  <FileText className="w-3 h-3" />
                ) : item.type === "matching" ? (
                  <Sparkles className="w-3 h-3" />
                ) : (
                  <HelpCircle className="w-3 h-3" />
                )}
              </div>

              {/* Main descriptive block */}
              <div className="flex-1 min-w-0 pr-3">
                <div className="flex items-center gap-1.5 justify-between text-[9px] font-mono">
                  <span className="font-extrabold text-slate-400 uppercase truncate">
                    {topic || "GENERAL_QUERY"}
                  </span>
                  <span className="text-slate-400 flex items-center gap-0.5 shrink-0">
                    <Clock className="w-3 h-3" /> {getRelativeTime(item.timestamp)}
                  </span>
                </div>

                <p className="text-[11px] font-bold text-slate-700 truncate leading-tight mt-0.5">
                  {item.questionText || "Image Solved Entry"}
                </p>

                <p className="text-[9px] text-slate-405 font-medium italic truncate mt-0.5 opacity-80">
                  {item.result.summary}
                </p>
              </div>

              {/* Active list details overlay indicator */}
              <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition">
                <ChevronRight className="w-3.5 h-3.5 text-indigo-500" />
              </div>

              {/* Interactive single delete */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="absolute right-0.5 top-0.5 p-0.5 text-slate-300 hover:text-red-500 rounded bg-transparent opacity-0 group-hover:opacity-100 hover:bg-red-50 transition"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {filteredHistory.length === 0 && (
          <div className="text-center py-8 bg-slate-50 border border-slate-100 rounded">
            <Clock className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
            <p className="text-[11px] text-slate-400 font-semibold font-mono uppercase tracking-wider">No computations found</p>
            {searchTerm || typeFilter !== "all" ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setTypeFilter("all");
                }}
                className="text-[10px] text-indigo-600 font-bold mt-1 hover:underline"
              >
                CLEAR FILTER
              </button>
            ) : null}
          </div>
        )}
      </div>

    </div>
  );
}
