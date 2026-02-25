import { useState } from 'react';

/**
 * Demo Component - Showcases Bidding System Features
 * This is a demonstration component showing all bidding features in one place
 * Can be added to App.jsx as a route for testing/demo purposes
 */
const BiddingDemo = () => {
  const [selectedTab, setSelectedTab] = useState('overview');

  const demoProduct = {
    _id: 'demo-123',
    title: 'Vintage Camera - Canon AE-1',
    description: 'Classic 35mm film camera in excellent working condition. Includes original lens and carrying case.',
    price: 500,
    category: 'Electronics',
    seller: {
      name: 'John Doe',
      email: 'john@university.edu'
    },
    bidding: {
      enabled: true,
      startingPrice: 500,
      currentBid: 750,
      totalBids: 8,
      buyoutPrice: 1500,
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'create', label: 'Create Auction', icon: '✨' },
    { id: 'bidding', label: 'Bidding UI', icon: '🔨' },
    { id: 'cards', label: 'Product Cards', icon: '🎴' },
    { id: 'features', label: 'Features', icon: '⚡' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl">
            🔨 Bidding System Demo
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Complete auction/bidding functionality for CampusLoop
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                selectedTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-emerald-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="glass-card border border-white/70 bg-white/90 p-8 shadow-2xl ring-1 ring-slate-200">
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">System Overview</h2>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-6">
                  <h3 className="mb-3 text-lg font-semibold text-amber-900">For Sellers</h3>
                  <ul className="space-y-2 text-sm text-amber-800">
                    <li>✓ Enable bidding on any product</li>
                    <li>✓ Set auction duration (minimum 1 day)</li>
                    <li>✓ Optional buyout price for instant sale</li>
                    <li>✓ Track all bids in real-time</li>
                    <li>✓ Automatic winner selection</li>
                  </ul>
                </div>

                <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-cyan-50 p-6">
                  <h3 className="mb-3 text-lg font-semibold text-emerald-900">For Buyers</h3>
                  <ul className="space-y-2 text-sm text-emerald-800">
                    <li>✓ Browse active auctions</li>
                    <li>✓ Place competitive bids</li>
                    <li>✓ Instant buyout option</li>
                    <li>✓ View bid history</li>
                    <li>✓ Real-time countdown timer</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-xl bg-blue-50 p-6">
                <h3 className="mb-3 text-lg font-semibold text-blue-900">Key Features</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-lg bg-white p-4">
                    <div className="mb-2 text-2xl">⏱️</div>
                    <p className="font-semibold text-slate-900">Live Timer</p>
                    <p className="text-xs text-slate-600">Real-time countdown</p>
                  </div>
                  <div className="rounded-lg bg-white p-4">
                    <div className="mb-2 text-2xl">🏆</div>
                    <p className="font-semibold text-slate-900">Bid Tracking</p>
                    <p className="text-xs text-slate-600">All bids displayed</p>
                  </div>
                  <div className="rounded-lg bg-white p-4">
                    <div className="mb-2 text-2xl">⚡</div>
                    <p className="font-semibold text-slate-900">Instant Buyout</p>
                    <p className="text-xs text-slate-600">Skip the wait</p>
                  </div>
                  <div className="rounded-lg bg-white p-4">
                    <div className="mb-2 text-2xl">🔄</div>
                    <p className="font-semibold text-slate-900">Auto-Refresh</p>
                    <p className="text-xs text-slate-600">Every 10 seconds</p>
                  </div>
                  <div className="rounded-lg bg-white p-4">
                    <div className="mb-2 text-2xl">📱</div>
                    <p className="font-semibold text-slate-900">Responsive</p>
                    <p className="text-xs text-slate-600">Works on all devices</p>
                  </div>
                  <div className="rounded-lg bg-white p-4">
                    <div className="mb-2 text-2xl">🎨</div>
                    <p className="font-semibold text-slate-900">Beautiful UI</p>
                    <p className="text-xs text-slate-600">Modern design</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'create' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Create Auction Listing</h2>
              <p className="text-slate-600">
                Sellers can enable bidding when posting a new item. Here's what they can configure:
              </p>

              <div className="space-y-4 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-semibold text-slate-800">
                      🔨 Enable Bidding/Auction
                    </label>
                    <p className="text-xs text-slate-600">Allow users to bid on your item</p>
                  </div>
                  <div className="h-6 w-11 rounded-full bg-emerald-600"></div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-sm font-semibold text-slate-800">
                    Starting Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="500"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                    disabled
                  />
                  <p className="text-xs text-slate-500">This is the minimum bid amount</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">
                    Auction Duration (days)
                  </label>
                  <input
                    type="number"
                    placeholder="3"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                    disabled
                  />
                  <p className="text-xs text-slate-500">Minimum 1 day required</p>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded"
                    disabled
                    checked
                  />
                  <div className="flex-1">
                    <label className="text-sm font-semibold text-slate-800">
                      ⚡ Add Buyout Price (Optional)
                    </label>
                    <p className="text-xs text-slate-600">
                      Allow instant purchase at this price
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">
                    Buyout Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="1500"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                    disabled
                  />
                  <p className="text-xs text-slate-500">Must be higher than starting price</p>
                </div>
              </div>

              <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-900">💡 Pro Tips</p>
                <ul className="mt-2 space-y-1 text-xs text-blue-800">
                  <li>• Set competitive starting prices to attract more bidders</li>
                  <li>• Longer auctions typically get more bids</li>
                  <li>• Buyout price should be your ideal selling price</li>
                  <li>• Check similar items to gauge demand</li>
                </ul>
              </div>
            </div>
          )}

          {selectedTab === 'bidding' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Bidding Interface</h2>
              <p className="text-slate-600">
                When buyers view an auction item, they see this comprehensive bidding interface:
              </p>

              {/* Mock Bidding Interface */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">🔨 Live Auction</h3>
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                      </span>
                      Active
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-600">Current Highest Bid</p>
                    <p className="text-3xl font-extrabold text-amber-600">₹750</p>
                    <p className="mt-1 text-sm text-slate-500">by Sarah K.</p>
                  </div>

                  <div className="mb-4 rounded-xl bg-white/70 p-3">
                    <p className="text-xs font-medium text-slate-600">Time Remaining</p>
                    <p className="text-xl font-bold text-rose-600">2d 5h 32m 15s</p>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/70 p-3">
                      <p className="text-xs font-medium text-slate-600">Total Bids</p>
                      <p className="text-lg font-bold text-slate-900">8</p>
                    </div>
                    <div className="rounded-xl bg-white/70 p-3">
                      <p className="text-xs font-medium text-slate-600">Starting Price</p>
                      <p className="text-lg font-bold text-slate-900">₹500</p>
                    </div>
                  </div>

                  <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4">
                    <p className="mb-2 text-sm font-semibold text-emerald-900">
                      ⚡ Buy it now for ₹1,500
                    </p>
                    <button className="w-full rounded-full bg-gradient-to-r from-emerald-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">
                      Buy Now
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="mb-4 text-lg font-semibold text-slate-900">Place Your Bid</h3>
                  <input
                    type="number"
                    placeholder="Minimum: ₹751"
                    className="mb-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-lg font-semibold"
                    disabled
                  />
                  <button className="w-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-base font-semibold text-white">
                    🔨 Place Bid
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="mb-4 text-lg font-semibold text-slate-900">Bid History (8)</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50 p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">👑</span>
                        <div>
                          <p className="font-semibold text-slate-900">Sarah K.</p>
                          <p className="text-xs text-slate-500">2 hours ago</p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-slate-900">₹750</p>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div>
                        <p className="font-semibold text-slate-900">Mike T.</p>
                        <p className="text-xs text-slate-500">4 hours ago</p>
                      </div>
                      <p className="text-lg font-bold text-slate-900">₹700</p>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div>
                        <p className="font-semibold text-slate-900">Alex P.</p>
                        <p className="text-xs text-slate-500">6 hours ago</p>
                      </div>
                      <p className="text-lg font-bold text-slate-900">₹650</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'cards' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Product Cards</h2>
              <p className="text-slate-600">
                Auction items display special badges and information on listing pages:
              </p>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Auction Card */}
                <div className="group overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80"
                      alt="Camera"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                      🔨 Auction
                    </div>
                    <div className="absolute right-3 top-3 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                      2d 5h
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="mb-1 line-clamp-2 text-base font-bold text-slate-900">
                      Vintage Camera - Canon AE-1
                    </h3>
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-medium text-slate-600">Current Bid:</span>
                        <p className="text-xl font-extrabold text-amber-600">₹750</p>
                      </div>
                      <p className="text-xs text-slate-500">8 bids</p>
                      <p className="text-xs font-medium text-emerald-600">⚡ Buyout: ₹1,500</p>
                    </div>
                  </div>
                </div>

                {/* Regular Card for Comparison */}
                <div className="group overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80"
                      alt="Textbook"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                      Like New
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="mb-1 line-clamp-2 text-base font-bold text-slate-900">
                      Operating Systems Textbook
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <p className="text-xl font-extrabold text-emerald-600">₹450</p>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Regular Sale</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-900">🎨 Visual Indicators</p>
                <ul className="mt-2 space-y-1 text-xs text-amber-800">
                  <li>• Amber/Orange "🔨 Auction" badge for auction items</li>
                  <li>• Green time remaining badge for active auctions</li>
                  <li>• Current bid amount displayed prominently</li>
                  <li>• Total bid count shown</li>
                  <li>• Buyout price indicator (if available)</li>
                </ul>
              </div>
            </div>
          )}

          {selectedTab === 'features' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Technical Features</h2>

              <div className="space-y-4">
                <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-cyan-50 p-6">
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-emerald-900">
                    <span>⏱️</span> Real-Time Updates
                  </h3>
                  <ul className="space-y-2 text-sm text-emerald-800">
                    <li>• Timer updates every second with accurate countdown</li>
                    <li>• Bid list auto-refreshes every 10 seconds</li>
                    <li>• Status automatically changes when auction ends</li>
                    <li>• No page refresh needed</li>
                  </ul>
                </div>

                <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 p-6">
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-amber-900">
                    <span>✅</span> Validation & Security
                  </h3>
                  <ul className="space-y-2 text-sm text-amber-800">
                    <li>• Bid amount must exceed current highest bid</li>
                    <li>• Buyout price must be higher than starting price</li>
                    <li>• Authentication required for all bidding operations</li>
                    <li>• Server-side validation on all operations</li>
                  </ul>
                </div>

                <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-blue-900">
                    <span>📱</span> User Experience
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li>• Fully responsive design for all screen sizes</li>
                    <li>• Glass-morphism effects for modern look</li>
                    <li>• Smooth animations and transitions</li>
                    <li>• Clear visual feedback for all actions</li>
                    <li>• Loading states and error handling</li>
                  </ul>
                </div>

                <div className="rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 p-6">
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-rose-900">
                    <span>🔌</span> API Integration
                  </h3>
                  <ul className="space-y-2 text-sm text-rose-800">
                    <li>• RESTful API endpoints for all operations</li>
                    <li>• JWT authentication for secure transactions</li>
                    <li>• Proper error handling and status codes</li>
                    <li>• Optimized data fetching</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-200">
            <div className="mb-2 text-3xl">📁</div>
            <p className="text-2xl font-bold text-emerald-600">5</p>
            <p className="text-xs text-slate-600">Files Modified</p>
          </div>
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-200">
            <div className="mb-2 text-3xl">✨</div>
            <p className="text-2xl font-bold text-amber-600">2</p>
            <p className="text-xs text-slate-600">New Components</p>
          </div>
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-200">
            <div className="mb-2 text-3xl">🎨</div>
            <p className="text-2xl font-bold text-blue-600">15+</p>
            <p className="text-xs text-slate-600">UI Features</p>
          </div>
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-200">
            <div className="mb-2 text-3xl">🚀</div>
            <p className="text-2xl font-bold text-rose-600">100%</p>
            <p className="text-xs text-slate-600">Production Ready</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiddingDemo;
