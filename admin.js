// ===========================
//  DAF Admin Panel JS
// ===========================

// --- Auth Guard ---
const adminUser = JSON.parse(sessionStorage.getItem('adminUser'));
if (!adminUser) {
    window.location.href = 'admin-login.html';
}

// --- Init ---
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('adminNameDisplay').textContent = adminUser ? adminUser.name : 'Admin';
    loadDashboard();
    loadSettings();
    loadAnnouncements();
    loadEvents();
    updateInboxBadge();
    initSidebar();
    initSearch();
});

// ===========================
//  SIDEBAR & NAVIGATION
// ===========================
function initSidebar() {
    // Sidebar toggle (mobile)
    document.getElementById('sidebarToggle').addEventListener('click', function () {
        document.body.classList.toggle('sidebar-open');
    });

    // Nav items
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const sec = this.getAttribute('data-section');
            if (sec) showSection(sec);
        });
    });

    // Logout
    document.getElementById('adminLogoutBtn').addEventListener('click', function (e) {
        e.preventDefault();
        if (confirm('Logout from Admin Panel?')) {
            sessionStorage.removeItem('adminUser');
            window.location.href = 'admin-login.html';
        }
    });
}

function showSection(sec) {
    // Update nav active
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navItem = document.querySelector(`.nav-item[data-section="${sec}"]`);
    if (navItem) navItem.classList.add('active');

    // Show section
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`section-${sec}`);
    if (target) target.classList.add('active');

    // Update topbar title
    const titles = {
        dashboard: 'Dashboard',
        users: 'All Users',
        dakhil: 'Dakhil 2020 Batch',
        alim: 'Alim 2022 Batch',
        announcements: 'Announcements',
        gallery: 'Photo Gallery',
        hero: 'Hero Slides',
        about: 'About Us',
        contact: 'Contact Us',
        inbox: 'Message Inbox',
        settings: 'Site Settings'
    };
    document.getElementById('topbarTitle').textContent = titles[sec] || 'Admin Panel';

    // Load data for section
    if (sec === 'users') loadUsersTable();
    if (sec === 'dakhil') loadBatchTable('dakhil2020', 'dakhilTableBody', 'dakhilCountBadge');
    if (sec === 'alim') loadBatchTable('alim2022', 'alimTableBody', 'alimCountBadge');
    if (sec === 'announcements') loadAnnouncements();
    if (sec === 'gallery') loadAdminGallery();
    if (sec === 'hero') loadAdminHeroSlides();
    if (sec === 'about') loadAboutSection();
    if (sec === 'contact') loadContactSection();
    if (sec === 'inbox') loadContactMessages();
    if (sec === 'settings') loadSettings();

    // Close sidebar on mobile
    document.body.classList.remove('sidebar-open');
}

// ===========================
//  HELPERS
// ===========================
function getUsers() {
    return JSON.parse(localStorage.getItem('alumniUsers')) || [];
}
function saveUsers(users) {
    localStorage.setItem('alumniUsers', JSON.stringify(users));
}
function getBatchLabel(batch) {
    return batch === 'dakhil2020' ? 'Dakhil 2020' : batch === 'alim2022' ? 'Alim 2022' : batch || '—';
}
function getBatchClass(batch) {
    return batch === 'dakhil2020' ? 'dakhil' : 'alim';
}
function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}
function avatarHtml(user, size = 36) {
    if (user.profilePicture) {
        return `<img src="${user.profilePicture}" class="user-photo" style="width:${size}px;height:${size}px;" alt="${user.fullName}">`;
    }
    return `<div class="user-photo-placeholder" style="width:${size}px;height:${size}px;font-size:${Math.round(size*0.38)}px;">${getInitials(user.fullName)}</div>`;
}

// ===========================
//  DASHBOARD
// ===========================
function loadDashboard() {
    const users = getUsers();
    const today = new Date().toDateString();
    const dakhil = users.filter(u => u.batch === 'dakhil2020').length;
    const alim = users.filter(u => u.batch === 'alim2022').length;
    const todayCount = users.filter(u => u.registrationDate && new Date(u.registrationDate).toDateString() === today).length;

    document.getElementById('statTotalUsers').textContent = users.length;
    document.getElementById('statDakhil').textContent = dakhil;
    document.getElementById('statAlim').textContent = alim;
    document.getElementById('statToday').textContent = todayCount;
    document.getElementById('sidebarUserCount').textContent = users.length;

    // Recent 5
    const recent = [...users].sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate)).slice(0, 5);
    const tbody = document.getElementById('recentTableBody');

    if (recent.length === 0) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="7"><i class="fas fa-users"></i>No users registered yet.</td></tr>`;
        return;
    }
    tbody.innerHTML = recent.map((u, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${avatarHtml(u)}</td>
            <td><strong>${u.fullName || '—'}</strong></td>
            <td>${u.email || '—'}</td>
            <td><span class="batch-pill ${getBatchClass(u.batch)}">${getBatchLabel(u.batch)}</span></td>
            <td>${u.profession || '—'}</td>
            <td>${formatDate(u.registrationDate)}</td>
            <td>
                <button class="btn-sm btn-info" onclick="viewUser('${u.id}')"><i class="fas fa-eye"></i></button>
                <button class="btn-sm btn-danger" onclick="deleteUser('${u.id}')" style="margin-left:4px;"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`).join('');
}

// ===========================
//  USERS TABLE
// ===========================
function loadUsersTable(filter = 'all', search = '') {
    const users = getUsers();
    let filtered = users;

    if (filter !== 'all') filtered = filtered.filter(u => u.batch === filter);
    if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(u =>
            (u.fullName || '').toLowerCase().includes(q) ||
            (u.email || '').toLowerCase().includes(q) ||
            (u.alumniId || '').toLowerCase().includes(q) ||
            (u.profession || '').toLowerCase().includes(q) ||
            (u.address || '').toLowerCase().includes(q)
        );
    }

    document.getElementById('userCountBadge').textContent = `${filtered.length} Users`;
    const tbody = document.getElementById('usersTableBody');

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="11"><i class="fas fa-search"></i>No users found.</td></tr>`;
        return;
    }
    tbody.innerHTML = filtered.map((u, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${avatarHtml(u)}</td>
            <td><strong>${u.fullName || '—'}</strong></td>
            <td><span style="background:#e8f4e8;color:#2e7d32;font-weight:700;padding:3px 10px;border-radius:8px;font-size:13px;letter-spacing:1px;">${u.alumniId || '—'}</span></td>
            <td style="font-size:12px;">${u.email || '—'}</td>
            <td>${u.phone || '—'}</td>
            <td><span class="batch-pill ${getBatchClass(u.batch)}">${getBatchLabel(u.batch)}</span></td>
            <td>${u.profession || '—'}</td>
            <td style="font-size:12px;">${u.workLocation || u.address || '—'}</td>
            <td style="font-size:12px;">${formatDate(u.registrationDate)}</td>
            <td style="white-space:nowrap;">
                <button class="btn-sm btn-info" onclick="viewUser('${u.id}')"><i class="fas fa-eye"></i> View</button>
                <button class="btn-sm btn-danger" onclick="deleteUser('${u.id}')" style="margin-left:4px;"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`).join('');
}

