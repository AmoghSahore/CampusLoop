import { useState, useEffect } from 'react';
import { placeBid, getBidsForProduct, executeBuyout } from '../services/biddingService';

const BiddingInterface = ({ product, onBidPlaced, onBuyout }) => {
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isBiddingActive, setIsBiddingActive] = useState(true);
  const [showBidHistory, setShowBidHistory] = useState(false);

  // Calculate time remaining
  useEffect(() => {
    if (!product.bidding?.endTime) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const endTime = new Date(product.bidding.endTime).getTime();
      const difference = endTime - now;

      if (difference <= 0) {
        setTimeRemaining('Bidding ended');
        setIsBiddingActive(false);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [product.bidding?.endTime]);

  // Fetch bids
  useEffect(() => {
    const fetchBids = async () => {
      try {
        const data = await getBidsForProduct(product._id);
        setBids(data.bids || []);
      } catch (err) {
        console.error('Error fetching bids:', err);
      }
    };

    if (product.bidding?.enabled) {
      fetchBids();
      // Refresh bids every 10 seconds
      const interval = setInterval(fetchBids, 10000);
      return () => clearInterval(interval);
    }
  }, [product._id, product.bidding?.enabled]);

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const currentHighestBid = bids.length > 0 
      ? Math.max(...bids.map(b => b.amount))
      : product.bidding?.startingPrice || product.price;

    if (parseFloat(bidAmount) <= currentHighestBid) {
      setError(`Bid must be higher than ₹${currentHighestBid}`);
      setLoading(false);
      return;
    }

    try {
      const result = await placeBid(product._id, parseFloat(bidAmount));
      setBids(prevBids => [result.bid, ...prevBids]);
      setBidAmount('');
      if (onBidPlaced) onBidPlaced(result);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to place bid');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyout = async () => {
    if (!window.confirm(`Are you sure you want to buy this item for ₹${product.bidding.buyoutPrice}?`)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await executeBuyout(product._id);
      if (onBuyout) onBuyout(result);
      setIsBiddingActive(false);
    } catch (err) {
      setError(err.message || 'Failed to execute buyout');
    } finally {
      setLoading(false);
    }
  };

  const currentHighestBid = bids.length > 0 
    ? Math.max(...bids.map(b => b.amount))
    : product.bidding?.startingPrice || product.price;

  const currentLeader = bids.length > 0 
    ? bids.find(b => b.amount === currentHighestBid)
    : null;

  return (
    <div className="space-y-6">
      {/* Bidding Status Card */}
      <div className="glass-card border border-white/70 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-lg ring-1 ring-amber-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">🔨 Live Auction</h3>
          {isBiddingActive ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Active
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
              Ended
            </span>
          )}
        </div>

        {/* Current Bid */}
        <div className="mb-4">
          <p className="text-sm font-medium text-slate-600">Current Highest Bid</p>
          <p className="text-3xl font-extrabold text-amber-600">
            ₹{currentHighestBid.toLocaleString()}
          </p>
          {currentLeader && (
            <p className="mt-1 text-sm text-slate-500">
              by {currentLeader.bidder?.name || 'Anonymous'}
            </p>
          )}
        </div>

        {/* Timer */}
        <div className="mb-4 rounded-xl bg-white/70 p-3">
          <p className="text-xs font-medium text-slate-600">Time Remaining</p>
          <p className={`text-xl font-bold ${isBiddingActive ? 'text-rose-600' : 'text-slate-600'}`}>
            {timeRemaining}
          </p>
        </div>

        {/* Bid Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl bg-white/70 p-3">
            <p className="text-xs font-medium text-slate-600">Total Bids</p>
            <p className="text-lg font-bold text-slate-900">{bids.length}</p>
          </div>
          <div className="rounded-xl bg-white/70 p-3">
            <p className="text-xs font-medium text-slate-600">Starting Price</p>
            <p className="text-lg font-bold text-slate-900">
              ₹{(product.bidding?.startingPrice || product.price).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Buyout Option */}
        {product.bidding?.buyoutPrice && isBiddingActive && (
          <div className="mb-4 rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-900 mb-2">
              ⚡ Buy it now for ₹{product.bidding.buyoutPrice.toLocaleString()}
            </p>
            <button
              onClick={handleBuyout}
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-r from-emerald-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Buy Now'}
            </button>
          </div>
        )}
      </div>

      {/* Place Bid Form */}
      {isBiddingActive && (
        <div className="glass-card border border-white/70 bg-white/90 p-6 shadow-lg ring-1 ring-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Place Your Bid</h3>
          
          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handlePlaceBid} className="space-y-4">
            <div>
              <label htmlFor="bidAmount" className="block text-sm font-medium text-slate-700 mb-2">
                Your Bid Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-600">
                  ₹
                </span>
                <input
                  type="number"
                  id="bidAmount"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Minimum: ${currentHighestBid + 1}`}
                  min={currentHighestBid + 1}
                  step="1"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-10 text-lg font-semibold text-slate-900 shadow-inner focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  required
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Minimum bid: ₹{(currentHighestBid + 1).toLocaleString()}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-base font-semibold text-white shadow-glow transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-500/60"
            >
              {loading ? 'Placing bid...' : '🔨 Place Bid'}
            </button>
          </form>
        </div>
      )}

      {/* Bid History */}
      <div className="glass-card border border-white/70 bg-white/90 p-6 shadow-lg ring-1 ring-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Bid History</h3>
          <button
            onClick={() => setShowBidHistory(!showBidHistory)}
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            {showBidHistory ? 'Hide' : 'Show'} ({bids.length})
          </button>
        </div>

        {showBidHistory && (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {bids.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-4">
                No bids yet. Be the first to bid!
              </p>
            ) : (
              bids.map((bid, index) => (
                <div
                  key={bid._id || index}
                  className={`flex items-center justify-between rounded-xl border p-3 ${
                    index === 0
                      ? 'border-amber-300 bg-amber-50'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {index === 0 && <span className="text-lg">👑</span>}
                    <div>
                      <p className="font-semibold text-slate-900">
                        {bid.bidder?.name || 'Anonymous'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(bid.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    ₹{bid.amount.toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Bidding Info */}
      <div className="glass-card border border-white/70 bg-blue-50/50 p-4 shadow-sm ring-1 ring-blue-200">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">ℹ️ Bidding Rules</h4>
        <ul className="space-y-1 text-xs text-blue-800">
          <li>• Each bid must be higher than the current highest bid</li>
          <li>• Bidding ends at the specified time</li>
          <li>• The highest bidder wins when time expires</li>
          {product.bidding?.buyoutPrice && (
            <li>• Use "Buy Now" to instantly win at the buyout price</li>
          )}
          <li>• All bids are binding and cannot be withdrawn</li>
        </ul>
      </div>
    </div>
  );
};

export default BiddingInterface;
