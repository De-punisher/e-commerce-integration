// Product data - TALIBHAN ENTERPRISE
const products = {
    1: { name: "Premium Kenyan Coffee", price: 1850, category: "Beverages" },
    2: { name: "Samsung Galaxy Tablet", price: 28999, category: "Clothing" },
    3: { name: "Wireless Bluetooth Headphones", price: 4299, category: "Art" },
    4: { name: "Modern Coffee Table", price: 7499, category: "Food" },
    5: { name: "Kenyan Tea Gift Box", price: 2199, category: "Beverages" },
    6: { name: "Beaded Jewelry Set", price: 1650, category: "Accessories" }
};

// DOM Elements
const modal = document.getElementById('paymentModal');
const closeBtn = document.querySelector('.close');
const buyButtons = document.querySelectorAll('.buy-btn');
const paymentOptions = document.querySelectorAll('.payment-option');
const paymentForms = {
    mpesa: document.getElementById('mpesaForm'),
    paypal: document.getElementById('paypalForm'),
    card: document.getElementById('cardForm')
};

// Shopping Cart Elements - FIXED: Wait for DOM to load
let cart = [];
let cartSidebar, cartItems, cartTotal, cartCount;

let selectedProduct = null;
let selectedPaymentMethod = 'mpesa';

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart elements after DOM is loaded
    cartSidebar = document.getElementById('cartSidebar');
    cartItems = document.getElementById('cartItems');
    cartTotal = document.getElementById('cartTotal');
    cartCount = document.getElementById('cart-count'); // Note: dash not camelCase
    
    console.log('Cart elements initialized:', { cartSidebar, cartItems, cartTotal, cartCount });
    
    // Initialize cart display
    updateCart();
    
    // Event Listeners - ADDED AFTER DOM LOAD
    buyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.getAttribute('data-product');
            addToCart(productId);
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    paymentOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            const method = e.currentTarget.getAttribute('data-method');
            selectPaymentMethod(method);
        });
    });

    // Cart event listeners
    if (document.querySelector('.cart-icon')) {
        document.querySelector('.cart-icon').addEventListener('click', openCart);
    }
    if (document.querySelector('.close-cart')) {
        document.querySelector('.close-cart').addEventListener('click', closeCart);
    }

    console.log('TALIBHAN ENTERPRISE initialized successfully!');
});

// Functions
function openPaymentModal(product) {
    if (document.getElementById('productName') && document.getElementById('productPrice')) {
        document.getElementById('productName').textContent = product.name;
        document.getElementById('productPrice').textContent = `KSh ${product.price}`;
    }
    if (modal) modal.style.display = 'block';
    selectPaymentMethod('mpesa');
}

function closeModal() {
    if (modal) modal.style.display = 'none';
}

function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    
    paymentOptions.forEach(option => {
        option.classList.toggle('active', option.getAttribute('data-method') === method);
    });
    
    Object.keys(paymentForms).forEach(key => {
        if (paymentForms[key]) {
            paymentForms[key].classList.toggle('hidden', key !== method);
        }
    });
    
    if (method === 'paypal') {
        initializePayPal();
    }
}

