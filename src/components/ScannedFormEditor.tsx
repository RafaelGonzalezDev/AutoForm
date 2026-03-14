'use client';

import { useState } from 'react';
import { useScanner, FormField, FieldType } from '@/context/ScannerContext';
import { useToast } from '@/context/ToastContext';
import { Send, RotateCcw, ChevronDown, AlertCircle, CheckCircle, Minus, Eye, EyeOff } from 'lucide-react';

function ConfidenceBadge({ confidence }: { confidence: number }) {
    if (confidence === 0) return (
        <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>
            <Minus size={9} /> Sin datos
        </span>
    );
    if (confidence >= 80) return (
        <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
            <CheckCircle size={9} /> Alta ({confidence}%)
        </span>
    );
    if (confidence >= 50) return (
        <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
            <AlertCircle size={9} /> Media ({confidence}%)
        </span>
    );
    return (
        <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>
            <AlertCircle size={9} /> Baja ({confidence}%)
        </span>
    );
}

function FieldBorderColor(confidence: number): string {
    if (confidence === 0) return 'var(--border)';
    if (confidence >= 80) return 'rgba(16,185,129,0.4)';
    if (confidence >= 50) return 'rgba(245,158,11,0.4)';
    return 'rgba(239,68,68,0.4)';
}

function renderInput(field: FormField, value: string, onChange: (v: string) => void, confidence: number) {
    const borderColor = FieldBorderColor(confidence);
    const baseStyle = {
        background: 'rgba(15,15,26,0.8)',
        border: `1px solid ${borderColor}`,
        borderRadius: 8,
        color: 'var(--text)',
        padding: '0.625rem 0.875rem',
        fontSize: '0.875rem',
        width: '100%',
        outline: 'none',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        fontFamily: 'inherit',
    };

    if (field.type === 'select' && field.options?.length) {
        return (
            <div style={{ position: 'relative' }}>
                <select
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    style={{ ...baseStyle, appearance: 'none', paddingRight: '2.5rem', cursor: 'pointer' }}
                >
                    <option value="">-- Seleccionar --</option>
                    {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            </div>
        );
    }

    if (field.type === 'date') {
        return (
            <input
                type="date"
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{ ...baseStyle, colorScheme: 'dark' }}
            />
        );
    }

    if (field.type === 'currency' || field.type === 'number') {
        return (
            <div style={{ position: 'relative' }}>
                {field.type === 'currency' && (
                    <span style={{
                        position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                        color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600,
                    }}>L</span>
                )}
                <input
                    type="number"
                    step="0.01"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={field.placeholder ?? '0.00'}
                    style={{ ...baseStyle, paddingLeft: field.type === 'currency' ? '1.75rem' : '0.875rem' }}
                />
            </div>
        );
    }

    if (field.type === 'email') {
        return <input type="email" value={value} onChange={e => onChange(e.target.value)} placeholder={field.placeholder} style={baseStyle} />;
    }

    return <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={field.placeholder} style={baseStyle} />;
}

interface ScannedFormEditorProps {
    onSubmit?: (data: Record<string, string>) => void;
}

export default function ScannedFormEditor({ onSubmit }: ScannedFormEditorProps) {
    const { fields, scannedData, updateScannedValue, rawOcrText, clearScan } = useScanner();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showRaw, setShowRaw] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        const missing = fields.filter(f => f.required && !scannedData[f.id]?.value?.trim());
        if (missing.length > 0) {
            toast(`Campos requeridos vacíos: ${missing.map(f => f.label).join(', ')}`, 'error');
            return;
        }

        setIsSubmitting(true);

        // Build payload
        const payload: Record<string, string> = {};
        for (const field of fields) {
            payload[field.id] = scannedData[field.id]?.value ?? '';
        }

        // Placeholder: log + callback
        console.log('[AutoForm] Payload to submit:', payload);

        // Simulate API call
        await new Promise(r => setTimeout(r, 900));

        setIsSubmitting(false);

        if (onSubmit) {
            onSubmit(payload);
        } else {
            toast('Formulario enviado exitosamente. (Simulado — la API no está conectada aún)', 'success');
        }
    };

    const totalFields = fields.length;
    const filledFields = fields.filter(f => (scannedData[f.id]?.value ?? '').trim().length > 0).length;
    const avgConfidence = fields.length > 0
        ? Math.round(fields.reduce((acc, f) => acc + (scannedData[f.id]?.confidence ?? 0), 0) / fields.length)
        : 0;

    return (
        <div>
            {/* Summary bar */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px',
                background: 'rgba(99,102,241,0.08)', borderRadius: 10,
                border: '1px solid rgba(99,102,241,0.2)',
                marginBottom: 24, flexWrap: 'wrap',
            }}>
                <div style={{ display: 'flex', gap: 20, flex: 1, flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-light)' }}>{filledFields}/{totalFields}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Campos llenados</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: avgConfidence >= 70 ? 'var(--success)' : 'var(--warning)' }}>{avgConfidence}%</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Confianza promedio</div>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setShowRaw(p => !p)}
                    className="btn-ghost"
                    style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                >
                    {showRaw ? <EyeOff size={13} /> : <Eye size={13} />}
                    {showRaw ? 'Ocultar OCR' : 'Ver texto OCR'}
                </button>
            </div>

            {/* Raw OCR text */}
            {showRaw && rawOcrText && (
                <div style={{
                    background: 'rgba(0,0,0,0.4)', borderRadius: 10,
                    border: '1px solid var(--border)',
                    padding: 16, marginBottom: 24,
                    maxHeight: 200, overflow: 'auto',
                }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--primary-light)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Texto extraído por OCR</div>
                    <pre style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', fontFamily: 'monospace', lineHeight: 1.6, margin: 0 }}>
                        {rawOcrText}
                    </pre>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: 18,
                    marginBottom: 28,
                }}>
                    {fields.map(field => {
                        const entry = scannedData[field.id];
                        const confidence = entry?.confidence ?? 0;
                        const value = entry?.value ?? '';

                        return (
                            <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>
                                        {field.label}
                                        {field.required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}
                                    </label>
                                    <ConfidenceBadge confidence={confidence} />
                                </div>
                                {renderInput(field, value, (v) => updateScannedValue(field.id, v), confidence)}
                            </div>
                        );
                    })}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                    <button
                        type="button"
                        className="btn-ghost"
                        onClick={clearScan}
                    >
                        <RotateCcw size={15} /> Nuevo Escaneo
                    </button>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={isSubmitting}
                        style={{ minWidth: 140 }}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="animate-spin-slow" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Send size={15} /> Enviar a API
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
