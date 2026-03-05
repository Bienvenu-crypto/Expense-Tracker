'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, UserPlus, ArrowRight, Sparkles } from 'lucide-react';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            if (res.ok) {
                router.push('/login');
            } else {
                const data = await res.text();
                setError(data || "Registration failed. Please try a different email.");
            }
        } catch (err) {
            setError("We couldn't reach the server. Please check your connection.");
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
            background: 'radial-gradient(circle at top left, rgba(16, 185, 129, 0.08), transparent 40%), radial-gradient(circle at bottom right, rgba(99, 102, 241, 0.05), transparent 40%), #0a0e27'
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
                    <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '200px', height: '200px', background: 'var(--accent-success)', filter: 'blur(100px)', opacity: '0.08', pointerEvents: 'none' }}></div>

                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '48px',
                            height: '48px',
                            background: 'rgba(52, 211, 153, 0.1)',
                            borderRadius: '12px',
                            marginBottom: '12px',
                            color: 'var(--accent-success)'
                        }}>
                            <UserPlus size={24} />
                        </div>
                        <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '6px', letterSpacing: '-0.02em' }}>Get Started</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Join us to master your finances</p>
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

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    name="user_full_name"
                                    autoComplete="off"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
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
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="email"
                                    name="user_email_registration"
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
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="password"
                                    name="user_password_registration"
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

                        <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '12px', borderRadius: '12px', display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                            <Sparkles size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                            <span>By signing up, you'll gain access to AI-powered financial insights.</span>
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
                                opacity: isLoading ? 0.7 : 1,
                                background: 'var(--accent-success)',
                                border: 'none'
                            }}
                        >
                            {isLoading ? (
                                <div className="spinner" style={{ width: '20px', height: '20px', borderTopColor: 'white' }}></div>
                            ) : (
                                <>Create Account <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
                        Already have an account?{' '}
                        <Link href="/login" style={{ color: 'var(--accent-success)', fontWeight: '700', textDecoration: 'none' }}>
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
