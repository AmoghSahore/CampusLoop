# Appendix

---

## Appendix A – Database Schema

The CampusLoop platform uses a MySQL (InnoDB) database named `campusloop_db`.

### users
Stores registered student accounts.

| Field | Type | Notes |
|---|---|---|
| user_id | INT UNSIGNED (PK) | Auto-increment |
| name | VARCHAR(150) | |
| email | VARCHAR(255) | Unique |
| password_hash | VARCHAR(255) | bcrypt hash |
| is_email_verified | TINYINT(1) | Default: 0 |
| email_verified_at | DATETIME | Nullable |
| status | ENUM('ACTIVE','SUSPENDED','BANNED') | Default: ACTIVE |
| green_credits | INT UNSIGNED | Default: 0 |
| created_at | DATETIME | UTC |
| updated_at | DATETIME | UTC, auto-updated |

### email_verification_otps
Stores account verification OTP metadata per user.

| Field | Type | Notes |
|---|---|---|
| otp_id | INT UNSIGNED (PK) | Auto-increment |
| user_id | INT UNSIGNED (FK → users) | Unique per user |
| otp_hash | VARCHAR(255) | SHA-256 hash |
| expires_at | DATETIME | OTP expiry |
| attempts | INT UNSIGNED | Invalid attempts counter |
| resend_count | INT UNSIGNED | Resend counter |
| last_sent_at | DATETIME | Nullable |
| consumed_at | DATETIME | Nullable |
| created_at | DATETIME | UTC |
| updated_at | DATETIME | UTC, auto-updated |

### admins
Stores administrator accounts (separate from regular users).

| Field | Type | Notes |
|---|---|---|
| admin_id | INT UNSIGNED (PK) | Auto-increment |
| email | VARCHAR(255) | Unique |
| password_hash | VARCHAR(255) | bcrypt hash |
| created_at | DATETIME | UTC |

### products
Stores all product listings created by sellers.

| Field | Type | Notes |
|---|---|---|
| product_id | INT UNSIGNED (PK) | Auto-increment |
| seller_id | INT UNSIGNED (FK → users) | |
| title | VARCHAR(255) | |
| description | TEXT | |
| category | VARCHAR(100) | |
| price | DECIMAL(10,2) | Default: 0.00 |
| listing_type | ENUM('SELL','RENT','DONATE') | |
| status | ENUM('AVAILABLE','SOLD','DONATED') | Default: AVAILABLE |
| moderation_status | ENUM('ACTIVE','UNDER_REVIEW','REMOVED') | Default: ACTIVE |
| created_at | DATETIME | UTC |
| updated_at | DATETIME | UTC, auto-updated |

### product_images
Stores Cloudinary image URLs linked to products.

| Field | Type | Notes |
|---|---|---|
| image_id | INT UNSIGNED (PK) | Auto-increment |
| product_id | INT UNSIGNED (FK → products) | Cascades on delete |
| image_url | VARCHAR(1024) | Cloudinary secure URL |
| created_at | DATETIME | UTC |

### listing_completion_otps
Stores OTP data for confirming listing completion status (`SOLD` / `DONATED`).

| Field | Type | Notes |
|---|---|---|
| otp_id | INT UNSIGNED (PK) | Auto-increment |
| product_id | INT UNSIGNED (FK → products) | Unique per product |
| seller_id | INT UNSIGNED (FK → users) | Listing owner |
| pending_status | ENUM('SOLD','DONATED') | Target status |
| otp_hash | VARCHAR(255) | SHA-256 hash |
| expires_at | DATETIME | OTP expiry |
| attempts | INT UNSIGNED | Invalid attempts counter |
| resend_count | INT UNSIGNED | Resend counter |
| last_sent_at | DATETIME | Nullable |
| consumed_at | DATETIME | Nullable |
| created_at | DATETIME | UTC |
| updated_at | DATETIME | UTC, auto-updated |

### wishlists
Tracks products saved by users.

| Field | Type | Notes |
|---|---|---|
| wishlist_id | INT UNSIGNED (PK) | Auto-increment |
| user_id | INT UNSIGNED (FK → users) | Cascades on delete |
| product_id | INT UNSIGNED (FK → products) | Cascades on delete |
| created_at | DATETIME | UTC |

> Unique constraint on (user_id, product_id) prevents duplicate entries.

### chat_messages
Stores direct messages between buyers and sellers about a specific product.

| Field | Type | Notes |
|---|---|---|
| chat_id | INT UNSIGNED (PK) | Auto-increment |
| sender_id | INT UNSIGNED (FK → users) | |
| receiver_id | INT UNSIGNED (FK → users) | |
| product_id | INT UNSIGNED (FK → products) | Cascades on delete |
| message | TEXT | |
| created_at | DATETIME | UTC |

### product_reports
Stores user-submitted reports against listings.

| Field | Type | Notes |
|---|---|---|
| report_id | INT UNSIGNED (PK) | Auto-increment |
| product_id | INT UNSIGNED (FK → products) | Cascades on delete |
| reported_by | INT UNSIGNED (FK → users) | |
| reason | TEXT | |
| status | ENUM('OPEN','REVIEWED','DISMISSED','ACTIONED') | Default: OPEN |
| admin_id | INT UNSIGNED (FK → admins, nullable) | Assigned reviewer |
| created_at | DATETIME | UTC |
| reviewed_at | DATETIME | Nullable |

### admin_action_logs
Audit trail of all moderation actions taken by admins.

