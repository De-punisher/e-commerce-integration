// Product data - TALIBHAN ENTERPRISE
const products = {
    1: { name: "Premium Kenyan Coffee", price: 1200, category: "Beverages" },
    2: { name: "Samsung Galaxy Tablet", price: 2500, category: "Clothing" },
    3: { name: "Wireless Bluetooth Headphones", price: 1800, category: "Art" },
    4: { name: "Smartphone Power Bank", price: 900, category: "Food" },
    5: { name: "Kenyan Tea Gift Box", price: 1500, category: "Beverages" },
    6: { name: "Beaded Jewelry Set", price: 1100, category: "Accessories" }
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
        alert('Please enter your M-Pesa phone number');
        return;
    }
    
    alert(`📱 M-Pesa prompt sent to ${phone} for KSh ${selectedProduct.price}\n\n(Simulation: Imagine entering PIN on your phone)`);
    
    setTimeout(() => {
        alert('✅ Payment confirmed! Thank you for your purchase.');
        closeModal();
    }, 2000);
}

// PayPal Integration - SIMPLIFIED
function initializePayPal() {
    document.getElementById('paypal-button-container').innerHTML = `
        <button onclick="simulatePayPalPayment()" style="background: #0070ba; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">
            Pay with PayPal - KSh ${selectedProduct.price}
        </button>
    `;
}

function simulatePayPalPayment() {
    alert(`🌐 Redirecting to PayPal for KSh ${selectedProduct.price}\n\n(Simulation: Imagine logging into PayPal)`);
    
    setTimeout(() => {
        alert('✅ PayPal payment successful! Thank you for your purchase.');
        closeModal();
    }, 2000);
}

// Credit Card Payment - SIMPLIFIED
async function processCardPayment() {
    const cardNumber = document.getElementById('cardNumber').value;
    const expiry = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;

    if (!cardNumber || !expiry || !cvv) {
        alert('Please fill all card details');
        return;
    }

    alert(`💳 Processing card payment for KSh ${selectedProduct.price}\n\n(Simulation: Imagine bank verification)`);

    setTimeout(() => {
        alert('✅ Card payment successful! Thank you for your purchase.');
        closeModal();
    }, 2000);
}