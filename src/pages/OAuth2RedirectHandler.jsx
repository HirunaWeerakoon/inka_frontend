import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

export default function OAuth2RedirectHandler() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Extract token from URL
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            authService.setToken(token);
            // Setup interceptors with new token
            authService.setupAxiosInterceptors();
            // Redirect to account dashboard
            navigate('/account', { replace: true });
        } else {
            // If no token was found, send them to home
            navigate('/', { replace: true });
        }
    }, [location, navigate]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <h2>Logging you in...</h2>
        </div>
    );
}
