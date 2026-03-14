import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        const { text, fields } = await req.json();

        if (!text || !fields) {
            return NextResponse.json({ error: 'Missing text or fields' }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
            Eres un experto en extracción de datos de documentos escaneados (OCR). 
            Tu objetivo es extraer información específica de un texto crudo de OCR y mapearla a los campos definidos.
            
            TEXTO OCR:
            """
            ${text}
            """
            
            CAMPOS A EXTRAER:
            ${JSON.stringify(fields, null, 2)}
            
            REGLAS:
            1. Analiza el texto OCR. Es posible que tenga errores tipográficos (ej: "T0TAL" por "TOTAL"). Usa tu inteligencia para identificar el campo correcto.
            2. Para cada campo definido en la lista anterior, devuelve un objeto con su 'id', el 'value' extraído y un 'confidence' (0-100).
            3. Si un campo no se encuentra en el texto, devuelve una cadena vacía para 'value' y confidence 0.
            4. Formatos:
               - Fechas: YYYY-MM-DD
               - Moneda/Números: Solo números (ej: "1250.50"), sin símbolos de moneda.
            5. Responde ÚNICAMENTE con un objeto JSON válido donde las llaves sean los ID de los campos.
            
            EJEMPLO DE SALIDA:
            {
              "invoice_number": { "value": "F-123", "confidence": 95 },
              "total_amount": { "value": "1500.00", "confidence": 99 }
            }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // Clean markdown if present
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : responseText;
        
        const extractedData = JSON.parse(cleanJson);

        return NextResponse.json(extractedData);
    } catch (error: any) {
        console.error('AI Mapper Error:', error);
        return NextResponse.json({ error: 'Failed to process AI mapping', details: error.message }, { status: 500 });
    }
}
