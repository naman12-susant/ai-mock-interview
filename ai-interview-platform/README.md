# AI Interview Preparation Platform

A comprehensive full-stack AI-powered interview preparation platform with voice interaction, resume analysis, and real-time feedback.

## 🚀 Features

### Core Features
- ✅ User Authentication (Login/Register)
- ✅ **AI Resume Gap Analysis & ATS Optimization**
- ✅ AI-powered resume enhancement with intelligent skill gap detection and personalized career improvement suggestions
- ✅ AI-Powered Question Generation
- ✅ Voice-Based Interview System
- ✅ Real-time AI Feedback & Scoring
- ✅ Coding Challenge Round
- ✅ Performance Dashboard & Analytics

### Advanced Features
- 🎥 Webcam Monitoring
- 😊 Emotion Detection
- ⏱️ Interview Timer
- 🏆 Leaderboard
- 📄 PDF Report Generation

## 🛠️ Tech Stack

### Frontend
- React 18
- Tailwind CSS
- Framer Motion
- Web Speech API
- Monaco Editor (Code Editor)

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication

### AI Services
- OpenAI API (GPT-4)
- Speech Recognition
- Natural Language Processing

## 📁 Project Structure

```
ai-interview-platform/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   ├── context/        # React context
│   │   └── assets/         # Images, icons
│   └── package.json
│
├── backend/                 # Node.js backend
│   ├── routes/             # API routes
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Database models
│   ├── services/           # Business logic
│   ├── utils/              # Helper functions
│   └── server.js
│
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB
- OpenAI API Key

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd ai-interview-platform
```

2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

3. Install Backend Dependencies
```bash
cd backend
npm install
```

4. Configure Environment Variables

Create `.env` file in backend directory:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
```

Create `.env` file in frontend directory:
```
REACT_APP_API_URL=http://localhost:5000
```

5. Run the Application

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm start
```

## 📊 System Architecture

```
Frontend (React)
      ↓
Backend API (Node.js/Express)
      ↓
AI Services (OpenAI API)
      ↓
Database (MongoDB)
      ↓
Speech Services
```

## 🎯 Workflow

1. **User Registration/Login** → Secure authentication
2. **Resume Upload** → AI extracts skills and experience
3. **AI Analysis** → Generates personalized interview questions
4. **Voice Interview** → AI asks questions, user responds via microphone
5. **Real-time Evaluation** → AI analyzes answers and provides scores
6. **Coding Round** → Timed coding challenges with test cases
7. **Dashboard** → Track performance, view analytics, download reports

## 🔑 Key APIs

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Resume
- `POST /api/resume/upload` - Upload resume
- `GET /api/resume/analysis` - Get resume analysis

### Interview
- `POST /api/interview/generate-questions` - Generate questions
- `POST /api/interview/submit-answer` - Submit answer
- `GET /api/interview/feedback` - Get feedback

### Coding
- `POST /api/coding/submit` - Submit code solution
- `GET /api/coding/challenges` - Get coding challenges

## 🎨 UI Pages

1. **Landing Page** - Hero section with features
2. **Dashboard** - Performance analytics and history
3. **Resume Upload** - Drag & drop PDF upload
4. **Interview Screen** - AI avatar, voice interaction
5. **Result Screen** - Scores, feedback, suggestions
6. **Coding Round** - Code editor with test cases

## 📈 Development Timeline

- **Week 1**: UI Design, Project Setup
- **Week 2**: Authentication, Resume Upload
- **Week 3**: AI Question Generation
- **Week 4**: Voice Interview System
- **Week 5**: AI Evaluation Engine
- **Week 6**: Coding Round
- **Week 7**: Deployment & Bug Fixes

## 🚀 Deployment

### Frontend
- Deploy to **Vercel**

### Backend
- Deploy to **Render** or **Railway**

### Database
- Host on **MongoDB Atlas**

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License

## 👨‍💻 Author

Built with ❤️ for interview preparation
