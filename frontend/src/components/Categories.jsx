const Categories = () => {
  return (
    <section className="category-section">
      <h2>Browse by Category</h2>
      <p className="section-subtitle">
        Find what you need or list what you don't
      </p>

      <div className="category-grid">
        <div className="category-card">
          <div className="icon-box blue">📘</div>
          <h3>Books</h3>
          <span>342 items</span>
        </div>

        <div className="category-card">
          <div className="icon-box purple">💻</div>
          <h3>Electronics</h3>
          <span>189 items</span>
        </div>

        <div className="category-card">
          <div className="icon-box green">🧪</div>
          <h3>Lab Equipment</h3>
          <span>127 items</span>
        </div>

        <div className="category-card">
          <div className="icon-box orange">🛋️</div>
          <h3>Furniture</h3>
          <span>95 items</span>
        </div>
      </div>
    </section>
  );
};

export default Categories;

