const API_BASE = '/api/v1';

const state = {
    user: null,
    stats: null
};

const appEl = document.getElementById('app');

function init() {
    // Check if we already have a JWT saved before showing the login screen!
    checkSession();
}

function getAuthHeader() {
    const token = localStorage.getItem('accessToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function checkSession() {
    renderLoader();
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            renderLogin();
            return;
        }

        // Test the token against the backend strict verifyJWT!
        const res = await fetch(`${API_BASE}/dashboard/stats`, { 
            headers: getAuthHeader() 
        });
        
        if (res.ok) {
            const result = await res.json();
            state.stats = result.data;
            renderDashboard();
        } else {
            // Token is invalid or expired
            localStorage.removeItem('accessToken');
            renderLogin();
        }
    } catch (e) {
        console.error("Network Error: ", e);
        localStorage.removeItem('accessToken');
        renderLogin();
    }
}

function renderLoader() {
    appEl.innerHTML = `<div class="auth-container"><div class="loader"></div></div>`;
}

function renderLogin() {
    appEl.innerHTML = `
        <div class="auth-container">
            <div class="glass-panel auth-box">
                <div class="auth-header">
                    <h1>StreamHub</h1>
                    <p style="color: var(--text-secondary); margin-top: 5px;">You must Log In to securely write to the Database!</p>
                </div>
                <form id="loginForm">
                    <div class="input-group">
                        <label>Username (e.g., akshath)</label>
                        <input type="text" id="username" placeholder="johndoe" required>
                    </div>
                    <div class="input-group">
                        <label>Secure Password</label>
                        <input type="password" id="password" required>
                    </div>
                    <button type="submit" class="btn-primary" style="width: 100%; margin-top: 10px;">Acquire Security Token</button>
                    <div id="errorMsg" style="color: #f87171; font-size: 0.85rem; margin-top: 15px; text-align: center; display: none; font-weight: 500;"></div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const defaultText = btn.innerText;
        btn.innerHTML = '<div class="loader" style="width: 16px; height: 16px; border-width: 2px; margin: 0;"></div>';
        
        try {
            const fd = new FormData();
            
            const userText = document.getElementById('username').value;
            fd.append('username', userText);
            fd.append('email', userText); 
            fd.append('password', document.getElementById('password').value);

            const res = await fetch(`${API_BASE}/users/login`, {
                method: 'POST',
                body: fd
            });
            
            const result = await res.json();
            
            if (res.ok) {
                // Instantly save the JWT security token to bypass future logins!
                localStorage.setItem('accessToken', result.data.accessToken); 
                checkSession(); 
            } else {
                showError(result.message || "Invalid credentials.");
                btn.innerText = defaultText;
            }
        } catch (err) {
            showError("Network unreachable. Is your backend down?");
            console.error(err);
            btn.innerText = defaultText;
        }
    });
}

function renderDashboard() {
    const s = state.stats || { totalViews: 0, totalSubscribers: 0, totalVideos: 0, totalLikes: 0 };
    
    appEl.innerHTML = `
        <nav class="dashboard-nav">
            <div class="nav-logo">StreamHub</div>
            <div style="display: flex; gap: 15px; align-items: center;">
                <span style="font-weight: 500; color: var(--text-secondary); font-size: 0.9rem;">Creator Portal</span>
                <button class="btn-primary" id="logoutBtn" style="background: rgba(255,255,255,0.05); box-shadow: none; border: 1px solid rgba(255,255,255,0.1);">Log off</button>
            </div>
        </nav>
        
        <div class="dashboard-container">
            <h2 style="margin-bottom: 30px; font-size: 2rem;">Channel Analytics</h2>
            
            <div class="stats-grid">
                <div class="glass-panel stat-card">
                    <div class="stat-value">${(s.totalViews || 0).toLocaleString()}</div>
                    <div class="stat-label">Total Views</div>
                </div>
                <div class="glass-panel stat-card">
                    <div class="stat-value">${(s.totalSubscribers || 0).toLocaleString()}</div>
                    <div class="stat-label">Subscribers</div>
                </div>
                <div class="glass-panel stat-card">
                    <div class="stat-value">${(s.totalVideos || 0).toLocaleString()}</div>
                    <div class="stat-label">Videos Uploaded</div>
                </div>
                <div class="glass-panel stat-card">
                    <div class="stat-value">${(s.totalLikes || 0).toLocaleString()}</div>
                    <div class="stat-label">Community Likes</div>
                </div>
            </div>
            
            <div class="content-section">
                <!-- Activity Feed Placeholder -->
                <div class="glass-panel" style="min-height: 350px;">
                    <h3 style="margin-bottom: 20px; color: var(--text-primary);">Network Traffic</h3>
                    <div id="activityFeed">
                        <p style="color: var(--text-secondary); line-height: 1.6;">Aggregated dashboard connection verified. Backend security keys mapped seamlessly!</p>
                    </div>
                </div>
                
                <!-- Interaction Component -->
                <div class="glass-panel">
                    <h3 style="margin-bottom: 20px;">Community Announcement</h3>
                    <form id="tweetForm">
                        <div class="input-group">
                            <input type="text" id="tweetContent" autocomplete="off" placeholder="Broadcast a message..." required>
                        </div>
                        <button type="submit" class="btn-primary" style="width: 100%;">Push to Network</button>
                    </form>
                </div>
            </div>
        </div>
    `;

    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
            await fetch(`${API_BASE}/users/logout`, { 
                method: 'POST', 
                headers: getAuthHeader()
            });
        } catch (e) {}
        
        state.user = null;
        // Obliterate token
        localStorage.removeItem('accessToken');
        renderLogin(); 
    });

    document.getElementById('tweetForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = document.getElementById('tweetContent').value;
        const btn = e.target.querySelector('button');
        
        try {
            const res = await fetch(`${API_BASE}/tweets`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify({ content })
            });

            const responseStatus = await res.json();

            if (res.ok) {
                document.getElementById('tweetContent').value = '';
                btn.innerText = "Transmitted!";
                setTimeout(() => btn.innerText = "Push to Network", 2000);
            } else {
                btn.innerText = "Failed (Unauthorized?)";
                console.error(responseStatus);
                setTimeout(() => btn.innerText = "Push to Network", 2500);
            }
        } catch (e) {
            console.error(e);
        }
    });
}

function showError(msg) {
    const el = document.getElementById('errorMsg');
    if (el) {
        el.innerText = `Error: ${msg}`;
        el.style.display = 'block';
    }
}

init();
