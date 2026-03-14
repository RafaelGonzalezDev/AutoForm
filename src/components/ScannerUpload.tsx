'use client';

import { useCallback, useRef, useState } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useScanner } from '@/context/ScannerContext';
import { mapOcrToFields } from '@/lib/fieldMapper';
import { useToast } from '@/context/ToastContext';

// Dynamic imports to avoid SSR issues
async function runTesseract(imageSource: string | File): Promise<string> {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('spa+eng', 1, {
        logger: () => { /* suppress logs */ },
    });
    const { data: { text } } = await worker.recognize(imageSource);
    await worker.terminate();
    return text;
}

async function runPdfExtraction(file: File): Promise<string> {
    const pdfjsLib = await import('pdfjs-dist');
    // Use bundled worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
            .map((item) => ('str' in item ? item.str : ''))
            .join(' ');
        fullText += pageText + '\n';
    }
    return fullText;
}

type UploadState = 'idle' | 'dragging' | 'processing' | 'done' | 'error';

interface ScannerUploadProps {
    onDone: () => void;
}

export default function ScannerUpload({ onDone }: ScannerUploadProps) {
    const { fields, setScannedData, setRawOcrText, setScanStatus } = useScanner();
    const { toast } = useToast();
    const fileRef = useRef<HTMLInputElement>(null);

    const [uploadState, setUploadState] = useState<UploadState>('idle');
    const [preview, setPreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [fileType, setFileType] = useState<'image' | 'pdf' | null>(null);
    const [progress, setProgress] = useState(0);

    const processFile = useCallback(async (file: File) => {
        const isImage = file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf';

        if (!isImage && !isPdf) {
            toast('Formato no compatible. Usa JPG, PNG, WEBP o PDF.', 'error');
            return;
        }

        setFileName(file.name);
        setFileType(isImage ? 'image' : 'pdf');
        setUploadState('processing');
        setScanStatus('processing');
        setProgress(10);

        // Image preview
        if (isImage) {
            const url = URL.createObjectURL(file);
            setPreview(url);
        }

        try {
            setProgress(30);
            let text = '';

            if (isImage) {
                text = await runTesseract(file);
            } else {
                text = await runPdfExtraction(file);
            }

            setProgress(80);
            setRawOcrText(text);

            const mapped = mapOcrToFields(text, fields);
            setScannedData(mapped);

            setProgress(100);
            setUploadState('done');
            setScanStatus('done');
            toast('Documento procesado con éxito. Revisa los campos extraídos.', 'success');

            setTimeout(onDone, 800);
        } catch (err) {
            console.error('OCR error:', err);
            setUploadState('error');
            setScanStatus('error');
            toast('Error al procesar el documento. Intenta con otra imagen.', 'error');
        }
    }, [fields, setScannedData, setRawOcrText, setScanStatus, toast, onDone]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setUploadState('idle');
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    }, [processFile]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    }, [processFile]);

    const reset = useCallback(() => {
        setUploadState('idle');
        setPreview(null);
        setFileName(null);
        setFileType(null);
        setProgress(0);
        if (fileRef.current) fileRef.current.value = '';
    }, []);

    const isProcessing = uploadState === 'processing';

    return (
        <div>
            {/* Drop zone */}
            {(uploadState === 'idle' || uploadState === 'dragging') && (
                <div
                    onDragOver={e => { e.preventDefault(); setUploadState('dragging'); }}
                    onDragLeave={() => setUploadState('idle')}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    style={{
                        border: `2px dashed ${uploadState === 'dragging' ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: 16,
                        padding: '56px 32px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 14,
                        cursor: 'pointer',
                        background: uploadState === 'dragging' ? 'rgba(99,102,241,0.08)' : 'rgba(26,26,46,0.5)',
                        transition: 'all 0.2s ease',
                    }}
                >
                    <div style={{
                        width: 68, height: 68, borderRadius: 16,
                        background: 'rgba(99,102,241,0.12)',
                        border: '1px solid rgba(99,102,241,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <UploadCloud size={32} style={{ color: 'var(--primary-light)' }} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: 4 }}>
                            Arrastra tu documento aquí
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            o haz clic para seleccionar un archivo
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 8 }}>
                            JPG · PNG · WEBP · PDF — hasta 20MB
                        </div>
                    </div>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                </div>
            )}

            {/* Processing state */}
            {isProcessing && (
                <div className="card animate-fade-in" style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                    {/* File info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: 10,
                            background: 'rgba(99,102,241,0.12)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            {fileType === 'pdf' ? <FileText size={20} style={{ color: 'var(--primary-light)' }} /> : <ImageIcon size={20} style={{ color: 'var(--primary-light)' }} />}
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.875rem' }}>{fileName}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{fileType === 'pdf' ? 'Extrayendo texto del PDF...' : 'Aplicando OCR a la imagen...'}</div>
                        </div>
                    </div>

                    {/* Spinner */}
                    <Loader2 size={36} className="animate-spin-slow" style={{ color: 'var(--primary-light)' }} />

                    {/* Progress bar */}
                    <div style={{ width: '100%', maxWidth: 360 }}>
                        <div style={{ background: 'rgba(99,102,241,0.12)', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                            <div style={{
                                width: `${progress}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, var(--primary), var(--primary-light))',
                                borderRadius: 99,
                                transition: 'width 0.4s ease',
                            }} />
                        </div>
                        <div style={{ textAlign: 'center', marginTop: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {progress < 40 ? 'Preparando documento...' : progress < 80 ? 'Ejecutando OCR...' : 'Mapeando campos...'}
                        </div>
                    </div>
                </div>
            )}

            {/* Done / Error */}
            {(uploadState === 'done' || uploadState === 'error') && (
                <div className="card animate-fade-in" style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    {uploadState === 'done' ? (
                        <>
                            <CheckCircle size={42} style={{ color: 'var(--success)' }} />
                            <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1rem' }}>¡Procesado con éxito!</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Redirigiendo al formulario...</div>
                        </>
                    ) : (
                        <>
                            <AlertCircle size={42} style={{ color: 'var(--danger)' }} />
                            <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1rem' }}>Error al procesar</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Verifica que la imagen sea clara y legible.</div>
                            <button className="btn-ghost" onClick={reset}>Intentar de nuevo</button>
                        </>
                    )}
                </div>
            )}

            {/* Image preview (shown below when processing/done) */}
            {preview && uploadState !== 'idle' && (
                <div style={{ marginTop: 16, position: 'relative' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={preview}
                        alt="Vista previa"
                        style={{ width: '100%', borderRadius: 12, maxHeight: 300, objectFit: 'contain', background: 'rgba(0,0,0,0.3)' }}
                    />
                    {uploadState !== 'processing' && (
                        <button
                            onClick={reset}
                            style={{
                                position: 'absolute', top: 8, right: 8, width: 28, height: 28,
                                background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: 'white',
                            }}
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
