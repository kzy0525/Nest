const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5001;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Add this for FormData
app.use(express.static(path.join(__dirname, 'client/build')));
app.use('/uploads', express.static(uploadsDir));

// Database setup
const db = new sqlite3.Database('./clubs.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    createTables();
  }
});

// Create tables
function createTables() {
  const clubsTable = `
    CREATE TABLE IF NOT EXISTS clubs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      meeting_time TEXT,
      meeting_location TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      website TEXT,
      instagram TEXT,

      twitter TEXT,
      facebook TEXT,
      application_deadline TEXT,
      interview_start_date TEXT,
      interview_end_date TEXT,
      rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      member_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      slogan TEXT,
      acceptance_rate INTEGER DEFAULT 0,
      applications_open TEXT,
      results_released TEXT,
      open_positions TEXT,
      available_spots INTEGER DEFAULT 0,
      application_questions TEXT,
      logo TEXT,
      backdrop TEXT
    )
  `;

  const reviewsTable = `
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      club_id INTEGER,
      student_name TEXT,
      club_position TEXT,
      rating INTEGER,
      review_text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (club_id) REFERENCES clubs (id)
    )
  `;

  db.run(clubsTable, (err) => {
    if (err) console.error('Error creating clubs table:', err);
    else console.log('Clubs table created or already exists');
  });

  db.run(reviewsTable, (err) => {
    if (err) console.error('Error creating reviews table:', err);
    else console.log('Reviews table created or already exists');
  });

  // Insert sample data
  insertSampleData();
}

