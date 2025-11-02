// Dashboard JavaScript

// Check if user is logged in
const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

if (!currentUser) {
    window.location.href = 'login.html';
}

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    initializeSidebarNavigation();
    initializeUserMenu();
    loadAlumniDirectory();
});

// Load User Data
function loadUserData() {
    if (!currentUser) return;
    
    // Update user name in multiple places
    document.getElementById('userName').textContent = currentUser.fullName;
    document.getElementById('welcomeName').textContent = currentUser.fullName;
    
    // Update profile section
    document.getElementById('profileName').textContent = currentUser.fullName;
    document.getElementById('profileBatch').textContent = getBatchName(currentUser.batch);
    document.getElementById('profileProfession').textContent = `${currentUser.profession}${currentUser.organization ? ' at ' + currentUser.organization : ''}`;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profilePhone').textContent = currentUser.phone;
    document.getElementById('profileDob').textContent = formatDate(currentUser.dob);
    document.getElementById('profileGender').textContent = capitalizeFirst(currentUser.gender);
    document.getElementById('profileStudentId').textContent = currentUser.studentId || 'N/A';
    document.getElementById('profilePassingYear').textContent = currentUser.passingYear;
    document.getElementById('profileDepartment').textContent = currentUser.department || 'N/A';
    document.getElementById('profileOrganization').textContent = currentUser.organization || 'N/A';
    document.getElementById('profileDesignation').textContent = currentUser.designation || 'N/A';
    document.getElementById('profileLocation').textContent = currentUser.workLocation || 'N/A';
    
    // Load profile picture if available
    if (currentUser.profilePic) {
        document.getElementById('userAvatar').src = currentUser.profilePic;
        document.getElementById('profileAvatar').src = currentUser.profilePic;
    }
    
    // Load edit form
    document.getElementById('editFullName').value = currentUser.fullName;
    document.getElementById('editPhone').value = currentUser.phone;
    document.getElementById('editAddress').value = currentUser.address || '';
    document.getElementById('editProfession').value = currentUser.profession;
    document.getElementById('editOrganization').value = currentUser.organization || '';
    document.getElementById('editDesignation').value = currentUser.designation || '';
    document.getElementById('editWorkLocation').value = currentUser.workLocation || '';
}

// Sidebar Navigation
function initializeSidebarNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.dashboard-section');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            menuItems.forEach(mi => mi.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Hide all sections
            sections.forEach(section => section.classList.remove('active'));
            
            // Show selected section
            const sectionName = this.getAttribute('data-section');
            const targetSection = document.getElementById(sectionName + '-section');
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

// User Menu Dropdown
function initializeUserMenu() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    
    userMenuBtn.addEventListener('click', function() {
        userDropdown.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.remove('show');
        }
    });
    
    // Logout functionality
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        }
    });
}

// Edit Profile Form
const editProfileForm = document.getElementById('editProfileForm');
if (editProfileForm) {
    editProfileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Update current user data
        currentUser.fullName = document.getElementById('editFullName').value;
        currentUser.phone = document.getElementById('editPhone').value;
        currentUser.address = document.getElementById('editAddress').value;
        currentUser.profession = document.getElementById('editProfession').value;
        currentUser.organization = document.getElementById('editOrganization').value;
        currentUser.designation = document.getElementById('editDesignation').value;
        currentUser.workLocation = document.getElementById('editWorkLocation').value;
        
        // Update in localStorage
        const alumniUsers = JSON.parse(localStorage.getItem('alumniUsers')) || [];
        const userIndex = alumniUsers.findIndex(u => u.id === currentUser.id);
        
        if (userIndex !== -1) {
            alumniUsers[userIndex] = currentUser;
            localStorage.setItem('alumniUsers', JSON.stringify(alumniUsers));
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Reload user data
            loadUserData();
            
            // Show success message
            showDashboardAlert('Profile updated successfully!', 'success');
            
            // Switch to profile view
            document.querySelector('[data-section="profile"]').click();
        }
    });
}

// Load Alumni Directory
function loadAlumniDirectory() {
    const alumniUsers = JSON.parse(localStorage.getItem('alumniUsers')) || [];
    const directoryGrid = document.getElementById('alumniDirectoryGrid');
    
    if (!directoryGrid) return;
    
    // Filter out current user
    const otherAlumni = alumniUsers.filter(user => user.id !== currentUser.id);
    
    if (otherAlumni.length === 0) {
        directoryGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">No other alumni registered yet.</p>';
        return;
    }
    
    directoryGrid.innerHTML = '';
    
    otherAlumni.forEach(alumni => {
        const card = createAlumniCard(alumni);
        directoryGrid.appendChild(card);
    });
    
    // Initialize directory filters
    initializeDirectoryFilters(otherAlumni);
    
    // Initialize search
    initializeAlumniSearch(otherAlumni);
}

