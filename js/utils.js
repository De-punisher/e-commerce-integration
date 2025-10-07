const express = require('express');
const router = express.Router();
const axios = require('axios');

// M-Pesa Configuration
const mpesaConfig = {
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    shortCode: process.env.MPESA_SHORTCODE,
    passkey: process.env.MPESA_PASSKEY,
    callbackURL: process.env.MPESA_CALLBACK_URL
};

// M-Pesa Payment Endpoint
router.post('/mpesa', async (req, res) => {
    try {
        const { phone, amount, productId } = req.body;

        // Generate M-Pesa access token
        const auth = Buffer.from(`${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`).toString('base64');
        
        const tokenResponse = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
            headers: {
                'Authorization': `Basic ${auth}`
            }
        });

        const accessToken = tokenResponse.data.access_token;

        // Initiate STK Push
        const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, -4);
        const password = Buffer.from(`${mpesaConfig.shortCode}${mpesaConfig.passkey}${timestamp}`).toString('base64');

        const stkResponse = await axios.post(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            {
                BusinessShortCode: mpesaConfig.shortCode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: amount,
                PartyA: phone,
                PartyB: mpesaConfig.shortCode,
                PhoneNumber: phone,
                CallBackURL: mpesaConfig.callbackURL,
                AccountReference: `Product${productId}`,
                TransactionDesc: 'E-commerce Purchase'
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({
            success: true,
            transactionId: stkResponse.data.CheckoutRequestID,
            message: 'M-Pesa prompt sent to your phone'
        });

    } catch (error) {
        console.error('M-Pesa Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to initiate M-Pesa payment'
        });
    }
});

// M-Pesa Callback Handler
router.post('/mpesa/callback', (req, res) => {
    const callbackData = req.body;
    
    // Process M-Pesa callback
    if (callbackData.ResultCode === 0) {
        // Payment successful
        console.log('Payment successful:', callbackData);
        // Update order status in database
    } else {
        // Payment failed
        console.log('Payment failed:', callbackData);
    }
    
    res.json({ ResultCode: 0, ResultDesc: "Success" });
});

// PayPal Payment Endpoint
router.post('/paypal/create-order', async (req, res) => {
    try {
        const paypal = require('paypal-rest-sdk');
        
        paypal.configure({
            'mode': 'sandbox', // sandbox or live
            'client_id': process.env.PAYPAL_CLIENT_ID,
            'client_secret': process.env.PAYPAL_CLIENT_SECRET
        });

        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:3000/success",
                "cancel_url": "http://localhost:3000/cancel"
            },
            "transactions": [{
                "amount": {
                    "currency": "USD",
                    "total": req.body.amount
                },
                "description": req.body.description
            }]
        };

        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                throw error;
            } else {
                res.json({ id: payment.id });
            }
        });

    } catch (error) {
        console.error('PayPal Error:', error);
        res.status(500).json({ error: 'Failed to create PayPal order' });
    }
});

// Credit Card Payment Endpoint (using Stripe)
router.post('/card', async (req, res) => {
    try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

        const { card, amount, product } = req.body;

        // Create a payment method
        const paymentMethod = await stripe.paymentMethods.create({
            type: 'card',
            card: {
                number: card.number,
                exp_month: card.expiry.split('/')[0],
                exp_year: card.expiry.split('/')[1],
                cvc: card.cvv,
            },
        });

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Convert to cents
            currency: 'kes',
            payment_method: paymentMethod.id,
            confirm: true,
            description: `Purchase: ${product}`,
            return_url: 'http://localhost:3000/success',
        });

        res.json({
            success: true,
            paymentIntentId: paymentIntent.id,
            message: 'Payment successful'
        });

    } catch (error) {
        console.error('Stripe Error:', error);
        res.status(500).json({
            success: false,
            message: 'Card payment failed: ' + error.message
        });
    }
});

module.exports = router;