# Bidding/Auction System - Frontend Implementation

## Overview
The bidding system allows sellers to create auction-style listings where buyers can place bids over a specified time period. Sellers can optionally set a "buyout" price for instant purchase.

## Features Implemented

### 1. **PostAdPage** - Create Auction Listings
Sellers can enable bidding when creating a new listing with the following options:

- **Enable Bidding Toggle**: Switch to enable auction mode
- **Starting Price**: The initial bid amount (replaces regular price field)
- **Auction Duration**: Minimum 1 day, configurable in days
- **Optional Buyout Price**: Allows instant purchase at a fixed price (must be higher than starting price)

**File**: [`frontend/src/components/PostAdPage.jsx`](../frontend/src/components/PostAdPage.jsx)

**State Variables**:
- `enableBidding`: Boolean to toggle auction mode
- `biddingDuration`: Number of days for the auction (minimum 1)
- `buyoutPrice`: Optional instant purchase price
- `enableBuyout`: Toggle for buyout feature

**Validation**:
- Bidding duration must be at least 1 day
- Buyout price must be higher than starting price
- All standard listing validations apply

### 2. **BiddingInterface** - Live Auction Component
A comprehensive bidding interface displayed on product detail pages for auction items.

**File**: [`frontend/src/components/BiddingInterface.jsx`](../frontend/src/components/BiddingInterface.jsx)

**Features**:
- **Live Timer**: Real-time countdown showing days, hours, minutes, and seconds remaining
- **Current Highest Bid**: Displays the current leading bid amount and bidder name
- **Bid Stats**: Shows total number of bids and starting price
- **Place Bid Form**: Input field with validation to place new bids
- **Buyout Button**: One-click instant purchase (if enabled by seller)
- **Bid History**: Collapsible list showing all bids with timestamps
- **Auto-refresh**: Bids refresh every 10 seconds automatically
- **Visual Indicators**: 
  - Live auction badge with pulsing animation
  - Crown icon for highest bidder
  - Color-coded status (active/ended)

**Props**:
```javascript
{
  product: Object,        // Product data including bidding info
  onBidPlaced: Function,  // Callback when bid is successfully placed
  onBuyout: Function      // Callback when buyout is executed
}
```

### 3. **ProductDetailsPage** - Display Integration
Updated to conditionally show either regular purchase options or the bidding interface.

**File**: [`frontend/src/components/ProductDetailsPage.jsx`](../frontend/src/components/ProductDetailsPage.jsx)

**Changes**:
- Imports `BiddingInterface` component
- Conditional rendering based on `product.bidding?.enabled`
- Regular "Chat with Seller" button hidden for auction items
- Full bidding interface replaces action buttons for auctions

### 4. **ProductCard** - Auction Badges
Product cards now display auction-specific information.

**File**: [`frontend/src/components/ProductCard.jsx`](../frontend/src/components/ProductCard.jsx)

**New Features**:
- **"🔨 Auction" badge** for bidding-enabled items
- **Time remaining badge** showing countdown
- **Current bid display** instead of fixed price
- **Bid count** showing total number of bids
- **Buyout price indicator** (if available)
- **Auto-updating timer** (updates every minute)

**Visual Indicators**:
- Amber/orange gradient for auction badge
- Emerald badge for active auctions
- Gray badge for ended auctions

### 5. **Listings** - Auction Filter
Updated listings page to include auction filtering.

**File**: [`frontend/src/components/Listings.jsx`](../frontend/src/components/Listings.jsx)

**Changes**:
- Added "Auction" filter to `filters` array
- Filter logic updated to show only items with `bidding.enabled === true`
- Works alongside existing Free/Rent/Sale filters

### 6. **BiddingService** - API Integration
Service layer for all bidding-related API calls.

**File**: [`frontend/src/services/biddingService.js`](../frontend/src/services/biddingService.js)

**Functions**:
```javascript
placeBid(productId, bidAmount)          // Place a new bid
getBidsForProduct(productId)            // Get all bids for a product
getHighestBid(productId)                // Get current highest bid
checkUserBid(productId)                 // Check user's bid status
executeBuyout(productId)                // Execute instant buyout
```

## Data Structure