// Product Search Functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const resultsCount = document.getElementById('resultsCount');
    const productGrid = document.querySelector('.product-grid');
    
    let allProducts = [];
    
    // Get all products from the page
    function getAllProducts() {
        const productElements = document.querySelectorAll('.product');
        return Array.from(productElements).map(product => ({
            element: product,
            name: product.querySelector('h3').textContent.toLowerCase(),
            description: product.querySelector('p:not(.price)')?.textContent.toLowerCase() || '',
            category: product.dataset.category || ''
        }));
    }
    
    // Filter products based on search term
    function filterProducts(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        
        if (term === '') {
            // Show all products
            allProducts.forEach(item => {
                item.element.style.display = 'block';
                item.element.classList.remove('highlight');
            });
            resultsCount.textContent = `Showing all ${allProducts.length} products`;
            return;
        }
        
        const filteredProducts = allProducts.filter(item => 
            item.name.includes(term) || 
            item.description.includes(term) ||
            item.category.includes(term)
        );
        
        // Hide all products first
        allProducts.forEach(item => {
            item.element.style.display = 'none';
            item.element.classList.remove('highlight');
        });
        
        // Show matching products
        filteredProducts.forEach(item => {
            item.element.style.display = 'block';
            item.element.classList.add('highlight');
        });
        
        // Update results count
        resultsCount.textContent = `Found ${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} for "${searchTerm}"`;
    }
    
    // Initialize search when page loads
    function init() {
        allProducts = getAllProducts();
        
        // Search on input (real-time)
        searchInput.addEventListener('input', (e) => {
            filterProducts(e.target.value);
        });
        
        // Search on button click
        searchBtn.addEventListener('click', () => {
            filterProducts(searchInput.value);
        });
        
        // Search on Enter key
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                filterProducts(searchInput.value);
            }
        });
        
        console.log('Search system initialized with', allProducts.length, 'products');
    }
    
    // Initialize when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}

// Initialize search system
initializeSearch();

// Cart Functions - SIMPLIFIED AND FIXED
function addToCart(productId) {
    const product = products[productId];
    if (!product) return;
    
    const existingItem = cart.find(item => item.id == productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    
    updateCart();
    openCart();
    showNotification(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id != productId);
    updateCart();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id == productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCart();
        }
    }
}

