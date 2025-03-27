// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    // API base URL - update this with your actual backend URL
    // If using a local development server, use something like: http://localhost:3000/api
    // If your API is on the same domain, you can use a relative path: /api
    const API_BASE_URL = '/api';  // Change this to your actual API URL
    
    // Enable debug mode for detailed console logs
    const DEBUG_MODE = true;
    
    function debug(message, data) {
        if (DEBUG_MODE) {
            console.log(`[DEBUG] ${message}`, data || '');
        }
    }
    
    debug('Script initialized with API_BASE_URL:', API_BASE_URL);
    
    // Modal elements
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const loginButton = document.getElementById('login-button');
    const registerButton = document.getElementById('register-button');
    const closeBtns = document.querySelectorAll('.close-button');
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    const getStartedBtn = document.getElementById('get-started');

    // Form elements
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // Check if all required elements exist
    function checkRequiredElements() {
        const requiredElements = {
            'login-modal': loginModal,
            'register-modal': registerModal,
            'login-button': loginButton,
            'register-button': registerButton,
            'login-form': loginForm,
            'register-form': registerForm
        };
        
        let allFound = true;
        for (const [id, element] of Object.entries(requiredElements)) {
            if (!element) {
                console.error(`Required element #${id} not found in the document`);
                allFound = false;
            }
        }
        
        return allFound;
    }
    
    if (!checkRequiredElements()) {
        console.error('Some required elements are missing. Authentication functionality may not work properly.');
    }

    // Open login modal
    if (loginButton) {
        loginButton.addEventListener('click', function() {
            debug('Login button clicked');
            if (loginModal) loginModal.style.display = 'block';
        });
    }

    // Open register modal
    if (registerButton) {
        registerButton.addEventListener('click', function() {
            debug('Register button clicked');
            if (registerModal) registerModal.style.display = 'block';
        });
    }

    // Get Started button action
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function() {
            debug('Get Started button clicked');
            // Scroll to semester section
            const semestersSection = document.querySelector('.semesters');
            if (semestersSection) {
                semestersSection.scrollIntoView({ 
                    behavior: 'smooth' 
                });
            } else {
                console.error('Semesters section not found in the document');
            }
        });
    }

    // Close modals when clicking the X
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            debug('Close button clicked');
            if (loginModal) loginModal.style.display = 'none';
            if (registerModal) registerModal.style.display = 'none';
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === loginModal) {
            debug('Clicked outside login modal');
            loginModal.style.display = 'none';
        }
        if (event.target === registerModal) {
            debug('Clicked outside register modal');
            registerModal.style.display = 'none';
        }
    });

    // Switch between login and register
    if (switchToRegister) {
        switchToRegister.addEventListener('click', function() {
            debug('Switch to register clicked');
            if (loginModal) loginModal.style.display = 'none';
            if (registerModal) registerModal.style.display = 'block';
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', function() {
            debug('Switch to login clicked');
            if (registerModal) registerModal.style.display = 'none';
            if (loginModal) loginModal.style.display = 'block';
        });
    }

    // Handle login form submission with backend integration
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            debug('Login form submitted');
            
            const email = document.getElementById('email')?.value;
            const password = document.getElementById('password')?.value;
            
            if (!email || !password) {
                showNotification('Email and password are required', 'error');
                debug('Login failed - missing email or password');
                return;
            }
            
            // Disable submit button and show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.textContent : 'Login';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Logging in...';
            }
            
            try {
                debug('Sending login request to:', `${API_BASE_URL}/login`);
                
                // Log request details (remove in production)
                debug('Login request payload:', { email, password: '********' });
                
                // Send login request to backend
                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                debug('Login response status:', response.status);
                
                let data;
                try {
                    data = await response.json();
                    debug('Login response data:', data);
                } catch (jsonError) {
                    console.error('Failed to parse JSON response:', jsonError);
                    throw new Error('Invalid response from server');
                }
                
                if (response.ok) {
                    // Store authentication token and user info
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userEmail', email);
                    localStorage.setItem('userName', data.name || email.split('@')[0]);
                    localStorage.setItem('userId', data.userId);
                    
                    debug('Login successful, stored token and user data');
                    
                    // Close modal and update UI
                    if (loginModal) loginModal.style.display = 'none';
                    updateUIAfterLogin(email, data.name);
                    showNotification('Login successful! Welcome back.');
                    
                    // Optional: redirect to dashboard
                    // window.location.href = 'dashboard.html';
                } else {
                    // Show error message
                    const errorMessage = data.message || 'Invalid email or password';
                    showNotification(errorMessage, 'error');
                    debug('Login failed with error:', errorMessage);
                }
            } catch (error) {
                console.error('Login error:', error);
                showNotification(`Login failed: ${error.message || 'Network error'}. Please check your connection and try again.`, 'error');
                debug('Login exception:', error);
            } finally {
                // Re-enable button
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            }
        });
    }

    // Handle registration form submission with backend integration
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            debug('Registration form submitted');
            
            const name = document.getElementById('reg-name')?.value;
            const email = document.getElementById('reg-email')?.value;
            const password = document.getElementById('reg-password')?.value;
            const confirmPassword = document.getElementById('confirm-password')?.value;
            
            if (!name || !email || !password || !confirmPassword) {
                showNotification('All fields are required', 'error');
                debug('Registration failed - missing required fields');
                return;
            }
            
            // Validation
            if (password !== confirmPassword) {
                showNotification('Passwords do not match', 'error');
                debug('Registration failed - passwords do not match');
                return;
            }
            
            // Disable submit button and show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.textContent : 'Register';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Creating account...';
            }
            
            try {
                debug('Sending registration request to:', `${API_BASE_URL}/register`);
                
                // Log request details (remove in production)
                debug('Registration request payload:', { name, email, password: '********' });
                
                // Send registration data to backend
                const response = await fetch(`${API_BASE_URL}/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, password })
                });
                
                debug('Registration response status:', response.status);
                
                let data;
                try {
                    data = await response.json();
                    debug('Registration response data:', data);
                } catch (jsonError) {
                    console.error('Failed to parse JSON response:', jsonError);
                    throw new Error('Invalid response from server');
                }
                
                if (response.ok) {
                    // Store authentication token and user info
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userEmail', email);
                    localStorage.setItem('userName', name);
                    localStorage.setItem('userId', data.userId);
                    
                    debug('Registration successful, stored token and user data');
                    
                    // Close modal and update UI
                    if (registerModal) registerModal.style.display = 'none';
                    updateUIAfterLogin(email, name);
                    
                    showNotification('Registration successful! Welcome to Engineering Quiz Platform.');
                    
                    // Optional: redirect to welcome page or tutorial
                    // window.location.href = 'welcome.html';
                } else {
                    // Show error message from server
                    const errorMessage = data.message || 'Registration failed. Please try again.';
                    showNotification(errorMessage, 'error');
                    debug('Registration failed with error:', errorMessage);
                }
            } catch (error) {
                console.error('Registration error:', error);
                showNotification(`Registration failed: ${error.message || 'Network error'}. Please check your connection and try again.`, 'error');
                debug('Registration exception:', error);
            } finally {
                // Re-enable button
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            }
        });
    }

    // Check if user is already logged in (from localStorage)
    function checkLoginState() {
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('userEmail');
        const name = localStorage.getItem('userName');
        
        debug('Checking login state:', { hasToken: !!token, email });
        
        if (token && email) {
            // Verify token validity with backend (optional)
            verifyToken(token).then(isValid => {
                debug('Token verification result:', isValid);
                if (isValid) {
                    updateUIAfterLogin(email, name);
                } else {
                    // Token invalid, log user out
                    logoutUser();
                }
            }).catch(error => {
                console.error('Token verification error:', error);
                debug('Token verification failed, but keeping user logged in:', error);
                // If verification fails, still show as logged in but don't make authorized requests
                updateUIAfterLogin(email, name);
            });
        }
    }

    // Verify token with backend
    async function verifyToken(token) {
        try {
            debug('Verifying token with backend');
            const response = await fetch(`${API_BASE_URL}/verify-token`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            debug('Token verification response status:', response.status);
            return response.ok;
        } catch (error) {
            console.error('Token verification error:', error);
            debug('Token verification exception:', error);
            return false;
        }
    }

    // Logout function
    function logoutUser() {
        debug('Logging out user');
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userId');
        
        // Optionally notify backend about logout
        const token = localStorage.getItem('token');
        if (token) {
            fetch(`${API_BASE_URL}/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).catch(error => {
                console.error('Logout error:', error);
                debug('Logout notification to backend failed:', error);
            });
        }
        
        // Reset UI
        location.reload();
    }

    // Update UI after successful login
    function updateUIAfterLogin(email, name) {
        debug('Updating UI after login for user:', email);
        const userControls = document.querySelector('.user-controls');
        if (userControls) {
            userControls.innerHTML = `
                <div class="user-profile">
                    <span class="user-greeting">Hello, ${name || email.split('@')[0]}</span>
                    <div class="user-dropdown">
                        <button class="user-menu-button">
                            <i class="fas fa-user-circle"></i>
                            <i class="fas fa-caret-down"></i>
                        </button>
                        <div class="dropdown-content">
                            <a href="dashboard.html">My Dashboard</a>
                            <a href="profile.html">Profile Settings</a>
                            <a href="#" id="logout-button">Logout</a>
                        </div>
                    </div>
                </div>
            `;
            
            // Add logout functionality
            document.getElementById('logout-button')?.addEventListener('click', function(e) {
                e.preventDefault();
                debug('Logout button clicked');
                logoutUser();
            });
            
            // Dropdown toggle
            const userMenuBtn = document.querySelector('.user-menu-button');
            if (userMenuBtn) {
                userMenuBtn.addEventListener('click', function() {
                    debug('User menu button clicked');
                    document.querySelector('.dropdown-content')?.classList.toggle('show');
                });
                
                // Close dropdown when clicking outside
                window.addEventListener('click', function(e) {
                    if (!e.target.matches('.user-menu-button') && !e.target.parentNode?.matches('.user-menu-button')) {
                        const dropdowns = document.querySelectorAll('.dropdown-content');
                        dropdowns.forEach(dropdown => {
                            if (dropdown.classList.contains('show')) {
                                dropdown.classList.remove('show');
                            }
                        });
                    }
                });
            }
        } else {
            console.error('User controls element not found in the document');
            debug('Failed to update UI - .user-controls not found');
        }
    }

    // Helper function to make authenticated API requests
    async function authenticatedFetch(url, options = {}) {
        const token = localStorage.getItem('token');
        if (!token) {
            debug('No token found for authenticated request');
            throw new Error('No authentication token found');
        }
        
        debug(`Making authenticated request to: ${url}`);
        
        const authOptions = {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${token}`
            }
        };
        
        try {
            const response = await fetch(url, authOptions);
            debug('Authenticated request response status:', response.status);
            
            // If unauthorized, logout user
            if (response.status === 401) {
                debug('Received 401 Unauthorized, logging out user');
                logoutUser();
                throw new Error('Authentication failed');
            }
            
            return response;
        } catch (error) {
            console.error(`Error making authenticated request to ${url}:`, error);
            debug('Authenticated request exception:', error);
            throw error;
        }
    }

    // Display notification message
    function showNotification(message, type = 'success') {
        debug('Showing notification:', { message, type });
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Show with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after timeout
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);  // Extended from 3000 to 5000 for better visibility
    }

    // Test API connectivity
    async function testAPIConnectivity() {
        try {
            debug('Testing API connectivity to:', `${API_BASE_URL}`);
            const response = await fetch(`${API_BASE_URL}/health`, { 
                method: 'GET',
                // Include longer timeout
                signal: AbortSignal.timeout(10000)
            });
            
            debug('API health check response status:', response.status);
            
            if (response.ok) {
                debug('API connection successful');
                return true;
            } else {
                debug('API responded but with error status code');
                return false;
            }
        } catch (error) {
            console.error('API connectivity test failed:', error);
            debug('API connectivity test exception:', error);
            
            // Show a more helpful error message if the API is unreachable
            showNotification(`Could not connect to the API server. Please check that your backend is running at ${API_BASE_URL}`, 'error');
            
            return false;
        }
    }

    // Initialize
    checkLoginState();
    testAPIConnectivity();

    // Add additional styles for user menu and notifications
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background-color: #4CAF50;
            color: white;
            border-radius: 4px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
            transform: translateX(150%);
            transition: transform 0.3s ease;
            z-index: 1010;
            max-width: 80%;
            word-wrap: break-word;
        }
        
        .notification.error {
            background-color: #F44336;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .user-profile {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .user-greeting {
            color: white;
            font-weight: 500;
        }
        
        .user-dropdown {
            position: relative;
            display: inline-block;
        }
        
        .user-menu-button {
            background-color: transparent;
            color: white;
            border: none;
            cursor: pointer;
            font-size: 1.2rem;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .dropdown-content {
            display: none;
            position: absolute;
            right: 0;
            background-color: white;
            min-width: 180px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.2);
            z-index: 1;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .dropdown-content.show {
            display: block;
        }
        
        .dropdown-content a {
            color: #333;
            padding: 12px 16px;
            text-decoration: none;
            display: block;
            transition: background-color 0.2s;
        }
        
        .dropdown-content a:hover {
            background-color: #f1f1f1;
        }
        
        /* Debug console styles */
        .debug-console {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.8);
            color: #00ff00;
            font-family: monospace;
            font-size: 12px;
            height: 200px;
            overflow-y: auto;
            padding: 10px;
            z-index: 1020;
            display: none;
        }
        
        .debug-console.show {
            display: block;
        }
        
        /* Add debug toggle button */
        .debug-toggle {
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.5);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 5px 10px;
            cursor: pointer;
            z-index: 1021;
            font-size: 12px;
        }
    `;
    document.head.appendChild(style);
    
    // Add debug console toggle (only in debug mode)
    if (DEBUG_MODE) {
        // Create debug console
        const debugConsole = document.createElement('div');
        debugConsole.className = 'debug-console';
        document.body.appendChild(debugConsole);
        
        // Create toggle button
        const debugToggle = document.createElement('button');
        debugToggle.className = 'debug-toggle';
        debugToggle.textContent = 'Show Debug Console';
        debugToggle.addEventListener('click', function() {
            debugConsole.classList.toggle('show');
            debugToggle.textContent = debugConsole.classList.contains('show') ? 
                'Hide Debug Console' : 'Show Debug Console';
        });
        document.body.appendChild(debugToggle);
        
        // Override debug function to output to console
        window.debug = function(message, data) {
            const time = new Date().toLocaleTimeString();
            const logItem = document.createElement('div');
            logItem.innerHTML = `<span style="color:#aaa;">${time}</span> ${message} ${data ? JSON.stringify(data) : ''}`;
            debugConsole.appendChild(logItem);
            debugConsole.scrollTop = debugConsole.scrollHeight;
            
            // Also log to browser console
            console.log(`[DEBUG] ${message}`, data || '');
        };
    }
});