// Authentication JavaScript

// Registration Form Handler
const registrationForm = document.getElementById('registrationForm');
if (registrationForm) {
    registrationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(registrationForm);
        const alumniData = {};
        
        formData.forEach((value, key) => {
            alumniData[key] = value;
        });
        
        // Password validation
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            showAlert('Passwords do not match!', 'error');
            return;
        }
        
        if (password.length < 6) {
            showAlert('Password must be at least 6 characters long!', 'error');
            return;
        }
        
        // Check terms acceptance
        if (!document.getElementById('terms').checked) {
            showAlert('Please accept the Terms & Conditions', 'error');
            return;
        }
        
        // Store alumni data in localStorage (in real app, this would be sent to server)
        const existingAlumni = JSON.parse(localStorage.getItem('alumniUsers')) || [];
        
        // Check if email already exists
        if (existingAlumni.some(user => user.email === alumniData.email)) {
            showAlert('Email already registered!', 'error');
            return;
        }
        
        // Add unique ID and registration date
        alumniData.id = Date.now().toString();
        alumniData.registrationDate = new Date().toISOString();
        alumniData.status = 'active';
        
        // Remove confirm password before storing
        delete alumniData.confirmPassword;
        
        // Add to alumni array
        existingAlumni.push(alumniData);
        localStorage.setItem('alumniUsers', JSON.stringify(existingAlumni));
        
        showAlert('Registration successful! Redirecting to login...', 'success');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    });
    
    // Password strength checker
    const passwordInput = document.getElementById('password');
    const strengthIndicator = document.getElementById('passwordStrength');
    
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strength = checkPasswordStrength(password);
        
        strengthIndicator.className = 'password-strength ' + strength;
    });
    
    // Profile picture preview
    const profilePicInput = document.getElementById('profilePic');
    const filePreview = document.getElementById('filePreview');
    
    profilePicInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                filePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });
}

// Login Form Handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Get all registered alumni
        const alumniUsers = JSON.parse(localStorage.getItem('alumniUsers')) || [];
        
        // Find user
        const user = alumniUsers.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Store current user session
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            
            if (rememberMe) {
                localStorage.setItem('rememberedUser', email);
            }
            
            showAlert('Login successful! Redirecting to dashboard...', 'success');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            showAlert('Invalid email or password!', 'error');
        }
    });
    
    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('loginPassword');
    
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
    
    // Check for remembered user
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        document.getElementById('loginEmail').value = rememberedUser;
        document.getElementById('rememberMe').checked = true;
    }
}

// Helper Functions
function checkPasswordStrength(password) {
    let strength = 'weak';
    
    if (password.length >= 8) {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        const strengthScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
        
        if (strengthScore >= 3) {
            strength = 'strong';
        } else if (strengthScore >= 2) {
            strength = 'medium';
        }
    }
    
    return strength;
}

function showAlert(message, type) {
    // Remove existing alert if any
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    const form = document.querySelector('.auth-form');
    form.insertBefore(alert, form.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Social Login Placeholders
const socialButtons = document.querySelectorAll('.btn-social');
socialButtons.forEach(button => {
    button.addEventListener('click', function() {
        const provider = this.classList.contains('btn-facebook') ? 'Facebook' : 'Google';
        showAlert(`${provider} login will be available soon!`, 'info');
    });
});

console.log('🔐 Authentication system loaded');
