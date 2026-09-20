import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { db } from "./server/db";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up larger JSON limit for base64 image uploads
app.use(express.json({ limit: "15mb" }));

// Initialize the Google Gemini GenAI SDK
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// JSON Schema description for Gemini to ensure reliable responses
const solvedResponseSchema = {
  type: Type.OBJECT,
  properties: {
    questionType: {
      type: Type.STRING,
      description: "Type of the question. Must be 'multiple_choice', 'yes_no', 'matching', or 'general'."
    },
    originalQuestion: {
      type: Type.STRING,
      description: "The extracted or reformatted complete human-readable question text."
    },
    topic: {
      type: Type.STRING,
      description: "The subject topic of the question (e.g., Mathematics, Physics, History, Biology, Geography, Trivia)."
    },
    confidence: {
      type: Type.INTEGER,
      description: "Confidence level of success in solving the question, from 0 to 100."
    },
    mcqAnswer: {
      type: Type.OBJECT,
      description: "Details of multiple choice answer. Only populate if questionType is multiple_choice.",
      properties: {
        correctKeys: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Keys of the correct options, e.g., ['A'], or ['B', 'C'] if multiple."
        },
        correctText: {
          type: Type.STRING,
          description: "Consolidated text of the correct choice(s)."
        },
        options: {
          type: Type.ARRAY,
          description: "Complete list of identified choices with keys and option text.",
          items: {
            type: Type.OBJECT,
            properties: {
              key: { type: Type.STRING, description: "Option key (e.g. A, B, C, D)" },
              text: { type: Type.STRING, description: "Content of the option" }
            },
            required: ["key", "text"]
          }
        }
      },
      required: ["correctKeys", "correctText", "options"]
    },
    yesNoAnswer: {
      type: Type.OBJECT,
      description: "Details of Yes/No or True/False answer. Only populate if questionType is yes_no.",
      properties: {
        answer: {
          type: Type.STRING,
          description: "The correct choice. Must be 'Yes', 'No', 'True', or 'False'."
        },
        statement: {
          type: Type.STRING,
          description: "The statement to which this answer applies."
        }
      },
      required: ["answer", "statement"]
    },
    matchingAnswer: {
      type: Type.OBJECT,
      description: "Details of Matching Columns answer. Only populate if questionType is matching.",
      properties: {
        leftColumn: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              key: { type: Type.STRING, description: "Key identifier for left item (e.g., 1, 2, 3)" },
              text: { type: Type.STRING, description: "Left column item text" }
            },
            required: ["key", "text"]
          }
        },
        rightColumn: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              key: { type: Type.STRING, description: "Key identifier for right item (e.g., A, B, C)" },
              text: { type: Type.STRING, description: "Right column item text" }
            },
            required: ["key", "text"]
          }
        },
        pairs: {
          type: Type.ARRAY,
          description: "Resolved links connecting items from left Column A to right Column B.",
          items: {
            type: Type.OBJECT,
            properties: {
              leftKey: { type: Type.STRING, description: "Key of item in left Column" },
              leftText: { type: Type.STRING, description: "Text of item in left Column" },
              rightKey: { type: Type.STRING, description: "Key of matched item in right Column" },
              rightText: { type: Type.STRING, description: "Text of matched item in right Column" },
              matchExplanation: { type: Type.STRING, description: "Short rationale explaining why this pair is a match" }
            },
            required: ["leftKey", "leftText", "rightKey", "rightText"]
          }
        }
      },
      required: ["leftColumn", "rightColumn", "pairs"]
    },
    generalAnswer: {
      type: Type.OBJECT,
      description: "Details for standard open or short-answer questions. Only populate if questionType is general.",
      properties: {
        text: { type: Type.STRING, description: "Comprehensive, straightforward answer or solution text." }
      },
      required: ["text"]
    },
    stepByStepExplanation: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Rigorous step-by-step logic detailing how the absolute correct answer was derived."
    },
    keyConcepts: {
      type: Type.ARRAY,
      description: "Key terminology, formulas, or academic concepts relevant to this question.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Concept title" },
          description: { type: Type.STRING, description: "Brief explanation or definition" }
        },
        required: ["title", "description"]
      }
    },
    summary: {
      type: Type.STRING,
      description: "A solid, one-sentence takeaway answering the core prompt."
    }
  },
  required: [
    "questionType",
    "originalQuestion",
    "topic",
    "confidence",
    "stepByStepExplanation",
    "keyConcepts",
    "summary"
  ]
};

