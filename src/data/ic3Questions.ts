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
  
  type: QuestionType; // "multiple_choice" hoặc "yes_no"
  text: string;
  options?: string[]; // Danh sách đáp án lựa chọn (cho dạng multiple_choice)
  correctAnswerText: string;
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
    correctAnswerText: "• Open Source ➔ Bất kỳ ai cũng có thể lấy mã nguồn và sửa đổi phần mềm miễn phí\n• Boot ➔ Quá trình khởi động một hệ điều hành...\n• Driver ➔ Một chương trình phần mềm nhỏ cho phép hệ điều hành và thiết bị giao tiếp...\n• Access Token ➔ Chứa thông tin xác thực bảo mật cho một phiên đăng nhập...\n• Daemon ➔ Bắt đầu thời gian khởi động và chạy như một quy trình nền...",
    pairs: [
      { left: "Open Source", right: "Bất kỳ ai cũng có thể lấy mã nguồn và sửa đổi phần mềm miễn phí" },
      { left: "Boot", right: "Quá trình khởi động một hệ điều hành. Trong quá trình này, hệ điều hành tải tất cả các trình điều khiển phần mềm cho phép các thành phần phần cứng của máy tính giao tiếp với nhau" },
      { left: "Driver", right: "Một chương trình phần mềm nhỏ cho phép hệ điều hành và thiết bị giao tiếp với nhau" },
      { left: "Access Token", right: "Chứa thông tin xác thực bảo mật cho một phiên đăng nhập và xác định người dùng, các nhóm của người dùng và các đặc quyền của người dùng" },
      { left: "Daemon", right: "Bắt đầu thời gian khởi động và chạy như một quy trình nền để hỗ trợ đa nhiệm" }
    ]
  },
  {
    id: "l1-q1",
    levelId: "level-1",
    subsetId: "GM1",
    type: "multiple_choice",
    text: "Phần cứng nào sau đây đóng vai trò là 'bộ nhận thức - bộ não' của máy tính, đảm nhận việc thực hiện các phép toán số học, logic và điều phối hoạt động của toàn bộ thiết bị?",
    options: [
      "Bộ nhớ truy cập ngẫu nhiên (RAM)",
      "Bộ xử lý trung tâm (CPU)",
      "Ổ đĩa cứng thể rắn (SSD)",
      "Bộ nhớ chỉ đọc (ROM)"
    ],
    correctAnswerText: "B. Bộ xử lý trung tâm (CPU)",
    correctKeys: ["B"],
  },
  {
    id: "l1-q2",
    levelId: "level-1",
    subsetId: "GM1",
    type: "yes_no",
    text: "True/False (Đúng hay Sai): Khi bạn thực hiện tắt nguồn máy tính (Shutdown), toàn bộ các tiến trình và dữ liệu lưu giữ tạm thời trên bộ nhớ RAM sẽ bị giải phóng (xóa sạch hoàn toàn).",
    correctAnswerText: "True (Đúng)",
    correctKeys: ["True"],
  },
  {
    id: "l1-q3",
    levelId: "level-1",
    subsetId: "GM2",
    type: "multiple_choice",
    text: "Thiết bị nào sau đây vừa thực hiện chức năng nhập dữ liệu (vào - Input) vừa thực hiện chức năng xuất dữ liệu (ra - Output) của máy tính?",
    options: [
      "Màn hình cảm ứng (Touchscreen)",
      "Bàn phím vật lý (Keyboard)",
      "Chuột quang (Mouse)",
      "Máy in laser (Printer)"
    ],
    correctAnswerText: "A. Màn hình cảm ứng (Touchscreen)",
    correctKeys: ["A"],
  },
  {
    id: "l1-q4",
    levelId: "level-1",
    subsetId: "OT1",
    type: "multiple_choice",
    text: "Trong hệ điều hành Microsoft Windows, tổ hợp phím tắt nhanh nào hỗ trợ người dùng chuyển đổi nhanh hiển thị giữa các cửa sổ ứng dụng đang mở?",
    options: [
      "Ctrl + Alt + Delete",
      "Alt + Tab",
      "Windows Logo + D",
      "Alt + F4"
    ],
    correctAnswerText: "B. Alt + Tab",
    correctKeys: ["B"],
  },
  {
    id: "l1-q5",
    levelId: "level-1",
    subsetId: "OT2",
    type: "multiple_choice",
    text: "Ổ cứng thể rắn SSD (Solid State Drive) có ưu điểm vượt trội nào sau đây so với ổ cứng HDD (Hard Disk Drive) truyền thống?",
    options: [
      "Dung lượng lưu trữ luôn lớn gấp 100 lần",
      "Tốc độ đọc ghi dữ liệu nhanh hơn vượt trội và chống sốc tốt do không có bộ phận chuyển động cơ học",
      "Không cần sử dụng nguồn điện từ máy tính để hoạt động",
      "Có khả năng tự động sửa chữa phần mềm bị lỗi hệ thống"
    ],
    correctAnswerText: "B. Tốc độ đọc ghi dữ liệu nhanh hơn vượt trội và chống sốc tốt do không có bộ phận chuyển động cơ học",
    correctKeys: ["B"],
  },
  {
    id: "l1-q6",
    levelId: "level-1",
    subsetId: "OT3",
    type: "yes_no",
    text: "True/False (Đúng hay Sai): Hệ điều hành (Operating System) là một phần cứng vật lý giúp kết nối dây nguồn hoạt động của màn hình máy tính.",
    correctAnswerText: "False (Sai)",
    correctKeys: ["False"],
  },
  {
    id: "l1-q7",
    levelId: "level-1",
    subsetId: "OT4",
    type: "multiple_choice",
    text: "Đơn vị đo lường phổ biến nào sau đây thường được dùng để chỉ dung lượng lưu trữ của một ổ đĩa cứng máy tính cá nhân hiện đại ngày nay?",
    options: [
      "Megahertz (MHz) hoặc Gigahertz (GHz)",
      "Gigabyte (GB) hoặc Terabyte (TB)",
      "Megapixels (MP)",
      "Frames per second (FPS)"
    ],
    correctAnswerText: "B. Gigabyte (GB) hoặc Terabyte (TB)",
    correctKeys: ["B"],
  },
  {
    id: "l1-q8",
    levelId: "level-1",
    subsetId: "OT5",
    type: "multiple_choice",
    text: "Khi một chương trình ứng dụng trên Windows bị đóng băng tạm thời và hiển thị dòng chữ 'Not Responding', bạn nên mở công cụ hệ thống nào sau đây để kích hoạt buộc đóng tiến trình đó?",
    options: [
      "Windows Registry Editor",
      "Windows File Explorer",
      "Task Manager (Trình quản lý tác vụ)",
      "Disk Defragmenter"
    ],
    correctAnswerText: "C. Task Manager (Trình quản lý tác vụ)",
    correctKeys: ["C"],
  },

  // ==========================================
  // LEVEL 2: CÁC ỨNG DỤNG CỐT LÕI (level-2)
  // ==========================================
  {
    id: "l2-q1",
    levelId: "level-2",
    subsetId: "GM1",
    type: "multiple_choice",
    text: "Trong tiến trình soạn thảo văn bản hành chính bằng phần mềm Microsoft Word, tổ hợp phím tắt nhanh nào hỗ trợ người dùng căn chỉnh lề đều hai bên (Justify) cho khối văn bản đang được bôi đen?",
    options: [
      "Ctrl + L (Left align)",
      "Ctrl + R (Right align)",
      "Ctrl + E (Center align)",
      "Ctrl + J (Justify align)"
    ],
    correctAnswerText: "D. Ctrl + J (Justify align)",
    correctKeys: ["D"],
  },
  {
    id: "l2-q2",
    levelId: "level-2",
    subsetId: "GM2",
    type: "multiple_choice",
    text: "Trong bảng tính Excel, nếu ô chứa dữ liệu lần lượt là A1 = 8, A2 = 12 và A3 = 10. Giá trị trả về của thuật toán chứa hàm sau là bao nhiêu: `=AVERAGE(A1:A3)`?",
    options: [
      "30",
      "10",
      "22",
      "12"
    ],
    correctAnswerText: "B. 10",
    correctKeys: ["B"],
  },
  {
    id: "l2-q3",
    levelId: "level-2",
    subsetId: "OT1",
    type: "multiple_choice",
    text: "Trong thiết kế trình diễn bằng Microsoft PowerPoint, chế độ hiển thị sắp xếp Slide Sorter mang lại công dụng nào có lợi nhất cho tác giả thiết kế?",
    options: [
      "Chỉnh sửa hiệu ứng âm thanh và nhạc nền cho toàn slide",
      "Hiển thị tất cả slide dưới dạng hình nhỏ giúp dễ kéo thả sắp xếp lại thứ tự, thêm, nhân bản hoặc xóa nhanh slide",
      "Chạy thử hoạt cảnh xuất hiện của từng cụm từ văn bản",
      "Tự động dịch thuật nội dung slide sang ngôn ngữ khác"
    ],
    correctAnswerText: "B. Hiển thị tất cả slide dưới dạng hình nhỏ giúp dễ kéo thả sắp xếp lại thứ tự, thêm, nhân bản hoặc xóa nhanh slide",
    correctKeys: ["B"],
  },
  {
    id: "l2-q4",
    levelId: "level-2",
    subsetId: "OT2",
    type: "multiple_choice",
    text: "Khi làm việc trên văn bản dài trong Word, tổ hợp phím tắt nào giúp bạn di chuyển nhanh căn lề của đoạn văn hiện hành căn đều ở trung tâm (Center Alignment)?",
    options: [
      "Ctrl + L",
      "Ctrl + R",
      "Ctrl + E",
      "Ctrl + M"
    ],
    correctAnswerText: "C. Ctrl + E",
    correctKeys: ["C"],
  },
  {
    id: "l2-q5",
    levelId: "level-2",
    subsetId: "OT3",
    type: "multiple_choice",
    text: "Trong Microsoft Excel, công thức tính toán nào sau đây là hoàn toàn đúng cú pháp để tính tổng toàn bộ các giá trị số nằm trong dãy ô từ B2 đến B10?",
    options: [
      "=ADD(B2:B10)",
      "=SUM(B2:B10)",
      "=TOTAL(B2..B10)",
      "=SUM(B2-B10)"
    ],
    correctAnswerText: "B. =SUM(B2:B10)",
    correctKeys: ["B"],
  },
  {
    id: "l2-q6",
    levelId: "level-2",
    subsetId: "OT4",
    type: "yes_no",
    text: "True/False (Đúng hay Sai): Trong trình chiếu PowerPoint, bạn chỉ có thể áp dụng hiệu ứng chuyển đổi giữa các slide (Transition) cho trang đầu tiên duy nhất.",
    correctAnswerText: "False (Sai)",
    correctKeys: ["False"],
  },
  {
    id: "l2-q7",
    levelId: "level-2",
    subsetId: "OT5",
    type: "multiple_choice",
    text: "Để thực hiện chèn một bảng biểu số liệu gồm hàng và cột (Table) vào văn bản Word hiện hành, bạn cần định vị và click vào tab chức năng nào trên thanh công cụ Ribbon?",
    options: [
      "Tab Home (Trang chủ)",
      "Tab Insert (Chèn)",
      "Tab Layout (Bố trí)",
      "Tab View (Hiển thị)"
    ],
    correctAnswerText: "B. Tab Insert (Chèn)",
    correctKeys: ["B"],
  },
  {
    id: "l2-q8",
    levelId: "level-2",
    subsetId: "GM1",
    type: "multiple_choice",
    text: "Thao tác đúp chuột trái (Double-click) vào một từ bất kỳ trong văn bản soạn thảo Word sẽ tạo ra kết quả trực tiếp nào dưới đây?",
    options: [
      "Xóa hoàn toàn từ đó ra khỏi dòng",
      "Bôi đen (chọn nhanh) toàn bộ từ vừa click",
      "Mở cửa sổ tìm kiếm từ đồng nghĩa tiếng anh",
      "Căn lề giữa bài viết cho từ đó"
    ],
    correctAnswerText: "B. Bôi đen (chọn nhanh) toàn bộ từ vừa click",
    correctKeys: ["B"],
  },

  // ==========================================
  // LEVEL 3: CUỘC SỐNG TRỰC TUYẾN (level-3)
  // ==========================================
  {
    id: "l3-q1",
    levelId: "level-3",
    subsetId: "GM1",
    type: "multiple_choice",
    text: "Giao thức truyền tải thông tin mạng nào sau đây hỗ trợ mã hóa bảo mật dữ liệu, giúp người dùng không bị đánh cắp thông tin đăng nhập và hiển thị ký hiệu 'ổ khóa xanh an toàn' trên trình duyệt?",
    options: [
      "FTP (File Transfer Protocol)",
      "HTTP (Hypertext Transfer Protocol)",
      "HTTPS (Hypertext Transfer Protocol Secure)",
      "SMTP (Simple Mail Transfer Protocol)"
    ],
    correctAnswerText: "C. HTTPS (Hypertext Transfer Protocol Secure)",
    correctKeys: ["C"],
  },
  {
    id: "l3-q2",
    levelId: "level-3",
    subsetId: "GM2",
    type: "yes_no",
    text: "True/False (Đúng hay Sai): Nhận một thông báo thư rác email trông giống như ngân hàng của bạn, yêu cầu ấn vào liên kết đính kèm để khai báo đổi mật khẩu là hành vi đánh lừa giả mạo có tên học thuật là Phishing.",
    correctAnswerText: "True (Đúng)",
    correctKeys: ["True"],
  },
  {
    id: "l3-q3",
    levelId: "level-3",
    subsetId: "OT1",
    type: "multiple_choice",
    text: "Tính năng nổi trội nhất của mô hình dịch vụ lưu trữ dữ liệu đám mây (Cloud Storage - như OneDrive, Google Drive) mang lại đối với thói quen học tập sinh hoạt số là gì?",
    options: [
      "Dọn dẹp và tối ưu hóa tốc độ CPU của thiết bị lưu trữ cục bộ",
      "Cho phép xem các kênh truyền hình độ phân giải cao miễn phí",
      "Giúp chỉnh sửa lỗi chính tả ngữ pháp tiếng việt tự động trong ảnh",
      "Cho phép người dùng truy cập lưu trữ dữ liệu linh hoạt ở bất kỳ đâu từ mọi dòng thiết bị có mạng, hỗ trợ chia sẻ liên kết tức thì"
    ],
    correctAnswerText: "D. Cho phép người dùng truy cập lưu trữ dữ liệu linh hoạt ở bất kỳ đâu từ mọi dòng thiết bị có mạng, hỗ trợ chia sẻ liên kết tức thời",
    correctKeys: ["D"],
  },
  {
    id: "l3-q4",
    levelId: "level-3",
    subsetId: "OT2",
    type: "multiple_choice",
    text: "Danh mục mạng diện rộng WAN (Wide Area Network) khác biệt thế nào về cơ bản so với mạng cục bộ LAN (Local Area Network)?",
    options: [
      "Mạng WAN chỉ dùng sóng vô tuyến tầm ngắn như Bluetooth",
      "Mạng WAN bao phủ một phạm vi địa lý rộng lớn (liên thành phố, quốc gia), trong khi LAN bị giới hạn hẹp trong một không gian (văn phòng, tòa nhà)",
      "Mạng WAN hoàn toàn loại bỏ mối nguy hại của phần mềm độc hại hại virus",
      "Tốc độ truyền dữ liệu của mạng WAN luôn bắt buộc phải cao hơn LAN 500 lần"
    ],
    correctAnswerText: "B. Mạng WAN bao phủ một phạm vi địa lý rộng lớn (liên thành phố, quốc gia), trong khi LAN bị giới hạn hẹp trong một không gian (văn phòng, tòa nhà)",
    correctKeys: ["B"],
  },
  {
    id: "l3-q5",
    levelId: "level-3",
    subsetId: "OT3",
    type: "yes_no",
    text: "True/False (Đúng hay Sai): Tường lửa (Firewall) là giải pháp giúp ngăn chặn tuyệt đối 100% mọi loại virus, mã độc xâm hại mà người dùng hoàn toàn không cần cập nhật hệ thống định kỳ.",
    correctAnswerText: "False (Sai)",
    correctKeys: ["False"],
  },
  {
    id: "l3-q6",
    levelId: "level-3",
    subsetId: "OT4",
    type: "multiple_choice",
    text: "Khi bạn khởi động và sử dụng tính năng 'Duyệt web ẩm danh' (Incognito hay Private Window), lịch sử truy cập trang của bạn sẽ được xử lý như thế nào?",
    options: [
      "Được mã hóa và lưu trữ trọn đời trên ổ đĩa cứng của bạn",
      "Được hệ thống tự động xóa sạch khỏi trình duyệt ngay sau khi bạn đóng hoàn toàn các tab ẩn danh đó",
      "Được chia sẻ công khai lên dòng trạng thái mạng xã hội",
      "Khách lướt web sẽ miễn phí không cần thanh toán cước phí Internet"
    ],
    correctAnswerText: "B. Được hệ thống tự động xóa sạch khỏi trình duyệt ngay sau khi bạn đóng hoàn toàn các tab ẩn danh đó",
    correctKeys: ["B"],
  },
  {
    id: "l3-q7",
    levelId: "level-3",
    subsetId: "OT5",
    type: "multiple_choice",
    text: "Hình thức bảo vệ tài khoản mạng yêu cầu người dùng phải trải qua 2 phương án xác thực độc lập (như mật khẩu + mã OTP gửi đến điện thoại bảo mật) gọi là gì?",
    options: [
      "Bảo mật nén một lớp zip bảo vệ",
      "Xác thực đa yếu tố (MFA / 2FA)",
      "Định dạng tường lửa vòng trong",
      "Khóa cơ học đầu cuối mật mã"
    ],
    correctAnswerText: "B. Xác thực đa yếu tố (MFA / 2FA)",
    correctKeys: ["B"],
  },
  {
    id: "l3-q8",
    levelId: "level-3",
    subsetId: "GM1",
    type: "multiple_choice",
    text: "Trong ứng dụng email điện tử, mục đích cốt lõi của thư mục có nhãn Spam / Junk Mail được thiết lập nhằm lưu trữ dòng thư tín nào?",
    options: [
      "Các bức thư khẩn cấp từ ban giám hiệu lớp học",
      "Các email quảng cáo rác, thư lừa đảo giả mạo hoặc thư chưa được kiểm chứng tin cậy từ những địa chỉ lạ",
      "Các mẫu thư dự định gửi đi vào cuối tuần sau",
      "Các file học liệu dung dung lượng cực lớn"
    ],
    correctAnswerText: "B. Các email quảng cáo rác, thư lừa đảo giả mạo hoặc thư chưa được kiểm chứng tin cậy từ những địa chỉ lạ",
    correctKeys: ["B"],
  }
];
