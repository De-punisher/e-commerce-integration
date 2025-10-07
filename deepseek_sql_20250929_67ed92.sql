CREATE DATABASE ecommerce_payments;
USE ecommerce_payments;

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    customer_email VARCHAR(255),
    total_amount DECIMAL(10, 2),
    payment_method ENUM('mpesa', 'paypal', 'card'),
    payment_status ENUM('pending', 'completed', 'failed'),
    mpesa_transaction_id VARCHAR(255),
    paypal_order_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE payment_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    payment_gateway VARCHAR(50),
    request_data JSON,
    response_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Insert sample products
INSERT INTO products (name, price, description) VALUES
('Kenyan Coffee', 1200.00, 'Premium Kenyan Arabica Coffee'),
('Maasai Shuka', 2500.00, 'Traditional Maasai Blanket');