// Solve Endpoint
app.post("/api/solve", async (req, res) => {
  try {
    const { questionText, questionType, image, options } = req.body;

    if (!apiKey) {
      return res.status(400).json({ 
        error: "GEMINI_API_KEY environment variable is not defined. Please add your key in the Settings > Secrets panel." 
      });
    }

    const parts: any[] = [];

    // Parse image if present
    if (image && typeof image === "string" && image.startsWith("data:")) {
      const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        parts.push({
          inlineData: {
            mimeType: matches[1],
            data: matches[2]
          }
        });
      }
    }

    // Prepare contextual user message
    let userPromptText = "";
    if (questionText) {
      userPromptText += `QUESTION TEXT / INPUT CLUES:\n${questionText}\n\n`;
    }
    if (questionType && questionType !== 'auto') {
      userPromptText += `EXPECTED QUESTION TYPE: ${questionType}\n\n`;
    }
    if (options && Array.isArray(options) && options.length > 0) {
      userPromptText += `MANUALLY PROVIDED OPTIONS:\n${options.map((opt, idx) => `${String.fromCharCode(65 + idx)}. ${opt}`).join("\n")}\n\n`;
    }

    userPromptText += `INSTRUCTIONS FOR SOLVER ENGAGEMENT:
1. Examine the provided question details (and image visual context if any).
2. Completely solve the requested task. Be rigorous, double check mathematics, logic, historical dates, grammar or translations.
3. Automatically classify the question style into one of these:
   - 'multiple_choice' (MCQ / multiple selector)
   - 'yes_no' (True/False, Correct/Incorrect, Yes/No checklist)
   - 'matching' (Connecting Left column entries to Right column partner entries)
   - 'general' (Standard text prompt, math solve, short answer, fill in blank, or general essay problem).
4. If options are visible in the image but not specified in text, extract them and map them inside the 'multiple_choice' JSON response structures!
5. If the type is 'matching', map every left column entry correctly to its corresponding right column partner and explain why.
6. List three key scientific, historic, or logical concepts, theorems, or theories helpful for remembering or testing this topic.
7. Return only strict, valid JSON conforming exactly to the responseSchema.`;

    parts.push({ text: userPromptText });

    // Call Gemini API using 'gemini-3.5-flash' on server side
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: parts,
      config: {
        systemInstruction: "You are a professional, peer-reviewed expert examiner and academic teacher. Formulate rigorous, correct, and completely explanations for any questions provided. Respond ONLY in valid JSON matching the exact schema definition.",
        responseMimeType: "application/json",
        responseSchema: solvedResponseSchema,
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Empty response from AI engine.");
    }

    const parsedData = JSON.parse(textOutput.trim());
    return res.json({ success: true, result: parsedData });

  } catch (error: any) {
    console.error("AI Solve Error details:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || "An unexpected error occurred while interacting with the AI endpoint." 
    });
  }
});

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

// Login with username & password
app.post("/api/auth/login", (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: "Vui lòng nhập tên đăng nhập và mật khẩu." });
    }

    const user = db.findUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, error: "Tên đăng nhập hoặc mật khẩu không chính xác." });
    }

    const session = db.createSession(user);
    // Don't return plain password to client
    const { password: _, ...safeUser } = user;

    return res.json({
      success: true,
      user: safeUser,
      sessionId: session.id
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Lỗi đăng nhập." });
  }
});

