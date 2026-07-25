CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  description TEXT,
  description_en TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL,
  images TEXT[] NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  rating DECIMAL(2,1) NOT NULL DEFAULT 0,
  reviews INT NOT NULL DEFAULT 0,
  tags TEXT[] NOT NULL DEFAULT '{}',
  story TEXT,
  culture TEXT,
  use TEXT
);

CREATE TABLE IF NOT EXISTS blogs (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  title_en VARCHAR(255),
  content TEXT NOT NULL,
  content_en TEXT,
  category VARCHAR(50) NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  audio VARCHAR(255),
  video VARCHAR(255),
  author VARCHAR(255) NOT NULL,
  publish_date DATE NOT NULL,
  views INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(255) PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  shipped_at TIMESTAMP,
  updated_at TIMESTAMP,
  tracking_number VARCHAR(255),
  carrier VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(255) PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL REFERENCES products(id),
  nickname VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  rating DECIMAL(2,1) NOT NULL,
  content TEXT NOT NULL,
  date DATE NOT NULL DEFAULT NOW(),
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_email BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS shipping_rates (
  country VARCHAR(255) PRIMARY KEY,
  standard DECIMAL(10,2) NOT NULL,
  express DECIMAL(10,2) NOT NULL,
  free_threshold DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  id VARCHAR(255) PRIMARY KEY DEFAULT 'default',
  site_name VARCHAR(255) NOT NULL,
  site_description VARCHAR(500),
  download_link VARCHAR(500),
  mail_from VARCHAR(255),
  app_url VARCHAR(500),
  ga_measurement_id VARCHAR(50),
  banner_image VARCHAR(500),
  order_email_subject_en VARCHAR(500),
  order_email_body_en TEXT,
  order_email_subject_zh VARCHAR(500),
  order_email_body_zh TEXT
);

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMP,
  order_ids TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS verification_codes (
  email VARCHAR(255) PRIMARY KEY,
  code VARCHAR(10) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS carts (
  id VARCHAR(255) PRIMARY KEY,
  items JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO shipping_rates (country, standard, express, free_threshold) VALUES
('United States', 4.99, 10.99, 49.99),
('Canada', 6.99, 12.99, 59.99),
('United Kingdom', 5.99, 11.99, 49.99),
('Germany', 5.99, 11.99, 49.99),
('France', 5.99, 11.99, 49.99),
('Italy', 6.99, 12.99, 59.99),
('Spain', 6.99, 12.99, 59.99),
('Australia', 7.99, 14.99, 69.99),
('Japan', 5.99, 11.99, 49.99),
('Other', 9.99, 18.99, 89.99);

INSERT INTO settings (id, site_name, site_description, download_link, mail_from, app_url, ga_measurement_id, banner_image, order_email_subject_en, order_email_body_en, order_email_subject_zh, order_email_body_zh) VALUES
('default', 'Chengdu Voice | 成都之音', '闭上眼，听成都', 'https://cdn.example.com/download.zip', 'Chengdu Voice <hello@chengduvoice.com>', 'http://localhost:3000', '', 'https://picsum.photos/id/1015/1920/1080', 'Your Order Has Been Confirmed - Chengdu Voice', 'Dear {customerName},\n\nThank you for your order! We have received your order #{orderNumber} and will begin processing it within 24 hours.\n\nYour package will be shipped via cross-border logistics and we will send you a tracking number once it is dispatched.\n\nThank you for choosing Chengdu Voice!', '您的订单已确认 - 成都之音', '尊敬的 {customerName}，\n\n感谢您的订单！我们已收到您的订单 #{orderNumber}，将在24小时内开始处理。\n\n您的包裹将通过跨境物流发出，发货后我们会发送物流追踪号码给您。\n\n感谢您选择成都之音！');