function initSearch() {
    const searchInput = document.getElementById('userSearch');
    const batchFilter = document.getElementById('batchFilter');
    if (searchInput) searchInput.addEventListener('input', () => loadUsersTable(batchFilter.value, searchInput.value));
    if (batchFilter) batchFilter.addEventListener('change', () => loadUsersTable(batchFilter.value, searchInput.value));
}

// ===========================
//  BATCH TABLE
// ===========================
function loadBatchTable(batch, tbodyId, badgeId) {
    const users = getUsers().filter(u => u.batch === batch);
    document.getElementById(badgeId).textContent = `${users.length} Members`;
    const tbody = document.getElementById(tbodyId);

    if (users.length === 0) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="8"><i class="fas fa-users"></i>No members in this batch yet.</td></tr>`;
        return;
    }
    tbody.innerHTML = users.map((u, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${avatarHtml(u)}</td>
            <td><strong>${u.fullName || '—'}</strong></td>
            <td><span style="background:#e8f4e8;color:#2e7d32;font-weight:700;padding:3px 10px;border-radius:8px;font-size:13px;letter-spacing:1px;">${u.alumniId || '—'}</span></td>
            <td style="font-size:12px;">${u.email || '—'}</td>
            <td>${u.phone || '—'}</td>
            <td>${u.profession || '—'}</td>
            <td style="font-size:12px;">${u.workLocation || u.address || '—'}</td>
            <td style="white-space:nowrap;">
                <button class="btn-sm btn-info" onclick="viewUser('${u.id}')"><i class="fas fa-eye"></i> View</button>
                <button class="btn-sm btn-danger" onclick="deleteUser('${u.id}')" style="margin-left:4px;"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`).join('');
}

// ===========================
//  VIEW USER MODAL
// ===========================
function viewUser(id) {
    const users = getUsers();
    const u = users.find(usr => usr.id === id);
    if (!u) return;

    const pic = u.profilePicture
        ? `<img src="${u.profilePicture}" class="profile-pic" alt="${u.fullName}">`
        : `<div class="profile-pic-placeholder">${getInitials(u.fullName)}</div>`;

    document.getElementById('modalBody').innerHTML = `
        <div class="profile-header">
            ${pic}
            <div class="profile-header-info">
                <h3>${u.fullName || '—'}</h3>
                <p style="margin:6px 0;"><span style="background:#e8f4e8;color:#2e7d32;font-weight:800;font-size:16px;padding:4px 14px;border-radius:8px;letter-spacing:2px;"><i class="fas fa-id-badge" style="margin-right:6px;"></i>${u.alumniId || 'N/A'}</span></p>
                <p style="margin:4px 0;"><i class="fas fa-envelope" style="margin-right:5px;color:#aaa;"></i>${u.email || '—'}</p>
                <span class="batch-pill ${getBatchClass(u.batch)}">${getBatchLabel(u.batch)}</span>
            </div>
        </div>
        <div class="profile-details-grid">
            ${field('Alumni ID', u.alumniId)}
            ${field('Phone', u.phone)}
            ${field('Date of Birth', u.dob)}
            ${field('Gender', u.gender)}
            ${field('Batch', getBatchLabel(u.batch))}
            ${field('Student ID', u.studentId)}
            ${field('Passing Year', u.passingYear)}
            ${field('Department', u.department)}
            ${field('Profession', u.profession)}
            ${field('Organization', u.organization)}
            ${field('Designation', u.designation)}
            ${field('Work Location', u.workLocation)}
            ${field('Address', u.address, true)}
            ${u.facebook ? `<div class="detail-item"><div class="label">Facebook</div><div class="value"><a href="${u.facebook}" target="_blank" style="color:var(--blue);">${u.facebook}</a></div></div>` : ''}
            ${u.linkedin ? `<div class="detail-item"><div class="label">LinkedIn</div><div class="value"><a href="${u.linkedin}" target="_blank" style="color:var(--blue);">${u.linkedin}</a></div></div>` : ''}
            ${field('Registered On', formatDate(u.registrationDate))}
            ${field('Status', u.status || 'active')}
        </div>
        <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;">
            <button class="btn-sm" style="background:#1565c0;color:#fff;border:none;padding:8px 18px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;" onclick="openSendMessage('${u.id}','${u.email}','${(u.fullName||'').replace(/'/g,"'")}')">
                <i class="fas fa-paper-plane"></i> Send Message
            </button>
            <button class="btn-sm btn-danger" onclick="deleteUser('${u.id}'); closeModal();">
                <i class="fas fa-trash"></i> Delete User
            </button>
        </div>`;

    document.getElementById('modalOverlay').classList.add('show');
}

function field(label, value, full = false) {
    if (!value) return '';
    return `<div class="detail-item${full ? ' full' : ''}"><div class="label">${label}</div><div class="value">${value}</div></div>`;
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('show');
}

// ===========================
//  SEND MESSAGE TO USER
// ===========================
function openSendMessage(userId, userEmail, userName) {
    closeModal();
    document.getElementById('msgToEmail').value = userEmail;
    document.getElementById('msgToName').textContent = userName + ' (' + userEmail + ')';
    document.getElementById('msgSubject').value = '';
    document.getElementById('msgBody').value = '';
    const m = document.getElementById('sendMsgModal');
    m.style.display = 'flex';
}
function closeSendMsgModal() {
    document.getElementById('sendMsgModal').style.display = 'none';
}
function sendMessageToUser() {
    const toEmail  = document.getElementById('msgToEmail').value;
    const subject  = document.getElementById('msgSubject').value.trim();
    const body     = document.getElementById('msgBody').value.trim();
    if (!subject) { showToast('Please enter a subject.', 'error'); return; }
    if (!body)    { showToast('Please enter a message.', 'error'); return; }
    const msgs = JSON.parse(localStorage.getItem('dafUserMessages')) || [];
    msgs.push({
        id: Date.now().toString(),
        to: toEmail,
        subject: subject,
        message: body,
        date: new Date().toISOString(),
        read: false
    });
    localStorage.setItem('dafUserMessages', JSON.stringify(msgs));
    closeSendMsgModal();
    showToast('Message sent to ' + toEmail + ' successfully!', 'success');
}
document.getElementById('modalOverlay').addEventListener('click', function (e) {
    if (e.target === this) closeModal();
});

