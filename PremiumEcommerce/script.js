// Initialize Lucide icons
lucide.createIcons();

// Products Data
const products = [
    { id: 1, name: "Premium Wireless Headphones", price: 299.99, category: "Electronics", rating: 5, img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=500&auto=format&fit=crop" },
    { id: 2, name: "Minimalist Smart Watch", price: 199.50, category: "Electronics", rating: 4, img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500&auto=format&fit=crop" },
    { id: 3, name: "Luxury Leather Wallet", price: 85.00, category: "Lifestyle", rating: 5, img: "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=500&auto=format&fit=crop" },
    { id: 4, name: "Modern Desk Lamp", price: 120.00, category: "Lifestyle", rating: 3, img: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?q=80&w=500&auto=format&fit=crop" },
    { id: 5, name: "Ceramic Coffee Set", price: 45.99, category: "Lifestyle", rating: 4, img: "https://images.unsplash.com/photo-1517256011253-af21be95a83b?q=80&w=500&auto=format&fit=crop" },
    { id: 6, name: "Premium Travel Backpack", price: 150.00, category: "Accessories", rating: 5, img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=500&auto=format&fit=crop" }
];

// State
let cart = JSON.parse(localStorage.getItem('luxeCart')) || [];
let currentTheme = localStorage.getItem('luxeTheme') || 'light';

// DOM Elements
const productGrid = document.getElementById('productGrid');
const cartToggle = document.getElementById('cartToggle');
const cartOverlay = document.getElementById('cartOverlay');
const closeCart = document.getElementById('closeCart');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCountLabel = document.getElementById('cartCountLabel');
const navCartCount = document.querySelector('.cart-count');
const themeToggle = document.getElementById('themeToggle');
const productModal = document.getElementById('productModal');
const priceSlider = document.querySelector('.price-slider');
const priceLabels = document.querySelector('.price-labels');

// Init
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(currentTheme);
    initFilters();
    initMobileNav();
    filterProducts(); // This handles the initial render
    updateCartUI();
    lucide.createIcons();
});

// Filters & Sorting Logic
function initFilters() {
    const categoryCheckboxes = document.querySelectorAll('.filter-list input[type="checkbox"]');
    const ratingRadios = document.querySelectorAll('.rating-filter input[type="radio"]');
    const sortSelect = document.querySelector('.sort-select');

    if (priceSlider) {
        priceSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            if (priceLabels) {
                priceLabels.innerHTML = `<span>$0</span><span>$${value}+</span>`;
            }
            filterProducts();
        });
    }

    categoryCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const categoryName = cb.parentElement.textContent.trim();
            if (categoryName === 'All Products' && cb.checked) {
                categoryCheckboxes.forEach(other => { if (other !== cb) other.checked = false; });
            } else if (cb.checked) {
                categoryCheckboxes[0].checked = false;
            }
            filterProducts();
        });
    });

    ratingRadios.forEach(radio => {
        radio.addEventListener('change', filterProducts);
    });

    if (sortSelect) {
        sortSelect.addEventListener('change', filterProducts);
    }
}

function filterProducts() {
    if (!productGrid) return;

    const maxPrice = priceSlider ? parseInt(priceSlider.value) : 1000;
    
    const activeCategories = Array.from(document.querySelectorAll('.filter-list input[type="checkbox"]:checked'))
        .map(cb => cb.parentElement.textContent.trim());
    
    const activeRatingRadio = document.querySelector('.rating-filter input[type="radio"]:checked');
    const minRating = activeRatingRadio ? parseInt(activeRatingRadio.parentElement.textContent.trim().split('★')[0]) : 0;

    let filtered = products.filter(p => {
        const matchesPrice = p.price <= maxPrice;
        const matchesCategory = activeCategories.length === 0 || activeCategories.includes('All Products') || activeCategories.includes(p.category);
        const matchesRating = (p.rating || 5) >= minRating;
        return matchesPrice && matchesCategory && matchesRating;
    });

    // Sorting
    const sortValue = document.querySelector('.sort-select')?.value;
    if (sortValue === 'Price: Low to High') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortValue === 'Price: High to Low') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sortValue === 'Newest') {
        filtered.sort((a, b) => b.id - a.id);
    }

    renderFilteredProducts(filtered);
}

function renderFilteredProducts(items) {
    if (!productGrid) return;

    productGrid.innerHTML = items.map(product => `
        <div class="product-card">
            <div class="product-img" onclick="openProductModal(${product.id})">
                <img src="${product.img}" alt="${product.name}">
                <button class="add-quick" onclick="event.stopPropagation(); addToCart(${product.id})">Add to Bag</button>
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
            </div>
        </div>
    `).join('');
    
    if (items.length === 0) {
        productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--muted);">No products found matching your criteria.</p>';
    }
}

