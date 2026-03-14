'use client';

import { useState } from 'react';
import { useScanner, FormField, FieldType } from '@/context/ScannerContext';
import { useToast } from '@/context/ToastContext';
import {
    Plus, Trash2, GripVertical, ChevronDown, Save, RotateCcw,
    ShieldCheck, Tag, Type, Hash, Calendar, DollarSign, List, Mail, Info,
} from 'lucide-react';

const FIELD_TYPE_OPTIONS: { value: FieldType; label: string; icon: typeof Type }[] = [
    { value: 'text', label: 'Texto', icon: Type },
    { value: 'number', label: 'Número', icon: Hash },
    { value: 'date', label: 'Fecha', icon: Calendar },
    { value: 'currency', label: 'Moneda', icon: DollarSign },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'select', label: 'Lista', icon: List },
];

function FieldTypeIcon({ type }: { type: FieldType }) {
    const found = FIELD_TYPE_OPTIONS.find(o => o.value === type);
    const Icon = found?.icon ?? Type;
    return <Icon size={13} />;
}

interface FieldEditorRowProps {
    field: FormField;
    index: number;
    total: number;
    onUpdate: (data: Partial<FormField>) => void;
    onRemove: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
}

function FieldEditorRow({ field, index, total, onUpdate, onRemove, onMoveUp, onMoveDown }: FieldEditorRowProps) {
    const [expanded, setExpanded] = useState(false);

    // Keywords as a comma-separated string
    const keywordsStr = field.keywords.join(', ');

    // Select options as newline-separated
    const optionsStr = (field.options ?? []).join('\n');

    return (
        <div className="card animate-fade-in" style={{ overflow: 'hidden' }}>
            {/* Header row */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px', cursor: 'pointer',
                borderBottom: expanded ? '1px solid var(--border)' : 'none',
            }}
                onClick={() => setExpanded(p => !p)}
            >
                {/* Drag handle (decorative) */}
                <div style={{ cursor: 'grab', color: 'var(--text-muted)', flexShrink: 0, display: 'flex', gap: 2 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {[0, 1, 2].map(i => <div key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-muted)' }} />)}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {[0, 1, 2].map(i => <div key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-muted)' }} />)}
                    </div>
                </div>

                {/* Index */}
                <span style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary-light)', flexShrink: 0,
                }}>{index + 1}</span>

                {/* Type icon + label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1 }}>
                    <span style={{ color: 'var(--text-muted)' }}><FieldTypeIcon type={field.type} /></span>
                    <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem' }}>{field.label || 'Sin nombre'}</span>
                    {field.required && <span style={{ fontSize: '0.65rem', color: 'var(--danger)', fontWeight: 700, letterSpacing: '0.05em' }}>REQUERIDO</span>}
                </div>

                {/* Keywords preview */}
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {field.keywords.length > 0 ? field.keywords.slice(0, 3).join(', ') + (field.keywords.length > 3 ? '...' : '') : 'Sin keywords'}
                </span>

                {/* Chevron */}
                <ChevronDown size={15} style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none', flexShrink: 0 }} />
            </div>

            {/* Expanded editor */}
            {expanded && (
                <div style={{ padding: '20px 20px 16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        {/* Label */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Nombre del campo *</label>
                            <input
                                className="input-field"
                                value={field.label}
                                onChange={e => onUpdate({ label: e.target.value })}
                                placeholder="Ej: Total de Factura"
                                onClick={e => e.stopPropagation()}
                            />
                        </div>

                        {/* Type */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Tipo de campo</label>
                            <div style={{ position: 'relative' }}>
                                <select
                                    className="input-field"
                                    value={field.type}
                                    onChange={e => onUpdate({ type: e.target.value as FieldType })}
                                    onClick={e => e.stopPropagation()}
                                    style={{ appearance: 'none', paddingRight: '2rem', cursor: 'pointer', colorScheme: 'dark' }}
                                >
                                    {FIELD_TYPE_OPTIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                            </div>
                        </div>

                        {/* Placeholder */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Valor de ejemplo (placeholder)</label>
                            <input
                                className="input-field"
                                value={field.placeholder ?? ''}
                                onChange={e => onUpdate({ placeholder: e.target.value })}
                                placeholder="Ej: 0.00"
                                onClick={e => e.stopPropagation()}
                            />
                        </div>

                        {/* Required toggle */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Campo requerido</label>
                            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                {[{ v: true, l: 'Sí' }, { v: false, l: 'No' }].map(opt => (
                                    <button
                                        key={String(opt.v)}
                                        type="button"
                                        onClick={e => { e.stopPropagation(); onUpdate({ required: opt.v }); }}
                                        style={{
                                            padding: '6px 18px', borderRadius: 6, border: '1px solid',
                                            borderColor: field.required === opt.v ? 'var(--primary)' : 'var(--border)',
                                            background: field.required === opt.v ? 'rgba(99,102,241,0.15)' : 'transparent',
                                            color: field.required === opt.v ? 'var(--primary-light)' : 'var(--text-muted)',
                                            fontWeight: field.required === opt.v ? 700 : 400,
                                            fontSize: '0.8rem', cursor: 'pointer',
                                        }}
                                    >{opt.l}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Keywords */}
                    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                <Tag size={11} style={{ display: 'inline', marginRight: 4 }} />
                                Palabras clave (separadas por coma)
                            </label>
                        </div>
                        <textarea
                            className="input-field"
                            value={keywordsStr}
                            onChange={e => onUpdate({ keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) })}
                            placeholder="total, monto total, grand total, importe..."
                            onClick={e => e.stopPropagation()}
                            rows={2}
                            style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.8rem' }}
                        />
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Info size={10} />
                            El OCR buscará estas palabras en el documento para asignar el valor a este campo.
                        </div>
                    </div>

                    {/* Select options */}
                    {field.type === 'select' && (
                        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Opciones del select (una por línea)</label>
                            <textarea
                                className="input-field"
                                value={optionsStr}
                                onChange={e => onUpdate({ options: e.target.value.split('\n').map(o => o.trim()).filter(Boolean) })}
                                placeholder={"HNL\nUSD\nEUR"}
                                onClick={e => e.stopPropagation()}
                                rows={4}
                                style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.8rem' }}
                            />
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                        <button type="button" className="btn-ghost" disabled={index === 0} onClick={e => { e.stopPropagation(); onMoveUp(); }} style={{ padding: '6px 10px', fontSize: '0.75rem' }}>▲</button>
                        <button type="button" className="btn-ghost" disabled={index === total - 1} onClick={e => { e.stopPropagation(); onMoveDown(); }} style={{ padding: '6px 10px', fontSize: '0.75rem' }}>▼</button>
                        <button
                            type="button"
                            onClick={e => { e.stopPropagation(); onRemove(); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '6px 12px', borderRadius: 6,
                                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                                color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                            }}
                        >
                            <Trash2 size={12} /> Eliminar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AdminScannerConfigPage() {
    const { fields, addField, updateField, removeField, reorderFields, resetToDefaults } = useScanner();
    const { toast } = useToast();

    const handleSave = () => {
        // Fields are already persisted on every change via ScannerContext
        toast('Configuración guardada correctamente en el almacenamiento local.', 'success');
    };

    return (
        <div style={{ padding: '32px 36px', maxWidth: 840 }}>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <ShieldCheck size={20} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>Configuración de Campos</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 3 }}>
                            Define qué datos extraerá el escáner de cada documento
                        </p>
                    </div>
                </div>

                {/* Info card */}
                <div style={{
                    padding: '12px 16px', borderRadius: 10, marginTop: 14,
                    background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                    fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: 8,
                }}>
                    <Info size={14} style={{ color: 'var(--primary-light)', flexShrink: 0, marginTop: 1 }} />
                    <span>
                        Cada campo define qué buscará el OCR en el documento. Las <strong style={{ color: 'var(--text)' }}>palabras clave</strong> son los términos que el motor intentará encontrar en el texto extraído para asignar el valor correspondiente a ese campo.
                    </span>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: '8px 16px', fontSize: '0.8rem', color: 'var(--primary-light)' }}>
                    <strong>{fields.length}</strong> campos configurados
                </div>
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px 16px', fontSize: '0.8rem', color: 'var(--danger)' }}>
                    <strong>{fields.filter(f => f.required).length}</strong> requeridos
                </div>
                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '8px 16px', fontSize: '0.8rem', color: 'var(--success)' }}>
                    <strong>{fields.reduce((acc, f) => acc + f.keywords.length, 0)}</strong> keywords totales
                </div>
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-primary" onClick={() => addField()}>
                        <Plus size={14} /> Agregar Campo
                    </button>
                    <button className="btn-ghost" onClick={() => { resetToDefaults(); toast('Restablecido a campos predeterminados de factura.', 'info'); }}>
                        <RotateCcw size={14} /> Restaurar Defaults
                    </button>
                </div>
                <button className="btn-ghost" onClick={handleSave} style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>
                    <Save size={14} /> Guardar
                </button>
            </div>

            {/* Field list */}
            {fields.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <List size={44} style={{ opacity: 0.3 }} />
                    <div style={{ fontWeight: 600 }}>No hay campos configurados</div>
                    <div style={{ fontSize: '0.85rem' }}>Agrega campos o restaura los predeterminados para empezar.</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-primary" onClick={() => addField()}><Plus size={13} /> Agregar</button>
                        <button className="btn-ghost" onClick={() => { resetToDefaults(); toast('Campos predeterminados cargados.', 'info'); }}><RotateCcw size={13} /> Defaults</button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {fields.map((field, i) => (
                        <FieldEditorRow
                            key={field.id}
                            field={field}
                            index={i}
                            total={fields.length}
                            onUpdate={(data) => updateField(field.id, data)}
                            onRemove={() => { removeField(field.id); toast(`Campo "${field.label}" eliminado.`, 'warning'); }}
                            onMoveUp={() => reorderFields(i, i - 1)}
                            onMoveDown={() => reorderFields(i, i + 1)}
                        />
                    ))}
                </div>
            )}

            {/* Bottom save */}
            {fields.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                    <button className="btn-primary" onClick={handleSave}>
                        <Save size={14} /> Guardar Configuración
                    </button>
                </div>
            )}
        </div>
    );
}
