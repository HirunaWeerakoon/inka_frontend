import './AboutPage.css';

export default function AboutPage() {
    return (
        <div className="about-page">

            {/* Hero Section */}
            <section className="about-hero">
                <div className="about-hero__content">
                    <p className="about-hero__label">THE INKA LAB</p>
                    <h1 className="about-hero__title">Where Precision Meets Print</h1>
                    <p className="about-hero__sub">
                        At INKA Apparel, we don't just "make clothes." We architect them. Born from a fusion
                        of technical precision and creative rebellion, INKA is where high-end design meets
                        the cutting edge of garment technology.
                    </p>
                </div>
            </section>

            {/* Methodology Section */}
            <section className="about-section">
                <div className="about-container">
                    <h2 className="about-section__title">The INKA Methodology</h2>
                    <p className="about-section__body">
                        We treat every garment like a high-stakes deployment. Using industry-leading DTF
                        (Direct to Film) technology, we've cracked the code on what makes a perfect print.
                    </p>
                    <div className="about-cards">
                        <div className="about-card">

                            <h3>Pixel-Perfect Resolution</h3>
                            <p>Our DTF process allows for insane detail and vibrant color gamuts that traditional screen printing just can't render. If you can dream it, we can print it—down to the last pixel.</p>
                        </div>
                        <div className="about-card">
                            <h3>Stress-Tested Durability</h3>
                            <p>Like well-documented code, our prints are built to last. No cracking, no peeling, and no fading. We build for the long-term, not the "one-wash" wonder.</p>
                        </div>
                        <div className="about-card">
                            <h3>The User Experience</h3>
                            <p>A shirt is only as good as it feels. We source premium fabrics that act as the perfect canvas for our technical applications.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Inkaa Section */}
            <section className="about-section about-section--dark">
                <div className="about-container">
                    <h2 className="about-section__title">Why INKA?</h2>
                    <div className="about-why-list">
                        <div className="about-why-item">
                            <span className="about-why-dot" />
                            <div>
                                <h4>Tech-Driven Quality</h4>
                                <p>We leverage the best DTF machinery to ensure your gear looks as good in person as it does on your screen.</p>
                            </div>
                        </div>
                        <div className="about-why-item">
                            <span className="about-why-dot" />
                            <div>
                                <h4>Artistic Integrity</h4>
                                <p>We don't compromise on the vision. Our colors stay sharp and our lines stay clean.</p>
                            </div>
                        </div>
                        <div className="about-why-item">
                            <span className="about-why-dot" />
                            <div>
                                <h4>The Creator's Promise</h4>
                                <p>We are built by creators, for creators. We know the hustle because we're in it.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="about-section">
                <div className="about-container about-contact">
                    <h2 className="about-section__title">Get In Touch</h2>
                    <p className="about-contact__phone">📞 0772544143</p>
                    <div className="about-socials">
                        <a href="https://www.instagram.com/inkaa_app?igsh=YTI1MnN1aHpkd3Rr&utm_source=qr"
                            target="_blank" rel="noreferrer" className="about-social-btn about-social-btn--ig">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                            </svg>
                            Instagram
                        </a>

                        <a href="https://www.facebook.com/share/1GzoUo4H9y/?mibextid=wwXIfr"
                            target="_blank" rel="noreferrer" className="about-social-btn about-social-btn--fb">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Facebook
                        </a>

                        <a href="https://www.tiktok.com/@inkaa_app?_r=1&_t=ZS-95iaE2HGMvV"
                            target="_blank" rel="noreferrer" className="about-social-btn about-social-btn--tt">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.22 8.22 0 004.82 1.56V6.79a4.85 4.85 0 01-1.05-.1z" />
                            </svg>
                            TikTok
                        </a>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="about-cta">
                <div className="about-container">
                    <h2>Upgrade Your Wardrobe</h2>
                    <p>The world is full of default settings. Don't be one of them.</p>
                    <div className="about-cta__btns">
                        <a href="/shop" className="about-cta__btn about-cta__btn--primary">Explore the Collection</a>
                        <a href="/custom" className="about-cta__btn about-cta__btn--secondary">Start Designing</a>
                    </div>
                </div>
            </section>

        </div>
    );
}