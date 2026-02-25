import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const ProductCard = ({ product }) => {
  // Construct image URL from backend
  const imageUrl = product.imageUrl || `http://localhost:5000/api/products/${product._id}/image`;
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Calculate time remaining for bidding
  useEffect(() => {
    if (!product.bidding?.enabled || !product.bidding?.endTime) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const endTime = new Date(product.bidding.endTime).getTime();
      const difference = endTime - now;

      if (difference <= 0) {
        setTimeRemaining('Ended');
        setIsActive(false);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h`);
      } else {
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining(`${hours}h ${minutes}m`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [product.bidding?.enabled, product.bidding?.endTime]);

  return (
    <Link to={`/product/${product._id}`}>
      <div className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <img
            src={imageUrl}
            alt={product.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80';
            }}
          />
          {/* Bidding Badge */}
          {product.bidding?.enabled ? (
            <div className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
              🔨 Auction
            </div>
          ) : product.condition && (
            <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
              {product.condition}
            </div>
          )}
          {/* Time Remaining Badge for Active Auctions */}
          {product.bidding?.enabled && timeRemaining && (
            <div className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur ${
              isActive 
                ? 'bg-emerald-500/90 text-white' 
                : 'bg-slate-500/90 text-white'
            }`}>
              {timeRemaining}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="mb-1 line-clamp-2 text-base font-bold text-slate-900 group-hover:text-emerald-600">
            {product.title}
          </h3>
          
          {product.bidding?.enabled ? (
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-medium text-slate-600">Current Bid:</span>
                <p className="text-xl font-extrabold text-amber-600">
                  ₹{product.bidding.currentBid || product.bidding.startingPrice || product.price}
                </p>
              </div>
              {product.bidding.totalBids > 0 && (
                <p className="text-xs text-slate-500">
                  {product.bidding.totalBids} bid{product.bidding.totalBids !== 1 ? 's' : ''}
                </p>
              )}
              {product.bidding.buyoutPrice && (
                <p className="text-xs text-emerald-600 font-medium">
                  ⚡ Buyout: ₹{product.bidding.buyoutPrice}
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <p className="text-xl font-extrabold text-emerald-600">
                ₹{product.price}
              </p>
              {product.originalPrice && (
                <p className="text-sm text-slate-400 line-through">
                  ₹{product.originalPrice}
                </p>
              )}
            </div>
          )}

          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            {product.category && (
              <span className="rounded-full bg-slate-100 px-2 py-1">
                {product.category}
              </span>
            )}
            {product.seller && (
              <span>
                by {product.seller.name || 'Anonymous'}
              </span>
            )}
          </div>

          {product.createdAt && (
            <p className="mt-2 text-xs text-slate-400">
              {new Date(product.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
