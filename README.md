<div align="center">

# 🪔 Hindi Language Tutor

An interactive AI-powered Hindi learning platform that helps users improve their Hindi through structured lessons, pronunciation practice, quizzes, progress tracking, achievements, and personalized AI assistance.

</div>

---

## ✨ Features

- 📚 Structured Hindi learning courses
- 🤖 AI-powered language assistance
- 🎙️ Pronunciation practice
- 📝 Interactive quizzes
- 🏆 XP, Coins & Achievement System
- 📊 Learning progress tracking
- 🔐 Secure Authentication (JWT)
- 👤 User Profiles
- 📈 Leaderboard
- 📅 Learning Calendar
- 📱 Responsive UI

---

## 🛠️ Tech Stack

### Frontend
- React
- TypeScript
- Vite

### Backend
- Node.js
- Express

### Authentication
- JWT
- bcryptjs

### AI
- Google Gemini API

---

# Installation

## Prerequisites

- Node.js (v18 or later)
- npm

---

## Clone the repository

```bash
git clone https://github.com/AyushiKarwa/hindi-language-tutor.git
cd hindi-language-tutor
```

---

## Install dependencies

```bash
npm install
```

---

## Configure Environment Variables

Create a `.env` file in the project root.

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
JWT_SECRET=YOUR_RANDOM_SECRET
APP_URL=http://localhost:3000
```

---

## Run the development server

```bash
npm run dev
```

---

## Build for Production

```bash
npm run build
```

---

## Start Production Server

```bash
npm start
```

---

## Project Structure

```
src/
├── components/
├── context/
├── lib/
├── server/
├── App.tsx
├── main.tsx

server.ts
package.json
vite.config.ts
```

---

## Environment Variables

| Variable | Description |
|-----------|-------------|
| GEMINI_API_KEY | Google Gemini API Key |
| JWT_SECRET | Secret used for JWT authentication |
| APP_URL | Application URL |

---

## License

This project is intended for educational and learning purposes.
