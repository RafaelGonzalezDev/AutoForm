'use client';

import { useToast } from '@/context/ToastContext';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const colors = {
    success: { border: 'var(--success)', bg: 'rgba(16,185,129,0.12)', icon: 'var(--success)' },
    error: { border: 'var(--danger)', bg: 'rgba(239,68,68,0.12)', icon: 'var(--danger)' },
    warning: { border: 'var(--warning)', bg: 'rgba(245,158,11,0.12)', icon: 'var(--warning)' },
    info: { border: 'var(--primary)', bg: 'rgba(99,102,241,0.12)', icon: 'var(--primary)' },
};

export default function ToastStack() {
    const { toasts, dismiss } = useToast();

    if (!toasts.length) return null;

    return (
        <div style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
            display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 380,
        }}>
            {toasts.map(t => {
                const Icon = icons[t.type];
                const c = colors[t.type];
                return (
                    <div key={t.id} className="animate-fade-in" style={{
                        background: c.bg,
                        border: `1px solid ${c.border}`,
                        borderLeft: `4px solid ${c.border}`,
                        borderRadius: 10,
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        backdropFilter: 'blur(12px)',
                    }}>
                        <Icon size={18} style={{ color: c.icon, flexShrink: 0, marginTop: 1 }} />
                        <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.5 }}>{t.message}</span>
                        <button onClick={() => dismiss(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <X size={14} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