// ===========================
//  DELETE USER
// ===========================
function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    let users = getUsers();
    users = users.filter(u => u.id !== id);
    saveUsers(users);
    showToast('User deleted successfully.', 'success');
    loadDashboard();

    // Refresh whichever section is open
    const active = document.querySelector('.admin-section.active');
    if (active) {
        const sec = active.id.replace('section-', '');
        if (sec === 'users') loadUsersTable(document.getElementById('batchFilter').value, document.getElementById('userSearch').value);
        if (sec === 'dakhil') loadBatchTable('dakhil2020', 'dakhilTableBody', 'dakhilCountBadge');
        if (sec === 'alim') loadBatchTable('alim2022', 'alimTableBody', 'alimCountBadge');
    }
}

function deleteAllUsers() {
    if (!confirm('⚠️ DELETE ALL USERS? This cannot be undone!')) return;
    if (!confirm('Are you absolutely sure? All user data will be permanently deleted.')) return;
    saveUsers([]);
    showToast('All users deleted.', 'error');
    loadDashboard();
    loadUsersTable();
}

// ===========================
//  ANNOUNCEMENTS
// ===========================
function getAnnouncements() {
    return JSON.parse(localStorage.getItem('dafAnnouncements')) || [];
}
function saveAnnouncements(list) {
    localStorage.setItem('dafAnnouncements', JSON.stringify(list));
}

function saveAnnouncement() {
    const title = document.getElementById('announcementTitle').value.trim();
    const msg   = document.getElementById('announcementMsg').value.trim();
    const type  = document.getElementById('announcementType').value;
    const date  = document.getElementById('announcementDate').value;
    const link  = document.getElementById('announcementLink').value.trim();

    if (!title || !msg) { showToast('Please fill in title and message.', 'error'); return; }

    const list = getAnnouncements();
    list.unshift({ id: Date.now().toString(), title, msg, type, date, link, createdAt: new Date().toISOString() });
    saveAnnouncements(list);

    document.getElementById('announcementTitle').value = '';
    document.getElementById('announcementMsg').value   = '';
    document.getElementById('announcementDate').value  = '';
    document.getElementById('announcementLink').value  = '';

    showToast('Announcement saved!', 'success');
    loadAnnouncements();
}

function loadAnnouncements() {
    const list = getAnnouncements();
    const container = document.getElementById('announcementsList');
    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = '<div class="no-announcements"><i class="fas fa-bullhorn" style="font-size:30px;margin-bottom:8px;display:block;"></i>No announcements yet.</div>';
        return;
    }
    container.innerHTML = list.map(a => `
        <div class="announcement-item">
            <div class="ann-content">
                <h4>${a.title}</h4>
                <p>${a.msg}</p>
                ${a.link ? `<p style="font-size:12px;margin-top:4px;"><i class="fas fa-link" style="margin-right:4px;color:#888;"></i><a href="${a.link}" target="_blank" style="color:var(--primary);word-break:break-all;">${a.link}</a></p>` : ''}
                <div class="ann-meta">
                    <span class="ann-type ${a.type}">${a.type}</span>
                    ${a.date ? ` &bull; ${a.date}` : ''}
                    &bull; Added ${formatDate(a.createdAt)}
                </div>
            </div>
            <div style="display:flex;gap:6px;flex-shrink:0;">
                <button class="btn-sm" style="background:#e8f5e9;color:#2e7d32;border:1px solid #c8e6c9;" onclick="viewAnnDetail('${a.id}')"><i class="fas fa-eye"></i></button>
                <button class="btn-sm" style="background:#f0f4ff;color:var(--primary);border:1px solid #d0dcff;" onclick="editAnnouncement('${a.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn-sm btn-danger" onclick="deleteAnnouncement('${a.id}')"><i class="fas fa-trash"></i></button>
            </div>
        </div>`).join('');
}

function deleteAnnouncement(id) {
    let list = getAnnouncements();
    list = list.filter(a => a.id !== id);
    saveAnnouncements(list);
    showToast('Announcement deleted.', 'success');
    loadAnnouncements();
}

function editAnnouncement(id) {
    const a = getAnnouncements().find(x => x.id === id);
    if (!a) return;
    document.getElementById('editAnnId').value    = a.id;
    document.getElementById('editAnnTitle').value = a.title;
    document.getElementById('editAnnMsg').value   = a.msg;
    document.getElementById('editAnnType').value  = a.type || 'info';
    document.getElementById('editAnnDate').value  = a.date || '';
    document.getElementById('editAnnLink').value  = a.link || '';
    const modal = document.getElementById('annEditModal');
    modal.style.display = 'flex';
    setTimeout(() => modal.style.opacity = '1', 10);
}

function closeAnnEditModal() {
    document.getElementById('annEditModal').style.display = 'none';
}

function viewAnnDetail(id) {
    const a = getAnnouncements().find(x => x.id === id);
    if (!a) return;
    const typeColors = { info:'#1565c0', success:'#2e7d32', warning:'#e65100', danger:'#c62828' };
    const color = typeColors[a.type] || '#1565c0';
    const modal = document.getElementById('annViewModal');
    document.getElementById('annViewTitle').textContent = a.title || '';
    document.getElementById('annViewMsg').textContent   = a.msg   || '';
    document.getElementById('annViewDate').textContent  = a.date  ? '📅 ' + a.date : '';
    document.getElementById('annViewCreated').textContent = '🕐 Added: ' + (a.createdAt ? new Date(a.createdAt).toLocaleString() : '');
    const badge = document.getElementById('annViewBadge');
    badge.textContent = (a.type||'info').charAt(0).toUpperCase()+(a.type||'info').slice(1);
    badge.style.background = color+'22'; badge.style.color = color;
    const linkWrap = document.getElementById('annViewLinkWrap');
    const linkEl   = document.getElementById('annViewLink');
    if (a.link) { linkEl.href = a.link; linkWrap.style.display='block'; }
    else { linkWrap.style.display='none'; }
    modal.style.display = 'flex';
    modal.onclick = e => { if (e.target === modal) modal.style.display='none'; };
}

function updateAnnouncement() {
    const id    = document.getElementById('editAnnId').value;
    const title = document.getElementById('editAnnTitle').value.trim();
    const msg   = document.getElementById('editAnnMsg').value.trim();
    const type  = document.getElementById('editAnnType').value;
    const date  = document.getElementById('editAnnDate').value;
    const link  = document.getElementById('editAnnLink').value.trim();

    if (!title || !msg) { showToast('Title and message are required.', 'error'); return; }

    const list = getAnnouncements();
    const idx  = list.findIndex(a => a.id === id);
    if (idx === -1) { showToast('Announcement not found.', 'error'); return; }

    list[idx] = { ...list[idx], title, msg, type, date, link, updatedAt: new Date().toISOString() };
    saveAnnouncements(list);
    closeAnnEditModal();
    showToast('Announcement updated!', 'success');
    loadAnnouncements();
}

