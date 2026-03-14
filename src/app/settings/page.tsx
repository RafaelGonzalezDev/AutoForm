'use client';

import { Settings2 } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div style={{ padding: '32px 36px', maxWidth: 700 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Settings2 size={20} color="white" />
                </div>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>Ajustes</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 3 }}>Configuración general del sistema</p>
                </div>
            </div>

            <div className="card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                    { label: 'Idioma OCR', value: 'Español + Inglés (spa+eng)', note: 'Tesseract.js multi-idioma' },
                    { label: 'Almacenamiento de schema', value: 'localStorage (navegador)', note: 'Se conectará a API backend' },
                    { label: 'Motor de extracción', value: 'Tesseract.js v5 (local)', note: 'Apache 2.0 — sin costo' },
                    { label: 'Versión', value: 'AutoForm v1.0.0', note: 'Escáner inteligente' },
                ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                        <div>
                            <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.875rem' }}>{item.label}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 2 }}>{item.note}</div>
                        </div>
                        <div style={{ color: 'var(--primary-light)', fontSize: '0.85rem', fontWeight: 500, textAlign: 'right' }}>{item.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
