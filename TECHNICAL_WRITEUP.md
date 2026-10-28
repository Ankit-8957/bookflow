# Technical Architecture & System Specification: BookLeaf Portal

## 1. Executive Summary
BookLeaf Portal is an end-to-end author relationship and support operations platform tailored for modern book publishing. It bridges the gap between authors and editorial/support teams via structured ticketing, real-time communication, and AI-assisted triage.

---

## 2. Technology Choices & Justification

### Frontend Architecture
- **Framework**: React 18 with Vite for fast HMR and optimized production bundles.
- **State & Context**: Lightweight React Context (`AuthContext` and `SocketContext`) eliminating heavy Redux boilerplate.
- **Styling**: Modular Vanilla CSS with CSS custom variables, glassmorphic accents, and fluid layouts for optimal speed and customization.
- **Navigation**: React Router DOM (v6) with declarative role-based `ProtectedRoute` wrappers.
- **Real-Time Layer**: `socket.io-client` with scoped event listeners.

### Backend Architecture
- **Runtime & Framework**: Node.js and Express.js for scalable asynchronous REST API handling.
- **Real-Time Protocol**: Socket.io utilizing room channels (`ticket:<ID>`) for isolated conversation streams.
- **Security & RBAC**: Stateless JWT auth with role claims (`AUTHOR`, `ADMIN`) validated by `authMiddleware`.
- **AI Augmentation Engine**: Contextual prompt engineering coupled with OpenAI and a localized BookLeaf publishing policies knowledge base (`knowledgeBase.js`).
- **Data Layer**: Structured in-memory model schema with sample dataset (`bookleaf_sample_data.json`) and pluggable database connectors.

---

## 3. Directory Layout
```
bookleaf-portal/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Reusable shared primitives (Navbar, Badges, Spinner)
│   │   │   ├── author/          # Author views (BookCard, TicketRow)
│   │   │   └── admin/           # Admin tools (Filters, AiDraftPanel, InternalNotesPanel)
│   │   ├── pages/
│   │   │   ├── auth/            # LoginPage
│   │   │   ├── author/          # Dashboard, Books, Tickets, Create, Detail
│   │   │   └── admin/           # Dashboard, Queue, Detail
│   │   ├── layouts/             # AuthorLayout, AdminLayout, ProtectedRoute
│   │   ├── context/             # AuthContext, SocketContext
│   │   ├── services/            # Axios API endpoints & data services
│   │   ├── hooks/               # Custom hooks (useAuth, useSocket)
│   │   ├── utils/               # Constants
│   │   ├── CSS/                 # index, layout, components, pages
│   │   ├── App.jsx              # Main routing tree
│   │   └── main.jsx             # React entry point
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── data/                    # bookleaf_dataset_full.json, bookleaf_sample_data.json
│   ├── src/
│   │   ├── config/              # db.js, env.js, socket.js
│   │   ├── controllers/         # Request handling & orchestration
│   │   ├── middleware/          # auth, error handling
│   │   ├── models/              # User, Book, Ticket (with embedded Messages & InternalNotes)
│   │   ├── routes/              # Express REST routes
│   │   ├── services/            # Business logic layer
│   │   ├── ai/                  # OpenAI client, knowledge base, prompt builder, AI service
│   │   ├── utils/               # AppError, apiResponse, seed utility, test suites
│   │   ├── app.js               # Express application configuration
│   │   └── server.js            # HTTP & Socket.io server bootstrap
│   ├── .env.example
│   └── package.json
```

---

## 4. Key Workflows

### Author Ticket Submission & Chat
1. Author submits a ticket with category, priority, and initial message.
2. Server assigns a unique ticket ID, emits a socket event to the support queue, and stores the message.
3. Both author and support agents can subscribe to the ticket room for real-time conversation.

### AI Draft Generation for Support
1. Support agent opens a ticket and selects a desired response tone (Empathetic, Professional, Concise).
2. `aiService` gathers ticket context and injects relevant publishing guidelines from `knowledgeBase.js`.
3. An OpenAI prompt generates a contextual reply draft.
4. Support agent reviews, modifies if needed, and posts the message directly into the ticket stream.
