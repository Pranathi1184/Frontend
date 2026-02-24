// Initialize Lucide icons
lucide.createIcons();

// Navbar Scroll Effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ScrollReveal Animations
const sr = ScrollReveal({
    origin: 'bottom',
    distance: '60px',
    duration: 1000,
    delay: 200,
    reset: false
});

sr.reveal('.reveal');
sr.reveal('.hero-title', { delay: 300, origin: 'top' });
sr.reveal('.hero-subtitle', { delay: 400 });
sr.reveal('.hero-description', { delay: 500 });
sr.reveal('.hero-btns', { delay: 600 });
sr.reveal('.skill-item', { interval: 100 });
sr.reveal('.project-card', { interval: 100 });
sr.reveal('.about-image', { origin: 'left' });
sr.reveal('.about-content', { origin: 'right' });

// Project Modal Logic
const projectModal = document.getElementById('projectModal');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const closeBtn = document.querySelector('.modal-close');

const projectsData = [
    {
        title: "Nexus Dashboard",
        desc: "A comprehensive analytics dashboard for modern SaaS platforms. Built with React, TypeScript, and D3.js for complex data visualization.",
        img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop"
    },
    {
        title: "E-Shop Premium",
        desc: "A high-performance e-commerce frontend focusing on user experience. Includes advanced filtering, search, and local storage cart management.",
        img: "https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=800&auto=format&fit=crop"
    },
    {
        title: "Pro Kanban",
        desc: "A Trello-level productivity tool. Features native HTML5 drag and drop, column customization, and real-time state persistence.",
        img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop"
    }
];

document.querySelectorAll('.open-project').forEach((btn, index) => {
    btn.onclick = () => {
        const data = projectsData[index];
        modalImg.src = data.img;
        modalTitle.textContent = data.title;
        modalDesc.textContent = data.desc;
        projectModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };
});

closeBtn.onclick = () => {
    projectModal.classList.remove('active');
    document.body.style.overflow = 'auto';
};

projectModal.onclick = (e) => {
    if (e.target === projectModal) {
        projectModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
};

// Contact Form Simulation
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button');
    const originalText = btn.textContent;
    
    btn.textContent = 'Sending...';
    btn.disabled = true;
    
    setTimeout(() => {
        alert('Thank you! Your message has been sent successfully.');
        contactForm.reset();
        btn.textContent = originalText;
        btn.disabled = false;
    }, 2000);
});

// Mobile Navigation
function initMobileNav() {
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileToggle && navLinks) {
        mobileToggle.onclick = (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('mobile-active');
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('mobile-active')) {
                    icon.setAttribute('data-lucide', 'x');
                } else {
                    icon.setAttribute('data-lucide', 'menu');
                }
            }
            lucide.createIcons();
        };

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('mobile-active') && !navLinks.contains(e.target) && e.target !== mobileToggle) {
                navLinks.classList.remove('mobile-active');
                const icon = mobileToggle.querySelector('i');
                if (icon) icon.setAttribute('data-lucide', 'menu');
                lucide.createIcons();
            }
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('mobile-active');
                const icon = mobileToggle.querySelector('i');
                if (icon) icon.setAttribute('data-lucide', 'menu');
                lucide.createIcons();
            });
        });
    }
}

// Initialize
initMobileNav();

// Window resize listener
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        const navLinks = document.querySelector('.nav-links');
        const mobileToggle = document.getElementById('mobileToggle');
        if (navLinks && navLinks.classList.contains('mobile-active')) {
            navLinks.classList.remove('mobile-active');
            const icon = mobileToggle?.querySelector('i');
            if (icon) icon.setAttribute('data-lucide', 'menu');
            lucide.createIcons();
        }
    }
});

// Smooth Link Active State
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section, header');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
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
