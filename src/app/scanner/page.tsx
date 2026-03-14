'use client';

import { useScanner } from '@/context/ScannerContext';
import ScannerUpload from '@/components/ScannerUpload';
import ScannerCamera from '@/components/ScannerCamera';
import ScannedFormEditor from '@/components/ScannedFormEditor';
import { UploadCloud, Camera, ClipboardList, ScanLine, Info } from 'lucide-react';

const TABS = [
    { id: 'upload', label: 'Subir Archivo', icon: UploadCloud },
    { id: 'camera', label: 'Cámara', icon: Camera },
    { id: 'form', label: 'Formulario', icon: ClipboardList },
] as const;

export default function ScannerPage() {
    const { activeTab, setActiveTab, scanStatus, fields } = useScanner();

    const goToForm = () => setActiveTab('form');

    return (
        <div style={{ maxWidth: 900, margin: '0 auto' }} className="p-mobile-sm">
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <ScanLine size={20} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>Escáner de Documentos</h1>
                        <p className="hide-on-mobile" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 3 }}>
                            Digitaliza facturas y documentos con OCR inteligente
                        </p>
                    </div>
                </div>

                {/* No fields warning */}
                {fields.length === 0 && (
                    <div style={{
                        display: 'flex', gap: 10, alignItems: 'center',
                        padding: '10px 14px', borderRadius: 10,
                        background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                        marginTop: 12,
                    }}>
                        <Info size={16} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            No hay campos configurados. <a href="/admin/scanner-config" style={{ color: 'var(--primary-light)', textDecoration: 'none', fontWeight: 600 }}>Ir a Configuración</a>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex', gap: 4, padding: 4,
                background: 'rgba(26,26,46,0.8)',
                borderRadius: 12, border: '1px solid var(--border)',
                marginBottom: 24,
                overflowX: 'auto',
            }}>
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    const isDone = tab.id === 'form' && scanStatus === 'done';
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                padding: '10px 12px',
                                borderRadius: 9,
                                border: 'none',
                                background: isActive
                                    ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))'
                                    : 'transparent',
                                color: isActive ? 'white' : isDone ? 'var(--success)' : 'var(--text-muted)',
                                fontWeight: isActive ? 700 : 500,
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                whiteSpace: 'nowrap',
                                minWidth: 'fit-content',
                            }}
                        >
                            <Icon size={14} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab content */}
            <div className="card" style={{ padding: 'min(28px, 5vw)' }}>
                {activeTab === 'upload' && <ScannerUpload onDone={goToForm} />}
                {activeTab === 'camera' && <ScannerCamera onDone={goToForm} />}
                {activeTab === 'form' && (
                    scanStatus === 'idle' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '32px 0', textAlign: 'center' }}>
                            <ClipboardList size={44} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                            <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Aún no hay datos extraídos</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 320 }}>
                                Primero sube un archivo o captura con la cámara para que el OCR extraiga los campos.
                            </div>
                            <button className="btn-ghost" onClick={() => setActiveTab('upload')}>
                                <UploadCloud size={14} /> Ir a Subir Archivo
                            </button>
                        </div>
                    ) : (
                        <ScannedFormEditor />
                    )
                )}
            </div>
        </div>
    );
}
