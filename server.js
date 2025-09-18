import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const upload = multer({ dest: 'public/uploads/' });
const DATA_FILE = path.join('./', 'posts.json');

// Загружаем данные из файла при старте
let posts = [];
if (fs.existsSync(DATA_FILE)) {
  posts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

// Сохраняем в файл
function savePosts() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), 'utf8');
}

// ===== Авторизация =====
const MODERATOR_PASSWORD = 'secret123';

function checkAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${MODERATOR_PASSWORD}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Проверка пароля
app.post('/api/check-auth', (req, res) => {
  const { password } = req.body;
  if (password === MODERATOR_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

// Получить записи
app.get('/api/posts', (req, res) => {
  const { status } = req.query;
  res.json(status ? posts.filter(p => p.status === status) : posts);
});

// Добавить запись
app.post('/api/posts', upload.single('photo'), (req, res) => {
  const newPost = {
    id: Date.now().toString(),
    name: req.body.name,
    text: req.body.text,
    photo: req.file ? `/uploads/${req.file.filename}` : null,
    status: 'pending',
    date: new Date().toISOString()
  };
  posts.push(newPost);
  savePosts();
  res.json({ success: true });
});

// Подтвердить запись
app.patch('/api/posts/:id/approve', checkAuth, (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (post) {
    post.status = 'approved';
    savePosts();
  }
  res.json({ success: true });
});

// Удалить запись
app.delete('/api/posts/:id', checkAuth, (req, res) => {
  posts = posts.filter(p => p.id !== req.params.id);
  savePosts();
  res.json({ success: true });
});

app.listen(3000, () => console.log('Server started on http://localhost:3000'));
