import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { authService } from '../../services/authService';

export default function CheckoutSuccess() {
    const navigate = useNavigate();

    useEffect(() => {
        const user = authService.getUserDetails();
        if (user?.id) {
            axios.delete(`/api/cart/${user.id}/clear`).catch(() => {});
            window.dispatchEvent(new Event('cart-updated'));
        }

        const timer = setTimeout(() => {
            navigate('/account/orders', { replace: true });
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="placeholder-page">
            <h1>Payment successful</h1>
            <p>Your payment was received. Thank you for your order.</p>
            <p>Redirecting to your orders in 5 seconds...</p>
            <Link to="/account/orders">View orders now</Link>
        </div>
    );
}