// Create Alumni Card
function createAlumniCard(alumni) {
    const card = document.createElement('div');
    card.className = 'alumni-card';
    card.setAttribute('data-batch', alumni.batch);
    
    card.innerHTML = `
        <div class="alumni-avatar">
            ${alumni.profilePic ? 
                `<img src="${alumni.profilePic}" alt="${alumni.fullName}" style="width: 100%; height: 100%; object-fit: cover;">` :
                '<i class="fas fa-user-graduate"></i>'
            }
        </div>
        <h4>${alumni.fullName}</h4>
        <p class="alumni-batch">${getBatchName(alumni.batch)}</p>
        <p class="alumni-profession">${alumni.profession}</p>
        <div class="alumni-social">
            <a href="mailto:${alumni.email}" title="Email"><i class="fas fa-envelope"></i></a>
            ${alumni.facebook ? `<a href="${alumni.facebook}" target="_blank" title="Facebook"><i class="fab fa-facebook"></i></a>` : ''}
            ${alumni.linkedin ? `<a href="${alumni.linkedin}" target="_blank" title="LinkedIn"><i class="fab fa-linkedin"></i></a>` : ''}
        </div>
    `;
    
    return card;
}

// Directory Filters
function initializeDirectoryFilters(alumni) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const alumniCards = document.querySelectorAll('.alumni-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            alumniCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-batch') === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Alumni Search
function initializeAlumniSearch(alumni) {
    const searchInput = document.getElementById('searchAlumni');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const alumniCards = document.querySelectorAll('.alumni-card');
        
        alumniCards.forEach(card => {
            const name = card.querySelector('h4').textContent.toLowerCase();
            const profession = card.querySelector('.alumni-profession').textContent.toLowerCase();
            
            if (name.includes(searchTerm) || profession.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// Helper Functions
function getBatchName(batch) {
    const batchNames = {
        'dakhil2020': 'Dakhil 2020',
        'alim2022': 'Alim 2022'
    };
    return batchNames[batch] || batch;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function capitalizeFirst(str) {
    if (!str) return 'N/A';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showDashboardAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.style.position = 'fixed';
    alert.style.top = '90px';
    alert.style.right = '20px';
    alert.style.zIndex = '9999';
    alert.style.minWidth = '300px';
    alert.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

// Add some sample data if none exists (for demo purposes)
if (!localStorage.getItem('alumniUsers') || JSON.parse(localStorage.getItem('alumniUsers')).length === 0) {
    const sampleUsers = [
        {
            id: '1',
            fullName: 'Mohammad Rahim',
            email: 'rahim@example.com',
            phone: '+880 1234-567890',
            dob: '1995-01-15',
            gender: 'male',
            batch: 'dakhil2020',
            studentId: '20001',
            passingYear: '2020',
            department: 'Science',
            profession: 'Software Engineer',
            organization: 'Tech Corp',
            designation: 'Senior Developer',
            workLocation: 'Dhaka, Bangladesh',
            password: 'password123',
            registrationDate: new Date().toISOString(),
            status: 'active'
        },
        {
            id: '2',
            fullName: 'Fatima Khatun',
            email: 'fatima@example.com',
            phone: '+880 1234-567891',
            dob: '1996-05-20',
            gender: 'female',
            batch: 'dakhil2020',
            studentId: '20002',
            passingYear: '2020',
            department: 'Arts',
            profession: 'Teacher',
            organization: 'ABC School',
            designation: 'Senior Teacher',
            workLocation: 'Dhaka, Bangladesh',
            password: 'password123',
            registrationDate: new Date().toISOString(),
            status: 'active'
        }
    ];
    
    // Only add if current user is logged in (don't interfere with real registrations)
    if (currentUser) {
        const existingUsers = JSON.parse(localStorage.getItem('alumniUsers')) || [];
        if (!existingUsers.some(u => u.id === currentUser.id)) {
            existingUsers.push(currentUser);
        }
        sampleUsers.forEach(user => {
            if (!existingUsers.some(u => u.email === user.email)) {
                existingUsers.push(user);
            }
        });
        localStorage.setItem('alumniUsers', JSON.stringify(existingUsers));
    }
}

console.log('📊 Dashboard loaded for:', currentUser?.fullName);
