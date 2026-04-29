import { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import { customerService } from '../../services/customerService';
import { authService } from '../../services/authService';
import axios from 'axios';

export default function MyDetails() {
    const [customer, setCustomer] = useState({ name: '', address: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [debugInfo, setDebugInfo] = useState('');

    const userDetails = authService.getUserDetails();
    const customerId = userDetails ? userDetails.id : null;

    useEffect(() => {
        if (!customerId) {
            setLoading(false);
            setError("You are not logged in.");
            setDebugInfo(`userDetails: ${JSON.stringify(userDetails)}, token exists: ${!!authService.getToken()}`);
            return;
        }
        const fetchCustomer = async () => {
            try {
                setLoading(true);
                setDebugInfo(`Fetching customer ID: "${customerId}" (type: ${typeof customerId}), baseURL: "${axios.defaults.baseURL}", token: "${authService.getToken()?.substring(0, 20)}..."`);
                const data = await customerService.getCustomer(customerId);
                setCustomer({ name: data.name || '', address: data.address || '' });
                setError(null);
                setDebugInfo('');
            } catch (err) {
                const status = err?.response?.status;
                const data = err?.response?.data;
                const url = err?.config?.url;
                const baseURL = err?.config?.baseURL;
                const authHeader = err?.config?.headers?.Authorization;
                
                setDebugInfo(
                    `STATUS: ${status || 'NO RESPONSE (network/CORS error)'}\n` +
                    `URL: ${baseURL || ''}${url || ''}\n` +
                    `Auth Header: ${authHeader || 'NONE'}\n` +
                    `Response Data: ${JSON.stringify(data)}\n` +
                    `Error Message: ${err.message}`
                );

                if (!err.response) {
                    setError('Cannot reach server. Likely a CORS issue.');
                } else if (status === 401) {
                    setError('Session expired or invalid token. Please log in again.');
                } else if (status === 403) {
                    setError('Access forbidden (403).');
                } else if (status === 404) {
                    setError('Customer not found in database (404).');
                } else {
                    setError(`Failed to load user details. (HTTP ${status})`);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCustomer();
    }, [customerId]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setCustomer(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setError(null);

        try {
            await customerService.updateCustomer(customerId, customer);
            setSuccessMessage('Details updated successfully!');
        } catch (err) {
            setError('Failed to update details. Please try again.');
        }
    };

    if (loading) return <div className="tab-pane my-details-pane">Loading details...</div>;

    return (
        <div className="tab-pane my-details-pane">
            {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
            {debugInfo && <pre style={{ background: '#ffe0e0', padding: '1rem', fontSize: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', borderRadius: '4px', marginBottom: '1rem' }}>DEBUG: {debugInfo}</pre>}
            {successMessage && <div className="success-message" style={{ color: 'green', marginBottom: '1rem' }}>{successMessage}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <Input
                        label="My Name"
                        id="name"
                        type="text"
                        value={customer.name}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="form-group" style={{ marginTop: '1.25rem' }}>
                    <Input
                        label="My Address"
                        id="address"
                        type="text"
                        value={customer.address}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}