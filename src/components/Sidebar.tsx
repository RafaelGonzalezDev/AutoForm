'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ScanLine, Settings2, LayoutDashboard, FileText, ShieldCheck } from 'lucide-react';

const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Escáner', href: '/scanner', icon: ScanLine },
    { label: 'Historial', href: '/history', icon: FileText },
    { label: 'Admin', href: '/admin/scanner-config', icon: ShieldCheck },
    { label: 'Ajustes', href: '/settings', icon: Settings2 },
];

interface SidebarProps {
    isMobile?: boolean;
}

export default function Sidebar({ isMobile = false }: SidebarProps) {
    const pathnameRaw = usePathname();
    const pathname = pathnameRaw ?? '';

    if (isMobile) {
        return (
            <nav style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: 70,
                background: 'rgba(26, 26, 46, 0.95)',
                backdropFilter: 'blur(16px)',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                padding: '0 10px',
                zIndex: 1000,
            }}>
                {navItems.map(item => {
                    const Icon = item.icon;
                    const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 4,
                                color: active ? 'var(--primary-light)' : 'var(--text-muted)',
                                textDecoration: 'none',
                                fontSize: '0.65rem',
                                fontWeight: active ? 600 : 400,
                                transition: 'all 0.15s ease',
                                flex: 1,
                            }}
                        >
                            <div style={{
                                padding: '6px 16px',
                                borderRadius: 16,
                                background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                                transition: 'all 0.15s ease',
                            }}>
                                <Icon size={20} />
                            </div>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        );
    }

    return (
        <aside style={{
            width: 220,
            minHeight: '100vh',
            background: 'rgba(26, 26, 46, 0.97)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            backdropFilter: 'blur(16px)',
        }}>
            {/* Logo */}
            <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
                    }}>
                        <ScanLine size={18} color="white" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', lineHeight: 1.2 }}>AutoForm</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Scanner</div>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {navItems.map(item => {
                    const Icon = item.icon;
                    const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '10px 12px',
                                borderRadius: 8,
                                fontSize: '0.875rem',
                                fontWeight: active ? 600 : 400,
                                color: active ? 'var(--primary-light)' : 'var(--text-muted)',
                                background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                                border: active ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
                                textDecoration: 'none',
                                transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={e => {
                                if (!active) {
                                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(99,102,241,0.08)';
                                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!active) {
                                    (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)';
                                }
                            }}
                        >
                            <Icon size={17} />
                            {item.label}
                            {item.href === '/scanner' && (
                                <span style={{
                                    marginLeft: 'auto', fontSize: '0.65rem', background: 'var(--primary)',
                                    color: 'white', borderRadius: 99, padding: '2px 7px', fontWeight: 600,
                                }}>AI</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>AutoForm v1.0</div>
                <div style={{ marginTop: 2 }}>Escáner Inteligente</div>
            </div>
        </aside>
    );
}
