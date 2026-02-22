// Authentication JavaScript

// Alumni ID live check
const alumniIdInput = document.getElementById('alumniId');
if (alumniIdInput) {
    alumniIdInput.addEventListener('input', function() {
        const val = this.value.trim();
        const status = document.getElementById('alumniIdStatus');
        if (!val) { status.textContent = ''; return; }
        if (!/^\d{8}$/.test(val)) {
            status.innerHTML = '<span style="color:#e74c3c;"><i class="fas fa-times-circle"></i> Must be exactly 8 digits (e.g. 20220001)</span>';
            return;
        }
        const users = JSON.parse(localStorage.getItem('alumniUsers')) || [];
        if (users.some(u => u.alumniId === val)) {
            status.innerHTML = '<span style="color:#e74c3c;"><i class="fas fa-times-circle"></i> This Alumni ID is already registered.</span>';
        } else {
            status.innerHTML = '<span style="color:#27ae60;"><i class="fas fa-check-circle"></i> Alumni ID available!</span>';
        }
    });
}

// Registration Form Handler
const registrationForm = document.getElementById('registrationForm');
if (registrationForm) {
    registrationForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const alumniId = (document.getElementById('alumniId').value || '').trim();

        // Validate Alumni ID
        if (!alumniId) {
            showAlert('Alumni ID is required!', 'error');
            document.getElementById('alumniId').focus();
            return;
        }
        if (!/^\d{8}$/.test(alumniId)) {
            showAlert('Alumni ID must be exactly 8 digits (e.g. 20220001)', 'error');
            document.getElementById('alumniId').focus();
            return;
        }
        // Check uniqueness immediately
        const existingCheck = JSON.parse(localStorage.getItem('alumniUsers')) || [];
        if (existingCheck.some(u => u.alumniId === alumniId)) {
            showAlert('This Alumni ID is already registered! Each ID can only be used once.', 'error');
            document.getElementById('alumniId').focus();
            return;
        }
        
        // Get form data
        const alumniData = {
            alumniId,
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            dob: document.getElementById('dob').value,
            gender: document.getElementById('gender').value,
            address: document.getElementById('address').value,
            batch: document.getElementById('batch').value,
            studentId: document.getElementById('studentId').value,
            passingYear: document.getElementById('passingYear').value,
            department: document.getElementById('department').value,
            profession: document.getElementById('profession').value,
            organization: document.getElementById('organization').value,
            designation: document.getElementById('designation').value,
            workLocation: document.getElementById('workLocation').value,
            facebook: document.getElementById('facebook').value,
            linkedin: document.getElementById('linkedin').value,
            password: document.getElementById('password').value
        };
        
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
        
        // Handle profile picture
        const profilePicInput = document.getElementById('profilePic');
        if (profilePicInput && profilePicInput.files && profilePicInput.files[0]) {
            const file = profilePicInput.files[0];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                alumniData.profilePicture = e.target.result;
                saveAlumniData(alumniData);
            };
            reader.readAsDataURL(file);
        } else {
            alumniData.profilePicture = '';
            saveAlumniData(alumniData);
        }
    });
    
    // Save alumni data function
    function saveAlumniData(alumniData) {
        // Store alumni data in localStorage
        const existingAlumni = JSON.parse(localStorage.getItem('alumniUsers')) || [];
        
        // Check if email already exists
        if (existingAlumni.some(user => user.email === alumniData.email)) {
            showAlert('Email already registered!', 'error');
            return;
        }

        // Double-check Alumni ID uniqueness at save time
        if (existingAlumni.some(user => user.alumniId === alumniData.alumniId)) {
            showAlert('This Alumni ID is already registered! Each ID can only be used once.', 'error');
            return;
        }
        
        // Add unique system ID and registration date
        alumniData.id = Date.now().toString();
        alumniData.registrationDate = new Date().toISOString();
        alumniData.status = 'active';
        
        // Add to alumni array
        existingAlumni.push(alumniData);
        localStorage.setItem('alumniUsers', JSON.stringify(existingAlumni));
        
        showAlert('Registration successful! Welcome to DAF Alumni Network. Redirecting...', 'success');
        
        // Redirect to alumni directory after 2 seconds
        setTimeout(() => {
            window.location.href = 'alumni-directory.html';
        }, 2000);
    }
    
    // Password strength checker
    const passwordInput = document.getElementById('password');
    const strengthIndicator = document.getElementById('passwordStrength');
    
    if (passwordInput && strengthIndicator) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strength = checkPasswordStrength(password);
            
            strengthIndicator.className = 'password-strength ' + strength;
        });
    }
    
    // Profile picture preview
    const profilePicInput = document.getElementById('profilePic');
    const filePreview = document.getElementById('filePreview');
    
    if (profilePicInput && filePreview) {
        profilePicInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Check file size (max 2MB)
                if (file.size > 2 * 1024 * 1024) {
                    showAlert('File size must be less than 2MB', 'error');
                    this.value = '';
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    filePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
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