// Close modal on backdrop click
document.addEventListener('click', function(e) {
    const modal = document.getElementById('annEditModal');
    if (modal && e.target === modal) closeAnnEditModal();
    const msgModal = document.getElementById('sendMsgModal');
    if (msgModal && e.target === msgModal) closeSendMsgModal();
});

// ===========================
//  EVENTS
// ===========================
function getEvents() {
    return JSON.parse(localStorage.getItem('dafEvents')) || [];
}
function saveEventsData(list) {
    localStorage.setItem('dafEvents', JSON.stringify(list));
}

function saveEvent() {
    const title    = document.getElementById('eventTitle').value.trim();
    const date     = document.getElementById('eventDate').value;
    const time     = document.getElementById('eventTime').value;
    const location = document.getElementById('eventLocation').value.trim();
    const desc     = document.getElementById('eventDesc').value.trim();
    const link     = document.getElementById('eventLink').value.trim();
    const editId   = document.getElementById('eventEditId').value;

    if (!title || !date) { showToast('Please fill in event title and date.', 'error'); return; }

    let list = getEvents();

    if (editId) {
        // UPDATE existing event
        list = list.map(ev => ev.id === editId
            ? { ...ev, title, date, time, location, desc, link }
            : ev);
        list.sort((a, b) => new Date(a.date) - new Date(b.date));
        saveEventsData(list);
        showToast('Event updated!', 'success');
    } else {
        // ADD new event
        list.push({ id: Date.now().toString(), title, date, time, location, desc, link, createdAt: new Date().toISOString() });
        list.sort((a, b) => new Date(a.date) - new Date(b.date));
        saveEventsData(list);
        showToast('Event added!', 'success');
    }

    cancelEditEvent();
    loadEvents();
}

function editEvent(id) {
    const ev = getEvents().find(e => e.id === id);
    if (!ev) return;
    document.getElementById('eventTitle').value    = ev.title    || '';
    document.getElementById('eventDate').value     = ev.date     || '';
    document.getElementById('eventTime').value     = ev.time     || '';
    document.getElementById('eventLocation').value = ev.location || '';
    document.getElementById('eventDesc').value     = ev.desc     || '';
    document.getElementById('eventLink').value     = ev.link     || '';
    document.getElementById('eventEditId').value   = ev.id;

    const saveBtn   = document.getElementById('eventSaveBtn');
    const cancelBtn = document.getElementById('eventCancelBtn');
    if (saveBtn)   { saveBtn.innerHTML   = '<i class="fas fa-save"></i> Update Event'; }
    if (cancelBtn) { cancelBtn.style.display = 'block'; }

    // Scroll form into view
    document.getElementById('eventTitle').scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById('eventTitle').focus();
}

function cancelEditEvent() {
    document.getElementById('eventTitle').value    = '';
    document.getElementById('eventDate').value     = '';
    document.getElementById('eventTime').value     = '';
    document.getElementById('eventLocation').value = '';
    document.getElementById('eventDesc').value     = '';
    document.getElementById('eventLink').value     = '';
    document.getElementById('eventEditId').value   = '';

    const saveBtn   = document.getElementById('eventSaveBtn');
    const cancelBtn = document.getElementById('eventCancelBtn');
    if (saveBtn)   { saveBtn.innerHTML   = '<i class="fas fa-plus"></i> Add Event'; }
    if (cancelBtn) { cancelBtn.style.display = 'none'; }
}

function loadEvents() {
    const list = getEvents();
    const container = document.getElementById('eventsList');
    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = '<p style="color:#aaa;font-size:13px;padding:10px 0;">No events added yet.</p>';
        return;
    }
    container.innerHTML = list.map(ev => `
        <div class="event-item">
            <div>
                <h4><i class="fas fa-calendar-alt" style="margin-right:6px;color:var(--primary);"></i>${ev.title}</h4>
                <p><i class="fas fa-map-marker-alt" style="margin-right:5px;"></i>${ev.location || '—'} &nbsp;|&nbsp; <i class="fas fa-clock" style="margin-right:5px;"></i>${ev.time || '—'}</p>
                ${ev.desc ? `<p style="margin-top:4px;">${ev.desc}</p>` : ''}
                ${ev.link ? `<p style="margin-top:4px;"><i class="fas fa-link" style="margin-right:5px;color:var(--primary);"></i><a href="${ev.link}" target="_blank" style="color:var(--primary);word-break:break-all;">${ev.link}</a></p>` : ''}
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;">
                <span class="event-date-badge">${ev.date}</span>
                <button class="btn-sm btn-primary" onclick="editEvent('${ev.id}')"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn-sm btn-danger" onclick="deleteEvent('${ev.id}')"><i class="fas fa-trash"></i></button>
            </div>
        </div>`).join('');
}

function deleteEvent(id) {
    let list = getEvents();
    list = list.filter(e => e.id !== id);
    saveEventsData(list);
    showToast('Event deleted.', 'success');
    loadEvents();
}

// ===========================
//  GALLERY  (IndexedDB — unlimited storage)
// ===========================
const _GDB = { name: 'dafGalleryDB', version: 1, store: 'photos' };

function _openGalleryDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(_GDB.name, _GDB.version);
        req.onupgradeneeded = e => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(_GDB.store))
                db.createObjectStore(_GDB.store, { keyPath: 'id' });
        };
        req.onsuccess = e => resolve(e.target.result);
        req.onerror   = e => reject(e.target.error);
    });
}
async function _dbGetAll() {
    const db = await _openGalleryDB();
    return new Promise((resolve, reject) => {
        const req = db.transaction(_GDB.store,'readonly').objectStore(_GDB.store).getAll();
        req.onsuccess = e => resolve((e.target.result || []).sort((a,b)=> new Date(a.addedAt)-new Date(b.addedAt)));
        req.onerror   = e => reject(e.target.error);
    });
}
async function _dbPut(photo) {
    const db = await _openGalleryDB();
    return new Promise((resolve, reject) => {
        const req = db.transaction(_GDB.store,'readwrite').objectStore(_GDB.store).put(photo);
        req.onsuccess = () => resolve();
        req.onerror   = e => reject(e.target.error);
    });
}
async function _dbDelete(id) {
    const db = await _openGalleryDB();
    return new Promise((resolve, reject) => {
        const req = db.transaction(_GDB.store,'readwrite').objectStore(_GDB.store).delete(id);
        req.onsuccess = () => resolve();
        req.onerror   = e => reject(e.target.error);
    });
}
async function _dbClear() {
    const db = await _openGalleryDB();
    return new Promise((resolve, reject) => {
        const req = db.transaction(_GDB.store,'readwrite').objectStore(_GDB.store).clear();
        req.onsuccess = () => resolve();
        req.onerror   = e => reject(e.target.error);
    });
}

