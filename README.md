# Nest - Club Discovery Platform

A personalized student club discovery platform that streamlines the process of finding, comparing, and applying to clubs on campus. Think of it as a "LinkedIn for clubs" where students can discover, understand, and apply to university clubs.

## Features

### Current Implementation
- **Home Dashboard**: Browse and search through available clubs
- **Club Discovery**: Filter clubs by category, search by name/description, and sort by various criteria
- **Club Details**: Comprehensive information including meeting times, locations, contact details, and social media links
- **Reviews & Ratings**: Students can leave reviews and ratings for clubs they've experienced
- **Application Timeline**: View hiring deadlines and interview schedules
- **Responsive Design**: Mobile-friendly interface

### Database Schema
- **Clubs Table**: Stores comprehensive club information including contact details, social media, and application timelines
- **Reviews Table**: Stores student reviews and ratings with foreign key relationships

### Sample Data
The platform comes pre-loaded with 5 sample clubs across different categories:
- Computer Science Club (Technology)
- Business Innovation Society (Business)
- Environmental Sustainability Group (Environment)
- Arts & Culture Collective (Arts & Culture)
- Sports & Fitness Club (Sports & Fitness)

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: SQLite3
- **Frontend**: React.js with modern hooks
- **Styling**: Custom CSS with responsive design
- **Icons**: Lucide React icons
- **HTTP Client**: Axios

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup
1. Install backend dependencies:
   ```bash
   npm install
   ```

2. Start the backend server:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5000`

### Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```
   The frontend will run on `http://localhost:3000`

### Alternative: Run Both Simultaneously
From the root directory, you can install all dependencies and run both servers:
```bash
npm install
npm run install-client
npm run dev
```

## API Endpoints

### Clubs
- `GET /api/clubs` - Get all clubs with optional filtering and sorting
- `GET /api/clubs/:id` - Get specific club details
- `GET /api/categories` - Get all available club categories

### Reviews
- `GET /api/clubs/:id/reviews` - Get reviews for a specific club
- `POST /api/clubs/:id/reviews` - Add a new review

### Query Parameters
- `category` - Filter by club category
- `search` - Search clubs by name or description
- `sortBy` - Sort by: name, rating, member_count, review_count
- `order` - Sort order: ASC or DESC

## Database Schema

### Clubs Table
```sql
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
```

### Reviews Table
```sql
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

## Usage

1. **Browse Clubs**: Visit the home page to see all available clubs
2. **Search & Filter**: Use the search bar and category dropdown to find specific clubs
3. **Sort Results**: Sort clubs by name, rating, member count, or review count
4. **View Details**: Click on any club card to see comprehensive information
5. **Read Reviews**: Browse student reviews and ratings for each club
6. **Leave Reviews**: Share your experience by writing reviews for clubs you've joined

## Future Enhancements

The platform is designed to be easily extensible for future features:

- **AI Recommendation System**: Suggest clubs based on student interests and preferences
- **Application Dashboard**: Streamlined application process for clubs
- **Interview Scheduling**: Calendar integration for interview coordination
- **Analytics Portfolio**: Demographic and engagement analytics for club leaders
- **User Authentication**: Student and club leader accounts
- **Real-time Updates**: Live notifications for application status and deadlines

## Contributing

This is a foundation that can be built upon. Feel free to:
- Add new club categories
- Implement additional filtering options
- Enhance the UI/UX design
- Add new features like favorites, comparisons, or notifications
- Integrate with external APIs for additional data sources

## License

MIT License - feel free to use this project for educational or commercial purposes.

## Support

For questions or support, please refer to the code comments or create an issue in the repository. 