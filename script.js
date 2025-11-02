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
                element.textContent = element.getAttribute('data-en');
            }
        } else {
            // Bangla
            if (element.hasAttribute('data-placeholder-bn')) {
                element.placeholder = element.getAttribute('data-placeholder-bn');
            } else {
                element.textContent = element.getAttribute('data-bn');
            }
        }
    });
    
    // Update batch buttons text
    document.querySelectorAll('.batch-btn').forEach(btn => {
        if (lang === 'en') {
            btn.textContent = btn.getAttribute('data-en');
        } else {
            btn.textContent = btn.getAttribute('data-bn');
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
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const batch = document.getElementById('batch').value;
    const message = document.getElementById('message').value;
    
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
    
    // Success message
    alert(`ধন্যবাদ ${name}! আপনার বার্তা সফলভাবে পাঠানো হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।`);
    
    // Reset form
    contactForm.reset();
});

// Counter Animation for Stats
const animateCounter = (element, target, duration = 2000) => {
    let current = 0;
    const increment = target / (duration / 16);
    
    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current) + '+';
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + '+';
        }
    };
    
    updateCounter();
};

// Observe stat items for counter animation
const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            const statValue = entry.target.querySelector('h4');
            const targetValue = parseInt(statValue.textContent);
            animateCounter(statValue, targetValue);
            entry.target.classList.add('counted');
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-item').forEach(stat => {
    statObserver.observe(stat);
});

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

// Print console message
console.log('%cDarunnazat Siddikia Kamil Madrasah Alumni Association (DSKMAA)', 'color: #2c5f2d; font-size: 20px; font-weight: bold;');
console.log('%cদাখিল ২০২০ | আলিম ২০২২', 'color: #97bc62; font-size: 16px;');
console.log('%cWebsite developed with ❤️', 'color: #ff6b35; font-size: 14px;');
