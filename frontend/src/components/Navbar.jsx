const Navbar = () => {
  return (
    <header className="navbar">
      <div className="logo">
        ♻ Campus<span>Loop</span>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search for textbooks, electronics, lab gear..."
        />
      </div>

      <div className="nav-actions">
        <span className="icon">♡</span>
        <span className="icon">💬</span>
        <span className="icon">👤</span>
        <button className="btn btn-primary">+ List Item</button>
      </div>
    </header>
  );
};

export default Navbar;

