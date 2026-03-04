const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const sanitizeHtml = require('sanitize-html');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Rate limiter for auth endpoints to mitigate brute force
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Too many requests, please try again later.' } });

const DATA_DIR = path.join(__dirname);
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');

function readJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, 'utf8') || '{}');
  } catch (e) {
    return {};
  }
}

function writeJson(filePath, obj) {
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2));
}

// Ensure files exist
if (!fs.existsSync(USERS_FILE)) writeJson(USERS_FILE, {});
if (!fs.existsSync(SESSIONS_FILE)) writeJson(SESSIONS_FILE, {});
if (!fs.existsSync(POSTS_FILE)) writeJson(POSTS_FILE, {});

// Serve static site from repo root
app.use(express.static(path.join(__dirname)));

// Signup
app.post('/api/signup', authLimiter, async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
  const emailKey = email.toLowerCase();

  const users = readJson(USERS_FILE);
  if (users[emailKey]) return res.status(400).json({ error: 'Account already exists' });

  if (password.length < 6) return res.status(400).json({ error: 'Password too short (min 6 chars)' });

  const hash = await bcrypt.hash(password, 10);
  users[emailKey] = { passwordHash: hash, createdAt: new Date().toISOString() };
  writeJson(USERS_FILE, users);

  // create session with expiry (24 hours)
  const sessions = readJson(SESSIONS_FILE);
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  sessions[token] = { email: emailKey, createdAt: new Date().toISOString(), expiresAt };
  writeJson(SESSIONS_FILE, sessions);

  // Set HttpOnly cookie (expires in 24 hours)
  res.cookie('sessionToken', token, { httpOnly: true, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });
  res.json({ email: emailKey });
});

// Login
app.post('/api/login', authLimiter, async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
  const emailKey = email.toLowerCase();

  const users = readJson(USERS_FILE);
  const user = users[emailKey];
  if (!user) return res.status(400).json({ error: 'No account for that email' });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(400).json({ error: 'Invalid credentials' });

  const sessions = readJson(SESSIONS_FILE);
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  sessions[token] = { email: emailKey, createdAt: new Date().toISOString(), expiresAt };
  writeJson(SESSIONS_FILE, sessions);

  // Set HttpOnly cookie (expires in 24 hours)
  res.cookie('sessionToken', token, { httpOnly: true, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });
  res.json({ email: emailKey });
});

// Check session (reads from cookie)
app.get('/api/session', (req, res) => {
  const token = req.cookies.sessionToken;
  if (!token) return res.json({ loggedIn: false });
  const sessions = readJson(SESSIONS_FILE);
  const session = sessions[token];
  if (!session) return res.json({ loggedIn: false });
  // Check expiry
  if (new Date(session.expiresAt) < new Date()) {
    delete sessions[token];
    writeJson(SESSIONS_FILE, sessions);
    res.clearCookie('sessionToken');
    return res.json({ loggedIn: false });
  }
  return res.json({ loggedIn: true, email: session.email });
});

// Logout
app.post('/api/logout', (req, res) => {
  const token = req.cookies.sessionToken;
  if (token) {
    const sessions = readJson(SESSIONS_FILE);
    if (sessions[token]) {
      delete sessions[token];
      writeJson(SESSIONS_FILE, sessions);
    }
  }
  res.clearCookie('sessionToken');
  return res.json({ success: true });
});

// Get account info for current session
app.get('/api/account', (req, res) => {
  const token = req.cookies.sessionToken;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const sessions = readJson(SESSIONS_FILE);
  const session = sessions[token];
  if (!session) return res.status(401).json({ error: 'Invalid session' });
  // Check expiry
  if (new Date(session.expiresAt) < new Date()) {
    delete sessions[token];
    writeJson(SESSIONS_FILE, sessions);
    res.clearCookie('sessionToken');
    return res.status(401).json({ error: 'Session expired' });
  }

  const users = readJson(USERS_FILE);
  const user = users[session.email];
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { passwordHash, ...rest } = user;
  return res.json({ email: session.email, ...rest });
});

// Update account info (name, icon, email, password)
app.put('/api/account', async (req, res) => {
  const token = req.cookies.sessionToken;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const sessions = readJson(SESSIONS_FILE);
  const session = sessions[token];
  if (!session) return res.status(401).json({ error: 'Invalid session' });
  // Check expiry
  if (new Date(session.expiresAt) < new Date()) {
    delete sessions[token];
    writeJson(SESSIONS_FILE, sessions);
    res.clearCookie('sessionToken');
    return res.status(401).json({ error: 'Session expired' });
  }

  const users = readJson(USERS_FILE);
  const currentEmail = session.email;
  const user = users[currentEmail];
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { name, icon, email: newEmailRaw, currentPassword, newPassword } = req.body || {};
  const newEmail = newEmailRaw ? newEmailRaw.toLowerCase().trim() : undefined;

  // Sanitize name and icon
  const sanitizedName = sanitizeHtml(name || '', { allowedTags: [], allowedAttributes: {} });
  const sanitizedIcon = sanitizeHtml(icon || '', { allowedTags: [], allowedAttributes: {} });

  // If changing email or password, require currentPassword
  if ((newEmail && newEmail !== currentEmail) || newPassword) {
    if (!currentPassword) return res.status(400).json({ error: 'Current password required to change email or password' });
    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) return res.status(400).json({ error: 'Current password incorrect' });
  }

  // Update simple fields
  if (sanitizedName) user.name = sanitizedName;
  if (sanitizedIcon) user.icon = sanitizedIcon;

  // Change password
  if (newPassword) {
    if (newPassword.length < 6) return res.status(400).json({ error: 'New password too short (min 6 chars)' });
    user.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  // Change email (re-key user entry)
  if (newEmail && newEmail !== currentEmail) {
    if (users[newEmail]) return res.status(400).json({ error: 'Email already in use' });
    users[newEmail] = user;
    delete users[currentEmail];

    // update all sessions referencing old email
    const sessionKeys = Object.keys(sessions);
    sessionKeys.forEach(k => {
      if (sessions[k] && sessions[k].email === currentEmail) sessions[k].email = newEmail;
    });
    // update current session
    sessions[token].email = newEmail;
    writeJson(SESSIONS_FILE, sessions);
  }

  users[newEmail && newEmail !== currentEmail ? newEmail : currentEmail] = user;
  writeJson(USERS_FILE, users);

  return res.json({ email: sessions[token].email, name: user.name || '', icon: user.icon || '' });
});

