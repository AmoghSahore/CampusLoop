USE campusloop_db;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_email_verified TINYINT(1) NOT NULL DEFAULT 0 AFTER password_hash,
  ADD COLUMN IF NOT EXISTS email_verified_at DATETIME NULL AFTER is_email_verified;

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
