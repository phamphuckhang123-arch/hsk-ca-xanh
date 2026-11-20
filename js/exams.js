// Cấu trúc đề thi HSK mới theo tài liệu 《新版HSK（1-6级）考试结构与样题示例》 (汉考国际, công bố 12/2025, áp dụng 7/2026).
// g: dạng câu hỏi — pic3 (chọn 1/3 tranh), resp3 (nghe câu hỏi chọn câu trả lời), mc3 (chọn 1/3 đáp án),
//    match6pic (ghép tranh A–F, nhóm 5 câu), match6txt (ghép câu A–F), fill6 (chọn từ A–F), comp6 (chọn bộ phận chữ A–F),
//    write (nhìn pinyin viết chữ), make (dùng từ đặt câu). pool: tên nhóm câu hỏi trong BANK[cấp].
const EXAMS = {
  1: { time: 32, official: 40, sections: [
    { name: '听力 · Nghe', time: 12, parts: [
      { t: 'Phần 1 — Nghe, chọn tranh đúng', n: 5, g: 'pic3', pool: 'lpic', audio: true },
      { t: 'Phần 2 — Nghe câu hỏi, chọn câu trả lời phù hợp', n: 5, g: 'resp3', pool: 'lresp', audio: true },
      { t: 'Phần 3 — Nghe hội thoại, chọn tranh phù hợp (A–F)', n: 5, g: 'match6pic', pool: 'dpic', audio: true },
      { t: 'Phần 4 — Nghe và chọn đáp án đúng', n: 5, g: 'mc3', pool: 'lq', audio: true },
    ] },
    { name: '阅读 · Đọc hiểu', time: 20, parts: [
      { t: 'Phần 1 — Đọc câu, chọn tranh phù hợp (A–F)', n: 5, g: 'match6pic', pool: 'rpic' },
      { t: 'Phần 2 — Chọn câu trả lời phù hợp (A–F)', n: 5, g: 'match6txt', pool: 'qa' },
      { t: 'Phần 3 — Chọn từ điền vào chỗ trống (A–F)', n: 5, g: 'fill6', pool: 'fill' },
      { t: 'Phần 4 — Đọc câu, trả lời câu hỏi ★', n: 5, g: 'mc3', pool: 'rq', star: true },
    ] },
  ] },
  2: { time: 52, official: 60, sections: [
    { name: '听力 · Nghe', time: 17, parts: [
      { t: 'Phần 1 — Nghe câu, chọn tranh đúng', n: 5, g: 'pic3', pool: 'lsent', audio: true },
      { t: 'Phần 2 — Nghe hội thoại, chọn tranh phù hợp (A–F)', n: 10, g: 'match6pic', pool: 'dpic', audio: true },
      { t: 'Phần 3 — Nghe hội thoại, chọn đáp án đúng', n: 10, g: 'mc3', pool: 'dlg', audio: true },
    ] },
    { name: '阅读 · Đọc hiểu', time: 25, parts: [
      { t: 'Phần 1 — Đọc câu, chọn tranh phù hợp (A–F)', n: 5, g: 'match6pic', pool: 'rpic' },
      { t: 'Phần 2 — Chọn từ điền vào chỗ trống (A–F)', n: 5, g: 'fill6', pool: 'fill' },
      { t: 'Phần 3 — Chọn câu đáp phù hợp (A–F)', n: 10, g: 'match6txt', pool: 'qa' },
      { t: 'Phần 4 — Đọc và chọn đáp án đúng ★', n: 5, g: 'mc3', pool: 'rq', star: true },
    ] },
    { name: '书写 · Viết', time: 10, parts: [
      { t: 'Phần 1 — Chọn bộ phận còn thiếu của chữ Hán (A–F)', n: 5, g: 'comp6', pool: 'comp' },
      { t: 'Phần 2 — Nhìn pinyin, viết chữ Hán', n: 5, g: 'write', pool: 'write' },
    ] },
  ] },
  3: { time: 73, official: 83, sections: [
    { name: '听力 · Nghe', time: 23, parts: [
      { t: 'Phần 1 — Nghe hội thoại, chọn tranh phù hợp (A–F)', n: 10, g: 'match6pic', pool: 'dpic', audio: true },
      { t: 'Phần 2 — Nghe hội thoại ngắn, chọn đáp án đúng', n: 5, g: 'mc3', pool: 'dlg', audio: true },
      { t: 'Phần 2 — Nghe hội thoại dài, chọn đáp án đúng', n: 5, g: 'mc3', pool: 'long', audio: true },
      { t: 'Phần 3 — Nghe đoạn văn, chọn đáp án đúng', n: 10, g: 'mc3', pool: 'mono', audio: true },
    ] },
    { name: '阅读 · Đọc hiểu', time: 30, parts: [
      { t: 'Phần 1 — Chọn câu phù hợp (A–F)', n: 10, g: 'match6txt', pool: 'qa' },
      { t: 'Phần 2 — Chọn từ điền vào chỗ trống (A–F)', n: 5, g: 'fill6', pool: 'fill' },
      { t: 'Phần 2 — Chọn từ điền vào hội thoại (A–F)', n: 5, g: 'fill6', pool: 'filld' },
      { t: 'Phần 3 — Đọc đoạn văn, chọn đáp án đúng ★', n: 10, g: 'mc3', pool: 'read', star: true },
    ] },
    { name: '书写 · Viết', time: 20, parts: [
      { t: 'Phần 1 — Nhìn pinyin, viết chữ Hán', n: 5, g: 'write', pool: 'write' },
      { t: 'Phần 2 — Dùng từ cho sẵn đặt câu', n: 5, g: 'make', pool: 'make' },
    ] },
  ] },
};
