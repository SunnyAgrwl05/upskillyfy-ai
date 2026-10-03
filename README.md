# 🚀 upskillyfy-ai — Complete Full Stack Website

**Learn. Build. Grow. Transform.**

---

## ⚡ Quick Start — 3 Simple Steps

### Step 1 — Install

Open **2 terminals** in VS Code:

**Terminal 1 (Frontend):**
```bash
cd client
npm install
```

**Terminal 2 (Backend):**
```bash
cd server
npm install
```

---

### Step 2 — MongoDB Setup (FREE)

1. Go to **https://mongodb.com/atlas** → Sign up free
2. Create a **Free Cluster** (M0 - Free Forever)
3. Click **Connect** → **Drivers** → Copy connection string
4. In `server/` folder, create `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/upskillyfy
JWT_SECRET=upskillyfy_secret_2026
CLIENT_URL=http://localhost:5173
```

---

### Step 3 — Run Both Servers

**Terminal 1:**
```bash
cd client
npm run dev
```
→ Opens at **http://localhost:5173** ✅

**Terminal 2:**
```bash
cd server
npm run dev
```
→ Runs at **http://localhost:5000** ✅

---

## ✨ Features

| Feature | Details |
|---------|---------|
| 🌗 Dark / Light Mode | Toggle in navbar — saves preference |
| 📬 Newsletter Subscribe | Footer — saves email to MongoDB |
| 🔐 User Auth | Register, Login, JWT tokens |
| 👤 Dashboard | Personalized user dashboard |
| 🚀 Internships | Filter by branch & mode, connected to DB |
| 🎯 Community Events | Live events from MongoDB |
| 📩 Contact Form | Saves to MongoDB |
| 💻 20+ Pages | All services, career, learning, community |
| 📱 Responsive | Works on mobile, tablet, desktop |

---

## 📁 Project Structure

```
upskillyfy-final/
├── client/          ← React + Vite frontend
│   └── src/
│       ├── pages/       ← 20+ pages
│       ├── components/  ← Navbar, Footer
│       ├── context/     ← Auth + Theme
│       └── api.js       ← All API calls
│
└── server/          ← Node.js + Express backend
    ├── models/      ← User, Internship, Contact, Subscriber, Community
    ├── routes/      ← auth, internships, contact, newsletter, users, community
    └── index.js     ← Main server file
```

---

## 🌐 Contact

- 📧 upskillyfy@gmail.com
- 📷 [@upskillyfy](https://www.instagram.com/upskillyfy/)
- 💼 [LinkedIn](https://www.linkedin.com/company/upskillyfy-ai/)
- 📍 Patna, Bihar, India
