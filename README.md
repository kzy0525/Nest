# Nest - Campus Club Discovery Platform

A personalized student club discovery platform that streamlines finding, comparing, and applying to clubs on campus. Think of it as "LinkedIn for clubs" where students can discover, understand, and apply to university clubs.

## Features

### 🔐 Authentication System
- **User Login**: Beautiful split-panel design with Nest branding
- **User Registration**: Complete registration form with student information
- **Session Management**: Logout functionality and route protection
- **Modern UI**: Clean, responsive design with Tailwind CSS

### 🏢 Club Discovery
- **Club Dashboard**: Browse all available clubs with search and filtering
- **Club Details**: Comprehensive information including:
  - Meeting times and locations
  - Contact information (email, phone, social media)
  - Application deadlines and interview timelines
  - Member count and ratings
  - Student reviews and testimonials
- **Advanced Filtering**: Search by name, filter by category, sort by various criteria

### 📊 Club Information
- **Social Media Integration**: Instagram, LinkedIn, Twitter, Facebook links
- **Application Timeline**: Deadlines, interview dates, and hiring process
- **Member Reviews**: Rating system and detailed feedback from past members
- **Contact Details**: Direct communication channels for each club

### 🎨 Modern Design
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Tailwind CSS**: Modern utility-first CSS framework
- **Beautiful UI**: Clean, professional interface with smooth animations
- **Sidebar Navigation**: Easy access to all platform features

## Tech Stack

### Backend
- **Node.js** with Express.js framework
- **SQLite3** database for data storage
- **RESTful API** endpoints for data access
- **CORS** enabled for cross-origin requests

### Frontend
- **React 18** with modern hooks
- **React Router DOM** for client-side routing
- **Tailwind CSS** for styling
- **Lucide React** for beautiful icons
- **Axios** for HTTP requests

### Database Schema
```sql
-- Clubs table
CREATE TABLE clubs (
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
);

-- Reviews table
CREATE TABLE reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  club_id INTEGER,
  student_name TEXT,
  rating INTEGER,
  review_text TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (club_id) REFERENCES clubs (id)
);
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup
```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# The backend will run on http://localhost:5001
```

### Frontend Setup
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start the development server
npm start

# The frontend will run on http://localhost:3000
```

## API Endpoints

### Clubs
- `GET /api/clubs` - Get all clubs (with optional filtering)
- `GET /api/clubs/:id` - Get specific club details
- `GET /api/categories` - Get all club categories

### Reviews
- `GET /api/clubs/:id/reviews` - Get reviews for a specific club
- `POST /api/clubs/:id/reviews` - Add a new review

### Query Parameters for Clubs
- `category` - Filter by club category
- `search` - Search in club names and descriptions
- `sortBy` - Sort by field (name, rating, member_count, created_at)
- `order` - Sort order (ASC or DESC)

## Usage

### For Students
1. **Register/Login**: Create an account or sign in to access the platform
2. **Browse Clubs**: Use the dashboard to explore available clubs
3. **Search & Filter**: Find clubs by category, name, or other criteria
4. **View Details**: Click on clubs to see comprehensive information
5. **Read Reviews**: Check out what other students say about clubs
6. **Contact Clubs**: Use provided contact information to reach out

### For Club Administrators
1. **Club Information**: All club data is stored in the SQLite database
2. **Add New Clubs**: Currently requires database insertion (see below)
3. **Manage Reviews**: Reviews are automatically linked to clubs
4. **Update Information**: Modify club details directly in the database

## Adding New Clubs

### Method 1: Direct Database Insertion (Recommended)
```bash
# Connect to the database
sqlite3 clubs.db

# Insert a new club
INSERT INTO clubs (
  name, description, category,
  meeting_time, meeting_location,
  contact_email, contact_phone,
  website, instagram, linkedin, twitter, facebook,
  application_deadline, interview_start_date, interview_end_date,
  member_count
) VALUES (
  'New Club Name', 'Description here', 'Technology',
  'Tues 6pm', 'Engineering Building 101',
  'club@university.edu', '(555) 123-4567',
  'https://club.example.com', '@clubinsta', 'club-linkedin', '@clubtwitter', 'clubfacebook',
  '2025-09-20', '2025-09-25', '2025-10-01',
  42
);
```

### Method 2: Modify server.js
Add club data to the `insertSampleData()` function and restart the server.

## Future Enhancements

### Planned Features
- **Club Hiring Dashboard**: Application management for clubs
- **Interview Scheduling**: Calendar integration for club interviews
- **Applicant Analytics**: Demographic and performance insights
- **AI Recommendation System**: Personalized club suggestions
- **Real-time Notifications**: Updates on application status
- **Mobile App**: Native iOS and Android applications

### Technical Improvements
- **User Authentication**: JWT tokens and secure login
- **Database Migration**: PostgreSQL for production use
- **API Rate Limiting**: Protect against abuse
- **Image Uploads**: Club logos and event photos
- **Email Integration**: Automated notifications

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ for university students everywhere**