// Insert sample club data
function insertSampleData() {
  const sampleClubs = [
    {
      name: "Smith Engineering Hyperloop (SEH)",
      description: "A community of engineering enthusiasts who love innovation, problem-solving, and building amazing projects together.",
      category: ["Technology", "Innovation", "Science"],
      meeting_time: "Every Tuesday at 6:00 PM",
      meeting_location: "Engineering Building Room 101",
      contact_email: "seh@university.edu",
      contact_phone: "(555) 123-4567",
      website: "https://seh.university.edu",
      instagram: "@university_seh",

      twitter: "@university_seh",
      facebook: "universityseh",
      application_deadline: "2024-02-15",
      interview_start_date: "2024-02-20",
      interview_end_date: "2024-02-25",
      rating: 4.9,
      review_count: 15,
      member_count: 45,
      application_questions: JSON.stringify([
        { id: 1, text: "What engineering projects have you worked on in the past?", type: "long" },
        { id: 2, text: "Why are you interested in joining SEH?", type: "short" },
        { id: 3, text: "What skills can you contribute to the team?", type: "long" }
      ])
    },
    {
      name: "Queen's Startup Consulting (QSC)",
      description: "Connecting future entrepreneurs and business leaders through networking events, workshops, and mentorship.",
      category: ["Business", "Innovation", "Community"],
      meeting_time: "Every Thursday at 7:00 PM",
      meeting_location: "Business School Auditorium",
      contact_email: "qsc@university.edu",
      contact_phone: "(555) 234-5678",
      website: "https://qsc.university.edu",
      instagram: "@university_qsc",

      twitter: "@university_qsc",
      facebook: "universityqsc",
      application_deadline: "2024-02-20",
      interview_start_date: "2024-02-25",
      interview_end_date: "2024-03-01",
      rating: 4.6,
      review_count: 12,
      member_count: 39
    },
    {
      name: "Queen's Vietnamese Student Association (QVSA)",
      description: "Dedicated to promoting Vietnamese culture and building community among Vietnamese students and allies.",
      category: ["Culture", "Community", "Social"],
      meeting_time: "Every Monday at 5:30 PM",
      meeting_location: "Student Center Room 205",
      contact_email: "qvsa@university.edu",
      contact_phone: "(555) 345-6789",
      website: "https://qvsa.university.edu",
      instagram: "@university_qvsa",

      twitter: "@university_qvsa",
      facebook: "universityqvsa",
      application_deadline: "2024-02-10",
      interview_start_date: "2024-02-15",
      interview_end_date: "2024-02-20",
      rating: 4.9,
      review_count: 18,
      member_count: 20
    },
    {
      name: "Queen's Tech and Media Association (QTMA)",
      description: "A premier technology and media organization focused on innovation, digital storytelling, and creative technology solutions.",
      category: ["Technology", "Media", "Innovation"],
      meeting_time: "Every Wednesday at 6:30 PM",
      meeting_location: "Media Center Studio A",
      contact_email: "qtma@university.edu",
      contact_phone: "(555) 456-7890",
      website: "https://qtma.university.edu",
      instagram: "@university_qtma",

      twitter: "@university_qtma",
      facebook: "universityqtma",
      application_deadline: "2024-02-25",
      interview_start_date: "2024-03-01",
      interview_end_date: "2024-03-05",
      rating: 4.7,
      review_count: 14,
      member_count: 41
    },
    {
      name: "Sports & Fitness Club",
      description: "Promoting healthy lifestyles through various sports activities, fitness challenges, and wellness programs.",
      category: ["Sports", "Health"],
      meeting_time: "Every Friday at 5:00 PM",
      meeting_location: "Recreation Center",
      contact_email: "sfc@university.edu",
      contact_phone: "(555) 567-8901",
      website: "https://sfc.university.edu",
      instagram: "@university_sfc",

      twitter: "@university_sfc",
      facebook: "universitysfc",
      application_deadline: "2024-02-18",
      interview_start_date: "2024-02-23",
      interview_end_date: "2024-02-28",
      rating: 4.5,
      review_count: 16,
      member_count: 67
    },
    {
      name: "Environmental Sustainability Group",
      description: "Dedicated to promoting environmental awareness and implementing sustainable practices on campus.",
      category: ["Environment", "Community", "Science"],
      meeting_time: "Every Saturday at 10:00 AM",
      meeting_location: "Environmental Science Building",
      contact_email: "esg@university.edu",
      contact_phone: "(555) 678-9012",
      website: "https://esg.university.edu",
      instagram: "@university_esg",

      twitter: "@university_esg",
      facebook: "universityesg",
      application_deadline: "2024-02-28",
      interview_start_date: "2024-03-05",
      interview_end_date: "2024-03-10",
      rating: 4.8,
      review_count: 22,
      member_count: 35
    },
    {
      name: "Political Science Society",
      description: "Engaging students in political discourse, policy analysis, and civic engagement activities.",
      category: ["Politics", "Academic", "Community"],
      meeting_time: "Every Monday at 7:00 PM",
      meeting_location: "Political Science Department",
      contact_email: "pss@university.edu",
      contact_phone: "(555) 789-0123",
      website: "https://pss.university.edu",
      instagram: "@university_pss",

      twitter: "@university_pss",
      facebook: "universitypss",
      application_deadline: "2024-03-01",
      interview_start_date: "2024-03-08",
      interview_end_date: "2024-03-15",
      rating: 4.6,
      review_count: 18,
      member_count: 28
    },
    {
      name: "Arts & Culture Collective",
      description: "Celebrating diversity through art, music, dance, and cultural exchange events.",
      category: ["Arts", "Culture", "Community"],
      meeting_time: "Every Thursday at 6:00 PM",
      meeting_location: "Arts Center Studio B",
      contact_email: "acc@university.edu",
      contact_phone: "(555) 890-1234",
      website: "https://acc.university.edu",
      instagram: "@university_acc",

      twitter: "@university_acc",
      facebook: "universityacc",
      application_deadline: "2024-03-05",
      interview_start_date: "2024-03-12",
      interview_end_date: "2024-03-19",
      rating: 4.7,
      review_count: 16,
      member_count: 42
    }
  ];

  const insertClub = db.prepare(`
    INSERT OR IGNORE INTO clubs (
      name, description, category, meeting_time, meeting_location, contact_email, contact_phone, website, instagram,
      twitter, facebook, application_deadline, interview_start_date, interview_end_date,
      member_count, rating, review_count, created_at, slogan, acceptance_rate,
      applications_open, results_released, open_positions, available_spots, application_questions,
      logo, backdrop
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  sampleClubs.forEach(club => {
    // Convert category array to JSON string for storage
    const categoryString = Array.isArray(club.category) ? JSON.stringify(club.category) : club.category;
    
    insertClub.run(
      club.name, club.description, categoryString, club.meeting_time,
      club.meeting_location, club.contact_email, club.contact_phone,
      club.website, club.instagram, club.twitter,
      club.facebook, club.application_deadline, club.interview_start_date,
      club.interview_end_date, club.member_count, club.rating, club.review_count, 
      new Date().toISOString(), // created_at
      '', // slogan
      0, // acceptance_rate
      '', // applications_open
      '', // results_released
      '', // open_positions
      0, // available_spots
      club.application_questions || '', // application_questions
      null, // logo
      null  // backdrop
    );
  });

  insertClub.finalize();
}

// API Routes

// Get all clubs
app.get('/api/clubs', (req, res) => {
  const { category, search, sortBy = 'name', order = 'ASC' } = req.query;
  
  let query = 'SELECT * FROM clubs';
  let params = [];
  
  if (category && category !== 'all') {
    query += ' WHERE category LIKE ?';
    params.push(`%${category}%`);
  }
  
  if (search) {
    const searchCondition = category && category !== 'all' ? 'AND' : 'WHERE';
    query += ` ${searchCondition} (name LIKE ? OR description LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }
  
  query += ` ORDER BY ${sortBy} ${order}`;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Convert category JSON strings back to arrays
    const processedRows = rows.map(row => ({
      ...row,
      category: row.category ? JSON.parse(row.category) : []
    }));
    
    res.json(processedRows);
  });
});

