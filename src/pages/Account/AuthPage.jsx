import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { authService } from '../../services/authService';
import './AuthPage.css';

const MODE = {
	LOGIN: 'login',
	REGISTER: 'register',
};

const getAuthErrorMessage = (error) => {
	if (!error.response) {
		return 'Cannot reach server. Make sure backend is running on port 8080.';
	}

	const { status, data } = error.response;

	if (status === 404) {
		return 'Email/password auth endpoint is not available yet. Use Continue with Google.';
	}
	if (status === 401) {
		return 'Invalid email or password.';
	}
	if (status === 409) {
		return 'This email is already registered. Please log in.';
	}
	if (status >= 500) {
		return 'Server error during authentication. Please try again.';
	}
	if (data?.message) return data.message;
	if (typeof data === 'string' && data.trim()) return data;

	return 'Unable to process request. Please try again.';
};

export default function AuthPage() {
	const navigate = useNavigate();
	const [mode, setMode] = useState(MODE.LOGIN);
	const [submitting, setSubmitting] = useState(false);
	const [message, setMessage] = useState('');
	const [form, setForm] = useState({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
	});

	const title = useMemo(() => (mode === MODE.LOGIN ? 'Login' : 'Register'), [mode]);

	const handleChange = (field) => (event) => {
		setForm((prev) => ({ ...prev, [field]: event.target.value }));
		if (message) setMessage('');
	};

	const startGoogleAuth = () => {
		const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
		window.location.href = `${apiUrl}/oauth2/authorization/google`;
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (!form.email || !form.password) {
			setMessage('Please fill in your email and password.');
			return;
		}

		if (mode === MODE.REGISTER) {
			if (!form.name.trim()) {
				setMessage('Please enter your name.');
				return;
			}
			if (form.password !== form.confirmPassword) {
				setMessage('Passwords do not match.');
				return;
			}
		}

		setSubmitting(true);
		setMessage('');

		try {
			if (mode === MODE.LOGIN) {
				const response = await axios.post('/api/auth/login', {
					email: form.email,
					password: form.password,
				});

				const token = response?.data?.token;
				if (!token) {
					setMessage('Login succeeded but no token was returned.');
					return;
				}

				authService.setToken(token);
				authService.setupAxiosInterceptors();
				const user = authService.getUserDetails();
				navigate(user?.role === 'ADMIN' ? '/admin' : '/account');
				return;
			}

			const registerResponse = await axios.post('/api/auth/register', {
				name: form.name,
				email: form.email,
				password: form.password,
			});

			const registerToken = registerResponse?.data?.token;
			if (registerToken) {
				authService.setToken(registerToken);
				authService.setupAxiosInterceptors();
				navigate('/account');
				return;
			}

			setMode(MODE.LOGIN);
			setMessage('Registration complete. Please log in now.');
			setForm((prev) => ({ ...prev, password: '', confirmPassword: '' }));
		} catch (error) {
			setMessage(getAuthErrorMessage(error));
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<section className="auth-simple-page">
			<div className="auth-simple-card">
				<div className="auth-simple-tabs">
					<button
						type="button"
						className={mode === MODE.LOGIN ? 'active' : ''}
						onClick={() => setMode(MODE.LOGIN)}
					>
						Login
					</button>
					<button
						type="button"
						className={mode === MODE.REGISTER ? 'active' : ''}
						onClick={() => setMode(MODE.REGISTER)}
					>
						Register
					</button>
				</div>

				<h1>{title}</h1>
				<p className="auth-simple-subtitle">
					{mode === MODE.LOGIN
						? 'Sign in to continue shopping with INKA.'
						: 'Create your account and start shopping with INKA.'}
				</p>

				<form className="auth-simple-form" onSubmit={handleSubmit}>
					{mode === MODE.REGISTER && (
						<label>
							Name
							<input
								type="text"
								value={form.name}
								onChange={handleChange('name')}
								placeholder="Enter your name"
								required
							/>
						</label>
					)}

					<label>
						Email
						<input
							type="email"
							value={form.email}
							onChange={handleChange('email')}
							placeholder="you@example.com"
							required
						/>
					</label>

					<label>
						Password
						<input
							type="password"
							value={form.password}
							onChange={handleChange('password')}
							placeholder="Enter your password"
							required
						/>
					</label>

					{mode === MODE.REGISTER && (
						<label>
							Confirm Password
							<input
								type="password"
								value={form.confirmPassword}
								onChange={handleChange('confirmPassword')}
								placeholder="Confirm password"
								required
							/>
						</label>
					)}

					{message && <p className="auth-simple-message">{message}</p>}

					<button type="submit" className="auth-simple-primary" disabled={submitting}>
						{submitting ? 'Please wait...' : mode === MODE.LOGIN ? 'Login' : 'Register'}
					</button>
				</form>

				<div className="auth-simple-divider">
					<span>or</span>
				</div>

				<button type="button" className="auth-simple-google" onClick={startGoogleAuth}>
					Continue with Google
				</button>
			</div>
		</section>
	);
}
