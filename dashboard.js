// ============================================================
//  DAF USER DASHBOARD
// ============================================================

// Guard: must be logged in
const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
if (!currentUser) { window.location.href = 'login.html'; }

// ---- Helpers ----
function getBatchName(b) {
    return b === 'dakhil2020' ? 'Dakhil 2020' : b === 'alim2022' ? 'Alim 2022' : (b || '');
}
function fmtDate(d) {
    if (!d) return '';
    const dt = new Date(d);
    return isNaN(dt) ? d : dt.toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
}
function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
function el(id) { return document.getElementById(id); }
function setText(id, val) { const e = el(id); if (e) e.textContent = val || ''; }

// ---- Toast ----
function toast(msg, type = 'success') {
    const t = el('dashToast');
    if (!t) return;
    t.textContent = msg;
    t.className = 'dash-toast show ' + type;
    setTimeout(() => t.className = 'dash-toast', 3000);
}

// ============================================================
//  SECTION NAVIGATION
// ============================================================
function switchSection(name) {
    document.querySelectorAll('.dash-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
    const sec = el(name + '-section');
    if (sec) sec.classList.add('active');
    const item = document.querySelector('.menu-item[data-section="' + name + '"]');
    if (item) item.classList.add('active');
    window.scrollTo(0, 0);
    closeSidebar(); // close sidebar on mobile after navigation
    if (name === 'messages') { loadMessages(); markMessagesRead(); }
    if (name === 'events') loadEvents();
}

document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        switchSection(this.getAttribute('data-section'));
    });
});

// Dropdown nav links
document.querySelectorAll('.dropdown-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        el('userDropdown').classList.remove('show');
        switchSection(this.getAttribute('data-section'));
    });
});

// User menu toggle
const userMenuBtn = el('userMenuBtn');
if (userMenuBtn) {
    userMenuBtn.addEventListener('click', () => el('userDropdown').classList.toggle('show'));
    document.addEventListener('click', e => {
        if (!userMenuBtn.contains(e.target) && !el('userDropdown').contains(e.target))
            el('userDropdown').classList.remove('show');
    });
}

