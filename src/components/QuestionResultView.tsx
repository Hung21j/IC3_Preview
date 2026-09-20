import React from "react";
import { 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  Award, 
  BookOpen, 
  Compass, 
  TrendingUp, 
  Layers, 
  Check, 
  Bookmark, 
  ArrowRight,
  GitPullRequest,
  CheckCircle2
} from "lucide-react";
import { SolvedResponse } from "../types";

interface QuestionResultViewProps {
  result: SolvedResponse;
  student?: { name: string; className: string } | null;
}

export default function QuestionResultView({ result, student }: QuestionResultViewProps) {
  const { 
    questionType, 
    originalQuestion, 
    topic, 
    confidence, 
    mcqAnswer, 
    yesNoAnswer, 
    matchingAnswer, 
    generalAnswer,
    stepByStepExplanation, 
    keyConcepts,
    summary 
  } = result;

  // Render question header including confidence gauge
  const renderHeader = () => {
    return (
      <div className="border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-1.5 font-mono flex-wrap">
            <span className="px-2 py-0.5 text-[10px] font-bold text-slate-400">
              QUERY_TYPE // {questionType.toUpperCase()}
            </span>
            {student && (
              <>
                <span className="text-slate-300">|</span>
                <span className="px-2 py-0.5 text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold uppercase rounded">
                  STUDENT: {student.name} ({student.className})
                </span>
              </>
            )}
            <span className="text-slate-300">|</span>
            <span className="px-2 py-0.5 text-[10px] bg-slate-100 rounded text-slate-600 font-bold capitalize">
              {topic || "General Subject"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">CONFIDENCE_SCORE</span>
              <span className={`text-xs font-mono font-bold ${
                confidence >= 90 ? "text-emerald-600" : confidence >= 70 ? "text-amber-600" : "text-rose-500"
              }`}>{confidence}% Perfect Accuracy</span>
            </div>
            {/* Accuracy bar indicator */}
            <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  confidence >= 90 ? "bg-emerald-500" : confidence >= 70 ? "bg-amber-500" : "bg-rose-500"
                }`}
                style={{ width: `${confidence}%` }}
              />
            </div>
          </div>
        </div>

        <div className="text-slate-800 font-sans leading-relaxed">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1 font-mono">
            <HelpCircle className="w-3.5 h-3.5 text-slate-300" /> PARSED_QUESTION_PROMPT
          </h3>
          <p className="text-sm font-semibold text-slate-850 bg-slate-50 border border-slate-200 p-4 rounded font-sans leading-relaxed whitespace-pre-wrap">
            {originalQuestion}
          </p>
        </div>
      </div>
    );
  };

  // Render Multiple Choice Answers Grid
  const renderMCQ = () => {
    if (!mcqAnswer) return null;
    const { correctKeys = [], options = [], correctText } = mcqAnswer;

    return (
      <div className="space-y-3 py-3">
        <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50/50 border border-emerald-200 p-3 rounded">
          <Award className="w-4 h-4 shrink-0 text-emerald-600" />
          <div className="text-xs">
            <span className="font-extrabold uppercase font-mono tracking-wider">CORRECT_CHOICE: </span>
            <span className="font-mono bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded mr-1 font-extrabold text-xs">
              {correctKeys.join(", ")}
            </span>
            <span className="font-semibold text-emerald-950">{correctText}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {options.map((option) => {
            const isCorrect = correctKeys.includes(option.key);
            return (
              <div
                key={option.key}
                className={`border rounded p-3 flex items-start gap-3 transition-colors ${
                  isCorrect
                    ? "border-emerald-500 bg-emerald-50/30 shadow-sm"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className={`mt-0.5 w-5 h-5 shrink-0 rounded flex items-center justify-center font-bold font-mono text-[10px] ${
                  isCorrect
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-500 border border-slate-200"
                }`}>
                  {option.key}
                </div>
                <div className="flex-1">
                  <p className={`text-xs ${isCorrect ? "font-bold text-slate-900" : "text-slate-600 font-medium"}`}>
                    {option.text}
                  </p>
                </div>
                {isCorrect && (
                  <div className="bg-emerald-100 text-emerald-700 p-0.5 rounded-full shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Yes / No Choice Cards
  const renderYesNo = () => {
    if (!yesNoAnswer) return null;
    const { answer, statement } = yesNoAnswer;
    const isYes = answer === "Yes" || answer === "True";

    return (
      <div className="py-3 space-y-3">
        <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider font-mono">Statement Analysis</div>
        
        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded text-xs italic text-slate-700 font-semibold leading-normal">
          "{statement}"
        </div>

        <div className="flex gap-3">
          <div className={`flex-1 flex flex-col items-center justify-center p-4 rounded border transition text-center ${
            isYes 
              ? "border-emerald-600 bg-emerald-50/35 text-emerald-950 scale-[1.01]"
              : "border-slate-200 bg-white text-slate-400 opacity-60"
          }`}>
            <CheckCircle className={`w-8 h-8 mb-1.5 ${isCorrectColor(isYes)}`} />
            <span className="text-sm font-extrabold font-mono uppercase tracking-wider">
              {answer === "True" || answer === "False" ? "True" : "Yes"}
            </span>
            <span className="text-[10px] text-emerald-700 mt-0.5 font-bold uppercase">VERIFIED</span>
          </div>

          <div className={`flex-1 flex flex-col items-center justify-center p-4 rounded border transition text-center ${
            !isYes 
              ? "border-rose-600 bg-rose-50/35 text-rose-950 scale-[1.01]"
              : "border-slate-200 bg-white text-slate-400 opacity-60"
          }`}>
            <XCircle className={`w-8 h-8 mb-1.5 ${isCorrectColor(!isYes, true)}`} />
            <span className="text-sm font-extrabold font-mono uppercase tracking-wider">
              {answer === "True" || answer === "False" ? "False" : "No"}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase">INCORRECT</span>
          </div>
        </div>
      </div>
    );
  };

  const isCorrectColor = (condition: boolean, isRed = false) => {
    if (condition) {
      return isRed ? "text-rose-600" : "text-emerald-600";
    }
    return "text-slate-200";
  };

  // Render Matching Columns side-by-side matches with explicit connector graphs
  const renderMatching = () => {
    if (!matchingAnswer) return null;
    const { pairs = [] } = matchingAnswer;

    return (
      <div className="space-y-3 py-3">
        <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 font-mono">
          <GitPullRequest className="w-3.5 h-3.5 text-indigo-400" /> PAIRING_MATCHES_RESOLVED
        </h4>

        {/* Visual responsive matching list with connectors */}
        <div className="space-y-2">
          {pairs.map((pair, index) => (
            <div 
              key={index}
              className="flex flex-col md:flex-row items-stretch border border-slate-200 bg-white rounded overflow-hidden"
            >
              {/* Left Column Item */}
              <div className="flex-1 p-3.5 bg-slate-50/45 border-b md:border-b-0 md:border-r border-slate-200 flex items-center relative">
                <div className="flex items-center gap-2.5 w-full">
                  <span className="w-5 h-5 shrink-0 rounded-full bg-slate-200 font-mono text-[9px] font-black text-slate-600 flex items-center justify-center border border-slate-300">
                    {pair.leftKey}
                  </span>
                  <p className="text-xs font-bold text-slate-700 text-left">{pair.leftText}</p>
                </div>
                {/* Embedded connecting line representation for high density aesthetics on MD+ screens */}
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-3 h-px bg-indigo-300 z-10" />
              </div>

              {/* Connected Coordinate Link Indicator */}
              <div className="flex items-center justify-center px-3 py-1 bg-indigo-50 font-mono text-[9px] font-extrabold text-indigo-600 z-20 shrink-0 border-b md:border-b-0 md:border-r border-indigo-100 select-none">
                <div className="flex items-center gap-1 uppercase tracking-wider">
                  <span>Match</span>
                  <ArrowRight className="w-3 h-3 rotate-90 md:rotate-0 animate-pulse" />
                </div>
              </div>

              {/* Right Column Item */}
              <div className="flex-1 p-3.5 bg-white flex items-center text-left relative">
                {/* Embedded connecting line representation for high density aesthetics on MD+ screens */}
                <div className="hidden md:block absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-px bg-indigo-300 z-10" />
                <div className="flex items-center gap-2.5 w-full pl-0 md:pl-2">
                  <span className="w-5 h-5 shrink-0 rounded-full bg-indigo-600 text-white font-mono text-[9px] font-black flex items-center justify-center shadow">
                    {pair.rightKey}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-indigo-950">{pair.rightText}</p>
                    {pair.matchExplanation && (
                      <p className="text-[10px] text-slate-400 font-medium italic mt-0.5">
                        {pair.matchExplanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render Open Ended General Solution Sheets
  const renderGeneral = () => {
    if (!generalAnswer) return null;
    return (
      <div className="py-3 font-mono text-slate-800 leading-relaxed max-w-none">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1 font-mono">
          <BookOpen className="w-3.5 h-3.5 text-slate-300" /> ANSWER_SHEET_EVAL_STREAM
        </h4>
        <div className="bg-slate-900 text-slate-150 p-4 rounded font-mono text-xs whitespace-pre-wrap leading-relaxed shadow-inner border border-slate-800">
          {generalAnswer.text}
        </div>
      </div>
    );
  };

  return (
    <div id="solver-result-card" className="bg-white rounded-lg border border-slate-200 p-5 space-y-5 shadow-sm">
      
      {/* 1. Header (Topic, confidence, analyzed text) */}
      {renderHeader()}
 
      {/* 2. Specific Answer Renderers */}
      {questionType === "multiple_choice" && renderMCQ()}
      {questionType === "yes_no" && renderYesNo()}
      {questionType === "matching" && renderMatching()}
      {questionType === "general" && renderGeneral()}

      {/* 3. Bullet-proof Summary takeaway */}
      {summary && (
        <div className="bg-indigo-50 border border-indigo-150 p-3 rounded">
          <h4 className="text-[9px] font-extrabold text-indigo-500 uppercase tracking-widest mb-1 font-mono">KEY_TAKEAWAY_SUMMARY</h4>
          <p className="text-xs text-indigo-950 font-bold">{summary}</p>
        </div>
      )}

      {/* 4. Chronological Step-by-Step Breakdown checkpoints */}
      {stepByStepExplanation && stepByStepExplanation.length > 0 && (
        <div className="pt-4 border-t border-slate-200/70">
          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 font-mono">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> STEP_BY_STEP_DECOMPOSITION
          </h4>
          <div className="space-y-2">
            {stepByStepExplanation.map((step, index) => (
              <div key={index} className="flex gap-3 items-stretch">
                <div className="font-mono text-[10px] font-black w-5 bg-indigo-50 border border-indigo-150 text-indigo-600 rounded flex items-center justify-center shrink-0 self-start py-1">
                  {index + 1}
                </div>
                <div className="bg-slate-50 border border-slate-200/50 rounded p-3 flex-1">
                  <p className="text-xs leading-relaxed text-slate-700 font-semibold">
                    {step}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Key Academic Concepts bento list */}
      {keyConcepts && keyConcepts.length > 0 && (
        <div className="pt-4 border-t border-slate-200/70">
          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 font-mono">
            <Layers className="w-3.5 h-3.5 text-indigo-400" /> ASSOCIATED_THEORY_BLOCKS
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {keyConcepts.map((concept, index) => (
              <div 
                key={index} 
                className="bg-slate-50/55 border border-slate-200 p-3 rounded flex items-start gap-2.5"
              >
                <div className="p-1 bg-indigo-50 text-indigo-600 rounded mt-0.5">
                  <BookOpen className="w-3 h-3 text-indigo-500" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800 tracking-tight leading-tight">{concept.title}</h5>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-medium">{concept.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
