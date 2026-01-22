const Listings = () => {
  return (
    <>
      <section className="listing-section">
        <h2>Latest Listings</h2>
        <p className="section-subtitle">
          Fresh finds from your campus community
        </p>

        <div className="filters">
          <span className="filter-label">🔽 Filter:</span>
          <button className="filter-btn active">All Items</button>
          <button className="filter-btn">Free / Donate</button>
          <button className="filter-btn">For Rent</button>
          <button className="filter-btn">For Sale</button>
        </div>
      </section>

      <section className="listing-grid">
        {/* CARD 1 */}
        <div className="listing-card">
          <div className="image-wrapper">
            <span className="tag buy">Buy</span>
            <span className="wishlist">♡</span>
            <img
              src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f"
              alt="Book"
            />
          </div>

          <div className="card-body">
            <span className="category">BOOKS</span>
            <h3>Operating Systems Concepts by Silberschatz</h3>
            <p className="price">₹450</p>

            <hr />

            <div className="seller">
              <div className="seller-info">
                <img src="https://i.pravatar.cc/40?img=12" alt="user" />
                <div>
                  <strong>Arjun K.</strong>
                  <span>2 days ago</span>
                </div>
              </div>
              <button className="chat-btn">💬 Chat</button>
            </div>
          </div>
        </div>

        {/* CARD 2 */}
        <div className="listing-card">
          <div className="image-wrapper">
            <span className="tag free">Free</span>
            <span className="wishlist">♡</span>
            <img
              src="https://images.unsplash.com/photo-1580281657527-47f249e8f2f9"
              alt="Lab"
            />
          </div>

          <div className="card-body">
            <span className="category">LAB EQUIPMENT</span>
            <h3>Professional Lab Coat - Size M</h3>
            <p className="price free-text">Free</p>

            <hr />

            <div className="seller">
              <div className="seller-info">
                <img src="https://i.pravatar.cc/40?img=32" alt="user" />
                <div>
                  <strong>Priya S.</strong>
                  <span>5 hours ago</span>
                </div>
              </div>
              <button className="chat-btn">💬 Chat</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Listings;