// Logout
function doLogout() {
    if (confirm('Logout from your account?')) {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}
const lb = el('logoutBtn'); if (lb) lb.addEventListener('click', e => { e.preventDefault(); doLogout(); });
const sl = el('sidebarLogout'); if (sl) sl.addEventListener('click', e => { e.preventDefault(); doLogout(); });

// ============================================================
//  MOBILE SIDEBAR TOGGLE
// ============================================================
function openSidebar() {
    const sidebar = document.querySelector('.dashboard-sidebar');
    const overlay = el('sidebarOverlay');
    if (sidebar) sidebar.classList.add('show');
    if (overlay) overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}
function closeSidebar() {
    const sidebar = document.querySelector('.dashboard-sidebar');
    const overlay = el('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('show');
    if (overlay) overlay.classList.remove('show');
    document.body.style.overflow = '';
}

const sidebarToggleBtn = el('sidebarToggleBtn');
if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener('click', () => {
        const sidebar = document.querySelector('.dashboard-sidebar');
        if (sidebar && sidebar.classList.contains('show')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });
}
const sidebarOverlay = el('sidebarOverlay');
if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
}

// ============================================================
//  LOAD USER DATA INTO PROFILE & EDIT FORM
// ============================================================
function loadUserData() {
    if (!currentUser) return;
    const u = currentUser;

    // Navbar
    setText('userName', u.fullName);
    const ua = el('userAvatar');
    if (ua && u.profilePicture) ua.src = u.profilePicture;

    // Sidebar
    setText('sidebarName', u.fullName);
    setText('sidebarAlumniId', u.alumniId ? 'ID: ' + u.alumniId : '');
    const sa = el('sidebarAvatar');
    if (sa) sa.src = u.profilePicture || 'https://via.placeholder.com/70';

    // Profile banner
    const pa = el('profileAvatar');
    if (pa) pa.src = u.profilePicture || 'https://via.placeholder.com/120';
    setText('profileName', u.fullName);
    setText('profileBatchPill', getBatchName(u.batch));
    const prof = u.profession ? u.profession + (u.organization ? ' at ' + u.organization : '') : '';
    setText('profileProfession', prof);
    setText('profileAlumniId', u.alumniId || '');

    // Social links in banner
    const sl2 = el('profileSocialLinks');
    if (sl2) {
        sl2.innerHTML = '';
        if (u.email) sl2.innerHTML += `<a href="mailto:${u.email}" title="Email"><i class="fas fa-envelope"></i></a>`;
        if (u.facebook) sl2.innerHTML += `<a href="${u.facebook}" target="_blank" title="Facebook"><i class="fab fa-facebook"></i></a>`;
        if (u.linkedin) sl2.innerHTML += `<a href="${u.linkedin}" target="_blank" title="LinkedIn"><i class="fab fa-linkedin"></i></a>`;
    }

    // Personal
    setText('pEmail', u.email);
    setText('pPhone', u.phone);
    setText('pDob', fmtDate(u.dob));
    setText('pGender', cap(u.gender));
    setText('pAddress', u.address);

    // Academic
    setText('pBatch', getBatchName(u.batch));
    setText('pPassingYear', u.passingYear);
    setText('pDepartment', u.department);
    setText('pStudentId', u.studentId);

    // Professional
    setText('pProfession', u.profession);
    setText('pOrganization', u.organization);
    setText('pDesignation', u.designation);
    setText('pWorkLocation', u.workLocation);

    // Fill edit form
    const fields = {
        editFullName: u.fullName, editDob: u.dob, editGender: u.gender,
        editPhone: u.phone, editAddress: u.address, editStudentId: u.studentId,
        editBatch: u.batch, editDepartment: u.department, editPassingYear: u.passingYear,
        editProfession: u.profession, editOrganization: u.organization,
        editDesignation: u.designation, editWorkLocation: u.workLocation,
        editFacebook: u.facebook, editLinkedin: u.linkedin
    };
    Object.entries(fields).forEach(([id, val]) => {
        const inp = el(id); if (inp) inp.value = val || '';
    });
    const ep = el('editProfilePic');
    if (ep) ep.src = u.profilePicture || 'https://via.placeholder.com/120';

    // Message badge
    updateMsgBadge();
}

// ============================================================
//  PROFILE PICTURE UPLOAD
// ============================================================
const ppUpload = el('profilePicUpload');
if (ppUpload) {
    ppUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { toast('File must be under 2MB', 'error'); return; }
        if (!file.type.startsWith('image/')) { toast('Please choose an image file', 'error'); return; }
        const reader = new FileReader();
        reader.onload = ev => {
            el('editProfilePic').src = ev.target.result;
            ppUpload.dataset.newImage = ev.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// ============================================================
//  SAVE EDIT PROFILE
// ============================================================
const editForm = el('editProfileForm');
if (editForm) {
    editForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Password change (optional)
        const curPw = el('editCurrentPassword').value;
        const newPw = el('editNewPassword').value;
        const conPw = el('editConfirmPassword').value;
        if (curPw || newPw || conPw) {
            if (!curPw) { toast('Enter your current password', 'error'); return; }
            if (curPw !== currentUser.password) { toast('Current password is incorrect', 'error'); return; }
            if (!newPw || newPw.length < 6) { toast('New password must be at least 6 characters', 'error'); return; }
            if (newPw !== conPw) { toast('Passwords do not match', 'error'); return; }
            currentUser.password = newPw;
        }

        // Update fields
        const map = {
            editFullName:'fullName', editDob:'dob', editGender:'gender', editPhone:'phone',
            editAddress:'address', editStudentId:'studentId', editBatch:'batch',
            editDepartment:'department', editPassingYear:'passingYear', editProfession:'profession',
            editOrganization:'organization', editDesignation:'designation',
            editWorkLocation:'workLocation', editFacebook:'facebook', editLinkedin:'linkedin'
        };
        Object.entries(map).forEach(([inpId, key]) => {
            const inp = el(inpId); if (inp) currentUser[key] = inp.value;
        });

        // Profile picture
        if (ppUpload && ppUpload.dataset.newImage) {
            currentUser.profilePicture = ppUpload.dataset.newImage;
            delete ppUpload.dataset.newImage;
        }

        // Save to localStorage
        const users = JSON.parse(localStorage.getItem('alumniUsers')) || [];
        const idx = users.findIndex(u => u.email === currentUser.email);
        if (idx !== -1) {
            users[idx] = currentUser;
            localStorage.setItem('alumniUsers', JSON.stringify(users));
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            loadUserData();
            el('editCurrentPassword').value = '';
            el('editNewPassword').value = '';
            el('editConfirmPassword').value = '';
            toast('Profile updated successfully!');
            setTimeout(() => switchSection('profile'), 1000);
        } else {
            toast('Error saving profile. Please try again.', 'error');
        }
    });
}

const cancelBtn = el('cancelEditBtn');
if (cancelBtn) cancelBtn.addEventListener('click', () => switchSection('profile'));

// ============================================================
//  EVENTS
// ============================================================
function loadEvents() {
    const events = JSON.parse(localStorage.getItem('dafEvents')) || [];
    const container = el('eventsContainer');
    if (!container) return;

    if (!events.length) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-times"></i><p>No events at the moment. Check back soon!</p></div>';
        return;
    }

    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    container.innerHTML = events.map((ev, idx) => {
        const d = ev.date ? new Date(ev.date + (ev.time ? ' ' + ev.time : ' 00:00')) : null;
        const dayNum = d ? d.getDate() : '';
        const monthStr = d ? d.toLocaleString('en', { month:'short' }) : '';
        const yearStr = d ? d.getFullYear() : '';
        const isPast = d && d < new Date();
        const countdownHtml = !isPast && d ? `
            <div class="ev-countdown" id="countdown-${idx}">
                <div class="cd-box"><span class="cd-num" id="cd-d-${idx}">--</span><span class="cd-lbl">Days</span></div>
                <div class="cd-sep">:</div>
                <div class="cd-box"><span class="cd-num" id="cd-h-${idx}">--</span><span class="cd-lbl">Hours</span></div>
                <div class="cd-sep">:</div>
                <div class="cd-box"><span class="cd-num" id="cd-m-${idx}">--</span><span class="cd-lbl">Mins</span></div>
                <div class="cd-sep">:</div>
                <div class="cd-box"><span class="cd-num" id="cd-s-${idx}">--</span><span class="cd-lbl">Secs</span></div>
            </div>` : '';
        return `
        <div class="event-card ${isPast ? 'past-event' : ''}" data-evtime="${d ? d.getTime() : ''}" data-idx="${idx}">
            <div class="event-date-block">
                <span class="ev-day">${dayNum}</span>
                <span class="ev-month">${monthStr}</span>
                <span class="ev-year">${yearStr}</span>
            </div>
            <div class="event-body">
                <h3>${ev.title || ''}</h3>
                ${ev.time ? `<p><i class="fas fa-clock"></i> ${ev.time}</p>` : ''}
                ${ev.location ? `<p><i class="fas fa-map-marker-alt"></i> ${ev.location}</p>` : ''}
                ${ev.description ? `<p class="ev-desc">${ev.description}</p>` : ''}
                ${ev.link ? `<a href="${ev.link}" target="_blank" class="ev-link"><i class="fas fa-external-link-alt"></i> More Details</a>` : ''}
                ${countdownHtml}
            </div>
            ${isPast ? '<span class="past-tag">Past</span>' : '<span class="upcoming-tag">Upcoming</span>'}
        </div>`;
    }).join('');

    startCountdowns();
}

