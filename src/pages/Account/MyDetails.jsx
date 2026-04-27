import { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import { customerService } from '../../services/customerService';
import { authService } from '../../services/authService';

export default function MyDetails() {
    const [customer, setCustomer] = useState({ name: '', address: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const userDetails = authService.getUserDetails();
    const customerId = userDetails ? userDetails.id : null;

    useEffect(() => {
        if (!customerId) {
            setLoading(false);
            setError("You are not logged in.");
            return;
        }
        const fetchCustomer = async () => {
            try {
                setLoading(true);
                const data = await customerService.getCustomer(customerId);
                setCustomer({ name: data.name || '', address: data.address || '' });
                setError(null);
            } catch (err) {
                setError('Failed to load user details.');
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