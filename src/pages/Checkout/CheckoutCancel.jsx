import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { checkoutService } from '../../services/checkoutService';

export default function CheckoutCancel() {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const orderId = searchParams.get('orderId');
        if (orderId) {
            checkoutService.cancelOrder(orderId).catch(console.error);
        }
    }, [searchParams]);

    return (
        <div className="placeholder-page">
            <h1>Payment cancelled</h1>
            <p>Your payment was cancelled. Your items are back in your cart.</p>
            <Link to="/cart">Back to cart</Link>
        </div>
    );
}