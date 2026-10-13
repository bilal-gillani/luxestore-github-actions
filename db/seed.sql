-- ================================================
-- E-Commerce Store - Seed Data
-- Run this AFTER init.sql on the Database VM
-- ================================================

-- IMPORTANT: Before running this file, generate a real bcrypt hash for the admin password.
--   node -e "const b=require('bcryptjs'); b.hash('admin-pass',10).then(h=>console.log(h));"
-- Then replace REPLACE_WITH_GENERATED_HASH below with the output.

USE ecommerce_store;

-- ------------------------------------------------
-- Admin User
-- Default password: [PASSWORD]
-- Replace the hash below with one generated from the command above
-- ------------------------------------------------
INSERT INTO users (name, email, password_hash, role, avatar_color) VALUES
('Admin User', 'admin@email.com', '$2a$10$ioST6fMeO2Zq3oPtM5JuVuM5Ks.64iZb4uhiwLbQUdWHxuNJ7rF.S', 'admin', '#EF4444');

-- ------------------------------------------------
-- Categories
-- ------------------------------------------------
INSERT INTO categories (name, description, icon) VALUES
('Electronics', 'Smartphones, laptops, gadgets and more', '💻'),
('Clothing', 'Fashion, apparel and accessories', '👕'),
('Home & Kitchen', 'Furniture, appliances and home essentials', '🏠'),
('Books', 'Bestsellers, fiction, non-fiction and textbooks', '📚'),
('Sports & Outdoors', 'Equipment, gear and fitness accessories', '⚽'),
('Beauty & Health', 'Skincare, makeup and wellness products', '✨');

-- ------------------------------------------------
-- Products
-- ------------------------------------------------

-- Electronics
INSERT INTO products (category_id, name, description, price, stock_quantity, image_url, featured) VALUES
(1, 'Wireless Noise-Cancelling Headphones', 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and Hi-Res audio support. Features adaptive sound control and speak-to-chat technology.', 299.99, 45, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', 1),
(1, 'Ultra-Slim Laptop Pro 15"', 'Powerful 15-inch laptop with M-series chip, 16GB RAM, 512GB SSD, Retina display. Perfect for professionals and creatives.', 1299.99, 20, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop', 1),
(1, 'Smart Watch Series X', 'Advanced health monitoring, GPS, always-on display, water resistant to 50m. Track your fitness goals with precision.', 449.99, 60, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', 1),
(1, 'Bluetooth Portable Speaker', 'Waterproof portable speaker with 360° sound, 20-hour playtime, and built-in microphone for calls.', 79.99, 100, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop', 0),
(1, '4K Ultra HD Action Camera', 'Capture stunning 4K footage with electronic stabilization, waterproof up to 10m, and wide-angle lens.', 199.99, 35, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop', 0);

-- Clothing
INSERT INTO products (category_id, name, description, price, stock_quantity, image_url, featured) VALUES
(2, 'Classic Leather Jacket', 'Genuine leather jacket with a timeless design. Soft inner lining, multiple pockets, and durable YKK zippers.', 189.99, 30, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop', 1),
(2, 'Premium Cotton T-Shirt Pack', 'Set of 3 premium cotton t-shirts in essential colors. Pre-shrunk, comfortable fit, reinforced stitching.', 49.99, 150, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', 0),
(2, 'Slim Fit Chino Pants', 'Modern slim-fit chinos made from stretch cotton blend. Versatile style for casual and semi-formal occasions.', 69.99, 80, 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop', 0),
(2, 'Running Sneakers Ultra', 'Lightweight running shoes with responsive cushioning, breathable mesh upper, and durable rubber outsole.', 129.99, 55, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', 1);

-- Home & Kitchen
INSERT INTO products (category_id, name, description, price, stock_quantity, image_url, featured) VALUES
(3, 'Automatic Espresso Machine', 'One-touch espresso machine with built-in grinder, milk frother, and 15-bar pressure pump. Makes cafe-quality drinks at home.', 549.99, 15, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&h=400&fit=crop', 1),
(3, 'Smart LED Desk Lamp', 'Adjustable LED desk lamp with wireless charging pad, multiple color temperatures, and touch controls.', 59.99, 90, 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400&h=400&fit=crop', 0),
(3, 'Non-Stick Cookware Set (10-Piece)', 'Complete cookware set with titanium non-stick coating, heat-resistant handles, and dishwasher-safe design.', 149.99, 40, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', 0),
(3, 'Air Purifier Pro', 'HEPA air purifier covering up to 500 sq ft. Real-time air quality monitor, quiet operation, and smart app control.', 229.99, 25, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop', 0);

-- Books
INSERT INTO products (category_id, name, description, price, stock_quantity, image_url, featured) VALUES
(4, 'The Art of Innovation', 'A groundbreaking guide to creative thinking and innovation in the modern world. Bestseller with over 1 million copies sold.', 24.99, 200, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop', 0),
(4, 'Data Science Fundamentals', 'Comprehensive textbook covering statistics, machine learning, and data visualization with Python. Includes practical exercises.', 39.99, 75, 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=400&fit=crop', 0),
(4, 'Mindful Leadership', 'Transform your leadership style with mindfulness practices. Real-world case studies and actionable strategies.', 19.99, 120, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop', 0);

-- Sports & Outdoors
INSERT INTO products (category_id, name, description, price, stock_quantity, image_url, featured) VALUES
(5, 'Yoga Mat Premium', 'Extra thick 6mm yoga mat with non-slip surface, alignment lines, and carrying strap. Eco-friendly materials.', 39.99, 100, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop', 0),
(5, 'Adjustable Dumbbell Set', 'Space-saving adjustable dumbbells from 5-52.5 lbs each. Quick-change weight system with comfortable grip.', 349.99, 20, 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400&h=400&fit=crop', 1),
(5, 'Insulated Water Bottle', 'Double-wall vacuum insulated stainless steel bottle. Keeps drinks cold 24hrs or hot 12hrs. BPA-free, leak-proof.', 29.99, 200, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop', 0);

-- Beauty & Health
INSERT INTO products (category_id, name, description, price, stock_quantity, image_url, featured) VALUES
(6, 'Vitamin C Brightening Serum', 'Advanced vitamin C serum with hyaluronic acid for bright, youthful skin. Dermatologist recommended.', 34.99, 80, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop', 0),
(6, 'Electric Toothbrush Pro', 'Sonic electric toothbrush with 5 modes, pressure sensor, smart timer, and 30-day battery life. Includes 3 brush heads.', 89.99, 65, 'https://images.unsplash.com/photo-1559591937-bbd4e3e22382?w=400&h=400&fit=crop', 0),
(6, 'Aromatherapy Diffuser Set', 'Ultrasonic essential oil diffuser with 7 LED colors, timer settings, and 6 pure essential oils included.', 44.99, 70, 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop', 0);
