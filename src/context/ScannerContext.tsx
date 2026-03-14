'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FieldType = 'text' | 'number' | 'date' | 'currency' | 'email' | 'select';

export interface FormField {
    id: string;
    label: string;
    type: FieldType;
    keywords: string[];      // palabras clave para buscar en el texto OCR
    required: boolean;
    options?: string[];       // solo para type === 'select'
    placeholder?: string;
}

export interface ScannedValue {
    value: string;
    confidence: number; // 0-100
}

export type ScannedData = Record<string, ScannedValue>;

export type ScanStatus = 'idle' | 'processing' | 'done' | 'error';
export type ScanTab = 'upload' | 'camera' | 'form';

interface ScannerContextType {
    // Schema management
    fields: FormField[];
    addField: (field?: Partial<FormField>) => void;
    updateField: (id: string, data: Partial<FormField>) => void;
    removeField: (id: string) => void;
    reorderFields: (from: number, to: number) => void;
    resetToDefaults: () => void;

    // Scan flow
    scanStatus: ScanStatus;
    setScanStatus: (s: ScanStatus) => void;
    activeTab: ScanTab;
    setActiveTab: (t: ScanTab) => void;

    // Extracted data
    scannedData: ScannedData;
    setScannedData: (d: ScannedData) => void;
    updateScannedValue: (fieldId: string, value: string) => void;
    rawOcrText: string;
    setRawOcrText: (t: string) => void;
    clearScan: () => void;
}

// ─── Default field schema ─────────────────────────────────────────────────────

const DEFAULT_FIELDS: FormField[] = [
    {
        id: 'supplier',
        label: 'Proveedor',
        type: 'text',
        keywords: ['proveedor', 'emisor', 'empresa', 'razón social', 'nombre', 'from', 'vendor', 'supplier'],
        required: true,
        placeholder: 'Nombre del proveedor',
    },
    {
        id: 'invoice_number',
        label: 'N° de Factura',
        type: 'text',
        keywords: ['factura', 'invoice', 'número', 'no.', 'n°', '#', 'folio', 'serie', 'ref'],
        required: true,
        placeholder: 'F-0001',
    },
    {
        id: 'invoice_date',
        label: 'Fecha de Factura',
        type: 'date',
        keywords: ['fecha', 'date', 'emitida', 'expedicion', 'issued', 'emisión'],
        required: true,
        placeholder: '',
    },
    {
        id: 'rtn',
        label: 'RTN / ID Fiscal',
        type: 'text',
        keywords: ['rtn', 'nit', 'ruc', 'rfc', 'tin', 'cif', 'fiscal', 'tax id', 'identificación fiscal'],
        required: false,
        placeholder: '08011999000000',
    },
    {
        id: 'subtotal',
        label: 'Subtotal',
        type: 'currency',
        keywords: ['subtotal', 'sub total', 'neto', 'base imponible', 'antes de impuesto'],
        required: false,
        placeholder: '0.00',
    },
    {
        id: 'tax',
        label: 'Impuesto / ISV',
        type: 'currency',
        keywords: ['isv', 'iva', 'impuesto', 'tax', 'igv', 'vat', 'gst'],
        required: false,
        placeholder: '0.00',
    },
    {
        id: 'total',
        label: 'Total',
        type: 'currency',
        keywords: ['total', 'importe total', 'amount due', 'grand total', 'total a pagar', 'monto total'],
        required: true,
        placeholder: '0.00',
    },
    {
        id: 'currency',
        label: 'Moneda',
        type: 'select',
        keywords: ['moneda', 'currency', 'coin'],
        required: false,
        options: ['HNL', 'USD', 'EUR', 'GTQ', 'MXN', 'CRC'],
        placeholder: '',
    },
];

const STORAGE_KEY = 'autoform_schema_v1';

// ─── Context ──────────────────────────────────────────────────────────────────

const ScannerContext = createContext<ScannerContextType | undefined>(undefined);

function loadFields(): FormField[] {
    if (typeof window === 'undefined') return DEFAULT_FIELDS;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored) as FormField[];
    } catch { /* ignore */ }
    return DEFAULT_FIELDS;
}

export function ScannerProvider({ children }: { children: ReactNode }) {
    const [fields, setFields] = useState<FormField[]>(loadFields);
    const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
    const [activeTab, setActiveTab] = useState<ScanTab>('upload');
    const [scannedData, setScannedDataState] = useState<ScannedData>({});
    const [rawOcrText, setRawOcrTextState] = useState('');

    // Persist schema whenever it changes
    const saveFields = useCallback((f: FormField[]) => {
        setFields(f);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(f)); } catch { /* ignore */ }
    }, []);

    const addField = useCallback((partial?: Partial<FormField>) => {
        const newField: FormField = {
            id: uuidv4(),
            label: 'Nuevo Campo',
            type: 'text',
            keywords: [],
            required: false,
            placeholder: '',
            ...partial,
        };
        saveFields([...fields, newField]);
    }, [fields, saveFields]);

    const updateField = useCallback((id: string, data: Partial<FormField>) => {
        saveFields(fields.map(f => f.id === id ? { ...f, ...data } : f));
    }, [fields, saveFields]);

    const removeField = useCallback((id: string) => {
        saveFields(fields.filter(f => f.id !== id));
    }, [fields, saveFields]);

    const reorderFields = useCallback((from: number, to: number) => {
        const arr = [...fields];
        const [item] = arr.splice(from, 1);
        arr.splice(to, 0, item);
        saveFields(arr);
    }, [fields, saveFields]);

    const resetToDefaults = useCallback(() => {
        saveFields(DEFAULT_FIELDS);
    }, [saveFields]);

    const setScannedData = useCallback((d: ScannedData) => {
        setScannedDataState(d);
    }, []);

    const updateScannedValue = useCallback((fieldId: string, value: string) => {
        setScannedDataState(prev => ({
            ...prev,
            [fieldId]: { value, confidence: prev[fieldId]?.confidence ?? 100 },
        }));
    }, []);

    const setRawOcrText = useCallback((t: string) => {
        setRawOcrTextState(t);
    }, []);

    const clearScan = useCallback(() => {
        setScannedDataState({});
        setRawOcrTextState('');
        setScanStatus('idle');
        setActiveTab('upload');
    }, []);

    return (
        <ScannerContext.Provider value={{
            fields, addField, updateField, removeField, reorderFields, resetToDefaults,
            scanStatus, setScanStatus,
            activeTab, setActiveTab,
            scannedData, setScannedData, updateScannedValue,
            rawOcrText, setRawOcrText,
            clearScan,
        }}>
            {children}
        </ScannerContext.Provider>
    );
}

export function useScanner() {
    const ctx = useContext(ScannerContext);
    if (!ctx) throw new Error('useScanner must be used within ScannerProvider');
    return ctx;
}