// Cart Logic
function addToCart(productId, qty = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({ ...product, qty });
    }

    saveCart();
    updateCartUI();
    openCart();
    
    // Animation effect on cart icon
    if (navCartCount) {
        navCartCount.parentElement.style.transform = 'scale(1.2)';
        setTimeout(() => navCartCount.parentElement.style.transform = 'scale(1)', 200);
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

function updateQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.qty += delta;
        if (item.qty < 1) return removeFromCart(productId);
        saveCart();
        updateCartUI();
    }
}

function saveCart() {
    localStorage.setItem('luxeCart', JSON.stringify(cart));
}

function updateCartUI() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const count = cart.reduce((sum, item) => sum + item.qty, 0);

    if (navCartCount) navCartCount.textContent = count;
    if (cartCountLabel) cartCountLabel.textContent = count;
    if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;

    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-img"><img src="${item.img}" alt="${item.name}"></div>
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                    <div class="cart-item-qty">
                        <button class="icon-btn btn-sm" onclick="updateQty(${item.id}, -1)">-</button>
                        <span>${item.qty}</span>
                        <button class="icon-btn btn-sm" onclick="updateQty(${item.id}, 1)">+</button>
                        <button class="icon-btn btn-sm" style="margin-left: auto; color: #ef4444" onclick="removeFromCart(${item.id})">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        lucide.createIcons();
    }
}

// Drawer Controls
function openCart() { 
    if (cartOverlay) {
        cartOverlay.style.display = 'block'; 
        setTimeout(() => cartOverlay.classList.add('active'), 10); 
    }
}
function closeCartDrawer() { 
    if (cartOverlay) {
        cartOverlay.classList.remove('active'); 
        setTimeout(() => cartOverlay.style.display = 'none', 300); 
    }
}

if (cartToggle) cartToggle.onclick = openCart;
if (closeCart) closeCart.onclick = closeCartDrawer;
if (cartOverlay) {
    cartOverlay.onclick = (e) => { if (e.target === cartOverlay) closeCartDrawer(); };
}

// Theme Logic
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (!themeToggle) return;
    
    const icon = themeToggle.querySelector('i');
    if (icon) {
        if (theme === 'dark') {
            icon.setAttribute('data-lucide', 'sun');
        } else {
            icon.setAttribute('data-lucide', 'moon');
        }
    }
    lucide.createIcons();
    localStorage.setItem('luxeTheme', theme);
}

if (themeToggle) {
    themeToggle.onclick = () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(currentTheme);
    };
}

// Modal Logic
let activeProductId = null;
function openProductModal(id) {
    const p = products.find(p => p.id === id);
    if (!p) return;
    activeProductId = id;
    
    const mImg = document.getElementById('modalImg');
    const mTitle = document.getElementById('modalTitle');
    const mPrice = document.getElementById('modalPrice');
    const mQty = document.getElementById('qtyInput');

    if (mImg) mImg.src = p.img;
    if (mTitle) mTitle.textContent = p.name;
    if (mPrice) mPrice.textContent = `$${p.price.toFixed(2)}`;
    if (mQty) mQty.value = 1;
    
    if (productModal) {
        productModal.style.display = 'flex';
        setTimeout(() => productModal.classList.add('active'), 10);
        document.body.style.overflow = 'hidden';
    }
}

function closeProductModal() {
    if (productModal) {
        productModal.classList.remove('active');
        setTimeout(() => productModal.style.display = 'none', 300);
        document.body.style.overflow = 'auto';
    }
}

const modalClose = document.querySelector('.modal-close');
if (modalClose) modalClose.onclick = closeProductModal;
if (productModal) {
    productModal.onclick = (e) => { if (e.target === productModal) closeProductModal(); };
}

const qtyPlus = document.getElementById('qtyPlus');
const qtyMinus = document.getElementById('qtyMinus');
const qtyInput = document.getElementById('qtyInput');

if (qtyPlus) qtyPlus.onclick = () => { if (qtyInput) qtyInput.value++; };
if (qtyMinus) qtyMinus.onclick = () => {
    if (qtyInput) {
        const val = parseInt(qtyInput.value);
        if (val > 1) qtyInput.value = val - 1;
    }
};

const mAddToCart = document.getElementById('modalAddToCart');
if (mAddToCart) {
    mAddToCart.onclick = () => {
        if (qtyInput) {
            const qty = parseInt(qtyInput.value);
            addToCart(activeProductId, qty);
            closeProductModal();
        }
    };
}

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