function updateCart() {
    console.log('Updating cart with:', cart);
    
    if (cartItems) {
        cartItems.innerHTML = '';
        let total = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>KSh ${item.price} x ${item.quantity}</p>
                    <p>Total: KSh ${itemTotal}</p>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            `;
            cartItems.appendChild(cartItem);
        });
    }
    // Category Filter Functionality
function initializeCategoryFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const products = document.querySelectorAll('.product');
    
    function filterProducts(category) {
        products.forEach(product => {
            const productCategory = product.dataset.category;
            
            if (category === 'all' || productCategory === category) {
                product.style.display = 'block';
                product.classList.add('highlight');
                setTimeout(() => product.classList.remove('highlight'), 500);
            } else {
                product.style.display = 'none';
            }
        });
        
        // Update results count
        const visibleCount = document.querySelectorAll('.product[style="display: block"]').length;
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            if (category === 'all') {
                resultsCount.textContent = `Showing all ${visibleCount} products`;
            } else {
                resultsCount.textContent = `Showing ${visibleCount} ${category} product${visibleCount !== 1 ? 's' : ''}`;
            }
        }
        
        // Update active button
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });
    }
    
    // Add click events to filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            filterProducts(category);
        });
    });
    
    // Initialize with all products showing
    filterProducts('all');
    
    console.log('Category filters initialized');
}

// Update your existing search to work with filters
function updateSearchWithFilters() {
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // When searching, reset to "all" filter
    searchInput.addEventListener('input', () => {
        filterButtons.forEach(btn => {
            if (btn.dataset.category === 'all') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    });
}
// Update your existing initializeSearch function or add this:
function initializeAllFeatures() {
    initializeSearch();
    initializeCategoryFilters();
    updateSearchWithFilters();
}

// Replace your existing DOMContentLoaded listener with:
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAllFeatures);
} else {
    initializeAllFeatures();
}
    // Update total and count
    if (cartTotal) {
        cartTotal.textContent = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    if (cartCount) {
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
}

function openCart() {
    if (cartSidebar) {
        cartSidebar.classList.add('open');
        console.log('Cart opened');
    }
}

function closeCart() {
    if (cartSidebar) {
        cartSidebar.classList.remove('open');
    }
}

function openCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    closeCart();
    selectedProduct = { 
        name: 'Multiple Items', 
        price: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
    openPaymentModal(selectedProduct);
}

// Payment Functions
async function processMpesaPayment() {
    const phoneInput = document.getElementById('mpesaPhone');
    if (!phoneInput || !selectedProduct) return;
    
    const phone = phoneInput.value;
    
    if (!phone) {
        alert('📱 Please enter your M-Pesa phone number');
        return;
    }
    
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = '⏳ Processing...';
    button.disabled = true;
    
    alert('✅ M-Pesa payment initiated!\n\n📱 Check your phone: ' + phone + '\n💳 Amount: KSh ' + selectedProduct.price + '\n\nPlease enter your M-Pesa PIN to complete payment.');
    
    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        showSuccessMessage('🎉 Payment Successful!\n\n✅ M-Pesa payment confirmed\n📦 Your order is being processed\n📞 You will receive SMS confirmation\n\nThank you for shopping with TALIBHAN ENTERPRISE!');
        closeModal();
        clearCart();
    }, 3000);
}

function initializePayPal() {
    const container = document.getElementById('paypal-button-container');
    if (container && selectedProduct) {
        container.innerHTML = `
            <button onclick="simulatePayPalPayment()" style="
                background: #0070ba; 
                color: white; 
                padding: 15px 30px; 
                border: none; 
                border-radius: 8px; 
                cursor: pointer;
                font-size: 1.1rem;
                font-weight: bold;
                width: 100%;
            ">
                Pay with PayPal - KSh ${selectedProduct.price}
            </button>
        `;
    }
}

function simulatePayPalPayment() {
    if (!selectedProduct) return;
    
    alert('🌐 Redirecting to PayPal...\n\nPlease login to your PayPal account to complete payment of KSh ' + selectedProduct.price);
    
    setTimeout(() => {
        showSuccessMessage('🎉 PayPal Payment Successful!\n\n✅ Payment confirmed via PayPal\n📦 Your order is being processed\n📧 Receipt sent to your email\n\nThank you for choosing TALIBHAN ENTERPRISE!');
        closeModal();
        clearCart();
    }, 3000);
}

async function processCardPayment() {
    const cardNumber = document.getElementById('cardNumber')?.value;
    const expiry = document.getElementById('expiryDate')?.value;
    const cvv = document.getElementById('cvv')?.value;

    if (!cardNumber || !expiry || !cvv || !selectedProduct) {
        alert('💳 Please fill all card details');
        return;
    }

    const button = event.target;
    const originalText = button.textContent;
    button.textContent = '⏳ Processing...';
    button.disabled = true;

    alert('💳 Processing card payment...\n\nAmount: KSh ' + selectedProduct.price + '\nCard: ****' + cardNumber.slice(-4) + '\n\nPlease wait for verification');

    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        showSuccessMessage('🎉 Card Payment Successful!\n\n✅ Payment approved via card\n📦 Order confirmed and processing\n📧 Receipt sent to your email\n🛡️ Transaction secured\n\nThank you for shopping with TALIBHAN ENTERPRISE!');
        closeModal();
        clearCart();
    }, 3000);
}

// UI Functions
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #d4af37;
        color: #000000;
        padding: 1rem 2rem;
        border-radius: 5px;
        z-index: 1002;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #d4af37, #e6c158);
        color: #000000;
        padding: 2rem;
        border-radius: 15px;
        z-index: 1003;
        font-weight: bold;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        border: 3px solid #000000;
        max-width: 400px;
        white-space: pre-line;
        font-size: 1.1rem;
    `;
    successDiv.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
        <div>${message}</div>
        <button onclick="this.parentElement.remove()" style="
            background: #000000;
            color: #d4af37;
            border: 2px solid #d4af37;
            padding: 10px 20px;
            border-radius: 25px;
            cursor: pointer;
            margin-top: 1rem;
            font-weight: bold;
        ">Continue Shopping</button>
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        if (successDiv.parentElement) {
            successDiv.remove();
        }
    }, 8000);
}

function clearCart() {
    cart = [];
    updateCart();
}

// Global functions
window.processMpesaPayment = processMpesaPayment;
window.processCardPayment = processCardPayment;
window.simulatePayPalPayment = simulatePayPalPayment;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.addToCart = addToCart;
window.openCheckout = openCheckout;

