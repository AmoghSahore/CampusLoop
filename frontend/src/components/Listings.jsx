import { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { SlidersHorizontal } from 'lucide-react';
import API_BASE from '../config/api.js';
import ProductCard from './ProductCard';

const FILTERS = [
  { value:'ALL',    label:'All items'  },
  { value:'DONATE', label:'Donations'  },
  { value:'RENT',   label:'Rent'       },
  { value:'SELL',   label:'Sell'       },
];

const SORT_OPTIONS = [
  { value:'newest',     label:'Newest first'       },
  { value:'price-asc',  label:'Price: Low → High'  },
  { value:'price-desc', label:'Price: High → Low'  },
];

const PAGE_SIZE = 8;

const SAMPLE = [
  { _id:'1', title:'Operating Systems Concepts (8th ed.)', price:450,  type:'Sale',   category:'Textbooks',    condition:'Like new',      seller:{ name:'Arjun K.'  }, createdAt: new Date(Date.now()-2*86400000).toISOString(), imageUrl:'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80' },
  { _id:'2', title:'Lab coat - size M',                    price:0,    type:'Free',   category:'Lab Equipment', condition:'Gently used',   seller:{ name:'Priya S.'  }, createdAt: new Date(Date.now()-5*3600000).toISOString(),  imageUrl:'https://images.unsplash.com/photo-1580281657527-47f249e8f2f9?auto=format&fit=crop&w=600&q=80' },
  { _id:'3', title:'MacBook Air M1 (13")',                  price:1900, type:'Rent',   category:'Electronics',  condition:'Excellent',     seller:{ name:'Neha B.'   }, createdAt: new Date(Date.now()-3600000).toISOString(),   imageUrl:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80' },
  { _id:'4', title:'Ergonomic study chair',                 price:2800, type:'Sale',   category:'Furniture',    condition:'1 year old',    seller:{ name:'Rahul D.'  }, createdAt: new Date(Date.now()-3*86400000).toISOString(), imageUrl:'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80' },
  { _id:'5', title:'DSA handwritten notes + slides',        price:0,    type:'Free',   category:'Textbooks',    condition:'Digital',       seller:{ name:'Isha V.'   }, createdAt: new Date(Date.now()-1800000).toISOString(),   imageUrl:'https://images.unsplash.com/photo-1457694587812-e8bf29a43845?auto=format&fit=crop&w=600&q=80' },
  { _id:'6', title:'Scientific Calculator TI-84',           price:1500, type:'Sale',   category:'Electronics',  condition:'Good',          seller:{ name:'Vikram P.' }, createdAt: new Date(Date.now()-4*86400000).toISOString(), imageUrl:'https://images.unsplash.com/photo-1611163321484-1b7cca510dcc?auto=format&fit=crop&w=600&q=80' },
  { _id:'7', title:'Hoodie - College Merch (M)',            price:800,  type:'Sale',   category:'Clothing',     condition:'Brand new',     seller:{ name:'Anika M.'  }, createdAt: new Date(Date.now()-6*3600000).toISOString(),  imageUrl:'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80' },
  { _id:'8', title:'Bicycle - Mountain Bike 21-Speed',      price:5500, type:'Sale',   category:'Other',        condition:'Well maintained',seller:{ name:'Rohan K.'  }, createdAt: new Date(Date.now()-86400000).toISOString(),  imageUrl:'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=600&q=80' },
  { _id:'9', title:'Chemistry Lab Manual 2024',             price:150,  type:'Sale',   category:'Textbooks',    condition:'Good',          seller:{ name:'Kavya R.'  }, createdAt: new Date(Date.now()-8*3600000).toISOString(),  imageUrl:'https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?auto=format&fit=crop&w=600&q=80' },
  { _id:'10',title:'Standing Desk Lamp – White LED',        price:0,    type:'Donate', category:'Furniture',    condition:'Working',       seller:{ name:'Dev S.'    }, createdAt: new Date(Date.now()-2*3600000).toISOString(),  imageUrl:'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80' },
];

const normalizeType = p => { const r=(p.listingType||p.type||'').toUpperCase(); if(r==='FREE'||r==='DONATION'||r==='DONATE')return 'DONATE'; if(r==='SALE'||r==='SELL')return 'SELL'; return r; };
const normalizeCategory = v => { const s=(v||'').toLowerCase().trim(); return s==='other'||s==='others'?'other':s; };

const Listings = ({ searchQuery='', selectedCategory='' }) => {
  const [filter,  setFilter]  = useState('ALL');
  const [sortBy,  setSortBy]  = useState('newest');
  const [count,   setCount]   = useState(PAGE_SIZE);
  const [products,setProducts]= useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setLoading(true); const r=await axios.get(`${API_BASE}/api/products`); setProducts(r.data?.length?r.data:SAMPLE); }
      catch { setProducts(SAMPLE); }
      finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => { setCount(PAGE_SIZE); }, [filter, sortBy, searchQuery, selectedCategory]);

  const sorted = useMemo(() => {
    let out = products;
    if (filter !== 'ALL') out = out.filter(p => normalizeType(p) === filter);
    if (searchQuery) { const q=searchQuery.toLowerCase(); out=out.filter(p=>p.title?.toLowerCase().includes(q)||p.description?.toLowerCase().includes(q)||p.category?.toLowerCase().includes(q)); }
    if (selectedCategory) out = out.filter(p => normalizeCategory(p.category)===normalizeCategory(selectedCategory));
    out = [...out];
    if (sortBy==='price-asc')  out.sort((a,b)=>(a.price??0)-(b.price??0));
    else if (sortBy==='price-desc') out.sort((a,b)=>(b.price??0)-(a.price??0));
    else out.sort((a,b)=>new Date(b.createdAt??0)-new Date(a.createdAt??0));
    return out;
  }, [products, filter, sortBy, searchQuery, selectedCategory]);

  const paged   = sorted.slice(0, count);
  const hasMore = sorted.length > count;

  return (
    <section id="listings" className="relative section-pad" style={{ background: 'linear-gradient(180deg, var(--bg) 0%, #edf7f0 100%)' }}>
      <div className="container-xl">

        {/* Header */}
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="section-eyebrow mb-3 block w-fit">Latest Listings</span>
            <h2 className="text-3xl font-extrabold text-[var(--fg)] sm:text-4xl">
              Fresh finds from your campus
            </h2>
            <p className="mt-2 text-[var(--fg-muted)]">
              Verified student profiles · Quick replies · Meet on campus
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="relative flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3 py-1.5">
              <SlidersHorizontal size={13} className="text-[var(--fg-muted)]" />
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
                className="appearance-none bg-transparent text-sm font-medium text-[var(--fg-muted)] focus:outline-none cursor-pointer pr-4 hover:text-[var(--primary)] transition-colors">
                {SORT_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <span className="pointer-events-none text-[var(--fg-subtle)] text-xs">▾</span>
            </div>
            {FILTERS.map(f=>(
              <button key={f.value} onClick={()=>setFilter(f.value)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-150 ${
                  filter===f.value
                    ? 'text-white shadow-sm'
                    : 'bg-white border border-[var(--border)] text-[var(--fg-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
                }`}
                style={filter===f.value ? { background:'var(--grad-primary)' } : {}}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Result count */}
        {!loading && (
          <p className="mb-6 text-sm text-[var(--fg-muted)]">
            Showing <span className="font-semibold text-[var(--fg)]">{paged.length}</span> of{' '}
            <span className="font-semibold text-[var(--fg)]">{sorted.length}</span> listings
          </p>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-24">
            <div className="spinner" />
            <p className="text-sm text-[var(--fg-muted)]">Loading products…</p>
          </div>
        )}

        {!loading && sorted.length===0 && (
          <div className="glass-card py-16 text-center">
            <p className="text-lg font-semibold text-[var(--fg)]">No products found</p>
            <p className="mt-1 text-sm text-[var(--fg-muted)]">Try adjusting your filters or search</p>
          </div>
        )}

        {!loading && paged.length>0 && (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {paged.map(p=><ProductCard key={p._id||p.id} product={p} />)}
            </div>
            {hasMore && (
              <div className="mt-12 flex justify-center">
                <button onClick={()=>setCount(c=>c+PAGE_SIZE)}
                  className="btn-outline px-10 py-3 font-semibold hover:shadow-md">
                  Load more · {sorted.length - count} remaining
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Listings;
