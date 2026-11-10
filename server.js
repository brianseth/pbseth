const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const fs = require("fs");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("Set the JWT_SECRET environment variable");
  process.exit(1);
}

const app = express();
app.set("trust proxy", 1);
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:5500" }));
app.use(express.json({ limit: "10kb" }));

// Simple file storage (see notes below)
const DB_FILE = "users.json";
const loadUsers = () =>
  fs.existsSync(DB_FILE) ? JSON.parse(fs.readFileSync(DB_FILE, "utf8")) : [];
const saveUsers = (users) => fs.writeFileSync(DB_FILE, JSON.stringify(users));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

app.post("/register", authLimiter, async (req, res) => {
  const username = String(req.body.username || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!/^[a-z0-9_]{3,20}$/.test(username))
    return res.status(400).json({ message: "Username must be 3-20 letters, numbers or _" });
  if (password.length < 8)
    return res.status(400).json({ message: "Password must be at least 8 characters" });

  const users = loadUsers();
  if (users.some((u) => u.username === username))
    return res.status(409).json({ message: "Username already taken" });

  users.push({ username, passwordHash: await bcrypt.hash(password, 12) });
  saveUsers(users);
  res.status(201).json({ message: "Account created" });
});

app.post("/login", authLimiter, async (req, res) => {
  const username = String(req.body.username || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  const user = loadUsers().find((u) => u.username === username);
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) return res.status(401).json({ message: "Invalid username or password" });

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "2h" });
  res.json({ message: "Login successful", token });
});

function auth(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Not authorized" });
  }
}

// Example protected route
app.get("/me", auth, (req, res) => res.json({ username: req.user.username }));

app.listen(process.env.PORT || 3000);