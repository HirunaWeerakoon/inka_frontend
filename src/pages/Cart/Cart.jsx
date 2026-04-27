import { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cartService } from '../../services/cartService';
import { checkoutService } from '../../services/checkoutService';
import { authService } from '../../services/authService';

export default function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCart = useCallback(async () => {
        try {
            setLoading(true);
            const user = authService.getUserDetails();
            const customerId = user?.id ?? 1;
            const data = await cartService.getCart(customerId);
            setCartItems(data);
            setError(null);
        } catch {
            setError('Failed to load your cart. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const handleQuantityChange = async (itemId, newQty) => {
        if (newQty < 1) return;
        try {
            const updated = await cartService.updateQuantity(itemId, newQty);
            setCartItems(prev =>
                prev.map(item => (item.id === itemId ? { ...item, quantity: updated.quantity } : item))
            );
        } catch {
            setError('Failed to update quantity.');
        }
    };

    const handleRemove = async (itemId) => {
        try {
            await cartService.removeItem(itemId);
            setCartItems(prev => prev.filter(item => item.id !== itemId));
        } catch {
            setError('Failed to remove item.');
        }
    };

    const handleClearCart = async () => {
        try {
            const user = authService.getUserDetails();
            const customerId = user?.id ?? 1;
            await cartService.clearCart(customerId);
            setCartItems([]);
        } catch {
            setError('Failed to clear cart.');
        }
    };

    const handleCheckout = async () => {
        const user = authService.getUserDetails();
        if (!user) {
            setError('Please log in to checkout.');
            return;
        }
        try {
            const response = await checkoutService.createCartSession(user.id);
            if (response?.url) {
                window.location.href = response.url;
            } else {
                setError('Unable to start checkout.');
            }
        } catch {
            setError('Unable to start checkout.');
        }
    };

    const subtotal = cartItems.reduce(
        (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
        0
    );
    const shipping = subtotal > 0 ? (subtotal >= 100 ? 0 : 8.99) : 0;
    const total = subtotal + shipping;

    return (
        <div className="cart-container">
            {/* Page Header */}
            <div className="cart-header">
                <div className="cart-title">
                    <ShoppingCart size={28} strokeWidth={2.5} />
                    <h1>Your Cart</h1>
                </div>
                {cartItems.length > 0 && (
                    <button className="btn-clear-cart" onClick={handleClearCart}>
                        Clear Cart
                    </button>
                )}
            </div>

            <div className="cart-divider" />

            {error && <p className="cart-error">{error}</p>}

            {loading ? (
                <p className="placeholder-text">Loading your cart…</p>
            ) : cartItems.length === 0 ? (
                /* ── Empty State ── */
                <div className="cart-empty">
                    <ShoppingCart size={64} strokeWidth={1.2} className="cart-empty-icon" />
                    <p className="cart-empty-title">Your cart is empty</p>
                    <p className="cart-empty-sub">Looks like you haven't added anything yet.</p>
                    <Link to="/shop" className="btn-shop-now">
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                /* ── Cart Body ── */
                <div className="cart-body">
                    {/* Items List */}
                    <section className="cart-items-section">
                        {cartItems.map(item => (
                            <div key={item.id} className="cart-item">
                                {/* Product Image Placeholder */}
                                <div className="cart-item-img">
                                    {item.product?.imageUrl ? (
                                        <img src={item.product.imageUrl} alt={item.product?.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ fontSize: '0.65rem', color: '#aaa' }}>INKA</span>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="cart-item-info">
                                    <p className="cart-item-name">{item.product?.name ?? 'Product'}</p>
                                    <p className="cart-item-desc">{item.product?.description ?? ''}</p>
                                    {item.color && <p className="cart-item-variant">Color: {item.color}</p>}
                                    {item.size && <p className="cart-item-variant">Size: {item.size}</p>}
                                    <p className="cart-item-unit-price">
                                        LKR {item.product?.price?.toFixed(2)}
                                    </p>
                                </div>

                                {/* Quantity + Remove */}
                                <div className="cart-item-controls">
                                    <div className="quantity-control">
                                        <button
                                            className="qty-btn"
                                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                            aria-label="Decrease quantity"
                                        >
                                            −
                                        </button>
                                        <span className="qty-value">{item.quantity}</span>
                                        <button
                                            className="qty-btn"
                                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                            aria-label="Increase quantity"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <p className="cart-item-line-total">
                                        LKR {((item.product?.price ?? 0) * item.quantity).toFixed(2)}
                                    </p>

                                    <button
                                        className="btn-remove"
                                        onClick={() => handleRemove(item.id)}
                                        aria-label="Remove item"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        <Link to="/shop" className="cart-continue-link">
                            <ArrowLeft size={16} />
                            Continue Shopping
                        </Link>
                    </section>

                    {/* Order Summary */}
                    <aside className="cart-summary">
                        <h2 className="summary-title">Order Summary</h2>

                        <div className="summary-rows">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>LKR {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>{shipping === 0 ? 'FREE' : `LKR ${shipping.toFixed(2)}`}</span>
                            </div>
                            {shipping > 0 && (
                                <p className="summary-shipping-note">
                                    Free shipping on orders over LKR 100.00
                                </p>
                            )}
                        </div>

                        <div className="summary-divider" />

                        <div className="summary-row summary-total">
                            <span>Total</span>
                            <span>LKR {total.toFixed(2)}</span>
                        </div>

                        <button className="btn-checkout" onClick={handleCheckout}>
                            Proceed to Checkout
                        </button>
                    </aside>
                </div>
            )}
        </div>
    );
}
