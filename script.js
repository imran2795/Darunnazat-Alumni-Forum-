// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

// Language Switcher
let currentLang = 'en'; // Default language is English

const langButtons = document.querySelectorAll('.lang-btn');

langButtons.forEach(button => {
    button.addEventListener('click', () => {
        const lang = button.getAttribute('data-lang');
        if (lang !== currentLang) {
            currentLang = lang;
            
            // Update active state
            langButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Switch language
            switchLanguage(lang);
        }
    });
});

function switchLanguage(lang) {
    // Update all elements with data-en and data-bn attributes
    document.querySelectorAll('[data-en][data-bn]').forEach(element => {
        if (lang === 'en') {
            // Check if it's an input/textarea placeholder
            if (element.hasAttribute('data-placeholder-en')) {
                element.placeholder = element.getAttribute('data-placeholder-en');
            } else {
                element.innerHTML = element.getAttribute('data-en');
            }
        } else {
            // Bangla
            if (element.hasAttribute('data-placeholder-bn')) {
                element.placeholder = element.getAttribute('data-placeholder-bn');
            } else {
                element.innerHTML = element.getAttribute('data-bn');
            }
        }
    });
    
    // Update batch buttons text
    document.querySelectorAll('.batch-btn').forEach(btn => {
        if (lang === 'en') {
            btn.innerHTML = btn.getAttribute('data-en');
        } else {
            btn.innerHTML = btn.getAttribute('data-bn');
        }
    });
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    
    // Store preference
    localStorage.setItem('preferredLanguage', lang);
}

// Load saved language preference
window.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && savedLang !== currentLang) {
        currentLang = savedLang;
        langButtons.forEach(btn => {
            if (btn.getAttribute('data-lang') === savedLang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        switchLanguage(savedLang);
    }
});

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    
    // Hamburger animation
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = navMenu.classList.contains('active') ? 'rotate(45deg) translate(5px, 5px)' : 'none';
    spans[1].style.opacity = navMenu.classList.contains('active') ? '0' : '1';
    spans[2].style.transform = navMenu.classList.contains('active') ? 'rotate(-45deg) translate(7px, -6px)' : 'none';
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu li a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    });
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    const hash = anchor.getAttribute('href');
    if (!hash || hash === '#') return; // skip plain # links (e.g. social icons)
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar Scroll Effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Alumni Filter Functionality
const batchButtons = document.querySelectorAll('.batch-btn');
const alumniCards = document.querySelectorAll('.alumni-card');

batchButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        batchButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');
        
        const batch = button.getAttribute('data-batch');
        
        alumniCards.forEach(card => {
            if (batch === 'all') {
                card.style.display = 'block';
                card.classList.add('fade-in');
            } else {
                if (card.getAttribute('data-batch') === batch) {
                    card.style.display = 'block';
                    card.classList.add('fade-in');
                } else {
                    card.style.display = 'none';
                }
            }
        });
    });
});

// Scroll Animation for Elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe all sections and cards
document.querySelectorAll('section, .alumni-card, .event-card, .gallery-item, .stat-item, .mission-card, .vision-card').forEach(el => {
    observer.observe(el);
});

// Contact Form Submission
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name    = document.getElementById('name').value.trim();
    const email   = document.getElementById('email').value.trim();
    const batch   = document.getElementById('batch').value.trim();
    const message = document.getElementById('message').value.trim();
    
    // Simple validation
    if (!name || !email || !message) {
        alert('অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন।');
        return;
    }
    
    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert('অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা প্রদান করুন।');
        return;
    }

    // Save to localStorage for admin inbox
    const msgs = JSON.parse(localStorage.getItem('dafContactMessages')) || [];
    msgs.unshift({
        id: Date.now().toString(),
        name, email, batch, message,
        sentAt: new Date().toISOString(),
        read: false
    });
    localStorage.setItem('dafContactMessages', JSON.stringify(msgs));
    
    // Success message
    alert(`ধন্যবাদ ${name}! আপনার বার্তা সফলভাবে পাঠানো হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।`);
    
    // Reset form
    contactForm.reset();
});

