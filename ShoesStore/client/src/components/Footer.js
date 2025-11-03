import React from "react";

export default function Footer() {
  return (
    <footer className="ft">
      <div className="container">
        <div className="ft-grid">
          <div className="ft-col">
            <div className="brand">
              <div className="brand-dot">S</div>
              <span className="brand-name">StepStyle</span>
            </div>
            <p className="muted">
              Your destination for premium footwear. Quality, comfort, and style in every step.
            </p>
            <div className="icons">
              <button className="icon-btn">f</button>
              <button className="icon-btn">ig</button>
              <button className="icon-btn">tw</button>
              <button className="icon-btn">yt</button>
            </div>
          </div>

          <div className="ft-col">
            <h3>Shop</h3>
            <ul className="links">
              <li><a href="#">New Arrivals</a></li>
              <li><a href="#">Men's Shoes</a></li>
              <li><a href="#">Women's Shoes</a></li>
              <li><a href="#">Kids' Shoes</a></li>
              <li><a href="#">Sale</a></li>
            </ul>
          </div>

          <div className="ft-col">
            <h3>Support</h3>
            <ul className="links">
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Shipping Info</a></li>
              <li><a href="#">Returns</a></li>
              <li><a href="#">Size Guide</a></li>
              <li><a href="#">FAQs</a></li>
            </ul>
          </div>

          <div className="ft-col">
            <h3>Newsletter</h3>
            <p className="muted">Subscribe to get special offers and updates.</p>
            <div className="newsletter">
              <input className="input" type="email" placeholder="Your email" />
              <button className="btn btn-primary">Join</button>
            </div>
          </div>
        </div>

        <div className="ft-bottom">
          <p>© 2025 StepStyle. All rights reserved.</p>
          <div className="bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
