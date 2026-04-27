import { Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="footer-container">
            <div className="footer-grid">
                <div className="footer-column">
                    <h3 className="footer-heading">Shop By Category</h3>
                    <div className="footer-links">
                        <Link to="/shop?category=2">Denims</Link>
                        <Link to="/shop?category=1">T-Shirts</Link>
                        <Link to="/shop?category=3">Tote Bags</Link>
                        <Link to="/shop?category=4">Accessories</Link>
                    </div>
                </div>

                <div className="footer-column">
                    <h3 className="footer-heading">Information</h3>
                    <div className="footer-links">
                        <Link to="/about">About Us</Link>
                        <span className="footer-link-text">Contact Us</span>
                        <a href="https://wa.me/94772544143" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp 077 254 4143" className="footer-whatsapp-link">
                            <svg viewBox="0 0 32 32" width="18" height="18" fill="currentColor" aria-hidden="true">
                                <path d="M19.11 17.21c-.27-.14-1.58-.78-1.82-.87-.24-.09-.41-.14-.58.14-.18.27-.67.87-.83 1.05-.15.18-.31.21-.58.07-.27-.14-1.12-.41-2.14-1.31-.79-.7-1.32-1.57-1.48-1.84-.15-.27-.02-.41.12-.55.12-.12.27-.31.41-.47.14-.16.18-.27.27-.46.09-.18.05-.34-.02-.48-.07-.14-.58-1.4-.79-1.92-.21-.5-.43-.43-.58-.43h-.5c-.18 0-.46.07-.7.34-.24.27-.92.9-.92 2.2s.94 2.56 1.07 2.74c.14.18 1.86 2.84 4.5 3.99.63.27 1.12.43 1.5.55.63.2 1.2.17 1.66.1.51-.08 1.58-.64 1.81-1.27.22-.63.22-1.17.15-1.27-.06-.1-.24-.17-.51-.31z" />
                                <path d="M27.64 4.36A15.85 15.85 0 0 0 16.01 0C7.17 0 0 7.17 0 16c0 2.82.74 5.58 2.13 8l-2.13 8 8.2-2.09A15.94 15.94 0 0 0 16 32c8.83 0 16-7.17 16-16 0-4.27-1.66-8.29-4.36-11.64zM16 29.3c-2.39 0-4.73-.65-6.77-1.89l-.48-.29-4.87 1.24 1.29-4.74-.31-.49A13.2 13.2 0 0 1 2.7 16C2.7 8.67 8.67 2.7 16 2.7S29.3 8.67 29.3 16 23.33 29.3 16 29.3z" />
                            </svg>
                            <span>WhatsApp: 077 254 4143</span>
                        </a>
                    </div>
                </div>

                <div className="footer-column">
                    <h3 className="footer-heading">Socials</h3>
                    <p className="footer-social-text">follow us on social media</p>
                    <div className="footer-socials">
                        <a href="https://www.instagram.com/inkaa_app/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <Instagram size={24} />
                        </a>
                        <a href="https://www.tiktok.com/@inkaa_app?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
                                <path d="M14.5 3.2c.66 1.9 2.3 3.2 4.3 3.4v2.8a7.2 7.2 0 0 1-4.3-1.4v6.4a6.1 6.1 0 1 1-6.1-6.1c.28 0 .56.02.83.06v2.75a3.3 3.3 0 1 0 2.47 3.19V3.2h2.8z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
