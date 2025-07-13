const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'))); // serve uploaded images

// Set up multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public/uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('❌ DB Connection Failed:', err);
  } else {
    console.log('✅ Connected to MySQL!');
  }
});

// ✅ Default route → now serves dashboard.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});

// Register a new employee (with image upload)
app.post('/register', upload.single('profile_pic'), (req, res) => {
  const { staff_id, name, department, email } = req.body;
  const profile_pic = req.file ? req.file.filename : null;

  if (!staff_id || !name || !department || !email || !profile_pic) {
    return res.status(400).json({ message: 'All fields and image are required' });
  }

  const query = 'INSERT INTO staff (staff_id, name, department, email, profile_pic) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [staff_id, name, department, email, profile_pic], (err) => {
    if (err) {
      console.error('❌ Registration Error:', err);
      return res.status(500).json({ message: 'Staff ID already exists or DB error' });
    }
    return res.status(201).json({ message: 'Employee registered successfully!' });
  });
});

// Login route can be kept if still needed via direct link
app.post('/login', (req, res) => {
  const { staff_id } = req.body;

  if (!staff_id) {
    return res.status(400).json({ message: 'Staff ID is required' });
  }

  const query = 'SELECT * FROM staff WHERE staff_id = ?';
  db.query(query, [staff_id], (err, results) => {
    if (err) {
      console.error('❌ Login Error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length > 0) {
      const user = results[0];
      res.json({
        loggedIn: true,
        name: user.name,
        department: user.department,
        profile_pic: user.profile_pic
      });
    } else {
      res.status(401).json({ loggedIn: false, message: 'Invalid Staff ID' });
    }
  });
});

// Verify a staff ID
app.post('/verify', (req, res) => {
  const { staffId } = req.body;

  if (!staffId) {
    return res.status(400).json({ message: 'Staff ID is required' });
  }

  const query = 'SELECT * FROM staff WHERE staff_id = ?';
  db.query(query, [staffId], (err, results) => {
    if (err) {
      console.error('❌ Query Error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length > 0) {
      return res.status(200).json({ verified: true, staff: results[0] });
    } else {
      return res.status(404).json({ verified: false, message: 'Staff not found' });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
