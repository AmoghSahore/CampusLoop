const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            ♻ Campus<span>Loop</span>
          </div>
          <p>
            The sustainable marketplace for university students.
            Buy, sell, rent, or donate within your campus community.
          </p>
        </div>

        <div className="footer-column">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#">Browse All</a></li>
            <li><a href="#">List an Item</a></li>
            <li><a href="#">Wishlist</a></li>
            <li><a href="#">Messages</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Categories</h4>
          <ul>
            <li><a href="#">Books</a></li>
            <li><a href="#">Electronics</a></li>
            <li><a href="#">Lab Equipment</a></li>
            <li><a href="#">Furniture</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Connect</h4>
          <div className="social-icons">
            <a href="#">✉️</a>
            <a href="#">📷</a>
            <a href="#">🐦</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 CampusLoop. Made with ♻ for students, by students.
      </div>
    </footer>
  );
};

export default Footer;