| Field | Type | Notes |
|---|---|---|
| log_id | INT UNSIGNED (PK) | Auto-increment |
| admin_id | INT UNSIGNED (FK → admins) | |
| target_type | ENUM('USER','PRODUCT') | |
| target_id | INT UNSIGNED | References user or product |
| action | VARCHAR(100) | e.g., SUSPEND, REMOVE |
| reason | TEXT | |
| created_at | DATETIME | UTC |

### appeals
Allows suspended/banned users to appeal their account status.

| Field | Type | Notes |
|---|---|---|
| appeal_id | INT UNSIGNED (PK) | Auto-increment |
| user_id | INT UNSIGNED (FK → users) | |
| reason | TEXT | |
| status | ENUM('OPEN','ACCEPTED','REJECTED') | Default: OPEN |
| admin_id | INT UNSIGNED (FK → admins, nullable) | Reviewing admin |
| created_at | DATETIME | UTC |
| reviewed_at | DATETIME | Nullable |

---

## Appendix B – API Endpoints

Base URL: `http://localhost:5000/api`

### Health
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /health | None | Server health check |

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /auth/signup | None | Register a new user account |
| POST | /auth/login | None | Authenticate user and return JWT |
| POST | /auth/verify-otp | None | Verify email OTP after signup |
| POST | /auth/resend-otp | None | Resend verification OTP |

### Products
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /products | None | Fetch all available product listings |
| GET | /products/:id | None | Fetch a single product by ID |
| GET | /products/:id/image | None | Fetch primary image URL for a product |
| POST | /listings | JWT + ACTIVE | Create a new product listing |
| DELETE | /products/:id | JWT + ACTIVE | Delete an existing listing (owner only) |
| POST | /products/:id/status/request-otp | JWT + ACTIVE | Request OTP to complete listing as SOLD/DONATED |
| POST | /products/:id/status/confirm-otp | JWT + ACTIVE | Confirm listing completion with OTP; awards green credits |

### Wishlist
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /wishlist | JWT | Fetch wishlist items + IDs |
| POST | /wishlist/:productId | JWT + ACTIVE | Add product to wishlist |
| DELETE | /wishlist/:productId | JWT + ACTIVE | Remove product from wishlist |

### Community Safety
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /reports | JWT + ACTIVE | Report a product listing |
| POST | /appeals | JWT | Submit account appeal (non-active users) |
| GET | /appeals/me | JWT | Fetch current user's appeals |

### Admin
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /admin/auth/login | None | Admin login |
| GET | /admin/summary | Admin JWT | Dashboard KPIs |
| GET | /admin/reports | Admin JWT | List reports |
| PATCH | /admin/reports/:id | Admin JWT | Update report status |
| GET | /admin/appeals | Admin JWT | List appeals |
| PATCH | /admin/appeals/:id | Admin JWT | Update appeal status |
| GET | /admin/users | Admin JWT | List users (filter/search) |
| PATCH | /admin/users/:id/status | Admin JWT | Update user status |
| GET | /admin/products | Admin JWT | List products (filter/search) |
| PATCH | /admin/products/:id/moderation | Admin JWT | Update product moderation status |
| GET | /admin/logs | Admin JWT | Fetch admin action logs |

### Images
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /upload-image | JWT + ACTIVE | Upload up to 10 images for a product (multipart/form-data); uploads to Cloudinary |

### Users
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /users/profile | JWT | Get the authenticated user's profile |
| GET | /users/listings | JWT | Get all listings posted by the authenticated user |

### Messages
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /messages | JWT + ACTIVE | Send a chat message about a product |
| GET | /messages/:product_id/:user_id | JWT | Retrieve the conversation between the authenticated user and another user about a product |

> **JWT + ACTIVE** means the request requires a valid Bearer token AND the account must have `status = 'ACTIVE'` (not SUSPENDED or BANNED).

---

## Appendix C – Sample API Requests

### POST /api/auth/signup
```json
POST /api/auth/signup
Content-Type: application/json

{
  "name": "Riya Sharma",
  "email": "riya@college.edu",
  "password": "securePassword123"
}
```

### POST /api/messages
`sender_id` is **not** included in the request body — it is derived server-side from the authenticated user's JWT token.

```json
POST /api/messages
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "receiver_id": 2,
  "product_id": 5,
  "message": "Is this item still available?"
}
```

### POST /api/upload-image
```
POST /api/upload-image
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

Fields:
  product_id: 5
  images: [file1.jpg, file2.jpg, ...]   (up to 10 files)
```

---

## Appendix D – Unit Test Cases

The following test categories are used to validate the CampusLoop platform:

| # | Category | Test Cases |
|---|---|---|
| 1 | **Authentication** | User registration with valid/invalid data; login with correct and incorrect credentials; JWT token generation and expiry; duplicate email rejection |
| 2 | **Product Listings** | Create listing with all required fields; reject listing with missing fields; fetch all products; fetch product by ID; delete listing by owner; reject deletion by non-owner |
| 3 | **Product Status Updates** | Request status OTP; confirm OTP for SOLD/DONATED; reject invalid/expired OTP; reject status update by non-owner |
| 4 | **Image Upload** | Upload single and multiple images (up to 10); reject upload for non-existent product; reject upload by non-owner; verify Cloudinary URL stored in `product_images` |
| 5 | **Messaging** | Send a valid message; reject message with missing fields; reject message to non-existent receiver or product; retrieve conversation by product and user |
| 6 | **Security** | Reject requests missing JWT; reject requests from SUSPENDED/BANNED users; verify passwords are stored as bcrypt hashes; verify SQL injection prevention via parameterised queries |
| 7 | **System Stability** | Server returns 404 for unknown routes; global error handler returns 500 on unhandled errors; database connection failure handled gracefully |