// ---- Live Alumni Stats ----
function animateCountTo(el, newVal) {
    if (!el) return;
    const current = parseInt(el.textContent) || 0;
    if (current === newVal) return;
    let start = current;
    const step = Math.ceil(Math.abs(newVal - start) / 30);
    const dir = newVal > start ? 1 : -1;
    const timer = setInterval(() => {
        start += dir * step;
        if ((dir === 1 && start >= newVal) || (dir === -1 && start <= newVal)) {
            el.textContent = newVal;
            clearInterval(timer);
        } else {
            el.textContent = start;
        }
    }, 30);
}

function updateLiveStats() {
    const users = JSON.parse(localStorage.getItem('alumniUsers')) || [];
    const events = JSON.parse(localStorage.getItem('dafEvents')) || [];
    const total      = users.length;
    const dakhil     = users.filter(u => u.batch === 'dakhil2020').length;
    const alim       = users.filter(u => u.batch === 'alim2022').length;
    const evCount    = events.length;
    const professions = new Set(users.map(u => (u.profession || '').trim().toLowerCase()).filter(Boolean)).size;

    // About section stats
    animateCountTo(document.getElementById('liveStatTotal'),  total);
    animateCountTo(document.getElementById('liveStatDakhil'), dakhil);
    animateCountTo(document.getElementById('liveStatAlim'),   alim);
    animateCountTo(document.getElementById('liveStatEvents'), evCount);

    // Our Alumni section stats
    animateCountTo(document.getElementById('alumSecTotal'),      total);
    animateCountTo(document.getElementById('alumSecDakhil'),     dakhil);
    animateCountTo(document.getElementById('alumSecAlim'),       alim);
    animateCountTo(document.getElementById('alumSecProfessions'), professions);
}

// Update on load and every 5 seconds
updateLiveStats();
setInterval(updateLiveStats, 5000);
// Also update when another tab/window changes localStorage
window.addEventListener('storage', updateLiveStats);

// Gallery Item Click (Placeholder for modal functionality)
document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
        // This can be extended to open a modal with the full image
        alert('গ্যালারি ফিচার শীঘ্রই আসছে!');
    });
});

// Event Card Hover Effect Enhancement
document.querySelectorAll('.event-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
    });
});

// Dynamic Year in Footer
const currentYear = new Date().getFullYear();
const footerYear = document.querySelector('.footer-bottom p');
if (footerYear) {
    footerYear.innerHTML = footerYear.innerHTML.replace('২০২৫', currentYear);
}

// Loading Animation (Optional)
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Add active state to navigation based on scroll position
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-menu a');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active');
        }
    });
});

// Add smooth reveal effect for images when they load
document.querySelectorAll('img').forEach(img => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.5s ease';
    
    img.addEventListener('load', () => {
        img.style.opacity = '1';
    });
});

// Update Alumni Stats dynamically
function updateAlumniStats() {
    const alumniUsers = JSON.parse(localStorage.getItem('alumniUsers')) || [];
    const totalAlumni = alumniUsers.length;
    
    // Update total alumni count
    const statCards = document.querySelectorAll('.stat-card h3');
    if (statCards.length > 0) {
        statCards[0].textContent = totalAlumni > 0 ? totalAlumni + '+' : '0';
    }
}

// Call on page load
if (document.querySelector('.alumni-stats-grid')) {
    updateAlumniStats();
}

// Print console message
console.log('%cদারুননাজাত অ্যালামনাই ফোরাম (দাখিল ২০২০ এবং আলিম ২০২২) | Darunnazat Alumni Forum (Dakhil 2020 and Alim 2022) - DAF', 'color: #2c5f2d; font-size: 20px; font-weight: bold;');
console.log('%cদাখিল ২০২০ | আলিম ২০২২', 'color: #97bc62; font-size: 16px;');
console.log('%cWebsite developed with ❤️', 'color: #ff6b35; font-size: 14px;');

