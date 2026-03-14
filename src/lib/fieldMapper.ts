import { FormField, ScannedData, ScannedValue } from '@/context/ScannerContext';

/**
 * Motor de mapeo heurístico: recibe el texto OCR crudo y el schema de campos
 * y retorna un mapa fieldId → { value, confidence }
 *
 * Estrategia:
 *  1. Normalizar texto (líneas limpias)
 *  2. Para cada campo, buscar líneas que contengan alguna keyword
 *  3. Extraer el valor que viene después del delimitador (: o tab o espacio)
 *  4. Para fechas y montos, aplicar regex específicos
 *  5. La confianza se basa en qué tan directa fue la coincidencia
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeText(raw: string): string {
    return raw
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove accents for matching
        .toLowerCase();
}

const DATE_PATTERNS = [
    /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\b/,
    /\b(\d{2,4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})\b/,
    /\b(\d{1,2})\s+(?:de\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(?:de\s+)?(\d{4})\b/i,
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s+(\d{4})\b/i,
];

const MONTH_MAP: Record<string, string> = {
    enero: '01', february: '02', febrero: '02', march: '03', marzo: '03',
    april: '04', abril: '04', may: '05', mayo: '05', june: '06', junio: '06',
    july: '07', julio: '07', august: '08', agosto: '08', september: '09',
    septiembre: '09', october: '10', octubre: '10', november: '11', noviembre: '11',
    december: '12', diciembre: '12', january: '01',
};

function extractDate(text: string): string | null {
    for (const pat of DATE_PATTERNS) {
        const m = text.match(pat);
        if (m) {
            if (pat === DATE_PATTERNS[2] || pat === DATE_PATTERNS[3]) {
                // Named month
                const [, a, b, c] = m;
                const month = MONTH_MAP[b.toLowerCase()];
                const day = (pat === DATE_PATTERNS[2] ? a : b).padStart(2, '0');
                const year = pat === DATE_PATTERNS[2] ? c : c;
                return `${year}-${month}-${day.padStart(2, '0')}`;
            }
            // Numeric – assume DD/MM/YYYY
            const [, d, mo, y] = m;
            const year = y.length === 2 ? `20${y}` : y;
            return `${year}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
    }
    return null;
}

const AMOUNT_PATTERN = /[\$L\€\₡]?\s*([\d,]+\.?\d{0,2})/;

function extractAmount(text: string): string | null {
    const m = text.match(AMOUNT_PATTERN);
    if (m) return m[1].replace(/,/g, '');
    return null;
}

function extractValueAfterDelimiter(line: string, keyword: string): string {
    // Remove the keyword itself and any leading punctuation
    const normalized = line.toLowerCase();
    const idx = normalized.indexOf(keyword.toLowerCase());
    let rest = idx >= 0 ? line.slice(idx + keyword.length) : line;
    rest = rest.replace(/^[\s:|\-=#>\.]+/, '').trim();
    return rest;
}

// ─── Main mapper ─────────────────────────────────────────────────────────────

export function mapOcrToFields(rawText: string, fields: FormField[]): ScannedData {
    const normalized = normalizeText(rawText);
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const normLines = normalized.split('\n').map(l => l.trim()).filter(Boolean);

    const result: ScannedData = {};

    for (const field of fields) {
        let bestMatch: ScannedValue | null = null;

        for (const keyword of field.keywords) {
            const kwLower = keyword.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

            // Search each line for keyword occurrence
            for (let i = 0; i < normLines.length; i++) {
                if (!normLines[i].includes(kwLower)) continue;

                // Found a line with this keyword
                const originalLine = lines[i];
                let candidate = extractValueAfterDelimiter(originalLine, keyword);

                // If the candidate is empty or too short, look at next line
                if (candidate.length < 2 && i + 1 < lines.length) {
                    candidate = lines[i + 1].trim();
                }

                if (!candidate) continue;

                // Apply type-specific extraction
                let value = candidate;
                let confidence = 70;

                if (field.type === 'date') {
                    // Try to extract date from candidate or surrounding lines
                    let dateStr: string | null = null;
                    for (let j = i; j <= Math.min(i + 2, lines.length - 1); j++) {
                        dateStr = extractDate(lines[j]);
                        if (dateStr) break;
                    }
                    if (!dateStr) continue;
                    value = dateStr;
                    confidence = 85;

                } else if (field.type === 'currency' || field.type === 'number') {
                    // Search in same line + next 2 lines for a number
                    let amount: string | null = null;
                    for (let j = i; j <= Math.min(i + 2, lines.length - 1); j++) {
                        amount = extractAmount(lines[j]);
                        if (amount) break;
                    }
                    if (!amount) continue;
                    value = amount;
                    confidence = 80;

                } else if (field.type === 'text' || field.type === 'email') {
                    // Clean common garbage chars
                    value = candidate.replace(/[|{}[\]]/g, '').trim();
                    if (value.length < 2) continue;
                    confidence = 75;

                } else if (field.type === 'select') {
                    // Check if any option keyword appears
                    if (field.options) {
                        const matchedOption = field.options.find(opt =>
                            normLines[i].includes(opt.toLowerCase())
                        );
                        if (matchedOption) {
                            value = matchedOption;
                            confidence = 90;
                        }
                    }
                }

                // Boost confidence if keyword is exact match at start of line
                if (normLines[i].startsWith(kwLower)) confidence = Math.min(confidence + 10, 99);

                // Keep best match (highest confidence)
                if (!bestMatch || confidence > bestMatch.confidence) {
                    bestMatch = { value, confidence };
                }
            }

            // Early exit if high confidence
            if (bestMatch && bestMatch.confidence >= 90) break;
        }

        if (bestMatch && bestMatch.value.trim().length > 0) {
            result[field.id] = bestMatch;
        } else {
            result[field.id] = { value: '', confidence: 0 };
        }
    }

    return result;
}