// ===== SEARCH FUNCTIONALITY =====
function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (searchTerm === '') {
        clearSearchResults();
        return;
    }
    
    const results = searchProducts(searchTerm);
    displaySearchResults(results);
}

function searchProducts(searchTerm) {
    return Object.values(products).filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.price.toString().includes(searchTerm)
    );
}

function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults') || createSearchResultsContainer();
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">No products found for "' + document.getElementById('searchInput').value + '"</div>';
    } else {
        searchResults.innerHTML = results.map(product => {
            const productId = Object.keys(products).find(key => products[key] === product);
            return `
                <div class="search-result-item" onclick="selectSearchResult(${productId})">
                    <div class="search-result-info">
                        <h4>${product.name}</h4>
                        <p>KSh ${product.price}</p>
                        <small>${product.category}</small>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    searchResults.style.display = 'block';
}

function createSearchResultsContainer() {
    const container = document.getElementById('searchResults');
    return container; // Already exists in HTML
}

function selectSearchResult(productId) {
    document.getElementById('searchInput').value = '';
    clearSearchResults();
    addToCart(productId);
}

function clearSearchResults() {
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
        searchResults.style.display = 'none';
    }
}

// Real-time search
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', performSearch);
    }
});

// Close search results when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        clearSearchResults();
    }
});

// ===== LOGIN & REGISTER FUNCTIONALITY =====
function showLogin() {
    document.getElementById('loginModal').style.display = 'block';
    document.getElementById('registerModal').style.display = 'none';
}

function showRegister() {
    document.getElementById('registerModal').style.display = 'block';
    document.getElementById('loginModal').style.display = 'none';
}

function closeLogin() {
    document.getElementById('loginModal').style.display = 'none';
}

function closeRegister() {
    document.getElementById('registerModal').style.display = 'none';
}

// Login form handling
document.addEventListener('DOMContentLoaded', function() {
    // Login form
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            const password = this.querySelector('input[type="password"]').value;
            
            // Simulate login (in real app, this would call an API)
            if (email && password) {
                showSuccessMessage('✅ Login successful! Welcome back to TALIBHAN ENTERPRISE.');
                closeLogin();
                updateUserStatus(true);
            } else {
                alert('Please enter both email and password.');
            }
        });
    }
    
    // Register form
    const registerForm = document.querySelector('.register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const password = this.querySelectorAll('input[type="password"]')[0].value;
            const confirmPassword = this.querySelectorAll('input[type="password"]')[1].value;
            
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            if (name && email && password) {
                showSuccessMessage('🎉 Account created successfully! Welcome to TALIBHAN ENTERPRISE.');
                closeRegister();
                updateUserStatus(true, name);
            } else {
                alert('Please fill all fields.');
            }
        });
    }
    
    // Close modal events
    const closeLoginBtn = document.querySelector('.close-login');
    const closeRegisterBtn = document.querySelector('.close-register');
    
    if (closeLoginBtn) closeLoginBtn.addEventListener('click', closeLogin);
    if (closeRegisterBtn) closeRegisterBtn.addEventListener('click', closeRegister);
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === document.getElementById('loginModal')) closeLogin();
        if (e.target === document.getElementById('registerModal')) closeRegister();
    });
});

function updateUserStatus(loggedIn, userName = '') {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn && loggedIn) {
        loginBtn.innerHTML = `👤 ${userName || 'Account'}`;
        loginBtn.style.background = 'linear-gradient(135deg, #000000, #1a1a1a)';
        loginBtn.style.color = '#d4af37';
        loginBtn.onclick = function() { showAccountMenu(); };
    }
}

function showAccountMenu() {
    alert('Account menu would open here with: Order History, Profile, Logout etc.');
}

// ===== PRODUCT REVIEWS FUNCTIONALITY =====
function addProductReview(productId, rating, comment) {
    // In a real app, this would save to a database
    console.log(`Review added for product ${productId}: ${rating} stars - ${comment}`);
    showSuccessMessage('📝 Thank you for your review!');
}

// ===== ENHANCE EXISTING FUNCTIONALITY =====
// Add review capability to existing products
function showReviewModal(productId) {
    const product = products[productId];
    if (!product) return;
    
    const reviewHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeModal()">&times;</span>
            <h2>Review ${product.name}</h2>
            <div class="review-form">
                <div class="rating-stars">
                    <span onclick="setRating(1)">★</span>
                    <span onclick="setRating(2)">★</span>
                    <span onclick="setRating(3)">★</span>
                    <span onclick="setRating(4)">★</span>
                    <span onclick="setRating(5)">★</span>
                </div>
                <textarea placeholder="Share your experience with this product..." rows="4"></textarea>
                <button onclick="submitReview(${productId})">Submit Review</button>
            </div>
        </div>
    `;
    
    // You can implement this modal similarly to payment modal
    alert('Review feature would open here for product: ' + product.name);
}

// ===== GLOBAL FUNCTION DECLARATIONS =====
window.performSearch = performSearch;
window.selectSearchResult = selectSearchResult;
window.showLogin = showLogin;
window.showRegister = showRegister;
window.closeLogin = closeLogin;
window.closeRegister = closeRegister;

// ===== PRODUCT FILTERS FUNCTIONALITY =====
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons in the same group
            const parent = this.parentElement;
            parent.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Apply filters
            applyFilters();
        });
    });
}

