import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBestSellerProducts } from '../../../services/productService';
import './BestSellingSection.css';

function BestSellingSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBestSellerProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="bestselling">
        <h2 className="bestselling__title">Best Selling</h2>
        <div className="bestselling__grid">
          {[1, 2, 3].map((n) => (
            <div key={n} className="product-card product-card--skeleton" />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null; // nothing to show
  }

  return (
    <section className="bestselling">
      <h2 className="bestselling__title">Best Selling</h2>
      <div className="bestselling__grid">
        {products.map((product) => (
          <Link
            to={`/product/${product.productId}`}
            key={product.productId}
            className="product-card"
          >
            {/* Product Image */}
            <div className="product-card__img-wrapper">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="product-card__img"
                />
              ) : (
                <div className="product-card__img-placeholder" aria-hidden="true" />
              )}
            </div>

            {/* Product Info */}
            <div className="product-card__info">
              <p className="product-card__name">{product.name}</p>
              {product.categoryName && (
                <p className="product-card__category">{product.categoryName}</p>
              )}
              <p className="product-card__price">
                LKR {product.price?.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default BestSellingSection;
