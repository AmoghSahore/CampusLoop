import { useMemo, useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";

const filters = ["All", "Free", "Rent", "Sale"];

// Sample products for testing
const sampleProducts = [
  {
    _id: "1",
    title: "Operating Systems Concepts (8th ed.)",
    price: 450,
    type: "Sale",
    category: "Textbooks",
    condition: "Like new",
    description: "Excellent condition textbook, barely used. All chapters intact with no markings.",
    seller: { name: "Arjun K.", email: "arjun@university.edu" },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    _id: "2",
    title: "Lab coat - size M",
    price: 0,
    type: "Free",
    category: "Lab Equipment",
    condition: "Gently used",
    description: "White lab coat in good condition. Perfect for chemistry or biology labs.",
    seller: { name: "Priya S.", email: "priya@university.edu" },
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1580281657527-47f249e8f2f9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    _id: "3",
    title: "MacBook Air M1 (13\")",
    price: 1900,
    type: "Rent",
    category: "Electronics",
    condition: "Excellent",
    description: "MacBook Air M1 chip, 8GB RAM, 256GB SSD. Available for monthly rent.",
    seller: { name: "Neha B.", email: "neha@university.edu" },
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
  },
  {
    _id: "4",
    title: "Ergonomic study chair",
    price: 2800,
    type: "Sale",
    category: "Furniture",
    condition: "1 year old",
    description: "Comfortable mesh back office chair with lumbar support. Great for long study sessions.",
    seller: { name: "Rahul D.", email: "rahul@university.edu" },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
  },
  {
    _id: "5",
    title: "DSA handwritten notes + slides",
    price: 0,
    type: "Free",
    category: "Textbooks",
    condition: "Digital download",
    description: "Complete notes and slides for Data Structures and Algorithms course.",
    seller: { name: "Isha V.", email: "isha@university.edu" },
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1457694587812-e8bf29a43845?auto=format&fit=crop&w=1200&q=80",
  },
  {
    _id: "6",
    title: "Scientific Calculator TI-84",
    price: 1500,
    type: "Sale",
    category: "Electronics",
    condition: "Good",
    description: "TI-84 Plus graphing calculator. Perfect for calculus and statistics courses.",
    seller: { name: "Vikram P.", email: "vikram@university.edu" },
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1611163321484-1b7cca510dcc?auto=format&fit=crop&w=1200&q=80",
  },
  {
    _id: "7",
    title: "Hoodie - College Merch",
    price: 800,
    type: "Sale",
    category: "Clothing",
    condition: "Brand new",
    description: "Official university hoodie, size L. Never worn, still has tags.",
    seller: { name: "Anika M.", email: "anika@university.edu" },
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=80",
  },
  {
    _id: "8",
    title: "Bicycle - Mountain Bike",
    price: 5500,
    type: "Sale",
    category: "Other",
    condition: "Well maintained",
    description: "21-speed mountain bike, perfect for campus commute. Recently serviced.",
    seller: { name: "Rohan K.", email: "rohan@university.edu" },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=1200&q=80",
  },
];

const Listings = ({ searchQuery = "", selectedCategory = "" }) => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/products');
        
        // If API returns data, use it; otherwise use sample data
        if (response.data && response.data.length > 0) {
          setProducts(response.data);
        } else {
          console.log('No products from API, using sample data');
          setProducts(sampleProducts);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        // Use sample products when API fails
        console.log('API failed, using sample data');
        setProducts(sampleProducts);
        setError(null); // Don't show error, just use sample data
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const visibleListings = useMemo(() => {
    let filtered = products;

    // Filter by type (Free, Rent, Sale)
    if (activeFilter !== "All") {
      filtered = filtered.filter((item) => item.type === activeFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) =>
        item.title?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((item) =>
        item.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    return filtered;
  }, [products, activeFilter, searchQuery, selectedCategory]);

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Latest listings</p>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Fresh finds from your campus</h2>
            <p className="text-slate-600">Verified student profiles, quick replies, meet up on campus.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                      : "bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-emerald-300"
                  }`}
                >
                  {filter === "All" ? "All items" : filter}
                </button>
              );
            })}
          </div>
        </div>

        {loading && (
          <div className="mt-10 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
            <p className="mt-4 text-slate-600">Loading products...</p>
          </div>
        )}

        {error && (
          <div className="mt-10 rounded-xl border border-rose-200 bg-rose-50 px-6 py-4 text-center">
            <p className="text-rose-700">{error}</p>
          </div>
        )}

        {!loading && !error && visibleListings.length === 0 && (
          <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 px-6 py-8 text-center">
            <p className="text-lg text-slate-600">No products found</p>
            <p className="mt-2 text-sm text-slate-500">Try adjusting your filters or search query</p>
          </div>
        )}

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {!loading && visibleListings.map((product) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Listings;