function applyFilters() {
    const activeCategory = document.querySelector('.category-filters .filter-btn.active').dataset.category;
    const activePrice = document.querySelector('.price-filters .filter-btn.active').dataset.price;
    
    const filteredProducts = Object.values(products).filter(product => {
        // Category filter
        const categoryMatch = activeCategory === 'all' || 
                            product.category.toLowerCase() === activeCategory;
        
        // Price filter
        let priceMatch = true;
        if (activePrice !== 'all') {
            if (activePrice === '0-2000') {
                priceMatch = product.price <= 2000;
            } else if (activePrice === '2000-10000') {
                priceMatch = product.price > 2000 && product.price <= 10000;
            } else if (activePrice === '10000+') {
                priceMatch = product.price > 10000;
            }
        }
        
        return categoryMatch && priceMatch;
    });
    
    displayFilteredProducts(filteredProducts);
    updateProductCount(filteredProducts.length);
}

function displayFilteredProducts(filteredProducts) {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return;
    
    productGrid.innerHTML = filteredProducts.map(product => {
        const productId = Object.keys(products).find(key => products[key] === product);
        return `
            <div class="product-card">
                <img src="${getProductImage(productId)}" alt="${product.name}">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-desc">${getProductDescription(productId)}</p>
                    <p class="price">KSh ${product.price}</p>
                    <button class="buy-btn" data-product="${productId}">Add to Cart</button>
                </div>
            </div>
        `;
    }).join('');
    
    // Reattach event listeners to new buttons
    reattachCartEventListeners();
}

function getProductImage(productId) {
    const images = {
        1: "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=400&h=300&fit=crop",
        2: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop",
        3: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
        4: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=300&fit=crop",
        5: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&h=300&fit=crop",
        6: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop"
    };
    return images[productId] || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop";
}

function getProductDescription(productId) {
    const descriptions = {
        1: "Freshly roasted Arabica coffee beans",
        2: "10-inch Android tablet with stylus",
        3: "Noise cancelling over-ear headphones",
        4: "Modern glass top coffee table with storage",
        5: "Premium Kenyan tea leaves gift package",
        6: "Beautiful handmade African bead jewelry"
    };
    return descriptions[productId] || "Premium quality product";
}

function updateProductCount(count) {
    const productCount = document.getElementById('productCount');
    if (productCount) {
        productCount.textContent = `${count} product${count !== 1 ? 's' : ''}`;
    }
}

