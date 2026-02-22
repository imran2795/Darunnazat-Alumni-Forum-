// Alumni Directory Filter and Search
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchAlumni');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const alumniGrid = document.querySelector('.alumni-directory-grid');

    // Load alumni from localStorage
    function loadAlumniFromStorage() {
        const alumniUsers = JSON.parse(localStorage.getItem('alumniUsers')) || [];
        const noAlumniMessage = document.querySelector('.no-alumni-message');
        
        if (alumniUsers.length > 0) {
            // Clear existing content
            alumniGrid.innerHTML = '';
            
            // Create cards for each registered alumni
            alumniUsers.forEach(user => {
                const alumniCard = createAlumniCard(user);
                alumniGrid.appendChild(alumniCard);
            });
            
            // Hide no alumni message
            if (noAlumniMessage) {
                noAlumniMessage.style.display = 'none';
            }
        } else {
            // Show no alumni message
            if (noAlumniMessage) {
                noAlumniMessage.style.display = 'block';
            }
        }
    }

    // Check login status for directory
    const isLoggedIn = !!sessionStorage.getItem('currentUser');

    // Create alumni card HTML
    function createAlumniCard(user) {
        const card = document.createElement('div');
        card.className = 'alumni-detail-card';
        card.setAttribute('data-batch', getBatchSlug(user.batch));

        // Check if profile picture exists, otherwise use FontAwesome icon
        let avatarHTML;
        if (user.profilePicture && user.profilePicture !== '') {
            avatarHTML = `<img src="${user.profilePicture}" alt="${user.fullName}" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-user-graduate\\' style=\\'font-size: 3rem; color: var(--primary-color);\\' ></i>'">`;
        } else {
            avatarHTML = `<i class="fas fa-user-graduate" style="font-size: 3rem; color: var(--primary-color);"></i>`;
        }
        
        if (isLoggedIn) {
            // Full details for logged-in users
            card.innerHTML = `
                <div class="alumni-card-header">
                    <div class="alumni-avatar-large">${avatarHTML}</div>
                    <div class="alumni-info">
                        <h3>${user.fullName}</h3>
                        <span class="batch-tag">${user.batch}</span>
                        ${user.alumniId ? `<span style="display:inline-block;margin-top:5px;background:#e8f4e8;color:#2e7d32;font-weight:700;font-size:12px;padding:2px 10px;border-radius:6px;letter-spacing:1px;"><i class="fas fa-id-badge"></i> ${user.alumniId}</span>` : ''}
                    </div>
                </div>
                <div class="alumni-card-body">
                    <div class="info-row"><i class="fas fa-briefcase"></i><div><strong>Profession</strong><p>${user.profession || 'Not specified'}</p></div></div>
                    <div class="info-row"><i class="fas fa-building"></i><div><strong>Organization</strong><p>${user.organization || 'Not specified'}</p></div></div>
                    <div class="info-row"><i class="fas fa-map-marker-alt"></i><div><strong>Location</strong><p>${user.workLocation || user.address || 'Bangladesh'}</p></div></div>
                    <div class="info-row"><i class="fas fa-envelope"></i><div><strong>Email</strong><p>${user.email}</p></div></div>
                    <div class="info-row"><i class="fas fa-phone"></i><div><strong>Phone</strong><p>${user.phone || 'Not provided'}</p></div></div>
                </div>
                <div class="alumni-card-footer">
                    ${user.facebook ? `<a href="${user.facebook}" target="_blank" class="social-link"><i class="fab fa-facebook"></i></a>` : ''}
                    ${user.linkedin ? `<a href="${user.linkedin}" target="_blank" class="social-link"><i class="fab fa-linkedin"></i></a>` : ''}
                    <a href="mailto:${user.email}" class="social-link"><i class="fas fa-envelope"></i></a>
                </div>
            `;
        } else {
            // Limited view for guests — only name, batch, profession, organization
            card.innerHTML = `
                <div class="alumni-card-header">
                    <div class="alumni-avatar-large">${avatarHTML}</div>
                    <div class="alumni-info">
                        <h3>${user.fullName}</h3>
                        <span class="batch-tag">${user.batch}</span>
                    </div>
                </div>
                <div class="alumni-card-body">
                    <div class="info-row"><i class="fas fa-briefcase"></i><div><strong>Profession</strong><p>${user.profession || 'Not specified'}</p></div></div>
                    <div class="info-row"><i class="fas fa-building"></i><div><strong>Organization</strong><p>${user.organization || 'Not specified'}</p></div></div>
                    <div class="info-row" style="filter:blur(5px);user-select:none;pointer-events:none;"><i class="fas fa-map-marker-alt"></i><div><strong>Location</strong><p>████████████</p></div></div>
                    <div class="info-row" style="filter:blur(5px);user-select:none;pointer-events:none;"><i class="fas fa-envelope"></i><div><strong>Email</strong><p>████████████████</p></div></div>
                    <div class="info-row" style="filter:blur(5px);user-select:none;pointer-events:none;"><i class="fas fa-phone"></i><div><strong>Phone</strong><p>████████████</p></div></div>
                </div>
                <div style="background:linear-gradient(135deg,#f0f4ff,#e8f4e8);border-top:1.5px solid #d0e8d0;padding:14px;text-align:center;border-radius:0 0 10px 10px;">
                    <p style="margin:0 0 8px;font-size:13px;color:#555;"><i class="fas fa-lock" style="color:#e67e22;margin-right:5px;"></i>Login করলে সম্পূর্ণ তথ্য দেখা যাবে</p>
                    <a href="login.html" style="display:inline-block;background:var(--primary-color,#2c7a4b);color:#fff;padding:7px 22px;border-radius:20px;font-size:13px;font-weight:700;text-decoration:none;"><i class="fas fa-sign-in-alt" style="margin-right:5px;"></i>Login Now</a>
                </div>
            `;
        }

        return card;
    }

    // Convert batch name to slug for filtering
    function getBatchSlug(batch) {
        if (batch.toLowerCase().includes('dakhil') && batch.includes('2020')) {
            return 'dakhil2020';
        } else if (batch.toLowerCase().includes('alim') && batch.includes('2022')) {
            return 'alim2022';
        }
        return 'other';
    }

    // Load alumni on page load
    loadAlumniFromStorage();

    // Get all alumni cards after loading
    let alumniCards = document.querySelectorAll('.alumni-detail-card');

    // Filter by batch
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');

            const selectedBatch = this.getAttribute('data-batch');
            alumniCards = document.querySelectorAll('.alumni-detail-card');

            alumniCards.forEach(card => {
                const cardBatch = card.getAttribute('data-batch');
                
                if (selectedBatch === 'all' || cardBatch === selectedBatch) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            alumniCards = document.querySelectorAll('.alumni-detail-card');

            alumniCards.forEach(card => {
                const name = card.querySelector('.alumni-info h3');
                const rows = card.querySelectorAll('.info-row p');
                let combined = (name ? name.textContent : '').toLowerCase();
                rows.forEach(r => { combined += ' ' + r.textContent.toLowerCase(); });

                card.style.display = combined.includes(searchTerm) ? 'block' : 'none';
            });
        });
    }

    // Add animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    alumniCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.5s ease';
        observer.observe(card);
    });
});

