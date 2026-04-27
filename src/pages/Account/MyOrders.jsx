import { useEffect, useState } from 'react';
import { authService } from '../../services/authService';
import { orderService } from '../../services/orderService';
import './MyOrders.css';

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const user = authService.getUserDetails();
        if (!user?.id) {
            setError('Please log in to view your orders.');
            setLoading(false);
            return;
        }

        let active = true;
        orderService.getOrdersByCustomer(user.id)
            .then((data) => {
                if (active) {
                    setOrders(Array.isArray(data) ? data : []);
                }
            })
            .catch(() => {
                if (active) {
                    setError('Unable to load orders right now.');
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, []);

    const formatAmount = (minor, currency) => {
        const value = typeof minor === 'number' ? minor / 100 : 0;
        const code = (currency || 'LKR').toUpperCase();
        return `${code} ${value.toFixed(2)}`;
    };

    const formatDate = (value) => {
        if (!value) return 'Unknown date';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return 'Unknown date';
        return date.toLocaleString();
    };

    if (loading) {
        return (
            <div className="tab-pane">
                <p className="placeholder-text">Loading your orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="tab-pane">
                <p className="placeholder-text">{error}</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="tab-pane">
                <p className="placeholder-text">You have no previous orders.</p>
            </div>
        );
    }

    return (
        <div className="tab-pane">
            <div className="orders-list">
                {orders.map((order) => {
                    const currency = order.currency || 'LKR';
                    const status = order.status || 'PENDING';
                    const statusClass = `orders-card__status orders-card__status--${status.toLowerCase()}`;

                    return (
                        <div className="orders-card" key={order.id}>
                            <div className="orders-card__header">
                                <div className="orders-card__title">
                                    <div className="orders-card__id">Order #{order.id}</div>
                                    <div className="orders-card__meta">
                                        {order.orderType} · {formatDate(order.createdAt)}
                                    </div>
                                </div>
                                <div className={statusClass}>{status}</div>
                            </div>

                            <div className="orders-card__items">
                                {(order.items || []).map((item) => (
                                    <div className="orders-item" key={item.id}>
                                        <div className="orders-item__name">{item.name}</div>
                                        <div className="orders-item__qty">x{item.quantity}</div>
                                        <div className="orders-item__price">
                                            {formatAmount(item.lineTotal, currency)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="orders-card__totals">
                                <div className="orders-card__row">
                                    <span>Subtotal</span>
                                    <span>{formatAmount(order.subtotalAmount, currency)}</span>
                                </div>
                                <div className="orders-card__row">
                                    <span>Shipping</span>
                                    <span>{formatAmount(order.shippingAmount, currency)}</span>
                                </div>
                                <div className="orders-card__row orders-card__row--total">
                                    <span>Total</span>
                                    <span>{formatAmount(order.totalAmount, currency)}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