// ===== LOAD EVENTS FROM ADMIN =====
(function loadWebsiteEvents() {
    const grid = document.getElementById('eventsGrid');
    if (!grid) return;

    const events = JSON.parse(localStorage.getItem('dafEvents')) || [];
    const MONTHS = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
    const today = new Date(); today.setHours(0,0,0,0);

    if (events.length === 0) {
        grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:50px 20px;color:#888;">
                <i class="fas fa-calendar-times" style="font-size:40px;margin-bottom:12px;display:block;color:#ccc;"></i>
                <p style="font-size:15px;">No upcoming events at the moment. Check back soon!</p>
            </div>`;
        return;
    }

    grid.innerHTML = events.map(ev => {
        const d = ev.date ? new Date(ev.date + 'T00:00:00') : null;
        const isPast = d && d < today;
        const day    = d ? d.getDate() : '--';
        const month  = d ? MONTHS[d.getMonth()] : '';
        const year   = d ? d.getFullYear() : '';
        const badge  = isPast
            ? '<span class="event-badge past-badge"><i class="fas fa-check-circle"></i> Completed</span>'
            : '<span class="event-badge upcoming-badge">Upcoming</span>';
        const timeStr = ev.time
            ? (() => { const [h,m] = ev.time.split(':'); const hr = +h; return `${hr > 12 ? hr-12 : hr || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`; })()
            : '';
        const countdownHtml = isPast
            ? `<div class="event-countdown ended"><i class="fas fa-check-circle"></i> Completed</div>`
            : `<div class="event-countdown" id="cd-${ev.id}"
                   data-date="${ev.date}" data-time="${ev.time || '00:00'}"></div>`;

        return `
        <div class="event-card ${isPast ? 'past' : 'upcoming'}">
            <div class="event-date">
                <span class="day">${day}</span>
                <span class="month">${month}</span>
                <span class="year">${year}</span>
            </div>
            <div class="event-content">
                ${badge}
                <h3>${ev.title}</h3>
                ${ev.location ? `<p><i class="fas fa-map-marker-alt"></i> ${ev.location}</p>` : ''}
                ${timeStr ? `<p><i class="fas fa-clock"></i> ${timeStr}</p>` : ''}
                ${countdownHtml}
                ${ev.desc ? `<p class="event-desc">${ev.desc}</p>` : ''}
                ${ev.link ? `<a href="${ev.link}" target="_blank" rel="noopener noreferrer" class="event-link-btn"><i class="fas fa-external-link-alt"></i> View Details / Register</a>` : ''}
            </div>
        </div>`;
    }).join('');

    // Start live countdown tickers
    function updateCountdowns() {
        document.querySelectorAll('.event-countdown[id^="cd-"]').forEach(el => {
            const date = el.dataset.date;
            const time = el.dataset.time || '00:00';
            const target = new Date(`${date}T${time}:00`);
            const now  = new Date();
            const diff = target - now;

            if (diff <= 0) {
                el.className = 'event-countdown ended';
                el.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
                return;
            }

            const days  = Math.floor(diff / 86400000);
            const hours = Math.floor((diff % 86400000) / 3600000);
            const mins  = Math.floor((diff % 3600000)  / 60000);
            const secs  = Math.floor((diff % 60000)    / 1000);

            el.innerHTML = `
                <span class="cd-label">Starts in</span>
                <div class="cd-blocks">
                    <div class="cd-block"><span class="cd-num">${String(days).padStart(2,'0')}</span><span class="cd-unit">Days</span></div>
                    <span class="cd-sep">:</span>
                    <div class="cd-block"><span class="cd-num">${String(hours).padStart(2,'0')}</span><span class="cd-unit">Hrs</span></div>
                    <span class="cd-sep">:</span>
                    <div class="cd-block"><span class="cd-num">${String(mins).padStart(2,'0')}</span><span class="cd-unit">Min</span></div>
                    <span class="cd-sep">:</span>
                    <div class="cd-block"><span class="cd-num">${String(secs).padStart(2,'0')}</span><span class="cd-unit">Sec</span></div>
                </div>`;
        });
    }
    updateCountdowns();
    setInterval(updateCountdowns, 1000);
})();

// ===== LOAD GALLERY FROM ADMIN =====
// ===== LOAD GALLERY FROM ADMIN (IndexedDB) =====
(function() {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;

    const DB = { name: 'dafGalleryDB', version: 1, store: 'photos' };
    function openDB() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(DB.name, DB.version);
            req.onupgradeneeded = e => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(DB.store))
                    db.createObjectStore(DB.store, { keyPath: 'id' });
            };
            req.onsuccess = e => resolve(e.target.result);
            req.onerror   = e => reject(e.target.error);
        });
    }

    openDB().then(db => {
        const req = db.transaction(DB.store,'readonly').objectStore(DB.store).getAll();
        req.onsuccess = e => {
            const photos = (e.target.result || []).sort((a,b)=> new Date(a.addedAt)-new Date(b.addedAt));
            if (photos.length === 0) {
                grid.innerHTML = `
                    <div style="grid-column:1/-1;text-align:center;padding:50px 20px;color:#888;">
                        <i class="fas fa-images" style="font-size:40px;margin-bottom:12px;display:block;color:#ccc;"></i>
                        <p style="font-size:15px;">No photos in gallery yet. Check back soon!</p>
                    </div>`;
                return;
            }
            grid.innerHTML = photos.map(p => `
                <div class="gallery-item">
                    <img src="${p.url}" alt="${p.caption || 'Gallery Photo'}" loading="lazy"
                         onerror="this.parentElement.style.display='none'">
                    <div class="gallery-overlay">
                        <div class="gallery-icon"><i class="fas fa-search-plus"></i></div>
                        ${p.caption ? `<p style="color:#fff;font-size:13px;margin-top:6px;text-align:center;padding:0 8px;">${p.caption}</p>` : ''}
                    </div>
                </div>`).join('');
        };
        req.onerror = () => {};
    }).catch(() => {});
})();


// ===== CONTACT INFO LOADER =====
(function loadContactContent() {
    const d = JSON.parse(localStorage.getItem('dafContactInfo')) || {};
    const lang = localStorage.getItem('dafLang') || 'en';

    // Address
    if (d.addrEn || d.addrBn) {
        const el = document.getElementById('contactAddress');
        if (el) {
            const en = (d.addrEn || '').replace(/\n/g, '<br>');
            const bn = (d.addrBn || '').replace(/\n/g, '<br>');
            el.setAttribute('data-en', en);
            el.setAttribute('data-bn', bn);
            el.innerHTML = lang === 'bn' ? (bn || en) : (en || el.innerHTML);
        }
    }

    // Phone
    if (d.phone) {
        const el = document.getElementById('contactPhone');
        if (el) el.textContent = d.phone;
    }

    // Email
    if (d.email) {
        const el = document.getElementById('contactEmail');
        if (el) el.textContent = d.email;
    }

    // Social links — Contact section + Follow Us footer (same data)
    const socPairs = [
        ['contactSocFb',  'footerSocFb',  d.facebook],
        ['contactSocTw',  'footerSocTw',  d.twitter],
        ['contactSocLi',  'footerSocLi',  d.linkedin],
        ['contactSocIg',  'footerSocIg',  d.instagram],
    ];
    socPairs.forEach(([id, footerId, url]) => {
        [id, footerId].forEach(elId => {
            const el = document.getElementById(elId);
            if (!el) return;
            el.style.display = '';
            el.onclick = null;
            if (url && url.trim()) {
                const fullUrl = /^https?:\/\//i.test(url.trim()) ? url.trim() : 'https://' + url.trim();
                el.href = fullUrl;
                el.target = '_blank';
                el.rel = 'noopener noreferrer';
            }
        });
    });
})();

// ===== ABOUT US LOADER =====
(function loadAboutContent() {
    const d = JSON.parse(localStorage.getItem('dafAboutContent')) || {};
    const lang = localStorage.getItem('dafLang') || 'en';

    function setText(id, en, bn) {
        const el = document.getElementById(id);
        if (!el) return;
        if (en) el.setAttribute('data-en', en);
        if (bn) el.setAttribute('data-bn', bn);
        el.textContent = lang === 'bn' ? (bn || en || el.textContent) : (en || el.textContent);
    }

    if (d.descEn || d.descBn)
        setText('aboutDesc', d.descEn, d.descBn);

    if (d.stat1Val) {
        const el = document.getElementById('aboutStat1Val');
        if (el) el.textContent = d.stat1Val;
    }
    if (d.stat1LblEn || d.stat1LblBn)
        setText('aboutStat1Lbl', d.stat1LblEn, d.stat1LblBn);

    if (d.stat2Val) {
        const el = document.getElementById('aboutStat2Val');
        if (el) el.textContent = d.stat2Val;
    }
    if (d.stat2LblEn || d.stat2LblBn)
        setText('aboutStat2Lbl', d.stat2LblEn, d.stat2LblBn);

    if (d.stat3Val) {
        const el = document.getElementById('aboutStat3Val');
        if (el) el.textContent = d.stat3Val;
    }
    if (d.stat3LblEn || d.stat3LblBn)
        setText('aboutStat3Lbl', d.stat3LblEn, d.stat3LblBn);

    if (d.missionEn || d.missionBn)
        setText('aboutMissionText', d.missionEn, d.missionBn);

    if (d.visionEn || d.visionBn)
        setText('aboutVisionText', d.visionEn, d.visionBn);
})();

// ---- Navbar user pill ----
(function() {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    const pill = document.getElementById('navUserPill');
    if (!pill) return;
    if (user) {
        document.getElementById('navUserName').textContent = user.fullName || 'Profile';
        const av = document.getElementById('navUserAvatar');
        if (user.profilePicture) av.src = user.profilePicture;
        pill.style.display = 'block';
    }
})();

// ===== ANNOUNCEMENT BAR =====
(function loadAnnouncementBar() {
    const bar      = document.getElementById('announcementBar');
    const itemsDiv = document.getElementById('annBarItems');
    if (!bar || !itemsDiv) return;

    const list = JSON.parse(localStorage.getItem('dafAnnouncements')) || [];
    if (list.length === 0) return;

    // Build ticker items — repeat list 3× so scrolling looks continuous
    const repeated = [...list, ...list, ...list];
    itemsDiv.innerHTML = repeated.map(a => {
        const inner = `
            <span class="ann-dot"></span>
            <strong>${a.title}</strong>
            ${a.msg ? ` — ${a.msg}` : ''}
            ${a.date ? `<span class="ann-date">${a.date}</span>` : ''}
            <span class="ann-link-icon" style="margin-left:6px;opacity:0.7;"><i class="fas fa-info-circle" style="font-size:10px;"></i></span>`;
        return `<span class="ann-bar-item type-${a.type || 'info'}" style="cursor:pointer;" onclick="showAnnModal('${a.id}')">${inner}</span>`;
    }).join('');

    // Adjust animation speed based on item count (more items = slower)
    const duration = Math.max(20, list.length * 12) + 's';
    itemsDiv.style.animationDuration = duration;

    bar.style.display = 'block';
    document.body.classList.add('has-announcement');
})();

function showAnnModal(id) {
    const list = JSON.parse(localStorage.getItem('dafAnnouncements')) || [];
    const a = list.find(x => x.id === id);
    if (!a) return;
    document.getElementById('annDetailTitle').textContent = a.title || '';
    document.getElementById('annDetailMsg').textContent   = a.msg   || '';
    const badge = document.getElementById('annDetailBadge');
    const typeColors = { info:'#1565c0', success:'#2e7d32', warning:'#e65100', danger:'#c62828' };
    badge.textContent = (a.type || 'info').charAt(0).toUpperCase() + (a.type || 'info').slice(1);
    badge.style.background = (typeColors[a.type] || '#1565c0') + '22';
    badge.style.color = typeColors[a.type] || '#1565c0';
    document.getElementById('annDetailDate').textContent = a.date ? '📅 ' + a.date : '';
    const linkWrap = document.getElementById('annDetailLinkWrap');
    const linkEl   = document.getElementById('annDetailLink');
    if (a.link) {
        linkEl.href = a.link;
        linkWrap.style.display = 'block';
    } else {
        linkWrap.style.display = 'none';
    }
    const modal = document.getElementById('annDetailModal');
    modal.style.display = 'flex';
    modal.onclick = function(e) { if (e.target === modal) modal.style.display = 'none'; };
}


// ===== HERO SLIDESHOW LOADER =====
(function() {
    const wrap = document.getElementById('heroSlidesWrap');
    if (!wrap) return;

    const defSlide = document.getElementById('heroDefaultSlide');
    const prevBtn  = document.getElementById('heroPrev');
    const nextBtn  = document.getElementById('heroNext');
    const dotsWrap = document.getElementById('heroDots');

    const HNAME = 'dafHeroDB', HSTORE = 'slides', HVER = 1;

    function openHDB() {
        return new Promise((res, rej) => {
            const r = indexedDB.open(HNAME, HVER);
            r.onupgradeneeded = e => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(HSTORE))
                    db.createObjectStore(HSTORE, { keyPath: 'id' });
            };
            r.onsuccess = e => res(e.target.result);
            r.onerror   = e => rej(e.target.error);
        });
    }

    openHDB().then(db => {
        const req = db.transaction(HSTORE,'readonly').objectStore(HSTORE).getAll();
        req.onsuccess = e => {
            const slides = (e.target.result||[]).sort((a,b)=>a.order-b.order);
            if (slides.length === 0) return; // keep default image

            // Remove default static slide
            if (defSlide) defSlide.remove();

            // Build slide divs
            slides.forEach((s, i) => {
                const d = document.createElement('div');
                d.className = 'hero-slide' + (i===0 ? ' active' : '');
                d.style.backgroundImage = `url('${s.url}')`;
                wrap.appendChild(d);
            });

            const all = wrap.querySelectorAll('.hero-slide');
            let idx = 0, timer = null;

            // Build dots
            if (dotsWrap) {
                dotsWrap.innerHTML = '';
                all.forEach((_,i) => {
                    const btn = document.createElement('button');
                    btn.className = 'hero-dot' + (i===0?' active':'');
                    btn.setAttribute('aria-label','Go to slide '+(i+1));
                    btn.addEventListener('click', () => goTo(i));
                    dotsWrap.appendChild(btn);
                });
            }

            function goTo(n) {
                all[idx].classList.remove('active');
                if (dotsWrap) dotsWrap.children[idx].classList.remove('active');
                idx = (n + all.length) % all.length;
                all[idx].classList.add('active');
                if (dotsWrap) dotsWrap.children[idx].classList.add('active');
                resetTimer();
            }

            function resetTimer() {
                clearInterval(timer);
                if (all.length > 1) timer = setInterval(() => goTo(idx+1), 5000);
            }

            // Arrow buttons
            if (prevBtn) prevBtn.addEventListener('click', () => goTo(idx-1));
            if (nextBtn) nextBtn.addEventListener('click', () => goTo(idx+1));

            // Show/hide arrows & dots
            if (all.length <= 1) {
                if (prevBtn) prevBtn.classList.add('hidden');
                if (nextBtn) nextBtn.classList.add('hidden');
                if (dotsWrap) dotsWrap.style.display = 'none';
            }

            // Keyboard navigation
            document.addEventListener('keydown', e => {
                const hero = document.getElementById('home');
                if (!hero) return;
                const rect = hero.getBoundingClientRect();
                if (rect.bottom < 0 || rect.top > window.innerHeight) return;
                if (e.key === 'ArrowLeft')  goTo(idx-1);
                if (e.key === 'ArrowRight') goTo(idx+1);
            });

            resetTimer();
        };
        req.onerror = () => {};
    }).catch(() => {});
})();