// ── Gallery upload state ──────────────────────────────
let _pendingGalleryFiles = [];

function _readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = e => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Cannot read ' + file.name));
        reader.readAsDataURL(file);
    });
}

// Called once when Gallery section opens — sets up file input & drag/drop
function initGalleryUpload() {
    const area  = document.getElementById('fileUploadArea');
    const input = document.getElementById('galleryFileInput');
    if (!area || !input || area._galleryInited) return;
    area._galleryInited = true;

    area.addEventListener('click', function(e) {
        if (e.target !== input) { input.value = ''; input.click(); }
    });
    input.addEventListener('change', function() {
        if (this.files && this.files.length > 0) handleGalleryFiles(Array.from(this.files));
    });
    area.addEventListener('dragover', e => {
        e.preventDefault();
        area.style.borderColor = 'var(--primary)'; area.style.background = '#f0f7ff';
    });
    area.addEventListener('dragleave', () => { area.style.borderColor=''; area.style.background=''; });
    area.addEventListener('drop', e => {
        e.preventDefault();
        area.style.borderColor=''; area.style.background='';
        if (e.dataTransfer.files.length > 0) handleGalleryFiles(Array.from(e.dataTransfer.files));
    });
}

async function handleGalleryFiles(files) {
    const addBtn   = document.getElementById('galleryAddBtn');
    const progress = document.getElementById('galleryUploadProgress');
    const bar      = document.getElementById('galleryProgressBar');
    const text     = document.getElementById('galleryProgressText');
    const label    = document.getElementById('fileUploadLabel');
    const preview  = document.getElementById('galleryPreviewRow');

    _pendingGalleryFiles = [];
    if (preview) preview.innerHTML = '';
    if (addBtn)  { addBtn.disabled = true; addBtn.style.opacity = '0.5'; }
    if (progress) progress.style.display = 'block';

    for (let i = 0; i < files.length; i++) {
        if (bar)  bar.style.width  = Math.round((i / files.length) * 100) + '%';
        if (text) text.textContent = `Reading ${i + 1} of ${files.length}...`;
        try {
            const dataUrl = await _readFileAsDataURL(files[i]);
            _pendingGalleryFiles.push(dataUrl);
            if (preview) {
                const img = document.createElement('img');
                img.src = dataUrl;
                img.style.cssText = 'width:100%;aspect-ratio:1/1;object-fit:cover;object-position:center;border-radius:8px;border:2px solid #ddd;display:block;';
                preview.appendChild(img);
            }
        } catch(e) { console.warn(e); }
    }

    if (bar)   bar.style.width   = '100%';
    if (text)  text.textContent  = `✓ ${_pendingGalleryFiles.length} photo(s) ready to add`;
    if (label) label.textContent = `${_pendingGalleryFiles.length} photo(s) selected`;
    if (addBtn && _pendingGalleryFiles.length > 0) { addBtn.disabled = false; addBtn.style.opacity = '1'; }
}

function _resetGalleryForm() {
    _pendingGalleryFiles = [];
    const els = { input:'galleryFileInput', preview:'galleryPreviewRow', label:'fileUploadLabel',
                  progress:'galleryUploadProgress', bar:'galleryProgressBar',
                  addBtn:'galleryAddBtn', caption:'galleryCaption' };
    const g = id => document.getElementById(id);
    if (g(els.input))    g(els.input).value          = '';
    if (g(els.preview))  g(els.preview).innerHTML    = '';
    if (g(els.label))    g(els.label).textContent    = 'Click to choose photos or drag & drop here';
    if (g(els.bar))      g(els.bar).style.width      = '0%';
    if (g(els.progress)) g(els.progress).style.display = 'none';
    if (g(els.caption))  g(els.caption).value        = '';
    if (g(els.addBtn))   { g(els.addBtn).disabled = true; g(els.addBtn).style.opacity = '0.5'; }
}

async function addGalleryPhoto() {
    const caption = (document.getElementById('galleryCaption').value || '').trim();
    if (_pendingGalleryFiles.length === 0) {
        showToast('Please select at least one photo first.', 'error'); return;
    }
    const count = _pendingGalleryFiles.length;
    for (const dataUrl of _pendingGalleryFiles) {
        await _dbPut({
            id: Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,7),
            url: dataUrl, caption, addedAt: new Date().toISOString()
        });
    }
    _resetGalleryForm();
    showToast(`${count} photo(s) added to gallery!`, 'success');
    await renderAdminGalleryGrid();
}

async function deleteGalleryPhoto(id) {
    await _dbDelete(id);
    showToast('Photo removed.', 'success');
    await renderAdminGalleryGrid();
}

async function clearAllGallery() {
    if (!confirm('Remove ALL photos from the gallery?')) return;
    await _dbClear();
    showToast('Gallery cleared.', 'success');
    await renderAdminGalleryGrid();
}

