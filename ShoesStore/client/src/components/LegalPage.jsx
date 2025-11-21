// src/components/LegalPage.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function LegalPage() {
  return (
    <main className="legal-wrap">
      {/* Header breadcrumb nhẹ */}
      <section className="men-head">
        <div className="container">
          <h1 className="men-title">Privacy Policy & Terms of Service</h1>
          <p className="men-sub">
            This page describes how we collect, use and protect your personal data when you use StepStyle,
            and the terms that apply when you create an account and shop with us.
          </p>
        </div>
      </section>

      <section className="container" style={{ padding: "24px 0 64px" }}>
        <div className="legal-layout">
          {/* Sidebar: table of contents */}
          <aside className="legal-toc">
            <p className="legal-toc-title">Contents</p>
            <ul>
              <li><a href="#who">1. Who is responsible for processing your data?</a></li>
              <li><a href="#what">2. What personal data do we collect and when?</a></li>
              <li><a href="#why">3. Why and how do we use your personal data?</a></li>
              <li><a href="#share">4. Sharing of your personal data</a></li>
              <li><a href="#rights">5. Your rights</a></li>
              <li><a href="#cookies">6. Cookies and similar technologies</a></li>
              <li><a href="#terms">7. Terms of Service</a></li>
              <li><a href="#contact">8. Questions & contact</a></li>
            </ul>
          </aside>

          {/* Main content */}
          <article className="legal-content">
            <section id="who">
              <h2>1. Who is responsible for processing your data?</h2>
              <p>
                StepStyle (“we”, “our”, “us”) is responsible for processing the personal data you provide
                when you interact with our website, mobile apps, or other digital services (the “Platform”).
              </p>
            </section>

            <section id="what">
              <h2>2. What personal data do we collect and when?</h2>
              <p>We may collect the following categories of information when you:</p>
              <ul>
                <li>Create an account or update your profile;</li>
                <li>Place an order, add items to your cart, or request a refund;</li>
                <li>Subscribe to our newsletter or marketing communications;</li>
                <li>Contact customer support or send us feedback;</li>
                <li>Browse our Platform (device information, log data, cookie identifiers, etc.).</li>
              </ul>
            </section>

            <section id="why">
              <h2>3. Why and how do we use your personal data?</h2>
              <p>We use your data to:</p>
              <ul>
                <li>Process and deliver your orders;</li>
                <li>Provide customer support and manage your account;</li>
                <li>Improve our products, services and user experience;</li>
                <li>Send you updates, offers and recommendations (where permitted);</li>
                <li>Comply with legal obligations and protect our rights.</li>
              </ul>
            </section>

            <section id="share">
              <h2>4. Sharing of your personal data</h2>
              <p>
                We may share your personal data with trusted service providers (payment processors,
                delivery partners, analytics providers) strictly for the purposes described in this Policy.
                We do not sell your personal data.
              </p>
            </section>

            <section id="rights">
              <h2>5. Your rights</h2>
              <p>
                Subject to applicable law, you may have the right to access, correct, delete, or restrict the
                processing of your personal data, as well as the right to object or to withdraw your consent.
              </p>
            </section>

            <section id="cookies">
              <h2>6. Cookies and similar technologies</h2>
              <p>
                We use cookies and similar technologies to remember your preferences, understand how you use
                our Platform, and personalize content and offers. You can manage your cookie preferences
                through your browser settings.
              </p>
            </section>

            <section id="terms">
              <h2>7. Terms of Service</h2>
              <p>
                By creating an account or placing an order on StepStyle, you agree to:
              </p>
              <ul>
                <li>Provide accurate and up-to-date information;</li>
                <li>Use the Platform only for lawful purposes;</li>
                <li>Respect all applicable laws and regulations;</li>
                <li>Not misuse discounts, promotions, or return policies.</li>
              </ul>
              <p>
                All purchases are subject to product availability, pricing at checkout, and our returns and
                shipping policies as displayed on the Platform.
              </p>
            </section>

            <section id="contact">
              <h2>8. Questions & contact</h2>
              <p>
                If you have any questions about this Policy or how we process your data, please contact our
                support team at <a href="mailto:support@stepstyle.com">support@stepstyle.com</a>.
              </p>
              <p style={{ marginTop: 16 }}>
                <Link to="/signup" className="link-btn">
                  ← Back to Sign up
                </Link>
              </p>
            </section>
          </article>
        </div>
      </section>
    </main>
  );
}