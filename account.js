// Basic account page JS for toggling forms and simple validation

document.addEventListener('DOMContentLoaded', function () {
    const loginBox = document.getElementById('login-box');
    const signupBox = document.getElementById('signup-box');
    const toSignup = document.getElementById('to-signup');
    const toLogin = document.getElementById('to-login');

    if (toSignup) {
        toSignup.addEventListener('click', () => {
            loginBox.style.display = 'none';
            signupBox.style.display = 'block';
        });
    }
    if (toLogin) {
        toLogin.addEventListener('click', () => {
            signupBox.style.display = 'none';
            loginBox.style.display = 'block';
        });
    }

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            const errorEl = document.getElementById('login-error');
            errorEl.textContent = '';

            if (!email || !password) {
                e.preventDefault();
                errorEl.textContent = 'Please enter both email and password.';
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', function (e) {
            const password = document.getElementById('signup-password').value;
            const confirm = document.getElementById('signup-confirm').value;
            const errorEl = document.getElementById('signup-error');
            errorEl.textContent = '';

            if (password !== confirm) {
                e.preventDefault();
                errorEl.textContent = 'Passwords do not match.';
            }
        });
    }
});
