'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, Shield, Sparkles, PieChart, ArrowRight } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="landing-container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', gap: '80px', padding: '40px 0' }}>
            {/* Hero Section */}
            <section style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99, 102, 241, 0.1)', padding: '8px 16px', borderRadius: '99px', color: 'var(--accent-primary)', fontSize: '14px', fontWeight: '600', marginBottom: '24px' }}>
                    <Sparkles size={16} />
                    <span>Now with AI-Powered Financial Advice</span>
                </div>
                <h1 style={{ fontSize: 'clamp(32px, 8vw, 64px)', fontWeight: '800', lineHeight: '1.1', marginBottom: '24px', background: 'linear-gradient(to right, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Master Your Money with Smart Precision
                </h1>
                <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
                    The modern way to track expenses, set budgets, and receive personalized financial advice powered by artificial intelligence.
                </p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/register" className="btn-primary" style={{ padding: '16px 32px', fontSize: '18px' }}>
                        Get Started Free <ArrowRight size={20} />
                    </Link>
                    <Link href="/login" className="btn-secondary" style={{ padding: '16px 32px', fontSize: '18px' }}>
                        Welcome Back
                    </Link>
                </div>
            </section>

            {/* Features Grid */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <FeatureCard
                    icon={<TrendingUp size={32} color="var(--accent-primary)" />}
                    title="Intelligent Tracking"
                    description="Automatically categorize your spending and see exactly where your money goes every month."
                />
                <FeatureCard
                    icon={<PieChart size={32} color="var(--accent-success)" />}
                    title="Visual Budgets"
                    description="Set limits for different categories and get notified before you overspend with beautiful visual bars."
                />
                <FeatureCard
                    icon={<Sparkles size={32} color="var(--accent-warning)" />}
                    title="AI Advisor"
                    description="Get professional financial suggestions based on your personal spending habits and future goals."
                />

            </section>

            {/* Social Proof / Stats */}
            <section style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-card)', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>Simple. Powerful. Persistent.</h2>
                <p style={{ color: 'var(--text-muted)' }}>Join thousands of users managing their finances with modern technology.</p>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div style={{ padding: '32px', background: 'var(--bg-card)', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', transition: 'var(--transition)' }} className="summary-card">
        <div style={{ marginBottom: '20px' }}>{icon}</div>
        <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6' }}>{description}</p>
    </div>
);

export default LandingPage;
