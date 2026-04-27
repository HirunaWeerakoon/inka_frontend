import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import { getBestSellerProducts, searchProducts } from '../../services/productService';
import './SearchResultsPage.css';

const QUICK_CATEGORY_LINKS = [
  { label: 'T-Shirts', to: '/shop?category=1' },
  { label: 'Denims', to: '/shop?category=2' },
  { label: 'Tote Bags', to: '/shop?category=3' },
  { label: 'Accessories', to: '/shop?category=4' },
];

function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').trim();
  const [products, setProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await searchProducts(query);
        const matchedProducts = Array.isArray(data) ? data : [];

        if (query && matchedProducts.length === 0) {
          try {
            const popular = await getBestSellerProducts();
            if (mounted) {
              setPopularProducts((Array.isArray(popular) ? popular : []).slice(0, 4));
            }
          } catch (popularError) {
            console.error('Error fetching popular products:', popularError);
            if (mounted) {
              setPopularProducts([]);
            }
          }
        } else if (mounted) {
          setPopularProducts([]);
        }

        if (mounted) {
          setProducts(matchedProducts);
        }
      } catch (error) {
        console.error('Error searching products:', error);
        if (mounted) {
          setProducts([]);
          setPopularProducts([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, [query]);

  return (
    <section className="search-results-page">
      <header className="search-results-header">
        <h1>Search Results</h1>
        {query ? (
          <p>
            Showing {products.length} matching product{products.length === 1 ? '' : 's'} for "{query}"
          </p>
        ) : (
          <p>Showing all products. Type a keyword from the search icon in the header to filter.</p>
        )}
      </header>

      {loading ? (
        <div className="search-results-status">Searching products...</div>
      ) : products.length === 0 ? (
        <section className="search-empty-state">
          <h2>No results found for "{query}"</h2>
          <p>Try another keyword, or browse one of these categories.</p>

          <div className="search-empty-links">
            {QUICK_CATEGORY_LINKS.map((category) => (
              <Link key={category.to} to={category.to} className="search-empty-link-chip">
                {category.label}
              </Link>
            ))}
            <Link to="/shop" className="search-empty-link-chip search-empty-link-chip--strong">
              View All Products
            </Link>
          </div>

          {popularProducts.length > 0 && (
            <div className="search-empty-popular">
              <h3>Popular Right Now</h3>
              <div className="search-results-grid">
                {popularProducts.map((product) => (
                  <ProductCard key={product.productId} product={product} />
                ))}
              </div>
            </div>
          )}
        </section>
      ) : (
        <div className="search-results-grid">
          {products.map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

export default SearchResultsPage;
