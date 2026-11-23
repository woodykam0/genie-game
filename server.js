const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'submissions.json');

// 教師控制台密碼（與 index.html 內 verifyTeacherPassword 保持一致）
const TEACHER_PASSWORD = "@W423021k";

app.use(cors());
app.use(express.json());

// 確保資料目錄存在
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// 初始化資料檔
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]', 'utf8');
});

// 讀取所有提交
function readSubmissions() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

// 寫入所有提交
function writeSubmissions(submissions) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2), 'utf8');
}

// GET /api/submissions — 教師端讀取所有資料（需教師密碼標頭）
app.get('/api/submissions', (req, res) => {
  const pass = req.headers['x-teacher-password'];
  if (pass !== TEACHER_PASSWORD) {
    return res.status(401).json({ error: '教師身分驗證失敗' });
  }
  res.json(readSubmissions());
});

// POST /api/submit — 學生端提交資料（無需驗證，任何人都可提交）
app.post('/api/submit', (req, res) => {
  const payload = req.body;
  if (!payload || !payload.name || !payload.studentId || !payload.className) {
    return res.status(400).json({ error: '資料不完整' });
  }
  payload.receivedAt = new Date().toISOString();
  const submissions = readSubmissions();
  submissions.push(payload);
  writeSubmissions(submissions);
  res.status(201).json({ ok: true, message: '提交成功' });
});

// POST /api/reset — 教師端重置所有資料（需教師密碼標頭）
app.post('/api/reset', (req, res) => {
  const pass = req.headers['x-teacher-password'];
  if (pass !== TEACHER_PASSWORD) {
    return res.status(401).json({ error: '教師身分驗證失敗' });
  }
  writeSubmissions([]);
  res.json({ ok: true, message: '資料已重置' });
});

// 健康檢查
app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'genie-game' });
});

// 靜態檔案（前端 index.html）
app.use(express.static(path.join(__dirname)));

// 所有其他路由都回傳 index.html（支援前端單頁應用）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Genie Game server listening on http://localhost:${PORT}`);
});
