import { QuestionType } from "../types";

export interface IC3Question {
  id: string;
  // levelId xác định cấp độ của câu hỏi:
  // - "level-1": Máy tính cơ bản
  // - "level-2": Các ứng dụng cốt lõi
  // - "level-3": Cuộc sống trực tuyến
  levelId: "level-1" | "level-2" | "level-3";
  
  // subsetId xác định đề thi hoặc chuyên mục cụ thể:
  // - "GM1": Đề GM1
  // - "GM2": Đề GM2
  // - "OT1": Đề OT1
  // - "OT2": Đề OT2
  // - "OT3": Đề OT3
  // - "OT4": Đề OT4
  // - "OT5": Đề OT5
  // (Đề "Tổng hợp FULL" sẽ tự động hiển thị tất cả các câu hỏi của cấp độ đó)
  subsetId: "GM1" | "GM2" | "OT1" | "OT2" | "OT3" | "OT4" | "OT5";
  
  type: QuestionType; // "multiple_choice" hoặc "yes_no" hoặc "matching"
  text: string;
  options?: string[]; // Danh sách đáp án lựa chọn (cho dạng multiple_choice)
  correctAnswerText?: string; // Hiển thị lời giải / đáp án đúng (tùy chọn)
  correctKeys?: string[]; // Phím đáp án đúng (ví dụ: ["B"] cho trắc nghiệm, ["True"] hoặc ["False"] cho Đúng/Sai)
  pairs?: { left: string; right: string }[]; // Cấu trúc ghép nối nếu có
}

/**
 * HƯỚNG DẪN THÊM CÂU HỎI MỚI:
 * -----------------------------------------------------
 * Bạn chỉ cần thêm một đối tượng {} vào mảng IC3_QUESTIONS dưới đây.
 * Đảm bảo điền đầy đủ các trường:
 * - id: "lễ_hội_gì_độc_nhất" (không được trùng lặp)
 * - levelId: "level-1", "level-2" hoặc "level-3"
 * - subsetId: "GM1", "GM2", "OT1", "OT2", "OT3", "OT4", "OT5"
 * - type: "multiple_choice" hoặc "yes_no"
 * - text: "Nội dung câu hỏi..."
 * - options: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"] (chỉ cần thiết nếu type là "multiple_choice")
 * - correctAnswerText: "Phần hiển thị đáp án đúng..."
 * - correctKeys: ["Phím đáp án đúng"] (Ví dụ: ["A"] hoặc ["True"])
 * - explanation: "Giải thích lý do lựa chọn đáp án này..."
 * -----------------------------------------------------
 */
export const IC3_QUESTIONS: IC3Question[] = [
  // ==========================================
  // LEVEL 1: MÁY TÍNH CƠ BẢN (level-1)
  // ==========================================
  {
    id: "l1-matching-q1",
    levelId: "level-1",
    subsetId: "GM1",
    type: "matching",
    text: "Hãy thực hiện ghép nối hoặc kéo thả các thuật ngữ công nghệ sau đây:",
    pairs: [
      { left: "Open Source", right: "Bất kỳ ai cũng có thể lấy mã nguồn và sửa đổi phần mềm miễn phí" },
      { left: "Boot", right: "Quá trình khởi động một hệ điều hành. Trong quá trình này, hệ điều hành tải tất cả các trình điều khiển phần mềm cho phép các thành phần phần cứng của máy tính giao tiếp với nhau" },
      { left: "Driver", right: "Một chương trình phần mềm nhỏ cho phép hệ điều hành và thiết bị giao tiếp với nhau" },
      { left: "Access Token", right: "Chứa thông tin xác thực bảo mật cho một phiên đăng nhập và xác định người dùng, các nhóm của người dùng và các đặc quyền của người dùng" },
      { left: "Daemon", right: "Bắt đầu thời gian khởi động và chạy như một quy trình nền để hỗ trợ đa nhiệm" }
    ]
  }, 
  // ==========================================
  // LEVEL 3: 
  // ==========================================

  {
    id: "l3-matching-q1",
    levelId: "level-3",
    subsetId: "GM1",
    type: "matching",
    text: "hãy chuyển từng nhu cầu từ danh sách ở bên phải sang thiết bị kỹ thuật số ở bên trái.",
    pairs: [
      { left: "Desktop Computer", right: "Có khả năng hợp nhất và chỉnh sửa các video lớn cho trang web của khách hàng"},
      { left: "Smartphone", right: "Có khả năng kiểm tra email, gửi tin nhắn và nhận cuộc gọi thoại mà không cần wifi"},
      { left: "Tablet", right: "Di động để sử dụng trong lớp học, hỗ trợ ghi chú, truy cập vào đám mây và chạy hầu hết các ứng dụng văn phòng"}
    ]
  }

];