// Get club by ID
app.get('/api/clubs/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM clubs WHERE id = ?', [id], (err, club) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!club) {
      res.status(404).json({ error: 'Club not found' });
      return;
    }
    
    // Convert category JSON string back to array
    if (club.category) {
      try {
        club.category = JSON.parse(club.category);
      } catch (e) {
        club.category = [club.category]; // Fallback for old string format
      }
    } else {
      club.category = [];
    }
    
    res.json(club);
  });
});

// Get club reviews
app.get('/api/clubs/:id/reviews', (req, res) => {
  const { id } = req.params;
  
  db.all('SELECT * FROM reviews WHERE club_id = ? ORDER BY created_at DESC', [id], (err, reviews) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(reviews);
  });
});

// Get categories
app.get('/api/categories', (req, res) => {
  db.all('SELECT category FROM clubs', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Extract all unique categories from the JSON arrays
    const allCategories = new Set();
    rows.forEach(row => {
      if (row.category) {
        try {
          const categories = JSON.parse(row.category);
          if (Array.isArray(categories)) {
            categories.forEach(cat => allCategories.add(cat));
          } else {
            allCategories.add(categories);
          }
        } catch (e) {
          // Fallback for old string format
          allCategories.add(row.category);
        }
      }
    });
    
    res.json(Array.from(allCategories).sort());
  });
});

// Add a review
app.post('/api/clubs/:id/reviews', (req, res) => {
  const { id } = req.params;
  const { student_name, club_position, rating, review_text } = req.body;
  
  if (!student_name || !rating || !review_text) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  
  db.run(
    'INSERT INTO reviews (club_id, student_name, club_position, rating, review_text) VALUES (?, ?, ?, ?, ?)',
    [id, student_name, club_position || '', rating, review_text],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Update club rating
      db.run(
        'UPDATE clubs SET rating = (SELECT AVG(rating) FROM reviews WHERE club_id = ?), review_count = (SELECT COUNT(*) FROM reviews WHERE club_id = ?) WHERE id = ?',
        [id, id, id],
        (updateErr) => {
          if (updateErr) {
            console.error('Error updating club rating:', updateErr);
          }
        }
      );
      
      res.json({ id: this.lastID, message: 'Review added successfully' });
    }
  );
});

// Test endpoint for debugging
app.post('/api/test-club', (req, res) => {
  console.log('=== Test endpoint ===');
  console.log('Request body:', req.body);
  console.log('Content-Type:', req.headers['content-type']);
  
  const { name, description, category, contact_email, member_count } = req.body;
  
  if (!name || !description || !contact_email || !member_count) {
    console.log('Test validation failed');
    res.status(400).json({ error: 'Test validation failed', received: { name, description, category, contact_email, member_count } });
    return;
  }
  
  res.json({ success: true, message: 'Test validation passed' });
});

