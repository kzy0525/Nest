const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));

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
      linkedin TEXT,
      twitter TEXT,
      facebook TEXT,
      application_deadline TEXT,
      interview_start_date TEXT,
      interview_end_date TEXT,
      rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      member_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const reviewsTable = `
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      club_id INTEGER,
      student_name TEXT,
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
      name: "Computer Science Club",
      description: "A community of CS enthusiasts who love coding, problem-solving, and building amazing projects together.",
      category: "Technology",
      meeting_time: "Every Tuesday at 6:00 PM",
      meeting_location: "Engineering Building Room 101",
      contact_email: "csclub@university.edu",
      contact_phone: "(555) 123-4567",
      website: "https://csclub.university.edu",
      instagram: "@university_csclub",
      linkedin: "university-cs-club",
      twitter: "@university_csclub",
      facebook: "universitycsclub",
      application_deadline: "2024-02-15",
      interview_start_date: "2024-02-20",
      interview_end_date: "2024-02-25",
      rating: 4.8,
      review_count: 15,
      member_count: 45
    },
    {
      name: "Business Innovation Society",
      description: "Connecting future entrepreneurs and business leaders through networking events, workshops, and mentorship.",
      category: "Business",
      meeting_time: "Every Thursday at 7:00 PM",
      meeting_location: "Business School Auditorium",
      contact_email: "bis@university.edu",
      contact_phone: "(555) 234-5678",
      website: "https://bis.university.edu",
      instagram: "@university_bis",
      linkedin: "university-business-innovation",
      twitter: "@university_bis",
      facebook: "universitybis",
      application_deadline: "2024-02-20",
      interview_start_date: "2024-02-25",
      interview_end_date: "2024-03-01",
      rating: 4.6,
      review_count: 12,
      member_count: 38
    },
    {
      name: "Environmental Sustainability Group",
      description: "Dedicated to promoting environmental awareness and implementing sustainable practices on campus.",
      category: "Environment",
      meeting_time: "Every Monday at 5:30 PM",
      meeting_location: "Student Center Room 205",
      contact_email: "esg@university.edu",
      contact_phone: "(555) 345-6789",
      website: "https://esg.university.edu",
      instagram: "@university_esg",
      linkedin: "university-environmental-group",
      twitter: "@university_esg",
      facebook: "universityesg",
      application_deadline: "2024-02-10",
      interview_start_date: "2024-02-15",
      interview_end_date: "2024-02-20",
      rating: 4.9,
      review_count: 18,
      member_count: 52
    },
    {
      name: "Arts & Culture Collective",
      description: "Celebrating diversity through art, music, dance, and cultural exchange events.",
      category: "Arts & Culture",
      meeting_time: "Every Wednesday at 6:30 PM",
      meeting_location: "Arts Center Studio A",
      contact_email: "acc@university.edu",
      contact_phone: "(555) 456-7890",
      website: "https://acc.university.edu",
      instagram: "@university_acc",
      linkedin: "university-arts-culture",
      twitter: "@university_acc",
      facebook: "universityacc",
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
      category: "Sports & Fitness",
      meeting_time: "Every Friday at 5:00 PM",
      meeting_location: "Recreation Center",
      contact_email: "sfc@university.edu",
      contact_phone: "(555) 567-8901",
      website: "https://sfc.university.edu",
      instagram: "@university_sfc",
      linkedin: "university-sports-fitness",
      twitter: "@university_sfc",
      facebook: "universitysfc",
      application_deadline: "2024-02-18",
      interview_start_date: "2024-02-23",
      interview_end_date: "2024-02-28",
      rating: 4.5,
      review_count: 16,
      member_count: 67
    }
  ];

  const insertClub = db.prepare(`
    INSERT OR IGNORE INTO clubs (
      name, description, category, meeting_time, meeting_location, 
      contact_email, contact_phone, website, instagram, linkedin, 
      twitter, facebook, application_deadline, interview_start_date, 
      interview_end_date, rating, review_count, member_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  sampleClubs.forEach(club => {
    insertClub.run([
      club.name, club.description, club.category, club.meeting_time,
      club.meeting_location, club.contact_email, club.contact_phone,
      club.website, club.instagram, club.linkedin, club.twitter,
      club.facebook, club.application_deadline, club.interview_start_date,
      club.interview_end_date, club.rating, club.review_count, club.member_count
    ]);
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
    query += ' WHERE category = ?';
    params.push(category);
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
    res.json(rows);
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
  db.all('SELECT DISTINCT category FROM clubs ORDER BY category', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map(row => row.category));
  });
});

// Add a review
app.post('/api/clubs/:id/reviews', (req, res) => {
  const { id } = req.params;
  const { student_name, rating, review_text } = req.body;
  
  if (!student_name || !rating || !review_text) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  
  db.run(
    'INSERT INTO reviews (club_id, student_name, rating, review_text) VALUES (?, ?, ?, ?)',
    [id, student_name, rating, review_text],
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

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 