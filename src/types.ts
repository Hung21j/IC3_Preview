/**
 * Types and interfaces for the Question Solver application.
 */

export type QuestionType = 'multiple_choice' | 'yes_no' | 'matching' | 'general';

export interface MCQOption {
  key: string;        // e.g., "A", "B", "C" or "1", "2"
  text: string;       // e.g., "Paris"
}

export interface MatchingPair {
  leftKey: string;    // Key of item from Column A
  leftText: string;   // Text of item from Column A
  rightKey: string;   // Key of item from Column B (correct match)
  rightText: string;  // Text of item from Column B (correct match)
  matchExplanation?: string; // Optional explanation for this specific pair
}

export interface SolvedResponse {
  questionType: QuestionType;
  originalQuestion: string;
  topic: string;
  confidence: number; // 0 to 100
  
  // MCQ Answer format
  mcqAnswer?: {
    correctKeys: string[]; // List of correct option keys (e.g., ["B"])
    correctText: string;   // Text representing correct answer(s)
    options: MCQOption[];  // Extracted options
  };

  // Yes/No Answer format
  yesNoAnswer?: {
    answer: 'Yes' | 'No' | 'True' | 'False';
    statement: string;
  };

  // Matching Answer format
  matchingAnswer?: {
    leftColumn: { key: string; text: string }[];
    rightColumn: { key: string; text: string }[];
    pairs: MatchingPair[];
  };

  // General Answer format
  generalAnswer?: {
    text: string;
  };

  stepByStepExplanation: string[];
  keyConcepts: {
    title: string;
    description: string;
  }[];
  summary: string;
}

export interface SavedQuestion {
  id: string;
  timestamp: string;
  questionText: string;
  image?: string; // base64 or source
  type: QuestionType;
  result: SolvedResponse;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  className: string;
  school: string;
  role: 'admin' | 'student';
  createdAt: string;
  lastLogin?: string;
  lastLogout?: string | null;
  isOnline?: boolean;
}

export interface SessionLog {
  id: string;
  userId: string;
  username: string;
  name: string;
  className: string;
  school: string;
  role?: 'admin' | 'student';
  isOnline?: boolean;
  loginTime: string;
  logoutTime?: string | null;
  durationSeconds?: number | null;
}

export interface ExamHistoryItem {
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
  timeTaken: number; // in seconds
  timestamp: string;
}