// Create a new club
app.post('/api/clubs', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'backdrop', maxCount: 1 }
]), (req, res) => {
  const clubData = req.body;
  const files = req.files;
  
  // Debug: Check if body is empty
  console.log('Request body keys:', Object.keys(req.body));
  console.log('Request body raw:', req.body);
  console.log('Content-Type header:', req.headers['content-type']);
  
  console.log('Received club data:', clubData);
  console.log('Received files:', files);
  console.log('Files type:', typeof files);
  console.log('Files keys:', files ? Object.keys(files) : 'No files object');
  
  // Validate required fields
  console.log('=== Server validation check ===');
  console.log('clubData.name:', clubData.name, 'Type:', typeof clubData.name);
  console.log('clubData.description:', clubData.description, 'Type:', typeof clubData.description);
  console.log('clubData.category:', clubData.category, 'Type:', typeof clubData.category);
  console.log('clubData.contact_email:', clubData.contact_email, 'Type:', typeof clubData.contact_email);
  console.log('clubData.member_count:', clubData.member_count, 'Type:', typeof clubData.member_count);
  
  // Check if category is empty JSON array
  let categoryIsValid = false;
  try {
    if (clubData.category) {
      const parsedCategory = JSON.parse(clubData.category);
      categoryIsValid = Array.isArray(parsedCategory) && parsedCategory.length > 0;
    }
  } catch (e) {
    console.log('Error parsing category:', e);
    categoryIsValid = false;
  }
  
  if (!clubData.name || !clubData.description || !clubData.contact_email || !clubData.member_count || !categoryIsValid) {
    console.log('Missing required fields:', { 
      name: !!clubData.name, 
      description: !!clubData.description, 
      category: !!clubData.category,
      categoryValid: categoryIsValid,
      contact_email: !!clubData.contact_email, 
      member_count: !!clubData.member_count 
    });
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  
  // Add default values
  clubData.rating = 0;
  clubData.review_count = 0;
  clubData.created_at = new Date().toISOString();
  
  // Handle file paths - files might be undefined if no files uploaded
  let logoPath = null;
  let backdropPath = null;
  
  try {
    if (files && files.logo && files.logo.length > 0) {
      logoPath = `/uploads/${files.logo[0].filename}`;
    }
    if (files && files.backdrop && files.backdrop.length > 0) {
      backdropPath = `/uploads/${files.backdrop[0].filename}`;
    }
  } catch (error) {
    console.log('Error handling files:', error);
    logoPath = null;
    backdropPath = null;
  }
  
  console.log('Final logo path:', logoPath);
  console.log('Final backdrop path:', backdropPath);
  
  // Insert into database
  const insertClub = db.prepare(`
    INSERT INTO clubs (
      name, description, category, meeting_time, meeting_location, contact_email, contact_phone, website, instagram,
      twitter, facebook, application_deadline, interview_start_date, interview_end_date,
      member_count, rating, review_count, created_at, slogan, acceptance_rate,
      applications_open, results_released, open_positions, available_spots, application_questions,
      logo, backdrop
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  try {
    const result = insertClub.run(
      clubData.name,
      clubData.description,
      clubData.category, // Already JSON string from FormData
      '', // meeting_time (not used in new form)
      '', // meeting_location (not used in new form)
      clubData.contact_email,
      '', // contact_phone (not used in new form)
      clubData.website || '',
      clubData.instagram || '',
      '', // twitter (not used in new form)
      '', // facebook (not used in new form)
      clubData.application_deadline || '',
      clubData.interview_start_date || '',
      clubData.interview_end_date || '',
      clubData.member_count,
      clubData.rating,
      clubData.review_count,
      clubData.created_at,
      clubData.slogan || '',
      clubData.acceptance_rate || 0,
      clubData.applications_open || '',
      clubData.results_released || '',
      clubData.open_positions || '',
      clubData.available_spots || 0,
      clubData.application_questions || '',
      logoPath,
      backdropPath
    );
    
    res.json({ 
      success: true, 
      message: 'Club created successfully',
      clubId: result.lastID 
    });
  } catch (error) {
    console.error('Error creating club:', error);
    res.status(500).json({ success: false, message: 'Error creating club' });
  }
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 