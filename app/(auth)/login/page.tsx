'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError("The email or password you entered is incorrect. Please try again.");
            } else {
                // Hard navigation ensures the session cookie is read fresh by the
                // server, so the user lands directly on the Dashboard view.
                window.location.href = '/';
            }
        } catch (err) {
            setError("Something went wrong on our end. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            overflowY: 'auto',
            background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.08), transparent 40%), radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.05), transparent 40%), #0a0e27'
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: '100%',
                padding: '40px 20px',
                width: '100%'
            }}>
                <div className="auth-card" style={{
                    margin: 'auto',
                    width: '100%',
                    maxWidth: '400px',
                    background: 'var(--bg-card)',
                    backdropFilter: 'blur(100px)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '24px',
                    padding: '32px',
                    boxShadow: 'var(--shadow-xl)',
                    position: 'relative'
                }}>
                    {/* Decorative Elements */}
                    <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '200px', height: '200px', background: 'var(--accent-primary)', filter: 'blur(100px)', opacity: '0.1', pointerEvents: 'none' }}></div>

                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '48px',
                            height: '48px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            borderRadius: '12px',
                            marginBottom: '12px',
                            color: 'var(--accent-primary)'
                        }}>
                            <ShieldCheck size={24} />
                        </div>
                        <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '6px', letterSpacing: '-0.02em' }}>Welcome Back</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Sign in to continue your journey</p>
                    </div>

                    {error && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#f87171',
                            padding: '16px',
                            borderRadius: '16px',
                            marginBottom: '24px',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <span style={{ fontSize: '20px' }}>⚠️</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {/* Dummy hidden inputs to trap aggressive browser autofill */}
                        <div style={{ display: 'none', position: 'absolute' }} aria-hidden="true">
                            <input type="email" name="trap_email" tabIndex={-1} autoComplete="off" />
                            <input type="password" name="trap_password" tabIndex={-1} autoComplete="new-password" />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="email"
                                    name="login_email"
                                    autoComplete="off"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{
                                        width: '100%',
                                        background: 'var(--bg-tertiary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '14px',
                                        padding: '14px 16px 14px 48px',
                                        fontSize: '16px',
                                        color: 'white',
                                        transition: 'all 0.2s'
                                    }}
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Password</label>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="password"
                                    name="login_password_no_autofill"
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{
                                        width: '100%',
                                        background: 'var(--bg-tertiary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '14px',
                                        padding: '14px 16px 14px 48px',
                                        fontSize: '16px',
                                        color: 'white',
                                        transition: 'all 0.2s'
                                    }}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary"
                            style={{
                                padding: '14px',
                                fontSize: '15px',
                                fontWeight: '700',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.7 : 1
                            }}
                        >
                            {isLoading ? (
                                <div className="spinner" style={{ width: '20px', height: '20px', borderTopColor: 'white' }}></div>
                            ) : (
                                <>Sign In <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
                        New to Expense Tracker?{' '}
                        <Link href="/register" style={{ color: 'var(--accent-primary)', fontWeight: '700', textDecoration: 'none' }}>
                            Create an account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
