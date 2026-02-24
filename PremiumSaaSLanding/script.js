// Initialize Lucide icons
lucide.createIcons();

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ScrollReveal animations
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
sr.reveal('.hero-btns', { delay: 500 });
sr.reveal('.hero-mockup', { delay: 600, distance: '100px' });
sr.reveal('.feature-card', { interval: 100 });
sr.reveal('.timeline-step', { interval: 200 });
sr.reveal('.pricing-card', { interval: 100 });

// Pricing toggle logic
const pricingToggle = document.getElementById('pricingToggle');
const priceElements = document.querySelectorAll('.price');

pricingToggle.addEventListener('change', () => {
    priceElements.forEach(priceEl => {
        const monthly = priceEl.getAttribute('data-monthly');
        const yearly = priceEl.getAttribute('data-yearly');
        
        if (monthly && yearly) {
            if (pricingToggle.checked) {
                // Yearly
                priceEl.innerHTML = `${yearly}<span>/mo</span>`;
                priceEl.style.transform = 'scale(1.1)';
                setTimeout(() => priceEl.style.transform = 'scale(1)', 200);
            } else {
                // Monthly
                priceEl.innerHTML = `${monthly}<span>/mo</span>`;
                priceEl.style.transform = 'scale(1.1)';
                setTimeout(() => priceEl.style.transform = 'scale(1)', 200);
            }
        }
    });
});

// Accordion logic
const accordionHeaders = document.querySelectorAll('.accordion-header');

accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const item = header.parentElement;
        const isActive = item.classList.contains('active');
        
        // Close all items
        document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));
        
        // Open clicked item if it wasn't active
        if (!isActive) {
            item.classList.add('active');
        }
    });
});

// Mobile menu toggle (simple version)
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
mobileMenuBtn.addEventListener('click', () => {
    alert('Mobile menu functionality would open a full-screen overlay here.');
});

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});