let _countdownTimer = null;
function startCountdowns() {
    if (_countdownTimer) clearInterval(_countdownTimer);
    function tick() {
        const now = Date.now();
        document.querySelectorAll('.event-card[data-evtime]').forEach(card => {
            const evTime = parseInt(card.dataset.evtime);
            const idx = card.dataset.idx;
            if (!evTime || isNaN(evTime)) return;
            const diff = evTime - now;
            if (diff <= 0) return;
            const days  = Math.floor(diff / 86400000);
            const hours = Math.floor((diff % 86400000) / 3600000);
            const mins  = Math.floor((diff % 3600000) / 60000);
            const secs  = Math.floor((diff % 60000) / 1000);
            const pad = n => String(n).padStart(2, '0');
            const dEl = document.getElementById(`cd-d-${idx}`);
            const hEl = document.getElementById(`cd-h-${idx}`);
            const mEl = document.getElementById(`cd-m-${idx}`);
            const sEl = document.getElementById(`cd-s-${idx}`);
            if (dEl) dEl.textContent = pad(days);
            if (hEl) hEl.textContent = pad(hours);
            if (mEl) mEl.textContent = pad(mins);
            if (sEl) sEl.textContent = pad(secs);
        });
    }
    tick();
    _countdownTimer = setInterval(tick, 1000);
}

// ============================================================
//  MESSAGES
// ============================================================
function getUserMessages() {
    const all = JSON.parse(localStorage.getItem('dafUserMessages')) || [];
    return all.filter(m => m.to === currentUser.email);
}

function updateMsgBadge() {
    const msgs = getUserMessages();
    const unread = msgs.filter(m => !m.read).length;
    const badge = el('msgBadge');
    if (!badge) return;
    if (unread > 0) {
        badge.textContent = unread;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

function markMessagesRead() {
    const all = JSON.parse(localStorage.getItem('dafUserMessages')) || [];
    let changed = false;
    all.forEach(m => { if (m.to === currentUser.email && !m.read) { m.read = true; changed = true; } });
    if (changed) {
        localStorage.setItem('dafUserMessages', JSON.stringify(all));
        updateMsgBadge();
    }
}

function loadMessages() {
    const msgs = getUserMessages();
    const container = el('messagesContainer');
    if (!container) return;

    if (!msgs.length) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No messages yet.</p></div>';
        return;
    }

    msgs.sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = msgs.map(m => `
        <div class="msg-card ${m.read ? '' : 'msg-unread'}">
            <div class="msg-header">
                <div class="msg-from">
                    <i class="fas fa-user-shield"></i>
                    <strong>Admin - DAF</strong>
                </div>
                <span class="msg-date">${fmtDate(m.date)}</span>
                ${!m.read ? '<span class="msg-new-badge">New</span>' : ''}
            </div>
            <div class="msg-subject">${m.subject || 'No Subject'}</div>
            <div class="msg-body">${m.message || ''}</div>
        </div>
    `).join('');
}

// ============================================================
//  INIT
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    loadEvents();
    loadMessages();
});
