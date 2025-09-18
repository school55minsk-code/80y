import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const upload = multer({ dest: 'public/uploads/' });

let posts = []; // В реальном проекте — база данных

// Получить записи по статусу
app.get('/api/posts', (req, res) => {
  const { status } = req.query;
  res.json(status ? posts.filter(p => p.status === status) : posts);
});

// Добавить новую запись
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
  res.json({ success: true });
});

// Подтвердить запись
app.patch('/api/posts/:id/approve', (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (post) post.status = 'approved';
  res.json({ success: true });
});

// Удалить запись
app.delete('/api/posts/:id', (req, res) => {
  posts = posts.filter(p => p.id !== req.params.id);
  res.json({ success: true });
});

app.listen(3000, () => console.log('Server started on http://localhost:3000'));
