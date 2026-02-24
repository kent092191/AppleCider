/**
 * Double M Merchandise - Main JavaScript
 * E-commerce functionality for Filipino herbal products
 */

// ==================== CART MANAGEMENT ====================

// Initialize cart from localStorage or create empty cart
let cart = JSON.parse(localStorage.getItem('doubleMCart')) || [];

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('doubleMCart', JSON.stringify(cart));
    updateCartCount();
}

// Update cart count in header
function updateCartCount() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('#cartCount');
    cartCountElements.forEach(el => {
        el.textContent = cartCount;
        if (cartCount > 0) {
            el.style.display = 'flex';
        } else {
            el.style.display = 'none';
        }
    });
}

// Add item to cart
function addToCart(id, name, price, quantity = 1) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            quantity: quantity
        });
    }
    
    saveCart();
    showToast(`${name} added to cart!`, 'success');
    
    // Add animation to cart icon
    const cartIcon = document.querySelector('.nav-icon-btn .fa-shopping-cart');
    if (cartIcon) {
        cartIcon.parentElement.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cartIcon.parentElement.style.transform = 'scale(1)';
        }, 200);
    }
}

// Remove item from cart
function removeFromCart(id) {
    const index = cart.findIndex(item => item.id === id);
    if (index > -1) {
        const item = cart[index];
        cart.splice(index, 1);
        saveCart();
        renderCart();
        showToast(`${item.name} removed from cart`, 'info');
    }
}

// Update cart item quantity
function updateCartQuantity(id, newQuantity) {
    const item = cart.find(item => item.id === id);
    if (item && newQuantity > 0) {
        item.quantity = parseInt(newQuantity);
        saveCart();
        renderCart();
    }
}

