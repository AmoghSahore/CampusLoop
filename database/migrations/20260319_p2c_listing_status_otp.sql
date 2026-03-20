USE campusloop_db;

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