// Register new user (name, class, school, username, password)
app.post("/api/auth/register", (req, res) => {
  try {
    const { username, password, name, className, school } = req.body;
    if (!username || !password || !name || !className || !school) {
      return res.status(400).json({ 
        success: false, 
        error: "Vui lòng điền đầy đủ thông tin: Họ tên, Lớp, Trường, Tên đăng nhập và Mật khẩu." 
      });
    }

    const existing = db.findUserByUsername(username);
    if (existing) {
      return res.status(400).json({ success: false, error: "Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác." });
    }

    const newUser = db.addUser({
      username: username.trim().toLowerCase(),
      password: password,
      name: name.trim(),
      className: className.trim(),
      school: school.trim(),
      role: "student"
    });

    const session = db.createSession(newUser);
    const { password: _, ...safeUser } = newUser;

    return res.json({
      success: true,
      user: safeUser,
      sessionId: session.id
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Lỗi tạo tài khoản." });
  }
});

// Logout (records logout time and duration)
app.post("/api/auth/logout", (req, res) => {
  try {
    const { userId, sessionId } = req.body;
    if (userId) {
      db.endSession(userId, sessionId);
    }
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Lỗi đăng xuất." });
  }
});

// ==========================================
// ADMIN USER MANAGEMENT ENDPOINTS
// ==========================================

// Get all users + statistical overview
app.get("/api/admin/users", (req, res) => {
  try {
    const users = db.getUsers().map(({ password, ...u }) => u);
    const sessions = db.getSessions();
    const history = db.getExamHistory();
    const customQuestions = db.getCustomQuestions();

    const uniqueSchools = Array.from(new Set(users.map(u => u.school).filter(Boolean)));
    const onlineCount = users.filter(u => u.isOnline).length;
    const studentCount = users.filter(u => u.role === "student").length;

    return res.json({
      success: true,
      users,
      stats: {
        totalUsers: users.length,
        totalStudents: studentCount,
        onlineCount,
        totalExamsTaken: history.length,
        totalCustomQuestions: customQuestions.length,
        schoolsCount: uniqueSchools.length,
        uniqueSchools
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Lỗi tải danh sách người dùng." });
  }
});

// Admin creates new user
app.post("/api/admin/users", (req, res) => {
  try {
    const { username, password, name, className, school, role } = req.body;
    if (!username || !password || !name) {
      return res.status(400).json({ success: false, error: "Vui lòng nhập đầy đủ họ tên, tên đăng nhập và mật khẩu." });
    }

    const existing = db.findUserByUsername(username);
    if (existing) {
      return res.status(400).json({ success: false, error: "Tên đăng nhập này đã tồn tại." });
    }

    const created = db.addUser({
      username: username.trim().toLowerCase(),
      password,
      name: name.trim(),
      className: (className || "").trim(),
      school: (school || "").trim(),
      role: role === "admin" ? "admin" : "student"
    });

    const { password: _, ...safe } = created;
    return res.json({ success: true, user: safe });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Lỗi tạo người dùng." });
  }
});

// Admin deletes user
app.delete("/api/admin/users/:id", (req, res) => {
  try {
    const { id } = req.params;
    const ok = db.deleteUser(id);
    if (!ok) {
      return res.status(400).json({ success: false, error: "Không thể xóa tài khoản này hoặc tài khoản không tồn tại." });
    }
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Lỗi xóa người dùng." });
  }
});

// Get session logs (login/logout times)
app.get("/api/admin/sessions", (req, res) => {
  try {
    const sessions = db.getSessions();
    return res.json({ success: true, sessions });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Lỗi tải lịch sử đăng nhập/đăng xuất." });
  }
});

// ==========================================
// EXAM HISTORY ENDPOINTS
// ==========================================

// Get all exam doing history
app.get("/api/admin/history", (req, res) => {
  try {
    const history = db.getExamHistory();
    return res.json({ success: true, history });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Lỗi tải lịch sử làm bài." });
  }
});

// Record completed exam
app.post("/api/history", (req, res) => {
  try {
    const {
      userId,
      username,
      studentName,
      className,
      school,
      level,
      subset,
      mode,
      correctCount,
      wrongCount,
      totalCount,
      scorePercent,
      timeTaken
    } = req.body;

    const record = db.addExamHistory({
      userId: userId || "anonymous",
      username: username || "anonymous",
      studentName: studentName || "Học sinh",
      className: className || "",
      school: school || "",
      level: level || "Level 1",
      subset: subset || "GM1",
      mode: mode || "testing",
      correctCount: Number(correctCount) || 0,
      wrongCount: Number(wrongCount) || 0,
      totalCount: Number(totalCount) || 0,
      scorePercent: Number(scorePercent) || 0,
      timeTaken: Number(timeTaken) || 0
    });

    return res.json({ success: true, record });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Lỗi lưu lịch sử bài thi." });
  }
});

// ==========================================
// QUESTION BANK MANAGEMENT ENDPOINTS
// ==========================================

// Get custom questions
app.get("/api/questions", (req, res) => {
  try {
    const customQuestions = db.getCustomQuestions();
    return res.json({ success: true, customQuestions });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Lỗi tải câu hỏi." });
  }
});

// Admin adds a question
app.post("/api/admin/questions", (req, res) => {
  try {
    const {
      levelId,
      subsetId,
      type,
      text,
      options,
      correctAnswerText,
      correctKeys,
      pairs,
      createdBy
    } = req.body;

    if (!levelId || !subsetId || !text) {
      return res.status(400).json({ success: false, error: "Vui lòng nhập đủ Cấp độ, Đề thi và Nội dung câu hỏi." });
    }

    const newQ = db.addCustomQuestion({
      levelId,
      subsetId,
      type: type || "multiple_choice",
      text: text.trim(),
      options: options || [],
      correctAnswerText: correctAnswerText || (options ? options[0] : "Đáp án đúng"),
      correctKeys: correctKeys || ["A"],
      pairs: pairs || undefined,
      createdBy: createdBy || "admin"
    });

    return res.json({ success: true, question: newQ });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Lỗi lưu câu hỏi." });
  }
});

// Admin deletes a question
app.delete("/api/admin/questions/:id", (req, res) => {
  try {
    const { id } = req.params;
    const ok = db.deleteCustomQuestion(id);
    if (!ok) {
      return res.status(404).json({ success: false, error: "Không tìm thấy câu hỏi để xóa." });
    }
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Lỗi xóa câu hỏi." });
  }
});

// Configure client assets loading
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    // Vite Middlewares for development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve build directory in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[STATUS] Express Server running on HTTP port ${PORT}`);
  });
}

setupServer();