// Get posts
app.get('/api/posts', (req, res) => {
  const posts = readJson(POSTS_FILE) || {};
  // return as array sorted by createdAt desc
  const arr = Object.keys(posts).map(id => ({ id, ...posts[id] }));
  arr.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ posts: arr });
});

// Helper: get session from cookie and validate
function getSessionFromCookie(req, res) {
  const token = req.cookies.sessionToken;
  if (!token) return null;
  const sessions = readJson(SESSIONS_FILE);
  const session = sessions[token];
  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) {
    delete sessions[token];
    writeJson(SESSIONS_FILE, sessions);
    res.clearCookie('sessionToken');
    return null;
  }
  return session;
}

// Create post (requires session token)
app.post('/api/posts', (req, res) => {
  const session = getSessionFromCookie(req, res);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { title, content, badge, category } = req.body || {};
  if (!title || !content) return res.status(400).json({ error: 'Missing title or content' });
  // length validations
  if (title.length > 200) return res.status(400).json({ error: 'Title too long (max 200 chars)' });
  if (content.length > 5000) return res.status(400).json({ error: 'Content too long (max 5000 chars)' });
  if (category && category.length > 100) return res.status(400).json({ error: 'Category too long (max 100 chars)' });

  // Sanitize inputs to prevent XSS
  const sanitizedTitle = sanitizeHtml(title, { allowedTags: [], allowedAttributes: {} });
  const sanitizedContent = sanitizeHtml(content, {
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h3', 'pre', 'code'],
    allowedAttributes: {}
  });
  const sanitizedCategory = sanitizeHtml(category || '', { allowedTags: [], allowedAttributes: {} });
  const sanitizedBadge = sanitizeHtml(badge || 'Discussion', { allowedTags: [], allowedAttributes: {} });

  if (!sanitizedTitle.trim() || !sanitizedContent.trim()) {
    return res.status(400).json({ error: 'Title and content cannot be empty' });
  }

  const posts = readJson(POSTS_FILE) || {};
  const id = uuidv4();
  posts[id] = {
    title: sanitizedTitle,
    content: sanitizedContent,
    badge: sanitizedBadge,
    badgeClass: sanitizedBadge.toLowerCase() === 'question' ? 'badge-question' : (sanitizedBadge.toLowerCase() === 'tips' ? 'badge-tips' : (sanitizedBadge.toLowerCase() === 'resource' ? 'badge-resource' : 'badge-discussion')),
    author: session.email,
    category: sanitizedCategory,
    date: new Date().toISOString(),
    replies: '0 replies',
    createdAt: new Date().toISOString()
  };
  writeJson(POSTS_FILE, posts);
  res.json({ id, post: posts[id] });
});

// Edit a post (only author)
app.put('/api/posts/:id', (req, res) => {
  const session = getSessionFromCookie(req, res);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const id = req.params.id;
  const posts = readJson(POSTS_FILE) || {};
  const post = posts[id];
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.author !== session.email) return res.status(403).json({ error: 'Forbidden' });
  const { title, content, badge, category } = req.body || {};
  if (title && title.length > 200) return res.status(400).json({ error: 'Title too long (max 200 chars)' });
  if (content && content.length > 5000) return res.status(400).json({ error: 'Content too long (max 5000 chars)' });
  if (category && category.length > 100) return res.status(400).json({ error: 'Category too long (max 100 chars)' });
  if (title) post.title = sanitizeHtml(title, { allowedTags: [], allowedAttributes: {} });
  if (content) post.content = sanitizeHtml(content, { allowedTags: ['p','br','strong','em','u','ol','ul','li','h3','pre','code'], allowedAttributes: {} });
  if (badge) post.badge = sanitizeHtml(badge, { allowedTags: [], allowedAttributes: {} });
  if (category) post.category = sanitizeHtml(category, { allowedTags: [], allowedAttributes: {} });
  post.updatedAt = new Date().toISOString();
  writeJson(POSTS_FILE, posts);
  res.json({ success: true, post });
});

// Delete a post (only author)
app.delete('/api/posts/:id', (req, res) => {
  const session = getSessionFromCookie(req, res);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const id = req.params.id;
  const posts = readJson(POSTS_FILE) || {};
  const post = posts[id];
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.author !== session.email) return res.status(403).json({ error: 'Forbidden' });
  delete posts[id];
  writeJson(POSTS_FILE, posts);
  res.json({ success: true });
});

// Top contributors
app.get('/api/contributors', (req, res) => {
  const posts = readJson(POSTS_FILE) || {};
  const counts = {};
  Object.values(posts).forEach(p => { counts[p.author] = (counts[p.author] || 0) + 1; });
  const list = Object.entries(counts).map(([email, count]) => ({ email, count })).sort((a,b) => b.count - a.count);
  res.json({ contributors: list.slice(0, 10) });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