### Product with Bidding
```javascript
{
  _id: "product_id",
  title: "Product Title",
  description: "Description",
  price: 1000,              // Starting price for auctions
  bidding: {
    enabled: true,          // Indicates this is an auction
    startingPrice: 1000,    // Initial bid amount
    currentBid: 1500,       // Current highest bid (optional)
    totalBids: 5,           // Number of bids placed
    buyoutPrice: 3000,      // Optional instant purchase price
    endTime: "2026-02-10T12:00:00Z",  // ISO timestamp
    startTime: "2026-02-05T12:00:00Z" // ISO timestamp
  },
  // ... other product fields
}
```

### Bid Object
```javascript
{
  _id: "bid_id",
  product: "product_id",
  bidder: {
    _id: "user_id",
    name: "User Name"
  },
  amount: 1500,
  createdAt: "2026-02-06T10:30:00Z"
}
```

## User Flow

### Creating an Auction
1. Navigate to "Post Ad" page
2. Fill in product details
3. Toggle "Enable Bidding/Auction"
4. Set auction duration (minimum 1 day)
5. Optionally enable and set buyout price
6. Submit listing

### Placing a Bid
1. Browse listings and identify auction items (🔨 badge)
2. Click on auction product
3. View current highest bid and time remaining
4. Enter bid amount (must be higher than current bid)
5. Click "Place Bid"
6. Bid appears in history immediately

### Instant Buyout
1. View auction product with buyout option
2. Click "Buy Now" button
3. Confirm purchase at buyout price
4. Auction ends immediately

## UI/UX Features

### Visual Design
- **Gradient badges** for auction items (amber/orange theme)
- **Pulsing animation** on active status indicator
- **Color-coded cards** in bid history (gold for leader)
- **Glass-morphism effects** throughout bidding interface
- **Responsive design** for mobile and desktop

### Real-time Updates
- Timer updates every second
- Bid list refreshes every 10 seconds
- Status automatically changes when auction ends

### User Feedback
- Success/error messages for bid placement
- Confirmation dialog for buyout
- Loading states for all actions
- Minimum bid amount hint

## Integration with Backend

### Expected API Endpoints
```
POST   /api/listings              - Create listing (with bidding data)
GET    /api/products/:id          - Get product (includes bidding info)
POST   /api/bids/:productId       - Place bid
GET    /api/bids/:productId       - Get all bids
GET    /api/bids/:productId/highest - Get highest bid
POST   /api/bids/:productId/buyout  - Execute buyout
```

### Authentication
All bidding operations require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Testing Checklist

- [ ] Create auction listing with various durations
- [ ] Create auction with buyout price
- [ ] Create auction without buyout price
- [ ] Place bids on active auctions
- [ ] Verify minimum bid validation
- [ ] Test buyout functionality
- [ ] Check timer countdown accuracy
- [ ] Verify bid history updates
- [ ] Test expired auction display
- [ ] Filter auctions in listings page
- [ ] Check mobile responsiveness
- [ ] Verify real-time updates

## Future Enhancements

1. **Push Notifications**: Notify users when outbid
2. **Auto-bid**: Set maximum bid amount for automatic bidding
3. **Bid Increment**: Set minimum bid increment amounts
4. **Reserve Price**: Hidden minimum price seller will accept
5. **Bid Retraction**: Allow bid cancellation within time window
6. **Auction Extensions**: Extend time if bid placed in last minutes
7. **Winner Notification**: Email/SMS to auction winner
8. **Payment Integration**: Direct payment processing for winners

## Files Modified/Created

### Created:
- `frontend/src/services/biddingService.js` - API service layer
- `frontend/src/components/BiddingInterface.jsx` - Main bidding UI
- `docs/BIDDING_FEATURE.md` - This documentation

### Modified:
- `frontend/src/components/PostAdPage.jsx` - Added bidding options
- `frontend/src/components/ProductDetailsPage.jsx` - Integrated BiddingInterface
- `frontend/src/components/ProductCard.jsx` - Added auction badges/info
- `frontend/src/components/Listings.jsx` - Added auction filter

## Notes

- All bidding functionality requires user authentication
- Timer accuracy depends on client system clock
- Backend validation required for all bid operations
- Consider implementing WebSocket for true real-time updates
- Ensure proper error handling for network failures
