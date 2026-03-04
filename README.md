# BASISForum — Local backend (development)

This repository includes a minimal local Node.js backend for development. The backend stores accounts and sessions in JSON files and exposes simple APIs used by the frontend.

Run locally:

```bash
# install dependencies
npm install

# start server (serves static files and API)
npm start

# open in browser:
http://localhost:3000/index.html
```

Notes:
- This is for local development only. Passwords are hashed using `bcryptjs` and sessions are stored in `sessions.json`.
- To reset users or sessions, delete `users.json` / `sessions.json` while the server is stopped.
