# CampusLoop Current Database Structure (Reference)

This file is a human-readable snapshot of the **current expected database schema** for CampusLoop.
Source of truth: `database/schema.sql` (plus migrations already reflected there).

## Database

- Name: `campusloop_db`
- Engine: `InnoDB`
- Charset: `utf8mb4`
- Collation: `utf8mb4_unicode_ci`
- Time defaults use `UTC_TIMESTAMP()`

## Tables Overview

1. `users`
2. `email_verification_otps`
3. `admins`
4. `products`
5. `product_images`
6. `listing_completion_otps`
7. `wishlists`
8. `chat_messages`
9. `product_reports`
10. `admin_action_logs`
11. `appeals`

---

## 1) users

Primary key:
- `user_id` (INT UNSIGNED, AUTO_INCREMENT)

Columns:
- `name` VARCHAR(150) NOT NULL
- `email` VARCHAR(255) NOT NULL
- `password_hash` VARCHAR(255) NOT NULL
- `is_email_verified` TINYINT(1) NOT NULL DEFAULT 0
- `email_verified_at` DATETIME NULL
- `status` ENUM('ACTIVE','SUSPENDED','BANNED') NOT NULL DEFAULT 'ACTIVE'
- `green_credits` INT UNSIGNED NOT NULL DEFAULT 0
- `created_at` DATETIME NOT NULL DEFAULT UTC_TIMESTAMP()
- `updated_at` DATETIME NOT NULL DEFAULT UTC_TIMESTAMP() ON UPDATE UTC_TIMESTAMP()

Indexes/constraints:
- PRIMARY KEY (`user_id`)
- UNIQUE KEY `uq_users_email` (`email`)

---

## 2) email_verification_otps

Primary key:
- `otp_id` (INT UNSIGNED, AUTO_INCREMENT)

Columns:
- `user_id` INT UNSIGNED NOT NULL
- `otp_hash` VARCHAR(255) NOT NULL
- `expires_at` DATETIME NOT NULL
- `attempts` INT UNSIGNED NOT NULL DEFAULT 0
- `resend_count` INT UNSIGNED NOT NULL DEFAULT 0
- `last_sent_at` DATETIME NULL
- `consumed_at` DATETIME NULL
- `created_at` DATETIME NOT NULL DEFAULT UTC_TIMESTAMP()
- `updated_at` DATETIME NOT NULL DEFAULT UTC_TIMESTAMP() ON UPDATE UTC_TIMESTAMP()

Indexes/constraints:
- PRIMARY KEY (`otp_id`)
- UNIQUE KEY `uq_email_otp_user` (`user_id`)  (one OTP row per user)
- KEY `idx_email_otp_expires` (`expires_at`)
- FK `fk_email_otp_user` (`user_id`) -> `users(user_id)` ON UPDATE CASCADE ON DELETE CASCADE

---

## 3) admins

Primary key:
- `admin_id` (INT UNSIGNED, AUTO_INCREMENT)

Columns:
- `email` VARCHAR(255) NOT NULL
- `password_hash` VARCHAR(255) NOT NULL
- `created_at` DATETIME NOT NULL DEFAULT UTC_TIMESTAMP()

Indexes/constraints:
- PRIMARY KEY (`admin_id`)
- UNIQUE KEY `uq_admins_email` (`email`)

---

## 4) products

Primary key:
- `product_id` (INT UNSIGNED, AUTO_INCREMENT)

