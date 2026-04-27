import { Link } from 'react-router-dom';
import { useState } from 'react';
import './HeroSection.css';

function HeroSection() {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <section className="hero">
      {/* Left content */}
      <div className="hero__content">
        <h1 className="hero__headline">
          PRINT YOUR STYLE.<br />
          WE PRINT THE ATTITUDE.
        </h1>
        <p className="hero__sub">
          Premium custom t-shirt printing for brands,<br />events &amp; creators
        </p>
        <div className="hero__actions">
          <Link to="/shop" className="btn btn--filled">SHOP NOW</Link>
          <Link to="/custom" className="btn btn--outline">Custom Print</Link>
        </div>
      </div>

      {/* Right image — no wrapper box, image is a natural element */}
      <div className="hero__image-wrapper">
        {!imageFailed ? (
          <img
            src="/home-image.png"
            alt="INKA home banner"
            className="hero__image"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="hero__image-placeholder" aria-hidden="true" />
        )}
      </div>
    </section>
  );
}

export default HeroSection;