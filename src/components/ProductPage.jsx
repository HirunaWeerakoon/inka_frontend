import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './ProductPage.css';
import ReviewSection from './ReviewSection';   // ← NEW
import { authService } from '../services/authService';
import ProductCard from './ProductCard';
import { getRelatedProducts } from '../services/productService';

const HeartIcon = () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

function StarRating({ rating = 4, max = 5 }) {
    return (
        <div className="pp-stars">
            {Array.from({ length: max }, (_, i) => (
                <span key={i} className={i < rating ? 'pp-star filled' : 'pp-star empty'}>★</span>
            ))}
        </div>
    );
}

const COLORS = [
    { label: 'Black', hex: '#111111' },
    { label: 'Tan', hex: '#C4A882' },
    { label: 'White', hex: '#FFFFFF' },
    { label: 'Light Gray', hex: '#D0D0D0' },
    { label: 'Navy', hex: '#3B4A6B' },
];
const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export default function ProductPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [selectedColor, setSelectedColor] = useState(COLORS[0].hex);
    const [selectedSize, setSelectedSize] = useState('');
    const [activeThumb, setActiveThumb] = useState(0);
    const [activeTab, setActiveTab] = useState('description');
    const [wishlisted, setWishlisted] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [cartMessage, setCartMessage] = useState('');
    const [isCartError, setIsCartError] = useState(false);
    const [avgRating, setAvgRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);
    const [relatedProducts, setRelatedProducts] = useState([]);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        axios.get(`/api/products/${id}`)
            .then(response => setProduct(response.data))
            .catch(error => console.error('Error fetching product:', error));
    }, [id]);

    // fetch average rating and review count when product loads ────
    useEffect(() => {
        if (!id) return;
        Promise.all([
            axios.get(`/api/reviews/product/${id}/average`),
            axios.get(`/api/reviews/product/${id}`)
        ]).then(([avgRes, reviewsRes]) => {
            setAvgRating(avgRes.data || 0);
            setReviewCount(reviewsRes.data.length || 0);
        }).catch(err => console.error('Error fetching review stats:', err));
    }, [id]);

    useEffect(() => {
        let mounted = true;

        const loadRelatedProducts = async () => {
            if (!product?.productId) return;
            try {
                const related = await getRelatedProducts(product);
                if (mounted) {
                    setRelatedProducts(related);
                }
            } catch (error) {
                console.error('Error loading related products:', error);
                if (mounted) {
                    setRelatedProducts([]);
                }
            }
        };

        loadRelatedProducts();

        return () => {
            mounted = false;
        };
    }, [product]);

    const handleAddToCart = async () => {
        if (!selectedSize) {
            setCartMessage('Please select a size');
            setIsCartError(true);
            setTimeout(() => { setCartMessage(''); setIsCartError(false); }, 2000);
            return;
        }

        const user = authService.getUserDetails();
        if (!user) {
            setCartMessage('Please log in to add to cart');
            setIsCartError(true);
            setTimeout(() => { setCartMessage(''); setIsCartError(false); }, 2000);
            return;
        }

        setAddingToCart(true);
        try {
            const selectedColorLabel = COLORS.find(c => c.hex === selectedColor)?.label || selectedColor;
            await axios.post(`/api/cart/${user.id}/add`, {
                productId: product.productId,
                quantity: 1,
                color: selectedColorLabel,
                size: selectedSize
            });
            setCartMessage('Added to cart!');
            setIsCartError(false);
            window.dispatchEvent(new Event('cart-updated'));
        } catch (error) {
            console.error('Error adding to cart:', error);
            setCartMessage('Failed to add to cart');
            setIsCartError(true);
        } finally {
            setAddingToCart(false);
            setTimeout(() => { setCartMessage(''); setIsCartError(false); }, 2000);
        }
    };

    const categoryName = (product?.categoryName || product?.category?.categoryName || '').toLowerCase();
    const categoryId = product?.categoryId || product?.category?.categoryId;
    const isDenimProduct = categoryName.includes('denim') || categoryId === 2;
    const hideSizeGuide = categoryName.includes('tote') || categoryName.includes('accessor') || categoryId === 3 || categoryId === 4;

    useEffect(() => {
        if (hideSizeGuide && activeTab === 'sizeguide') {
            setActiveTab('description');
        }
    }, [hideSizeGuide, activeTab]);

    if (!product) return <div className="loading">Loading...</div>;

    // Build gallery: use image1-5 if available, fallback to imageUrl
    const primaryImage = product.image1 || product.imageUrl;
    const thumbnails = [product.image2, product.image3, product.image4, product.image5].filter(Boolean);
    const mainImage = thumbnails.length > 0 && activeThumb >= 0
        ? (thumbnails[activeThumb] || primaryImage)
        : primaryImage;

    const TABS = [
        { id: 'description', label: 'Description' },
        ...(!hideSizeGuide ? [{ id: 'sizeguide', label: 'Size Guide' }] : []),
        { id: 'reviews', label: 'Reviews' },
    ];

    return (
        <div className="pp-root">

            {/* PRODUCT SECTION */}
            <section className="pp-product">

                {/* LEFT — images */}
                <div className="pp-images">
                    <div className="pp-main-img">
                        {mainImage
                            ? <img src={mainImage} alt={product.name} className="pp-main-img-tag" />
                            : <span className="pp-no-image">No Image</span>
                        }
                    </div>
                    {thumbnails.length > 0 && (
                        <div className="pp-thumbs">
                            {thumbnails.map((img, i) => (
                                <button
                                    key={i}
                                    className={`pp-thumb${activeThumb === i ? ' active' : ''}`}
                                    onClick={() => setActiveThumb(i)}
                                    style={{
                                        backgroundImage: `url(${img})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }}
                                    aria-label={`Thumbnail ${i + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT — details */}
                <div className="pp-details">
                    <h1 className="pp-name">{product.name}</h1>
                    <div className="pp-rating-row">
                        <StarRating rating={avgRating} />
                        <span>({reviewCount} reviews)</span>
                    </div>
                    <p className="pp-price">LKR {product.price?.toLocaleString()}</p>
                    <p className="pp-vat">Inclusive of VAT</p>

                    {product.description && (
                        <p className="pp-description">{product.description}</p>
                    )}

                    {/* Color */}
                    <div className="pp-option-row">
                        <span className="pp-option-label">Color</span>
                        <div className="pp-colors">
                            {COLORS.map((c) => (
                                <button
                                    key={c.hex}
                                    className={`pp-color-swatch${selectedColor === c.hex ? ' selected' : ''}`}
                                    style={{ backgroundColor: c.hex }}
                                    onClick={() => setSelectedColor(c.hex)}
                                    aria-label={c.label}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Size */}
                    <div className="pp-option-row">
                        <span className="pp-option-label">Size</span>
                        <div className="pp-sizes">
                            {SIZES.map((s) => (
                                <button
                                    key={s}
                                    className={`pp-size-btn${selectedSize === s ? ' selected' : ''}`}
                                    onClick={() => setSelectedSize(s)}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="pp-cta-row">
                        <button
                            className="pp-add-to-cart"
                            onClick={handleAddToCart}
                            disabled={addingToCart}
                        >
                            {addingToCart ? 'ADDING...' : 'ADD TO CART'}
                        </button>
                        <button
                            className={`pp-wishlist-btn${wishlisted ? ' active' : ''}`}
                            onClick={() => setWishlisted(!wishlisted)}
                            aria-label="Add to wishlist"
                        >
                            <HeartIcon />
                        </button>
                    </div>

                    {cartMessage && <p className={`pp-cart-message ${isCartError ? 'error' : ''}`}>{cartMessage}</p>}

                    <p className="pp-stock">
                        {product.isAvailable ? `In Stock: ${product.stock} items` : 'Out of Stock'}
                    </p>
                </div>
            </section>

            {/* TABS */}
            <div className="pp-tabs-bar">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        className={`pp-tab${activeTab === tab.id ? ' active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* TAB CONTENT */}
            <div className="pp-tab-content">
                {activeTab === 'description' && (
                    <div className="pp-tab-placeholder pp-description-wrap">
                        <p className="pp-description-text">{product.description}</p>
                    </div>
                )}
                {activeTab === 'sizeguide' && !hideSizeGuide && (
                    <div className="pp-tab-placeholder pp-sizeguide-wrap">
                        <img
                            src={isDenimProduct ? '/denim-size-chart.jpeg' : '/size-chart.png'}
                            alt={isDenimProduct ? 'Denim size chart' : 'Size chart'}
                            className="pp-sizeguide-image"
                        />
                    </div>
                )}

                {/* ── REVIEWS TAB — now connected to the backend ── */}
                {activeTab === 'reviews' && (
                    <ReviewSection productId={product.productId} />
                )}
            </div>

            {/* RELATED PRODUCTS */}
            <section className="pp-related">
                <h2 className="pp-related-title">Related Products</h2>
                {relatedProducts.length > 0 ? (
                    <div className="pp-related-grid">
                        {relatedProducts.map((relatedProduct) => (
                            <ProductCard key={relatedProduct.productId} product={relatedProduct} />
                        ))}
                    </div>
                ) : (
                    <p className="pp-related-empty">No related products available right now.</p>
                )}
            </section>

        </div>
    );
}