import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  // Construct image URL from backend
  const imageUrl = product.imageUrl || `http://localhost:5000/api/products/${product._id}/image`;

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
          {/* Badge */}
          {product.condition && (
            <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
              {product.condition}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="mb-1 line-clamp-2 text-base font-bold text-slate-900 group-hover:text-emerald-600">
            {product.title}
          </h3>
          
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
