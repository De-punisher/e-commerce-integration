// Product data
const products = {
    1: { name: "Kenyan Coffee", price: 1200 },
    2: { name: "Maasai Shuka", price: 2500 }
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

// M-Pesa Payment
async function processMpesaPayment() {
    const phone = document.getElementById('mpesaPhone').value;
    
    if (!phone) {
        alert('Please enter your M-Pesa phone number');
        return;
    }

    try {
        const response = await fetch('/api/payments/mpesa', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phone: phone,
                amount: selectedProduct.price,
                productId: Object.keys(products).find(key => products[key] === selectedProduct)
            })
        });

        const data = await response.json();
        
        if (data.success) {
            alert('M-Pesa prompt sent to your phone. Please enter your PIN to complete payment.');
            // Poll for payment confirmation
            checkMpesaPaymentStatus(data.transactionId);
        } else {
            alert('Payment failed: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while processing your payment');
    }
}

async function checkMpesaPaymentStatus(transactionId) {
    // Implement polling to check payment status
    const checkStatus = async () => {
        const response = await fetch(`/api/payments/mpesa/status/${transactionId}`);
        const data = await response.json();
        
        if (data.status === 'completed') {
            alert('Payment successful! Thank you for your purchase.');
            closeModal();
        } else if (data.status === 'failed') {
            alert('Payment failed. Please try again.');
        } else {
            // Continue polling
            setTimeout(checkStatus, 2000);
        }
    };
    
    checkStatus();
}

// PayPal Integration
function initializePayPal() {
    paypal.Buttons({
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: (selectedProduct.price / 100).toFixed(2) // Convert to USD
                    },
                    description: selectedProduct.name
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                alert('Payment completed by ' + details.payer.name.given_name);
                closeModal();
            });
        },
        onError: function(err) {
            console.error('PayPal Error:', err);
            alert('An error occurred with PayPal payment');
        }
    }).render('#paypal-button-container');
}

// Credit Card Payment
async function processCardPayment() {
    const cardData = {
        number: document.getElementById('cardNumber').value,
        expiry: document.getElementById('expiryDate').value,
        cvv: document.getElementById('cvv').value
    };

    // Basic validation
    if (!cardData.number || !cardData.expiry || !cardData.cvv) {
        alert('Please fill all card details');
        return;
    }

    try {
        const response = await fetch('/api/payments/card', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                card: cardData,
                amount: selectedProduct.price,
                product: selectedProduct.name
            })
        });

        const data = await response.json();
        
        if (data.success) {
            alert('Payment successful! Thank you for your purchase.');
            closeModal();
        } else {
            alert('Payment failed: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while processing your payment');
    }
}