async function renderAdminGalleryGrid() {
    const grid = document.getElementById('adminGalleryGrid');
    if (!grid) return;
    const list = await _dbGetAll();

    const countEl = document.getElementById('galleryCount');
    if (countEl) countEl.textContent = list.length ? `(${list.length})` : '';

    const storageEl = document.getElementById('storageInfo');
    if (storageEl) storageEl.innerHTML = `<span style="color:#27ae60;font-weight:600;">Unlimited (IndexedDB)</span>`;

    if (list.length === 0) {
        grid.innerHTML = '<p style="color:#aaa;font-size:13px;padding:10px;">No photos added yet.</p>';
        return;
    }
    grid.innerHTML = list.map(p => `
        <div style="position:relative;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.12);aspect-ratio:4/3;background:#e8e8e8;">
            <img src="${p.url}" alt="${p.caption || 'Gallery'}"
                 style="width:100%;height:100%;object-fit:cover;object-position:center;display:block;">
            ${p.caption ? `<div style="position:absolute;bottom:0;left:0;right:0;font-size:11px;padding:5px 8px;background:rgba(0,0,0,0.55);color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.caption}</div>` : ''}
            <button onclick="deleteGalleryPhoto('${p.id}')"
                style="position:absolute;top:6px;right:6px;background:rgba(220,53,69,0.9);border:none;color:#fff;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;line-height:1;">
                <i class="fas fa-times"></i>
            </button>
        </div>`).join('');
}

async function loadAdminGallery() {
    initGalleryUpload();
    await renderAdminGalleryGrid();
}

// ===========================
//  CONTACT US
// ===========================
const CONTACT_KEY = 'dafContactInfo';

function getContactData() {
    return JSON.parse(localStorage.getItem(CONTACT_KEY)) || {};
}

function loadContactSection() {
    const d = getContactData();
    const defaults = {
        ctcAddrEn:   d.addrEn   || 'Darunnazat Alumni Forum (DAF)\nEast Boxnagar, Sarulia, Demra, Dhaka\u20131361, Bangladesh',
        ctcAddrBn:   d.addrBn   || '\u09a6\u09be\u09b0\u09c1\u09a8\u09a8\u09be\u099c\u09be\u09a4 \u0985\u09cd\u09af\u09be\u09b2\u09be\u09ae\u09a8\u09be\u0987 \u09ab\u09cb\u09b0\u09be\u09ae (DAF)\n\u09aa\u09c2\u09b0\u09cd\u09ac \u09ac\u0995\u09cd\u09b8\u09a8\u0997\u09b0, \u09b8\u09be\u09b0\u09c1\u09b2\u09bf\u09af\u09bc\u09be, \u09a1\u09c7\u09ae\u09b0\u09be, \u09a2\u09be\u0995\u09be\u201313\u09ec1, \u09ac\u09be\u0982\u09b2\u09be\u09a6\u09c7\u09b6',
        ctcPhone:    d.phone    || '+880 963 851 0916',
        ctcEmail:    d.email    || 'alumni.dskmaa2025@gmail.com',
        ctcFacebook: d.facebook || '',
        ctcTwitter:  d.twitter  || '',
        ctcLinkedin: d.linkedin || '',
        ctcInstagram:d.instagram|| '',
    };
    Object.entries(defaults).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    });
}

function saveContactSection() {
    const g = id => (document.getElementById(id)||{}).value||'';
    const data = {
        addrEn:   g('ctcAddrEn'),
        addrBn:   g('ctcAddrBn'),
        phone:    g('ctcPhone'),
        email:    g('ctcEmail'),
        facebook: g('ctcFacebook').replace(/^\s+|\s+$/g,''),
        twitter:  g('ctcTwitter').replace(/^\s+|\s+$/g,''),
        linkedin: g('ctcLinkedin').replace(/^\s+|\s+$/g,''),
        instagram:g('ctcInstagram').replace(/^\s+|\s+$/g,''),
    };
    // Auto-prefix https:// if missing
    ['facebook','twitter','linkedin','instagram'].forEach(k => {
        if (data[k] && !/^https?:\/\//i.test(data[k])) data[k] = 'https://' + data[k];
    });
    localStorage.setItem(CONTACT_KEY, JSON.stringify(data));
    showToast('Contact info saved!', 'success');
}

// Contact Messages Inbox
function updateInboxBadge() {
    const msgs = JSON.parse(localStorage.getItem('dafContactMessages')) || [];
    const unread = msgs.filter(m => !m.read).length;
    const badge = document.getElementById('sidebarInboxCount');
    if (!badge) return;
    if (unread > 0) { badge.textContent = unread; badge.style.display = ''; }
    else { badge.style.display = 'none'; }
}

function loadContactMessages() {
    const msgs = JSON.parse(localStorage.getItem('dafContactMessages')) || [];
    const container = document.getElementById('inboxMsgContainer');
    if (!container) return;
    const unread = msgs.filter(m => !m.read).length;
    container.innerHTML = `
        <div class="admin-card">
            <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
                <h3><i class="fas fa-inbox"></i> All Messages
                    ${unread > 0 ? `<span style="background:#e74c3c;color:#fff;font-size:11px;font-weight:700;padding:2px 9px;border-radius:10px;margin-left:8px;">${unread} new</span>` : ''}
                </h3>
                ${msgs.length > 0 ? `<button class="btn-sm btn-danger" onclick="clearContactMessages()"><i class="fas fa-trash"></i> Clear All</button>` : ''}
            </div>
            <div style="padding:0 4px 8px;">
            ${msgs.length === 0
                ? `<p style="text-align:center;color:#aaa;padding:40px 0;"><i class="fas fa-inbox" style="font-size:36px;display:block;margin-bottom:10px;opacity:0.3;"></i>No messages yet.</p>`
                : msgs.map(m => `
                <div id="cmsg_${m.id}" style="border:1px solid ${m.read ? '#eee' : '#d0e8ff'};background:${m.read ? '#fafafa' : '#f0f7ff'};border-radius:10px;padding:14px 16px;margin-bottom:10px;">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
                        <div style="flex:1;min-width:0;">
                            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap;">
                                <strong style="font-size:14px;">${m.name}</strong>
                                ${!m.read ? '<span style="background:#e74c3c;color:#fff;font-size:10px;padding:1px 7px;border-radius:8px;">New</span>' : ''}
                                ${m.batch ? `<span style="background:#e8f4e8;color:#2e7d32;font-size:11px;padding:1px 7px;border-radius:8px;">${m.batch}</span>` : ''}
                            </div>
                            <div style="font-size:12px;color:#888;margin-bottom:6px;">
                                <a href="mailto:${m.email}" style="color:var(--primary);">${m.email}</a>
                                &bull; ${formatDate(m.sentAt)}
                            </div>
                            <p style="font-size:13px;color:#333;margin:0;white-space:pre-wrap;">${m.message}</p>
                        </div>
                        <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0;">
                            ${!m.read ? `<button class="btn-sm" style="background:#e8f4e8;color:#2e7d32;border:1px solid #c8e6c9;font-size:11px;" onclick="markMsgRead('${m.id}')"><i class="fas fa-check"></i> Read</button>` : ''}
                            <button class="btn-sm btn-danger" onclick="deleteContactMsg('${m.id}')"><i class="fas fa-times"></i></button>
                        </div>
                    </div>
                </div>`).join('')}
            </div>
        </div>`;
    // Mark all as read after viewing
    if (msgs.some(m => !m.read)) {
        const updated = msgs.map(m => ({...m, read: true}));
        localStorage.setItem('dafContactMessages', JSON.stringify(updated));
        updateInboxBadge();
    }
}

function markMsgRead(id) {
    const msgs = JSON.parse(localStorage.getItem('dafContactMessages')) || [];
    const idx = msgs.findIndex(m => m.id === id);
    if (idx !== -1) { msgs[idx].read = true; localStorage.setItem('dafContactMessages', JSON.stringify(msgs)); }
    updateInboxBadge();
    loadContactMessages();
}

function deleteContactMsg(id) {
    let msgs = JSON.parse(localStorage.getItem('dafContactMessages')) || [];
    msgs = msgs.filter(m => m.id !== id);
    localStorage.setItem('dafContactMessages', JSON.stringify(msgs));
    updateInboxBadge();
    showToast('Message deleted.', 'success');
    loadContactMessages();
}

function clearContactMessages() {
    if (!confirm('Delete ALL messages?')) return;
    localStorage.removeItem('dafContactMessages');
    updateInboxBadge();
    showToast('All messages cleared.', 'success');
    loadContactMessages();
}

// ===========================
//  ABOUT US
// ===========================
const ABOUT_KEY = 'dafAboutContent';

function getAboutData() {
    return JSON.parse(localStorage.getItem(ABOUT_KEY)) || {};
}

function loadAboutSection() {
    const d = getAboutData();
    const fields = [
        ['aboutDescEn',    d.descEn    || 'Darunnazat Alumni Forum (DAF) is an organization of former students of Dakhil 2020 and Alim 2022 batches of Darunnazat Siddikia Kamil Madrasah. Our goal is to strengthen relationships among all alumni, contribute to the development of educational institutions and participate in social service work.'],
        ['aboutDescBn',    d.descBn    || 'দারুননাজাত অ্যালামনাই ফোরাম (DAF) দারুননাজাত সিদ্দিকিয়া কামিল মাদ্রাসার দাখিল ২০২০ ও আলিম ২০২২ ব্যাচের প্রাক্তন শিক্ষার্থীদের একটি সংগঠন।'],
        ['aboutStat1Val',  d.stat1Val  || '৫০০+'],
        ['aboutStat1LblEn',d.stat1LblEn|| 'Alumni Members'],
        ['aboutStat1LblBn',d.stat1LblBn|| 'আলামনাই সদস্য'],
        ['aboutStat2Val',  d.stat2Val  || '২০+'],
        ['aboutStat2LblEn',d.stat2LblEn|| 'Events Organized'],
        ['aboutStat2LblBn',d.stat2LblBn|| 'ইভেন্ট আয়োজিত'],
        ['aboutStat3Val',  d.stat3Val  || '১৫+'],
        ['aboutStat3LblEn',d.stat3LblEn|| 'Social Services'],
        ['aboutStat3LblBn',d.stat3LblBn|| 'সমাজসেবা কার্যক্রম'],
        ['aboutMissionEn', d.missionEn || 'To increase unity and cooperation among alumni, contribute to the development of educational institutions and work for the welfare of society.'],
        ['aboutMissionBn', d.missionBn || 'প্রাক্তন শিক্ষার্থীদের মধ্যে ঐক্য ও সহযোগিতা বৃদ্ধি করা, শিক্ষা প্রতিষ্ঠানের উন্নয়নে অবদান রাখা এবং সমাজের কল্যাণে কাজ করা।'],
        ['aboutVisionEn',  d.visionEn  || 'To build a strong and active alumni network that will play a leading role in education and social service.'],
        ['aboutVisionBn',  d.visionBn  || 'একটি শক্তিশালী ও সক্রিয় আলামনাই নেটওয়ার্ক গড়ে তোলা যা শিক্ষা ও সমাজসেবায় অগ্রণী ভূমিকা পালন করবে।'],
    ];
    fields.forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    });
}

function saveAboutSection() {
    const g = id => (document.getElementById(id)||{}).value||'';
    const data = {
        descEn:     g('aboutDescEn'),
        descBn:     g('aboutDescBn'),
        stat1Val:   g('aboutStat1Val'),
        stat1LblEn: g('aboutStat1LblEn'),
        stat1LblBn: g('aboutStat1LblBn'),
        stat2Val:   g('aboutStat2Val'),
        stat2LblEn: g('aboutStat2LblEn'),
        stat2LblBn: g('aboutStat2LblBn'),
        stat3Val:   g('aboutStat3Val'),
        stat3LblEn: g('aboutStat3LblEn'),
        stat3LblBn: g('aboutStat3LblBn'),
        missionEn:  g('aboutMissionEn'),
        missionBn:  g('aboutMissionBn'),
        visionEn:   g('aboutVisionEn'),
        visionBn:   g('aboutVisionBn'),
    };
    if (!data.descEn && !data.descBn) { showToast('Please fill in the description.', 'error'); return; }
    localStorage.setItem(ABOUT_KEY, JSON.stringify(data));
    showToast('About Us saved!', 'success');
}

// ===========================
//  HERO SLIDES  (IndexedDB)
// ===========================
const _HDB = { name: 'dafHeroDB', version: 1, store: 'slides' };

function _openHeroDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(_HDB.name, _HDB.version);
        req.onupgradeneeded = e => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(_HDB.store))
                db.createObjectStore(_HDB.store, { keyPath: 'id' });
        };
        req.onsuccess = e => resolve(e.target.result);
        req.onerror   = e => reject(e.target.error);
    });
}
async function _heroGetAll() {
    const db = await _openHeroDB();
    return new Promise((resolve, reject) => {
        const req = db.transaction(_HDB.store,'readonly').objectStore(_HDB.store).getAll();
        req.onsuccess = e => resolve((e.target.result||[]).sort((a,b)=>a.order-b.order));
        req.onerror   = e => reject(e.target.error);
    });
}
async function _heroPut(slide) {
    const db = await _openHeroDB();
    return new Promise((resolve, reject) => {
        const req = db.transaction(_HDB.store,'readwrite').objectStore(_HDB.store).put(slide);
        req.onsuccess = () => resolve();
        req.onerror   = e => reject(e.target.error);
    });
}
async function _heroDelete(id) {
    const db = await _openHeroDB();
    return new Promise((resolve, reject) => {
        const req = db.transaction(_HDB.store,'readwrite').objectStore(_HDB.store).delete(id);
        req.onsuccess = () => resolve();
        req.onerror   = e => reject(e.target.error);
    });
}
async function _heroClear() {
    const db = await _openHeroDB();
    return new Promise((resolve, reject) => {
        const req = db.transaction(_HDB.store,'readwrite').objectStore(_HDB.store).clear();
        req.onsuccess = () => resolve();
        req.onerror   = e => reject(e.target.error);
    });
}

let _pendingHeroFiles = [];

function initHeroUpload() {
    const area  = document.getElementById('heroUploadArea');
    const input = document.getElementById('heroFileInput');
    if (!area || !input || area._heroInited) return;
    area._heroInited = true;
    area.addEventListener('click', e => { if (e.target !== input) { input.value=''; input.click(); } });
    input.addEventListener('change', function() {
        if (this.files && this.files.length > 0) handleHeroFiles(Array.from(this.files));
    });
    area.addEventListener('dragover', e => { e.preventDefault(); area.style.borderColor='var(--primary)'; area.style.background='#f0f7ff'; });
    area.addEventListener('dragleave', () => { area.style.borderColor=''; area.style.background=''; });
    area.addEventListener('drop', e => {
        e.preventDefault(); area.style.borderColor=''; area.style.background='';
        if (e.dataTransfer.files.length > 0) handleHeroFiles(Array.from(e.dataTransfer.files));
    });
}

async function handleHeroFiles(files) {
    const addBtn   = document.getElementById('heroAddBtn');
    const progress = document.getElementById('heroUploadProgress');
    const bar      = document.getElementById('heroProgressBar');
    const text     = document.getElementById('heroProgressText');
    const label    = document.getElementById('heroUploadLabel');
    const preview  = document.getElementById('heroPreviewRow');
    _pendingHeroFiles = [];
    if (preview) preview.innerHTML = '';
    if (addBtn) { addBtn.disabled=true; addBtn.style.opacity='0.5'; }
    if (progress) progress.style.display='block';
    for (let i=0; i<files.length; i++) {
        if (bar) bar.style.width = Math.round(i/files.length*100)+'%';
        if (text) text.textContent = `Reading ${i+1} of ${files.length}...`;
        try {
            const dataUrl = await _readFileAsDataURL(files[i]);
            _pendingHeroFiles.push(dataUrl);
            if (preview) {
                const img = document.createElement('img');
                img.src = dataUrl;
                img.style.cssText = 'width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:8px;border:2px solid #ddd;display:block;';
                preview.appendChild(img);
            }
        } catch(e) { console.warn(e); }
    }
    if (bar) bar.style.width='100%';
    if (text) text.textContent = `✓ ${_pendingHeroFiles.length} photo(s) ready`;
    if (label) label.textContent = `${_pendingHeroFiles.length} photo(s) selected`;
    if (addBtn && _pendingHeroFiles.length > 0) { addBtn.disabled=false; addBtn.style.opacity='1'; }
}

async function addHeroSlides() {
    if (_pendingHeroFiles.length === 0) { showToast('Please select photos first.','error'); return; }
    const existing = await _heroGetAll();
    let order = existing.length;
    for (const dataUrl of _pendingHeroFiles) {
        await _heroPut({ id: Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6), url: dataUrl, order: order++, addedAt: new Date().toISOString() });
    }
    _pendingHeroFiles = [];
    // Reset form
    const els = ['heroFileInput','heroPreviewRow','heroProgressBar','heroUploadProgress','heroAddBtn'];
    els.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (id==='heroFileInput') el.value='';
        else if (id==='heroPreviewRow') el.innerHTML='';
        else if (id==='heroProgressBar') el.style.width='0%';
        else if (id==='heroUploadProgress') el.style.display='none';
        else if (id==='heroAddBtn') { el.disabled=true; el.style.opacity='0.5'; }
    });
    const lbl = document.getElementById('heroUploadLabel');
    if (lbl) lbl.textContent='Click to choose photos or drag & drop here';
    showToast('Slides added!','success');
    await renderHeroSlideGrid();
}

async function deleteHeroSlide(id) {
    await _heroDelete(id);
    // Re-order remaining
    const list = await _heroGetAll();
    for (let i=0; i<list.length; i++) { list[i].order=i; await _heroPut(list[i]); }
    showToast('Slide removed.','success');
    await renderHeroSlideGrid();
}

async function clearAllHeroSlides() {
    if (!confirm('Remove ALL hero slides? Default image will be used.')) return;
    await _heroClear();
    showToast('All slides cleared.','success');
    await renderHeroSlideGrid();
}

async function renderHeroSlideGrid() {
    const grid = document.getElementById('heroSlideGrid');
    if (!grid) return;
    const list = await _heroGetAll();
    const countEl = document.getElementById('heroSlideCount');
    if (countEl) countEl.textContent = list.length ? `(${list.length})` : '';
    if (list.length === 0) {
        grid.innerHTML = '<p style="color:#aaa;font-size:13px;padding:10px;">No slides added. Default image will show on website.</p>';
        return;
    }
    grid.innerHTML = list.map((p,i) => `
        <div style="position:relative;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.12);aspect-ratio:16/9;background:#e8e8e8;">
            <img src="${p.url}" style="width:100%;height:100%;object-fit:cover;object-position:center;display:block;">
            <div style="position:absolute;top:6px;left:8px;background:rgba(0,0,0,0.6);color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;">${i+1}</div>
            <button onclick="deleteHeroSlide('${p.id}')"
                style="position:absolute;top:6px;right:6px;background:rgba(220,53,69,0.9);border:none;color:#fff;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;line-height:1;">
                <i class="fas fa-times"></i>
            </button>
        </div>`).join('');
}

async function loadAdminHeroSlides() {
    initHeroUpload();
    await renderHeroSlideGrid();
}

// ===========================
//  SITE SETTINGS
// ===========================
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('dafSettings')) || {};
    const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
    set('settingOrgEn', settings.orgEn);
    set('settingOrgBn', settings.orgBn);
    set('settingAddressEn', settings.addressEn);
    set('settingAddressBn', settings.addressBn);
    set('settingPhone', settings.phone);
    set('settingEmail', settings.email);
    set('settingFacebook', settings.facebook);
    set('settingHeroSub', settings.heroSub);
}

function saveContactSettings() {
    const settings = {
        orgEn: document.getElementById('settingOrgEn').value.trim(),
        orgBn: document.getElementById('settingOrgBn').value.trim(),
        addressEn: document.getElementById('settingAddressEn').value.trim(),
        addressBn: document.getElementById('settingAddressBn').value.trim(),
        phone: document.getElementById('settingPhone').value.trim(),
        email: document.getElementById('settingEmail').value.trim(),
        facebook: document.getElementById('settingFacebook').value.trim(),
        heroSub: document.getElementById('settingHeroSub').value.trim(),
    };
    localStorage.setItem('dafSettings', JSON.stringify(settings));
    showToast('Settings saved successfully!', 'success');
}

// ===========================
//  CHANGE ADMIN PASSWORD
// ===========================
function changeAdminPassword() {
    const pw = document.getElementById('newAdminPw').value;
    const cpw = document.getElementById('confirmAdminPw').value;
    if (!pw || pw.length < 6) { showToast('Password must be at least 6 characters.', 'error'); return; }
    if (pw !== cpw) { showToast('Passwords do not match.', 'error'); return; }
    localStorage.setItem('dafAdminPw', pw);
    document.getElementById('newAdminPw').value = '';
    document.getElementById('confirmAdminPw').value = '';
    showToast('Admin password updated!', 'success');
}

// ===========================
//  TOAST
// ===========================
let toastTimer;
function showToast(msg, type = 'info') {
    const toast = document.getElementById('toast');
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    toast.innerHTML = `<span>${icons[type] || icons.info}</span> ${msg}`;
    toast.className = `toast show ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.classList.remove('show'); }, 3000);
}
