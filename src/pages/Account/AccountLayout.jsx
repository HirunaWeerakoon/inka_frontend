import { Outlet, NavLink } from 'react-router-dom';
import { User } from 'lucide-react';
import { authService } from '../../services/authService';

export default function AccountLayout() {
    const handleLogout = () => {
        authService.removeToken();
        window.location.href = '/';
    };

    return (
        <div className="account-container">
            <div className="account-header">
                <div className="account-title">
                    <User size={28} strokeWidth={2.5} />
                    <h1>My Account</h1>
                </div>
                <button className="btn-logout" onClick={handleLogout}>Log Out</button>
            </div>

            <div className="account-divider"></div>

            <nav className="account-nav-tabs">
                <NavLink
                    to="/account/orders"
                    className={({ isActive }) => isActive ? 'tab active' : 'tab'}
                >
                    My Orders
                </NavLink>
                <NavLink
                    to="/account/details"
                    className={({ isActive }) => isActive ? 'tab active' : 'tab'}
                >
                    My Details
                </NavLink>
                <NavLink
                    to="/account/reviews"
                    className={({ isActive }) => isActive ? 'tab active' : 'tab'}
                >
                    My Reviews
                </NavLink>
            </nav>

            <div className="account-content">
                <Outlet />
            </div>
        </div>
    );
}