Columns:
- `seller_id` INT UNSIGNED NOT NULL
- `title` VARCHAR(255) NOT NULL
- `description` TEXT NOT NULL
- `category` VARCHAR(100) NOT NULL
- `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00
- `listing_type` ENUM('SELL','RENT','DONATE') NOT NULL
- `status` ENUM('AVAILABLE','SOLD','DONATED') NOT NULL DEFAULT 'AVAILABLE'
- `moderation_status` ENUM('ACTIVE','UNDER_REVIEW','REMOVED') NOT NULL DEFAULT 'ACTIVE'
- `created_at` DATETIME NOT NULL DEFAULT UTC_TIMESTAMP()
- `updated_at` DATETIME NOT NULL DEFAULT UTC_TIMESTAMP() ON UPDATE UTC_TIMESTAMP()

Indexes/constraints:
- PRIMARY KEY (`product_id`)
- FK `fk_products_seller` (`seller_id`) -> `users(user_id)` ON UPDATE CASCADE ON DELETE RESTRICT

---

## 5) product_images

Primary key:
- `image_id` (INT UNSIGNED, AUTO_INCREMENT)

Columns:
- `product_id` INT UNSIGNED NOT NULL
- `image_url` VARCHAR(1024) NOT NULL
- `created_at` DATETIME NOT NULL DEFAULT UTC_TIMESTAMP()

Indexes/constraints:
- PRIMARY KEY (`image_id`)
- FK `fk_pimages_product` (`product_id`) -> `products(product_id)` ON UPDATE CASCADE ON DELETE CASCADE

---

## 6) listing_completion_otps

Primary key:
- `otp_id` (INT UNSIGNED, AUTO_INCREMENT)

Columns:
- `product_id` INT UNSIGNED NOT NULL
- `seller_id` INT UNSIGNED NOT NULL
- `pending_status` ENUM('SOLD','DONATED') NOT NULL
- `otp_hash` VARCHAR(255) NOT NULL
- `expires_at` DATETIME NOT NULL
- `attempts` INT UNSIGNED NOT NULL DEFAULT 0
- `resend_count` INT UNSIGNED NOT NULL DEFAULT 0
- `last_sent_at` DATETIME NULL
- `consumed_at` DATETIME NULL
- `created_at` DATETIME NOT NULL DEFAULT UTC_TIMESTAMP()
- `updated_at` DATETIME NOT NULL DEFAULT UTC_TIMESTAMP() ON UPDATE UTC_TIMESTAMP()

Indexes/constraints:
- PRIMARY KEY (`otp_id`)
- UNIQUE KEY `uq_listing_completion_product` (`product_id`)  (one OTP row per product)
- KEY `idx_listing_completion_expires` (`expires_at`)
- FK `fk_listing_completion_product` (`product_id`) -> `products(product_id)` ON UPDATE CASCADE ON DELETE CASCADE
- FK `fk_listing_completion_seller` (`seller_id`) -> `users(user_id)` ON UPDATE CASCADE ON DELETE CASCADE

---

## 7) wishlists

Primary key:
- `wishlist_id` (INT UNSIGNED, AUTO_INCREMENT)

Columns:
- `user_id` INT UNSIGNED NOT NULL
- `product_id` INT UNSIGNED NOT NULL
- `created_at` DATETIME NOT NULL DEFAULT UTC_TIMESTAMP()

Indexes/constraints:
- PRIMARY KEY (`wishlist_id`)
- UNIQUE KEY `uq_wishlist_user_product` (`user_id`, `product_id`)
- FK `fk_wishlist_user` (`user_id`) -> `users(user_id)` ON UPDATE CASCADE ON DELETE CASCADE
- FK `fk_wishlist_product` (`product_id`) -> `products(product_id)` ON UPDATE CASCADE ON DELETE CASCADE

---

## 8) chat_messages

Primary key:
- `chat_id` (INT UNSIGNED, AUTO_INCREMENT)

Columns:
- `sender_id` INT UNSIGNED NOT NULL
- `receiver_id` INT UNSIGNED NOT NULL
- `product_id` INT UNSIGNED NOT NULL
- `message` TEXT NOT NULL
- `created_at` DATETIME NOT NULL DEFAULT UTC_TIMESTAMP()

Indexes/constraints:
- PRIMARY KEY (`chat_id`)
- FK `fk_chat_sender` (`sender_id`) -> `users(user_id)` ON UPDATE CASCADE ON DELETE RESTRICT
- FK `fk_chat_receiver` (`receiver_id`) -> `users(user_id)` ON UPDATE CASCADE ON DELETE RESTRICT
- FK `fk_chat_product` (`product_id`) -> `products(product_id)` ON UPDATE CASCADE ON DELETE CASCADE

---

## 9) product_reports

Primary key:
- `report_id` (INT UNSIGNED, AUTO_INCREMENT)

Columns:
- `product_id` INT UNSIGNED NOT NULL
- `reported_by` INT UNSIGNED NOT NULL
- `reason` TEXT NOT NULL
- `status` ENUM('OPEN','REVIEWED','DISMISSED','ACTIONED') NOT NULL DEFAULT 'OPEN'
- `admin_id` INT UNSIGNED NULL
- `created_at` DATETIME NOT NULL DEFAULT UTC_TIMESTAMP()
- `reviewed_at` DATETIME NULL

Indexes/constraints:
- PRIMARY KEY (`report_id`)
- FK `fk_report_product` (`product_id`) -> `products(product_id)` ON UPDATE CASCADE ON DELETE CASCADE
- FK `fk_report_user` (`reported_by`) -> `users(user_id)` ON UPDATE CASCADE ON DELETE RESTRICT
- FK `fk_report_admin` (`admin_id`) -> `admins(admin_id)` ON UPDATE CASCADE ON DELETE SET NULL

---

## 10) admin_action_logs

Primary key:
- `log_id` (INT UNSIGNED, AUTO_INCREMENT)

Columns:
- `admin_id` INT UNSIGNED NOT NULL
- `target_type` ENUM('USER','PRODUCT') NOT NULL
- `target_id` INT UNSIGNED NOT NULL
- `action` VARCHAR(100) NOT NULL
- `reason` TEXT NOT NULL
- `created_at` DATETIME NOT NULL DEFAULT UTC_TIMESTAMP()

Indexes/constraints:
- PRIMARY KEY (`log_id`)
- FK `fk_log_admin` (`admin_id`) -> `admins(admin_id)` ON UPDATE CASCADE ON DELETE RESTRICT

---

## 11) appeals

Primary key:
- `appeal_id` (INT UNSIGNED, AUTO_INCREMENT)

Columns:
- `user_id` INT UNSIGNED NOT NULL
- `reason` TEXT NOT NULL
- `status` ENUM('OPEN','ACCEPTED','REJECTED') NOT NULL DEFAULT 'OPEN'
- `admin_id` INT UNSIGNED NULL
- `created_at` DATETIME NOT NULL DEFAULT UTC_TIMESTAMP()
- `reviewed_at` DATETIME NULL

Indexes/constraints:
- PRIMARY KEY (`appeal_id`)
- FK `fk_appeal_user` (`user_id`) -> `users(user_id)` ON UPDATE CASCADE ON DELETE RESTRICT
- FK `fk_appeal_admin` (`admin_id`) -> `admins(admin_id)` ON UPDATE CASCADE ON DELETE SET NULL

---

## Notes for Comparison

- If your existing Aiven DB has different table names (for example `admin_users` instead of `admins`), that is a mismatch.
- If your existing DB lacks `email_verification_otps` or `listing_completion_otps`, OTP flows will fail.
- If enums differ from above, status transitions and admin moderation may break.

---

## Quick Compare SQL (run in Aiven MySQL client)

```sql
USE campusloop_db;
SHOW TABLES;

SHOW CREATE TABLE users;
SHOW CREATE TABLE email_verification_otps;
SHOW CREATE TABLE admins;
SHOW CREATE TABLE products;
SHOW CREATE TABLE product_images;
SHOW CREATE TABLE listing_completion_otps;
SHOW CREATE TABLE wishlists;
SHOW CREATE TABLE chat_messages;
SHOW CREATE TABLE product_reports;
SHOW CREATE TABLE admin_action_logs;
SHOW CREATE TABLE appeals;
```
