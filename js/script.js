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

let selectedProduct = null;
let selectedPaymentMethod = 'mpesa';

// Event Listeners
buyButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const productId = e.target.getAttribute('data-product');
        selectedProduct = products[productId];
        openPaymentModal(selectedProduct);
    });
});

closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

paymentOptions.forEach(option => {
    option.addEventListener('click', (e) => {
        const method = e.currentTarget.getAttribute('data-method');
        selectPaymentMethod(method);
    });
});

// Functions
function openPaymentModal(product) {
    document.getElementById('productName').textContent = product.name;
    document.getElementById('productPrice').textContent = `KSh ${product.price}`;
    modal.style.display = 'block';
    selectPaymentMethod('mpesa'); // Default to M-Pesa
}

function closeModal() {
    modal.style.display = 'none';
}

function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    
    // Update UI
    paymentOptions.forEach(option => {
        option.classList.toggle('active', option.getAttribute('data-method') === method);
    });
    
    // Show relevant form
    Object.keys(paymentForms).forEach(key => {
        paymentForms[key].classList.toggle('hidden', key !== method);
    });
    
    // Initialize PayPal if selected
    if (method === 'paypal') {
        initializePayPal();
    }
}

// M-Pesa Payment - SIMPLIFIED
async function processMpesaPayment() {
    const phone = document.getElementById('mpesaPhone').value;
    
    if (!phone) {
        alert('📱 Please enter your M-Pesa phone number');
        return;
    }
    
    // Show loading state
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = '⏳ Processing...';
    button.disabled = true;
    
    alert('✅ M-Pesa payment initiated!\n\n📱 Check your phone: ' + phone + '\n💳 Amount: KSh ' + selectedProduct.price + '\n\nPlease enter your M-Pesa PIN to complete payment.');
    
    // Simulate payment processing
    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        showSuccessMessage('🎉 Payment Successful!\n\n✅ M-Pesa payment confirmed\n📦 Your order is being processed\n📞 You will receive SMS confirmation\n\nThank you for shopping with TALIBHAN ENTERPRISE!');
        closeModal();
        clearCart();
    }, 3000);
}

// PayPal Integration - SIMPLIFIED
 function simulatePayPalPayment() {
    alert('🌐 Redirecting to PayPal...\n\nPlease login to your PayPal account to complete payment of KSh ' + selectedProduct.price);
    
    setTimeout(() => {
        showSuccessMessage('🎉 PayPal Payment Successful!\n\n✅ Payment confirmed via PayPal\n📦 Your order is being processed\n📧 Receipt sent to your email\n\nThank you for choosing TALIBHAN ENTERPRISE!');
        closeModal();
        clearCart();
    }, 3000);
}

// Credit Card Payment - SIMPLIFIED
async function processCardPayment() {
    const cardNumber = document.getElementById('cardNumber').value;
    const expiry = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;

    if (!cardNumber || !expiry || !cvv) {
        alert('💳 Please fill all card details');
        return;
    }

    // Show loading state
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

// Shopping Cart Functionality
let cart = [];
const cartSidebar = document.getElementById('cartSidebar');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');

// Update "Add to Cart" buttons
document.querySelectorAll('.buy-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const productId = e.target.getAttribute('data-product');
        addToCart(productId);
    });
});

// Cart Functions
function addToCart(productId) {
    const product = products[productId];
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
    // Update cart items display
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
    
    // Update total and count
    cartTotal.textContent = total;
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function openCart() {
    cartSidebar.classList.add('open');
}

function closeCart() {
    cartSidebar.classList.remove('open');
}

function openCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    closeCart();
    // For now, open payment modal with first item
    selectedProduct = { 
        name: 'Multiple Items', 
        price: parseInt(cartTotal.textContent) 
    };
    openPaymentModal(selectedProduct);
}

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
        notification.remove();
    }, 3000);
}

// Close cart when clicking outside
document.addEventListener('click', (e) => {
    if (!cartSidebar.contains(e.target) && !e.target.closest('.cart-icon')) {
        closeCart();
    }
});

// Update cart icon to open cart
document.querySelector('.cart-icon').addEventListener('click', openCart);
document.querySelector('.close-cart').addEventListener('click', closeCart);
// Success message function
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

// Clear cart after successful payment
function clearCart() {
    cart = [];
    updateCart();
}

// Success message function
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

// Clear cart after successful payment
function clearCart() {
    cart = [];
    updateCart();
}

// Success message function
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

// Clear cart after successful payment
function clearCart() {
    cart = [];
    updateCart();
}