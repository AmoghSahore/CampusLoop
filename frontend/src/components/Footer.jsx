import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Recycle, Mail, Send, CheckCircle, Github, Twitter, Instagram } from 'lucide-react';

const footerLinks = {
  Product:    [['Browse all','#listings'],['List an item','/post-ad'],['Messages','/chat'],['My Profile','/profile']],
  Categories: [['Books','/?category=Textbooks'],['Electronics','/?category=Electronics'],['Lab Equipment','/?category=Lab Equipment'],['Furniture','/?category=Furniture']],
  Support:    [['Safety tips','#'],['Community guidelines','#'],['Help center','#'],['Contact us','#']],
};

const Footer = () => {
  const [email,     setEmail]     = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <footer style={{ background: 'linear-gradient(160deg, #0f2d1e 0%, #0c1f14 60%, #071510 100%)' }}>
      {/* Top wave */}
      <div className="h-px w-full" style={{ background:'linear-gradient(90deg,transparent,rgba(29,154,108,0.5),transparent)' }} />

      <div className="container-xl py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">

          {/* Brand */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                style={{ background:'var(--grad-primary)', boxShadow:'0 2px 12px var(--primary-glow)' }}>
                <Recycle className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Campus<span style={{ background:'linear-gradient(135deg,#4ade80,#34d399)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Loop</span>
              </span>
            </Link>

            <p className="max-w-xs text-sm leading-relaxed text-white/50">
              The sustainable campus marketplace. Keep great gear in circulation,
              reduce waste, and help your fellow students.
            </p>

            {/* Social */}
            <div className="flex gap-2.5">
              {[Github, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white/40 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400">
                  <Icon size={16} />
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-white/40">Stay updated</p>
              {submitted ? (
                <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                  <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-300">You're in!</p>
                    <p className="text-xs text-emerald-400/70">Updates headed to {email}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); if(email.trim()) setSubmitted(true); }} className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                    <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
                      placeholder="your@email.edu"
                      className="w-full rounded-xl border border-white/10 bg-white/7 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/25 focus:border-emerald-500/50 focus:outline-none transition" />
                  </div>
                  <button type="submit"
                    className="flex items-center justify-center rounded-xl px-3.5 text-white transition-all hover:scale-105"
                    style={{ background:'var(--grad-primary)', boxShadow:'0 2px 10px var(--primary-glow)' }}>
                    <Send size={14} />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/35">{heading}</h3>
              <ul className="space-y-3">
                {links.map(([name, href]) => (
                  <li key={name}>
                    <Link to={href} className="text-sm text-white/45 transition-colors hover:text-emerald-400">{name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-7 sm:flex-row">
          <p className="text-xs text-white/30">© 2026 CampusLoop · For students, by students.</p>
          <div className="flex gap-5">
            {['Privacy','Terms','Status'].map(item=>(
              <a key={item} href="#" className="text-xs text-white/30 transition-colors hover:text-emerald-400">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
