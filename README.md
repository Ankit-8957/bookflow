# BookLeaf Portal 📚

A comprehensive, role-based Author & Admin Publishing Support Platform for **BookLeaf Publishing**.

---

## 🏗️ Architecture

```
bookleaf-portal/
├── frontend/                # React 18 + Vite SPA client
├── backend/                 # Node.js + Express REST API with Socket.io & AI services
├── README.md                # System overview and quick start guide
├── TECHNICAL_WRITEUP.md     # In-depth architectural & design documentation
└── .gitignore               # Version control ignore rules
```

---

## ✨ Features

### For Authors
- **Author Dashboard**: Track active books, pending reviews, royalties, and support inquiries.
- **My Books**: Comprehensive inventory of published and in-review manuscripts.
- **Support Ticketing**: Submit queries tagged by category (Royalties, Distribution, Publishing, Cover Design).
- **Interactive Ticket Thread**: Real-time communication with the BookLeaf support team.

### For Admins & Support Specialists
- **Operations Dashboard**: Monitor response times, SLA adherence, and open queues.
- **Ticket Queue Management**: Filter by status, priority, and category with quick triage.
- **AI Draft Assistant**: Automated suggestion generation referencing the BookLeaf publishing knowledge base.
- **Internal Collaboration Notes**: Private staff notes on ticket resolution.
- **Real-time Synchronization**: Instant messaging and ticket status updates powered by WebSockets.

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
copy .env.example .env
npm run dev
```
Backend API and Socket server run on: `http://localhost:5000`

### 2. Frontend Setup
```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```
Frontend client runs on: `http://localhost:5173`
