const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/Songs', express.static(path.join(__dirname, 'Songs')));
app.use(bodyParser.json());

// Load songs from JSON
const getSongs = () => {
  const data = fs.readFileSync('./songs.json', 'utf8');
  return JSON.parse(data);
};

// GET: All songs with pagination
app.get('/api/songs', (req, res) => {
  const songs = getSongs();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || songs.length;
  const start = (page - 1) * limit;
  const end = page * limit;

  res.json({
    page,
    limit,
    total: songs.length,
    results: songs.slice(start, end),
  });
});

// GET: Search songs
app.get('/api/songs/search', (req, res) => {
  const query = req.query.q?.toLowerCase();
  const songs = getSongs();
  if (!query) return res.json(songs);

  const results = songs.filter(song =>
    song.title.toLowerCase().includes(query) ||
    song.artist.toLowerCase().includes(query)
  );
  res.json(results);
});

// POST: Add new song
app.post('/api/songs', (req, res) => {
  const newSong = req.body;
  if (!newSong.title || !newSong.artist || !newSong.src || !newSong.cover) {
    return res.status(400).json({ error: 'Missing required song fields' });
  }

  const songs = getSongs();
  songs.push(newSong);

  fs.writeFileSync('./songs.json', JSON.stringify(songs, null, 2));
  res.status(201).json(newSong);
});

// POST: Upload song file
const upload = multer({ dest: 'Songs/' });
app.post('/api/songs/upload', upload.single('song'), (req, res) => {
  const { title, artist, cover } = req.body;
  const file = req.file;
  if (!file || !title || !artist || !cover) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const songs = getSongs();
  const newSong = {
    title,
    artist,
    cover,
    src: `http://localhost:${PORT}/Songs/${file.filename}`
  };

  songs.push(newSong);
  fs.writeFileSync('./songs.json', JSON.stringify(songs, null, 2));

  res.status(201).json({ message: 'Song uploaded', song: newSong });
});

app.listen(PORT, () => {
  console.log(`✅ NovaTunes backend running at http://localhost:${PORT}`);
});
