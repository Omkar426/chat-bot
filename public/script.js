// ---------- Common Utilities ----------
const api = (path) => `http://localhost:5000/api${path}`;
const token = localStorage.getItem('token');

// ---------- LOGIN ----------
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const res = await fetch(api('/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      window.location.href = 'chat.html';
    } else {
      alert('Invalid login credentials');
    }
  });
}

const clearBtn = document.getElementById('clearChatBtn');
if (clearBtn) {
  clearBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to delete all chats?')) {
      const res = await fetch(api('/chat'), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        chatContainer.innerHTML = '';
        alert('Chat history cleared');
      } else {
        alert('Failed to delete chat');
      }
    }
  });
}


// ---------- REGISTER ----------
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const res = await fetch(api('/auth/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      window.location.href = 'chat.html';
    } else {
      alert('Registration failed');
    }
  });
}

// ---------- CHAT ----------
const chatForm = document.getElementById('chatForm');
const chatContainer = document.getElementById('chatContainer');

const appendMessage = (role, text) => {
  const div = document.createElement('div');
  div.className = `mb-2 p-2 rounded ${role === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-200 text-left'}`;
  div.textContent = text;
  chatContainer.appendChild(div);
  chatContainer.scrollTop = chatContainer.scrollHeight;
};

const loadMessages = async () => {
  const res = await fetch(api('/chat'), {
    headers: { Authorization: `Bearer ${token}` }
  });
  const messages = await res.json();

  messages.reverse().forEach(({ userText, botResponse }) => {
    appendMessage('user', userText);
    appendMessage('bot', botResponse);
  });
};

if (chatForm && token) {
  loadMessages();

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('message');
    const message = input.value.trim();
    if (!message) return;

    appendMessage('user', message);
    input.value = '';

    const res = await fetch(api('/chat'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ text: message })
    });

    const data = await res.json();
    appendMessage('bot', data.botResponse || "No response");
  });
} else if (chatForm && !token) {
  alert("You must login first.");
  window.location.href = 'index.html';
}
