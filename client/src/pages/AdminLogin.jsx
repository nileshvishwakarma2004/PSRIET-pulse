import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isPortalAdmin, useAuth } from '../context/AuthContext';
import './style/AdminLogin.css';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { signInWithPassword, signOut } = useAuth();

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            const authResult = await signInWithPassword({ email, password });
            const authError = authResult?.error ?? authResult?.data?.error;

            if (authError) throw authError;

            const authenticatedUser = authResult?.user
                ?? authResult?.data?.user
                ?? authResult?.session?.user
                ?? authResult?.data?.session?.user;

            if (!authenticatedUser) {
                throw new Error('Sign-in succeeded, but Supabase did not return a user.');
            }

            if (!isPortalAdmin(authenticatedUser)) {
                await signOut();
                setError('This account is not authorized for administrator access.');
                return;
            }

            navigate('/admin/dashboard', { replace: true });
        } catch (authError) {
            console.error('Unable to sign in administrator.', authError);
            setError(authError.message || 'Unable to sign in. Check your credentials and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="admin-login-body">
            <div className="container">
                <div className="login-box">
                    <form onSubmit={handleAdminLogin} autoComplete="on">
                        <h2>Admin Login</h2>

                        <div className="input-box" style={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="username"
                                name="email"
                                required
                            />
                            <label className={email ? 'active' : ''}>Administrator email</label>
                        </div>
                        <div className="input-box" style={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                name="password"
                                required
                            />
                            <span
                                className="icon"
                                role="button"
                                tabIndex={0}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                aria-pressed={showPassword}
                                style={{ cursor: 'pointer' }}
                                onClick={() => setShowPassword((visible) => !visible)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setShowPassword((visible) => !visible);
                                    }
                                }}
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    {showPassword ? (
                                        <>
                                            <path d="M3 3l18 18" />
                                            <path d="M10.58 10.58a2 2 0 002.83 2.83" />
                                            <path d="M9.88 5.09A10.94 10.94 0 0112 4.5c5 0 8.27 4.11 9.5 7.5a11.8 11.8 0 01-3.05 4.57" />
                                            <path d="M6.61 6.61A12.12 12.12 0 002.5 12c1.23 3.39 4.5 7.5 9.5 7.5a10.9 10.9 0 004.15-.82" />
                                        </>
                                    ) : (
                                        <>
                                            <path d="M2.5 12s3.27-7.5 9.5-7.5 9.5 7.5 9.5 7.5-3.27 7.5-9.5 7.5S2.5 12 2.5 12z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </>
                                    )}
                                </svg>
                            </span>
                            <label className={password ? 'active' : ''}>Password</label>
                        </div>

                        {error && <p style={{ color: '#ff4d4d', fontSize: '0.85em', marginBottom: '10px', textAlign: 'center' }}>{error}</p>}

                        <div className="remember-forgot">
                            <span>Sign in with your Supabase administrator account.</span>
                        </div>

                        <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Signing in...' : 'Login'}</button>

                        <div className="register-link">
                            <p><a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>← Back to Home</a></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}