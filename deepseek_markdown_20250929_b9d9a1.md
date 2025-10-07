# E-commerce Payment Integration

A complete e-commerce website with integrated payment systems for M-Pesa, PayPal, and Credit Cards.

## Features

- Multi-payment gateway integration (M-Pesa, PayPal, Credit Cards)
- Responsive design
- Secure payment processing
- Order management
- Payment status tracking

## Payment Methods Supported

1. **M-Pesa** - Mobile money payments (Kenya)
2. **PayPal** - International payments
3. **Credit/Debit Cards** - Via Stripe integration

## Setup Instructions

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Configure payment gateway credentials
5. Run the application: `npm start`

## Environment Variables

Create a `.env` file with:

```env
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
DATABASE_URL=your_database_url