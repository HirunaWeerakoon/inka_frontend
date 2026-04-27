import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from './ProductCard';
import './ProductGrid.css';

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'denims', label: 'Denims' },
  { id: 'tshirts', label: 'T-Shirts' },
  { id: 'totebags', label: 'Tote Bags' },
  { id: 'accessories', label: 'Accessories' },
];

const AVAILABILITY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'instock', label: 'In Stock' },
];

const CATEGORY_ID_TO_FILTER = {
  1: 'tshirts',
  2: 'denims',
  3: 'totebags',
  4: 'accessories',
};

const normalizeCategory = (value = '') => value.toString().toLowerCase().replace(/[^a-z]/g, '');
const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 10000;

function ProductGrid() {
  const [searchParams] = useSearchParams();
  const dropdownRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [priceFromInput, setPriceFromInput] = useState(String(DEFAULT_MIN_PRICE));
  const [priceToInput, setPriceToInput] = useState(String(DEFAULT_MAX_PRICE));
  const [selectedMinPrice, setSelectedMinPrice] = useState(DEFAULT_MIN_PRICE);
  const [selectedMaxPrice, setSelectedMaxPrice] = useState(DEFAULT_MAX_PRICE);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setProducts([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const categoryQuery = searchParams.get('category');
    if (!categoryQuery) { setSelectedFilter('all'); return; }
    const parsedCategoryId = Number.parseInt(categoryQuery, 10);
    const matchedById = CATEGORY_ID_TO_FILTER[parsedCategoryId];
    if (matchedById) { setSelectedFilter(matchedById); return; }
    const normalizedQuery = normalizeCategory(categoryQuery);
    const matchedByName = CATEGORY_FILTERS.find(
      (filter) => normalizeCategory(filter.id) === normalizedQuery || normalizeCategory(filter.label) === normalizedQuery
    );
    setSelectedFilter(matchedByName ? matchedByName.id : 'all');
  }, [searchParams]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [searchParams]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const priceBounds = { min: DEFAULT_MIN_PRICE, max: DEFAULT_MAX_PRICE };

  const handleMinSliderChange = (e) => {
    const next = Math.min(Number(e.target.value), selectedMaxPrice);
    setSelectedMinPrice(next);
    setPriceFromInput(String(next));
  };

  const handleMaxSliderChange = (e) => {
    const next = Math.max(Number(e.target.value), selectedMinPrice);
    setSelectedMaxPrice(next);
    setPriceToInput(String(next));
  };

  const handleFromInputChange = (e) => {
    setPriceFromInput(e.target.value);
    const parsed = Number(e.target.value);
    if (!e.target.value || Number.isNaN(parsed)) return;
    const clamped = Math.min(Math.max(parsed, priceBounds.min), selectedMaxPrice);
    setSelectedMinPrice(clamped);
  };

  const handleToInputChange = (e) => {
    setPriceToInput(e.target.value);
    const parsed = Number(e.target.value);
    if (!e.target.value || Number.isNaN(parsed)) return;
    const clamped = Math.max(Math.min(parsed, priceBounds.max), selectedMinPrice);
    setSelectedMaxPrice(clamped);
  };

  const handleClearPriceRange = () => {
    setSelectedMinPrice(priceBounds.min);
    setSelectedMaxPrice(priceBounds.max);
    setPriceFromInput(String(priceBounds.min));
    setPriceToInput(String(priceBounds.max));
  };

  const handleCategoryToggle = (filterId) => {
    setSelectedFilter((current) => (filterId === 'all' || current === filterId) ? 'all' : filterId);
    if (filterId === 'all') setSelectedFilter('all');
  };

  const handleAvailabilityToggle = (filterId) => {
    setSelectedAvailability((current) => (filterId === 'all' || current === filterId) ? 'all' : filterId);
    if (filterId === 'all') setSelectedAvailability('all');
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const productCategory = normalizeCategory(product.categoryName || product.category?.categoryName || '');
      const categoryMatches = selectedFilter === 'all' || productCategory === selectedFilter;
      const hasStockValue = typeof product.stock === 'number';
      const inStock = hasStockValue ? product.stock > 0 : product.isAvailable !== false;
      const availabilityMatches = selectedAvailability === 'all' || inStock;
      const numericPrice = Number(product.price) || 0;
      return categoryMatches && availabilityMatches && numericPrice >= selectedMinPrice && numericPrice <= selectedMaxPrice;
    });
  }, [products, selectedFilter, selectedAvailability, selectedMinPrice, selectedMaxPrice]);

  const sliderSpan = priceBounds.max - priceBounds.min;
  const minPercent = sliderSpan > 0 ? ((selectedMinPrice - priceBounds.min) / sliderSpan) * 100 : 0;
  const maxPercent = sliderSpan > 0 ? ((selectedMaxPrice - priceBounds.min) / sliderSpan) * 100 : 100;

  if (loading) return <div className="loading">Loading</div>;
  if (products.length === 0) return <div className="no-products">No products found</div>;

  return (
    <div className="product-section">
      <div className="filter-bar">
        <div className="filter-dropdown" ref={dropdownRef}>
          <button
            type="button"
            className="filter-btn"
            onClick={() => setIsDropdownOpen((open) => !open)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
          >
            <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Filter
          </button>

          {isDropdownOpen && (
            <div className="filter-menu" role="menu" aria-label="Product filters">

              <p className="filter-section-title">Category</p>
              {CATEGORY_FILTERS.map((filter) => {
                const isActive = selectedFilter === filter.id;
                return (
                  <label
                    key={filter.id}
                    className={`filter-option ${isActive ? 'filter-option--active' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => handleCategoryToggle(filter.id)}
                      className="filter-checkbox"
                    />
                    <span className="filter-checkbox-box" aria-hidden="true" />
                    <span>{filter.label}</span>
                  </label>
                );
              })}

              <div className="filter-divider" />

              <p className="filter-section-title">Availability</p>
              {AVAILABILITY_FILTERS.map((filter) => {
                const isActive = selectedAvailability === filter.id;
                return (
                  <label
                    key={filter.id}
                    className={`filter-option ${isActive ? 'filter-option--active' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => handleAvailabilityToggle(filter.id)}
                      className="filter-checkbox"
                    />
                    <span className="filter-checkbox-box" aria-hidden="true" />
                    <span>{filter.label}</span>
                  </label>
                );
              })}

              <div className="filter-divider" />

              <p className="filter-section-title">Price Range</p>
              <div className="price-section">
                <div className="price-slider">
                  <div className="price-slider-track" />
                  <div
                    className="price-slider-active-track"
                    style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
                  />
                  <input
                    type="range"
                    min={priceBounds.min}
                    max={priceBounds.max}
                    value={selectedMinPrice}
                    onChange={handleMinSliderChange}
                    className="price-slider-input price-slider-input--min"
                  />
                  <input
                    type="range"
                    min={priceBounds.min}
                    max={priceBounds.max}
                    value={selectedMaxPrice}
                    onChange={handleMaxSliderChange}
                    className="price-slider-input price-slider-input--max"
                  />
                </div>

                <div className="price-inputs">
                  <div className="price-input-group">
                    <label className="price-range-label" htmlFor="price-from-input">From</label>
                    <input
                      id="price-from-input"
                      type="number"
                      min={priceBounds.min}
                      value={priceFromInput}
                      onChange={handleFromInputChange}
                      className="price-range-input"
                      placeholder="0"
                    />
                  </div>
                  <div className="price-input-group">
                    <label className="price-range-label" htmlFor="price-to-input">To</label>
                    <input
                      id="price-to-input"
                      type="number"
                      min={priceBounds.min}
                      value={priceToInput}
                      onChange={handleToInputChange}
                      className="price-range-input"
                      placeholder="10000"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="price-reset-btn"
                  onClick={handleClearPriceRange}
                >
                  Reset
                </button>
              </div>

            </div>
          )}
        </div>
        <span className="product-count">{filteredProducts.length} items</span>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="no-products">No products found for this filter</div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map(product => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductGrid;