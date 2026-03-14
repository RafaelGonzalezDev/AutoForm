'use client';

import Link from 'next/link';
import { ScanLine, UploadCloud, Camera, ShieldCheck, ArrowRight, Zap, FileText, CheckCircle } from 'lucide-react';

const stats = [
    { label: 'Documentos Procesados', value: '0', sub: 'esta sesión' },
    { label: 'Campos Extraídos', value: '0', sub: 'con OCR' },
    { label: 'Precisión Promedio', value: '—', sub: 'confianza' },
];

const features = [
    {
        icon: UploadCloud,
        title: 'Subir Imagen o PDF',
        desc: 'Arrastra tu factura o documento. Compatible con JPG, PNG, WEBP y PDF.',
        href: '/scanner',
    },
    {
        icon: Camera,
        title: 'Captura por Cámara',
        desc: 'Apunta la cámara al documento y captura en tiempo real para digitalizarlo.',
        href: '/scanner',
    },
    {
        icon: ShieldCheck,
        title: 'Configurar Campos',
        desc: 'Define qué campos extraerá el sistema. Personaliza el formulario de destino.',
        href: '/admin/scanner-config',
    },
];

export default function DashboardPage() {
    return (
        <div style={{ padding: '32px 36px', maxWidth: 1100 }}>

            {/* Header */}
            <div className="animate-fade-in" style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Zap size={22} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
                            AutoForm Scanner
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
                            Digitaliza facturas y documentos en segundos con OCR inteligente
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 36 }}>
                {stats.map(s => (
                    <div key={s.label} className="card animate-fade-in" style={{ padding: '20px 24px' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-light)', lineHeight: 1 }}>{s.value}</div>
                        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.875rem', marginTop: 4 }}>{s.label}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 2 }}>{s.sub}</div>
                    </div>
                ))}
            </div>

            {/* Quick action */}
            <Link href="/scanner" style={{ textDecoration: 'none' }}>
                <div className="animate-fade-in" style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(79,70,229,0.1))',
                    border: '1px solid rgba(99,102,241,0.4)',
                    borderRadius: 16,
                    padding: '28px 32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 36,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)')}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: 14,
                            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
                        }}>
                            <ScanLine size={26} color="white" />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>
                                Iniciar Escaneo
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 2 }}>
                                Sube un archivo o usa la cámara para digitalizar un documento
                            </div>
                        </div>
                    </div>
                    <ArrowRight size={22} style={{ color: 'var(--primary-light)', flexShrink: 0 }} />
                </div>
            </Link>

            {/* Feature cards */}
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 16, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Funcionalidades
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
                {features.map(f => {
                    const Icon = f.icon;
                    return (
                        <Link key={f.title} href={f.href} style={{ textDecoration: 'none' }}>
                            <div className="card animate-fade-in" style={{ padding: '24px', height: '100%', cursor: 'pointer' }}
                                onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card-hover)')}
                                onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card)')}
                            >
                                <div style={{
                                    width: 42, height: 42, borderRadius: 10,
                                    background: 'rgba(99,102,241,0.15)',
                                    border: '1px solid rgba(99,102,241,0.25)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: 14,
                                }}>
                                    <Icon size={20} style={{ color: 'var(--primary-light)' }} />
                                </div>
                                <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem', marginBottom: 6 }}>{f.title}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.825rem', lineHeight: 1.6 }}>{f.desc}</div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Supported info */}
            <div className="card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontWeight: 600, color: 'var(--text)', fontSize: '0.875rem' }}>
                    <CheckCircle size={16} style={{ color: 'var(--success)' }} /> Motor de OCR local
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {['Tesseract.js', 'Apache 2.0', 'Sin API externa', '100% privado', 'PDF soportado', 'Cámara en tiempo real', 'Uso comercial libre'].map(tag => (
                        <span key={tag} className="badge badge-primary">{tag}</span>
                    ))}
                </div>
                <div style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FileText size={13} />
                    Todos los datos se procesan localmente en tu navegador. Nada se envía a servidores externos.
                </div>
            </div>

        </div>
    );
}