// Get cart total
function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Get cart item count
function getCartItemCount() {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

// Render cart page
function renderCart() {
    const cartContent = document.getElementById('cartContent');
    if (!cartContent) return;

    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <h2>Your cart is empty</h2>
                <p>Start adding some products to your cart!</p>
                <a href="products.html" class="btn btn-primary btn-lg">
                    <i class="fas fa-shopping-bag"></i>
                    Browse Products
                </a>
            </div>
        `;
        return;
    }

    const subtotal = getCartTotal();
    const shipping = subtotal >= 1500 ? 0 : 100;
    const total = subtotal + shipping;

    let cartHTML = `
        <div class="cart-layout">
            <div class="cart-items">
    `;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        cartHTML += `
            <div class="cart-item">
                <div class="cart-item-image">
                    <div class="product-placeholder">
                        <div class="placeholder-icon">${getProductIcon(item.id)}</div>
                    </div>
                </div>
                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <p>₱${item.price.toLocaleString()}</p>
                </div>
                <div class="cart-item-qty">
                    <div class="quantity-selector">
                        <button class="qty-btn" onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="qty-input" value="${item.quantity}" min="1" 
                               onchange="updateCartQuantity('${item.id}', this.value)" readonly>
                        <button class="qty-btn" onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="cart-item-total">
                    <div class="price">₱${itemTotal.toLocaleString()}</div>
                    <button class="remove-btn" onclick="removeFromCart('${item.id}')">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `;
    });

    cartHTML += `
            </div>
            <div class="cart-summary">
                <h3>Order Summary</h3>
                <div class="summary-row">
                    <span>Subtotal (${getCartItemCount()} items)</span>
                    <span>₱${subtotal.toLocaleString()}</span>
                </div>
                <div class="summary-row">
                    <span>Shipping</span>
                    <span>${shipping === 0 ? 'FREE' : '₱' + shipping.toLocaleString()}</span>
                </div>
                ${subtotal < 1500 ? `
                <div style="background: var(--bg-cream); padding: 12px; border-radius: var(--radius-sm); margin: 12px 0; font-size: 0.85rem; color: var(--text-medium);">
                    <i class="fas fa-info-circle" style="color: var(--accent);"></i>
                    Add ₱${(1500 - subtotal).toLocaleString()} more for FREE shipping!
                </div>
                ` : `
                <div style="background: rgba(45,106,79,0.1); padding: 12px; border-radius: var(--radius-sm); margin: 12px 0; font-size: 0.85rem; color: var(--primary);">
                    <i class="fas fa-check-circle"></i>
                    You qualify for FREE shipping!
                </div>
                `}
                <div class="promo-code">
                    <input type="text" placeholder="Promo code" id="promoCode">
                    <button class="btn btn-sm btn-secondary" onclick="applyPromoCode()">Apply</button>
                </div>
                <div class="summary-row total">
                    <span>Total</span>
                    <span class="price">₱${total.toLocaleString()}</span>
                </div>
                <a href="checkout.html" class="btn btn-primary btn-lg">
                    <i class="fas fa-lock"></i>
                    Proceed to Checkout
                </a>
                <a href="products.html" class="btn btn-secondary btn-lg" style="margin-top: 12px;">
                    <i class="fas fa-arrow-left"></i>
                    Continue Shopping
                </a>
            </div>
        </div>
    `;

    cartContent.innerHTML = cartHTML;
}

// Get product icon emoji or image
function getProductIcon(id) {
    const icons = {
        'apple-cider': '<img src="images/apple-cider.png" alt="Apple Cider" class="cart-product-img">',
        'sambong': '💊',
        'lagundi': '🌿',
        'paragis': '🌾',
        'bundle': '📦',
        'apple-cider-3pack': '<img src="images/apple-cider.png" alt="Apple Cider 3-Pack" class="cart-product-img">'
    };
    return icons[id] || '📦';
}

// Apply promo code
function applyPromoCode() {
    const promoInput = document.getElementById('promoCode');
    if (!promoInput) return;
    
    const code = promoInput.value.trim().toUpperCase();
    
    const promoCodes = {
        'WELCOME10': { type: 'percent', value: 10, description: '10% off' },
        'SAVE50': { type: 'fixed', value: 50, description: '₱50 off' },
        'FREESHIP': { type: 'shipping', value: 0, description: 'Free shipping' }
    };
    
    if (promoCodes[code]) {
        showToast(`Promo code "${code}" applied! ${promoCodes[code].description}`, 'success');
        promoInput.value = '';
        // In a real app, you'd update the cart total here
    } else if (code) {
        showToast('Invalid promo code', 'error');
    }
}

// ==================== CHECKOUT MANAGEMENT ====================

// Initialize checkout page
function initCheckout() {
    const checkoutItems = document.getElementById('checkoutItems');
    if (!checkoutItems) return;

    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }

    let itemsHTML = '';
    cart.forEach(item => {
        itemsHTML += `
            <div class="checkout-item">
                <div class="checkout-item-img">
                    <div class="product-placeholder">
                        <div class="placeholder-icon">${getProductIcon(item.id)}</div>
                    </div>
                </div>
                <div class="checkout-item-details">
                    <h4>${item.name}</h4>
                    <span>Qty: ${item.quantity}</span>
                </div>
                <div class="checkout-item-price">₱${(item.price * item.quantity).toLocaleString()}</div>
            </div>
        `;
    });

    checkoutItems.innerHTML = itemsHTML;
    updateCheckoutTotals();
}

// Update checkout totals
function updateCheckoutTotals() {
    const subtotal = getCartTotal();
    const shippingCost = getShippingCost();
    const total = subtotal + shippingCost;

    const subtotalEl = document.getElementById('checkoutSubtotal');
    const shippingEl = document.getElementById('checkoutShipping');
    const totalEl = document.getElementById('checkoutTotal');

    if (subtotalEl) subtotalEl.textContent = `₱${subtotal.toLocaleString()}`;
    if (shippingEl) shippingEl.textContent = shippingCost === 0 ? 'FREE' : `₱${shippingCost.toLocaleString()}`;
    if (totalEl) totalEl.textContent = `₱${total.toLocaleString()}`;
}

// Get shipping cost based on selected delivery method
function getShippingCost() {
    const selectedDelivery = document.querySelector('input[name="delivery"]:checked');
    if (!selectedDelivery) return 0;
    
    if (selectedDelivery.value === 'express') {
        return 150;
    }
    
    // Free standard shipping for orders over ₱1,500
    const subtotal = getCartTotal();
    return subtotal >= 1500 ? 0 : 0; // Changed to always free for standard
}

// Place order
function placeOrder() {
    // Validate form
    const firstName = document.getElementById('firstName')?.value.trim();
    const lastName = document.getElementById('lastName')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();
    const address = document.getElementById('address')?.value.trim();
    const city = document.getElementById('city')?.value.trim();
    const province = document.getElementById('province')?.value.trim();

    if (!firstName || !lastName || !email || !phone || !address || !city || !province) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }

    // Get order details
    const orderData = {
        customer: {
            firstName,
            lastName,
            email,
            phone,
            address,
            city,
            province,
            barangay: document.getElementById('barangay')?.value.trim(),
            zipCode: document.getElementById('zipCode')?.value.trim(),
            region: document.getElementById('region')?.value
        },
        items: cart,
        payment: document.querySelector('input[name="payment"]:checked')?.value,
        delivery: document.querySelector('input[name="delivery"]:checked')?.value,
        subtotal: getCartTotal(),
        shipping: getShippingCost(),
        total: getCartTotal() + getShippingCost(),
        orderDate: new Date().toISOString(),
        orderNumber: 'DM' + Date.now()
    };

    // Save order (in real app, send to server)
    console.log('Order placed:', orderData);

    // Clear cart
    cart = [];
    saveCart();

    // Show success message
    showToast('Order placed successfully!', 'success');

    // Redirect to success page
    setTimeout(() => {
        localStorage.setItem('lastOrder', JSON.stringify(orderData));
        window.location.href = 'order-success.html';
    }, 1000);
}

// ==================== UI INTERACTIONS ====================

// Mobile menu toggle
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const mobileToggle = document.getElementById('mobileToggle');
    
    if (navMenu) {
        navMenu.classList.toggle('active');
        const icon = mobileToggle.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }
}

// Initialize mobile toggle
const mobileToggle = document.getElementById('mobileToggle');
if (mobileToggle) {
    mobileToggle.addEventListener('click', toggleMobileMenu);
}

// Search functionality
const searchBtn = document.getElementById('searchBtn');
const searchOverlay = document.getElementById('searchOverlay');
const searchInput = document.getElementById('searchInput');

if (searchBtn && searchOverlay) {
    searchBtn.addEventListener('click', () => {
        searchOverlay.classList.add('active');
        setTimeout(() => searchInput?.focus(), 100);
    });

    searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) {
            searchOverlay.classList.remove('active');
        }
    });
}

// Handle search input
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const searchResults = document.getElementById('searchResults');
        
        if (query.length < 2) {
            searchResults.innerHTML = '';
            return;
        }

        const products = [
            { id: 'apple-cider', name: 'Apple Cider with Herbs', price: 999, icon: '<img src="images/apple-cider.png" alt="Apple Cider" class="search-product-img">' },
            { id: 'sambong', name: 'Sambong Capsules', price: 400, icon: '💊' },
            { id: 'lagundi', name: 'Lagundi Leaves Capsules', price: 370, icon: '🌿' },
            { id: 'paragis', name: 'Paragis Capsules', price: 380, icon: '🌾' }
        ];

        const results = products.filter(p => p.name.toLowerCase().includes(query));

        if (results.length > 0) {
            searchResults.innerHTML = results.map(p => `
                <a href="product-${p.id}.html" class="search-result-item">
                    <div class="search-result-icon">${p.icon}</div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600;">${p.name}</div>
                        <div style="color: var(--primary); font-weight: 700;">₱${p.price.toLocaleString()}</div>
                    </div>
                </a>
            `).join('');
        } else {
            searchResults.innerHTML = '<p style="text-align: center; padding: 20px; color: var(--text-light);">No products found</p>';
        }
    });
}

// Back to top button
const backToTop = document.getElementById('backToTop');
if (backToTop) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Toast notifications
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info} toast-icon"></i>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Newsletter form
function handleNewsletter(event) {
    event.preventDefault();
    const email = event.target.querySelector('input[type="email"]').value;
    showToast('Thanks for subscribing! Check your email for confirmation.', 'success');
    event.target.reset();
}

// Contact form
function handleContactForm(event) {
    event.preventDefault();
    const name = document.getElementById('contactName').value;
    showToast(`Thanks for reaching out, ${name}! We'll get back to you soon.`, 'success');
    event.target.reset();
}

// Quick view (placeholder)
function quickView(productId) {
    window.location.href = `product-${productId}.html`;
}

// Product filtering (for products page)
function initProductFilters() {
    const filterBtns = document.querySelectorAll('.category-chip');
    const products = document.querySelectorAll('.product-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            // Filter products
            let visibleCount = 0;
            products.forEach(product => {
                const category = product.getAttribute('data-category');
                const badge = product.getAttribute('data-badge');

                if (filter === 'all' || 
                    category.includes(filter) || 
                    badge === filter) {
                    product.style.display = '';
                    visibleCount++;
                } else {
                    product.style.display = 'none';
                }
            });

            // Show/hide no results message
            const noResults = document.getElementById('noResults');
            if (noResults) {
                noResults.style.display = visibleCount === 0 ? 'block' : 'none';
            }
        });
    });
}

// ==================== PAGE INITIALIZATION ====================

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Update cart count on all pages
    updateCartCount();

    // Initialize cart page if we're on it
    if (document.getElementById('cartContent')) {
        renderCart();
    }

    // Initialize checkout page if we're on it
    if (document.getElementById('checkoutItems')) {
        initCheckout();
    }

    // Initialize product filters if on products page
    if (document.querySelector('.category-chip')) {
        initProductFilters();
    }

    // Add fade-in animation to elements
    const fadeElements = document.querySelectorAll('.product card, .benefit-card, .testimonial-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in', 'visible');
            }
        });
    }, { threshold: 0.1 });

    fadeElements.forEach(el => observer.observe(el));
});

// Handle page visibility change (update cart count when returning to page)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        cart = JSON.parse(localStorage.getItem('doubleMCart')) || [];
        updateCartCount();
    }
});

// Console welcome message
console.log('%c🌿 Double M Merchandise', 'color: #2d6a4f; font-size: 20px; font-weight: bold;');
console.log('%cPremium Filipino Herbal Health Products', 'color: #555; font-size: 12px;');
console.log('%cBuilt with ❤️ in the Philippines', 'color: #d4a843; font-size: 12px;');
