-- ============================================================
-- CampusLoop Database Schema
-- Engine: InnoDB | Charset: utf8mb4 | Time: UTC
-- ============================================================

CREATE DATABASE IF NOT EXISTS campusloop
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE campusloop;

-- ============================================================
-- 1. users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  user_id       INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  name          VARCHAR(150)      NOT NULL,
  email         VARCHAR(255)      NOT NULL,
  password_hash VARCHAR(255)      NOT NULL,
  is_email_verified TINYINT(1)    NOT NULL DEFAULT 0,
  email_verified_at DATETIME      NULL,
  status        ENUM('ACTIVE','SUSPENDED','BANNED')
                                  NOT NULL DEFAULT 'ACTIVE',
  green_credits INT UNSIGNED      NOT NULL DEFAULT 0,
  created_at    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP
                                  ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 1b. email_verification_otps
-- ============================================================
CREATE TABLE IF NOT EXISTS email_verification_otps (
  otp_id        INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  user_id       INT UNSIGNED      NOT NULL,
  otp_hash      VARCHAR(255)      NOT NULL,
  expires_at    DATETIME          NOT NULL,
  attempts      INT UNSIGNED      NOT NULL DEFAULT 0,
  resend_count  INT UNSIGNED      NOT NULL DEFAULT 0,
  last_sent_at  DATETIME          NULL,
  consumed_at   DATETIME          NULL,
  created_at    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP
                                  ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (otp_id),
  UNIQUE KEY uq_email_otp_user (user_id),
  KEY idx_email_otp_expires (expires_at),
  CONSTRAINT fk_email_otp_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. admins
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
  admin_id      INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  name          VARCHAR(150)      NOT NULL DEFAULT 'CampusLoop Admin',
  email         VARCHAR(255)      NOT NULL,
  password_hash VARCHAR(255)      NOT NULL,
  role          ENUM('ADMIN')     NOT NULL DEFAULT 'ADMIN',
  status        ENUM('ACTIVE','DISABLED')
                                  NOT NULL DEFAULT 'ACTIVE',
  created_at    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP
                                  ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (admin_id),
  UNIQUE KEY uq_admins_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2b. admin_users (compatibility table for existing seed script)
-- NOTE:
--  - Runtime controllers use `admins`
--  - Existing seed script writes to `admin_users`
--  This table + triggers keep both in sync for fresh setups.
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id            INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  name          VARCHAR(150)      NOT NULL DEFAULT 'CampusLoop Admin',
  email         VARCHAR(255)      NOT NULL,
  password_hash VARCHAR(255)      NOT NULL,
  role          ENUM('ADMIN')     NOT NULL DEFAULT 'ADMIN',
  status        ENUM('ACTIVE','DISABLED')
                                  NOT NULL DEFAULT 'ACTIVE',
  created_at    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP
                                  ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TRIGGER IF EXISTS trg_admin_users_ai;
DROP TRIGGER IF EXISTS trg_admin_users_au;
DROP TRIGGER IF EXISTS trg_admin_users_ad;

CREATE TRIGGER trg_admin_users_ai
AFTER INSERT ON admin_users
FOR EACH ROW
INSERT INTO admins (admin_id, name, email, password_hash, role, status, created_at, updated_at)
VALUES (NEW.id, NEW.name, NEW.email, NEW.password_hash, NEW.role, NEW.status, NEW.created_at, NEW.updated_at)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  email = VALUES(email),
  password_hash = VALUES(password_hash),
  role = VALUES(role),
  status = VALUES(status),
  updated_at = VALUES(updated_at);

CREATE TRIGGER trg_admin_users_au
AFTER UPDATE ON admin_users
FOR EACH ROW
UPDATE admins
SET
  name = NEW.name,
  email = NEW.email,
  password_hash = NEW.password_hash,
  role = NEW.role,
  status = NEW.status,
  updated_at = NEW.updated_at
WHERE admin_id = NEW.id;

CREATE TRIGGER trg_admin_users_ad
AFTER DELETE ON admin_users
FOR EACH ROW
DELETE FROM admins WHERE admin_id = OLD.id;

-- ============================================================
-- 3. products
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  product_id         INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  seller_id          INT UNSIGNED   NOT NULL,
  title              VARCHAR(255)   NOT NULL,
  description        TEXT           NOT NULL,
  category           VARCHAR(100)   NOT NULL,
  price              DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  listing_type       ENUM('SELL','RENT','DONATE')
                                    NOT NULL,
  status             ENUM('AVAILABLE','SOLD','DONATED')
                                    NOT NULL DEFAULT 'AVAILABLE',
  moderation_status  ENUM('ACTIVE','UNDER_REVIEW','REMOVED')
                                    NOT NULL DEFAULT 'ACTIVE',
  created_at         DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id),
  CONSTRAINT fk_products_seller
    FOREIGN KEY (seller_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. product_images
-- ============================================================
CREATE TABLE IF NOT EXISTS product_images (
  image_id    INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  product_id  INT UNSIGNED   NOT NULL,
  image_url   VARCHAR(1024)  NOT NULL,
  created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (image_id),
  CONSTRAINT fk_pimages_product
    FOREIGN KEY (product_id) REFERENCES products(product_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4b. listing_completion_otps
-- ============================================================
CREATE TABLE IF NOT EXISTS listing_completion_otps (
  otp_id              INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  product_id          INT UNSIGNED      NOT NULL,
  seller_id           INT UNSIGNED      NOT NULL,
  pending_status      ENUM('SOLD','DONATED')
                                          NOT NULL,
  otp_hash            VARCHAR(255)      NOT NULL,
  expires_at          DATETIME          NOT NULL,
  attempts            INT UNSIGNED      NOT NULL DEFAULT 0,
  resend_count        INT UNSIGNED      NOT NULL DEFAULT 0,
  last_sent_at        DATETIME          NULL,
  consumed_at         DATETIME          NULL,
  created_at          DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP
                                        ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (otp_id),
  UNIQUE KEY uq_listing_completion_product (product_id),
  KEY idx_listing_completion_expires (expires_at),
  CONSTRAINT fk_listing_completion_product
    FOREIGN KEY (product_id) REFERENCES products(product_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_listing_completion_seller
    FOREIGN KEY (seller_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. wishlists
-- ============================================================
CREATE TABLE IF NOT EXISTS wishlists (
  wishlist_id  INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id      INT UNSIGNED  NOT NULL,
  product_id   INT UNSIGNED  NOT NULL,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (wishlist_id),
  UNIQUE KEY uq_wishlist_user_product (user_id, product_id),
  CONSTRAINT fk_wishlist_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_product
    FOREIGN KEY (product_id) REFERENCES products(product_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. chat_messages
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  chat_id     INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  sender_id   INT UNSIGNED  NOT NULL,
  receiver_id INT UNSIGNED  NOT NULL,
  product_id  INT UNSIGNED  NOT NULL,
  message     TEXT          NOT NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (chat_id),
  CONSTRAINT fk_chat_sender
    FOREIGN KEY (sender_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_chat_receiver
    FOREIGN KEY (receiver_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_chat_product
    FOREIGN KEY (product_id) REFERENCES products(product_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. product_reports
-- ============================================================
CREATE TABLE IF NOT EXISTS product_reports (
  report_id    INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  product_id   INT UNSIGNED  NOT NULL,
  reported_by  INT UNSIGNED  NOT NULL,
  reason       TEXT          NOT NULL,
  status       ENUM('OPEN','REVIEWED','DISMISSED','ACTIONED')
                             NOT NULL DEFAULT 'OPEN',
  admin_id     INT UNSIGNED  NULL,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at  DATETIME      NULL,
  PRIMARY KEY (report_id),
  CONSTRAINT fk_report_product
    FOREIGN KEY (product_id) REFERENCES products(product_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_report_user
    FOREIGN KEY (reported_by) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_report_admin
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. admin_action_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_action_logs (
  log_id       INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  admin_id     INT UNSIGNED  NOT NULL,
  target_type  ENUM('USER','PRODUCT') NOT NULL,
  target_id    INT UNSIGNED  NOT NULL,
  action       VARCHAR(100)  NOT NULL,
  reason       TEXT          NOT NULL,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (log_id),
  CONSTRAINT fk_log_admin
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. appeals
-- ============================================================
CREATE TABLE IF NOT EXISTS appeals (
  appeal_id    INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id      INT UNSIGNED  NOT NULL,
  reason       TEXT          NOT NULL,
  status       ENUM('OPEN','ACCEPTED','REJECTED')
                             NOT NULL DEFAULT 'OPEN',
  admin_id     INT UNSIGNED  NULL,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at  DATETIME      NULL,
  PRIMARY KEY (appeal_id),
  CONSTRAINT fk_appeal_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_appeal_admin
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
