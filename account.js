// Account page JS: toggles forms and talks to local backend API via secure cookies
// Session token is now stored in HttpOnly cookie (not localStorage)

function showLogin() {
  document.getElementById('login-box').style.display = 'block';
  document.getElementById('signup-box').style.display = 'none';
}

function showSignup() {
  document.getElementById('login-box').style.display = 'none';
  document.getElementById('signup-box').style.display = 'block';
}

async function apiPost(path, body) {
  const res = await fetch(`/api/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Auto-send cookies
    body: JSON.stringify(body)
  });
  return res.json().then(data => ({ ok: res.ok, data }));
}

document.addEventListener('DOMContentLoaded', function () {
  const toSignup = document.getElementById('to-signup');
  const toLogin = document.getElementById('to-login');
  if (toSignup) toSignup.addEventListener('click', showSignup);
  if (toLogin) toLogin.addEventListener('click', showLogin);

  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const errorEl = document.getElementById('login-error');
      errorEl.textContent = '';
      if (!email || !password) return (errorEl.textContent = 'Please enter both email and password.');

      const { ok, data } = await apiPost('login', { email, password });
      if (!ok) return (errorEl.textContent = data.error || 'Login failed');

      // Redirect (session cookie is already set by server)
      window.location.href = 'index.html';
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      const confirm = document.getElementById('signup-confirm').value;
      const errorEl = document.getElementById('signup-error');
      errorEl.textContent = '';
      if (password !== confirm) return (errorEl.textContent = 'Passwords do not match.');
      if (password.length < 6) return (errorEl.textContent = 'Password must be at least 6 characters.');

      const { ok, data } = await apiPost('signup', { email, password });
      if (!ok) return (errorEl.textContent = data.error || 'Signup failed');

      // Redirect (session cookie is already set by server)
            window.location.href = 'index.html';
        });
    }
});

