'use client';

import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function HistoryPage() {
    return (
        <div style={{ padding: '32px 36px', maxWidth: 900 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <FileText size={20} color="white" />
                </div>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>Historial</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 3 }}>Documentos procesados previamente</p>
                </div>
            </div>

            {/* Empty state */}
            <div className="card" style={{ padding: '64px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
                <Clock size={52} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                <div style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '1rem' }}>Historial vacío</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: 340, lineHeight: 1.6 }}>
                    El historial de documentos procesados aparecerá aquí una vez que el backend esté conectado.
                    Por ahora los datos se procesan en sesión.
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    <span className="badge badge-primary"><CheckCircle size={9} /> Listo para backend</span>
                    <span className="badge badge-warning"><AlertCircle size={9} /> Próximamente</span>
                </div>
            </div>
        </div>
    );
}