function clearAllFilters() {
    // Reset category filter
    const categoryButtons = document.querySelectorAll('.category-filters .filter-btn');
    categoryButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === 'all') {
            btn.classList.add('active');
        }
    });
    
    // Reset price filter
    const priceButtons = document.querySelectorAll('.price-filters .filter-btn');
    priceButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.price === 'all') {
            btn.classList.add('active');
        }
    });
    
    // Show all products
    applyFilters();
}

function reattachCartEventListeners() {
    const buyButtons = document.querySelectorAll('.buy-btn');
    buyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.getAttribute('data-product');
            addToCart(productId);
        });
    });
}

// Initialize filters when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeFilters();
});

// ===== UPDATE GLOBAL FUNCTIONS =====
window.clearAllFilters = clearAllFilters;
// ===== PRODUCT REVIEWS SYSTEM =====
let currentReviewProductId = null;
let currentRating = 0;

function showReviewModal(productId) {
    currentReviewProductId = productId;
    currentRating = 0;
    
    const product = products[productId];
    if (!product) return;
    
    // Create review modal
    const reviewModal = document.createElement('div');
    reviewModal.className = 'modal review-modal';
    reviewModal.id = 'reviewModal';
    reviewModal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeReviewModal()">&times;</span>
            <h2>Review ${product.name}</h2>
            <p>Share your experience with this product</p>
            
            <div class="rating-input">
                <span class="rating-star" onclick="setRating(1)">★</span>
                <span class="rating-star" onclick="setRating(2)">★</span>
                <span class="rating-star" onclick="setRating(3)">★</span>
                <span class="rating-star" onclick="setRating(4)">★</span>
                <span class="rating-star" onclick="setRating(5)">★</span>
            </div>
            
            <textarea class="review-textarea" placeholder="What did you like about this product? Any suggestions for improvement?" rows="4"></textarea>
            
            <button class="submit-review-btn" onclick="submitReview()">Submit Review</button>
        </div>
    `;
    
    document.body.appendChild(reviewModal);
    reviewModal.style.display = 'block';
    
    // Close modal when clicking outside
    reviewModal.addEventListener('click', function(e) {
        if (e.target === reviewModal) {
            closeReviewModal();
        }
    });
}

function setRating(rating) {
    currentRating = rating;
    const stars = document.querySelectorAll('.rating-star');
    
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function submitReview() {
    const reviewText = document.querySelector('.review-textarea').value.trim();
    
    if (currentRating === 0) {
        alert('Please select a rating before submitting your review.');
        return;
    }
    
    if (!reviewText) {
        alert('Please write a review before submitting.');
        return;
    }
    
    // In a real app, this would save to a database
    console.log(`Review submitted for product ${currentReviewProductId}:`, {
        rating: currentRating,
        review: reviewText,
        date: new Date().toISOString()
    });
    
    showSuccessMessage('📝 Thank you for your review! Your feedback helps other customers.');
    closeReviewModal();
    
    // Update product rating display (simulated)
    updateProductRating(currentReviewProductId, currentRating);
}

function closeReviewModal() {
    const reviewModal = document.getElementById('reviewModal');
    if (reviewModal) {
        reviewModal.remove();
    }
}

function updateProductRating(productId, newRating) {
    // Simulate updating the product's average rating
    // In a real app, this would calculate from all reviews
    const productCard = document.querySelector(`[data-product="${productId}"]`).closest('.product-card');
    if (productCard) {
        const ratingElement = productCard.querySelector('.rating');
        if (ratingElement) {
            // Simple simulation - just show the new rating
            const stars = '★'.repeat(newRating) + '☆'.repeat(5 - newRating);
            ratingElement.innerHTML = `${stars} <span class="rating-count">(${Math.floor(Math.random() * 50) + 1})</span>`;
        }
    }
}

// Initialize review buttons
function initializeReviewButtons() {
    // Buttons are already initialized via onclick attributes
}

// Add to global functions
window.showReviewModal = showReviewModal;
window.setRating = setRating;
window.closeReviewModal = closeReviewModal;