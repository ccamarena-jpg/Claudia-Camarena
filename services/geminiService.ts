
import { GoogleGenAI } from "@google/genai";
import { MaterialItem, POSAudit } from "../types";

// Always initialize GoogleGenAI with the apiKey property from process.env.API_KEY
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeMaterialImage = async (base64Image: string, materialType: string): Promise<string> => {
  try {
    const ai = getAI();
    const prompt = `Analiza esta fotografía de un material de comunicación en punto de venta (P.O.P.) de tipo ${materialType}. 
    Evalúa lo siguiente:
    1. ¿Es claramente visible para el consumidor?
    2. ¿Está en buen estado físico (no arrugado, no roto)?
    3. ¿Se identifica claramente la marca?
    4. ¿Hay otros materiales de la competencia obstruyéndolo?
    Responde de forma concisa en español (máximo 300 caracteres).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] || base64Image } },
          { text: prompt }
        ]
      }
    });

    return response.text || "No se pudo realizar el análisis automático.";
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    return "Error en el análisis de IA.";
  }
};

export const detectMaterialsAndOOS = async (base64Image: string): Promise<string> => {
  try {
    const ai = getAI();
    const prompt = `Actúa como un experto en auditoría de Trade Marketing. Observa esta imagen de una góndola/cigarra:
    1. Identifica qué materiales de comunicación (Afiches, Stoppers, Cenefas) están presentes.
    2. Identifica si hay huecos o espacios vacíos (Quiebres de stock).
    3. Proporciona una lista resumida de lo encontrado.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] || base64Image } },
          { text: prompt }
        ]
      }
    });
    return response.text || "No se detectaron elementos.";
  } catch (error) {
    return "Error en detección automática.";
  }
};

export const verifyLayoutCompliance = async (base64Image: string, area: string): Promise<string> => {
  try {
    const ai = getAI();
    const prompt = `Analiza el Layout de la sección ${area} en esta fotografía.
    Determina si el orden de los productos y la limpieza cumplen con los estándares de exhibición (productos alineados, sin contaminantes externos). 
    Responde: CUMPLE o NO CUMPLE seguido de una breve justificación.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] || base64Image } },
          { text: prompt }
        ]
      }
    });
    return response.text || "Análisis de layout no disponible.";
  } catch (error) {
    return "Error analizando layout.";
  }
};

export const chatWithAuditor = async (query: string): Promise<string> => {
  try {
    const ai = getAI();
    const systemPrompt = `Eres un asistente experto para auditores de Trade Marketing. Tu objetivo es resolver dudas sobre qué materiales POP deben ir en cada cadena (Oxxo, Tambo, Bodegas, etc.).
    - Oxxo: Usar afiches A3 y wobblers en el counter.
    - Tambo: Solo cenefas y glorificadores LED.
    - Bodegas: Afiches exteriores y stickers de precios.
    Responde de forma amable y profesional.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: { systemInstruction: systemPrompt }
    });
    return response.text || "Lo siento, no tengo esa información en este momento.";
  } catch (error) {
    return "Error al procesar tu consulta.";
  }
};

export const generateAuditSummary = async (audit: POSAudit): Promise<string> => {
  try {
    const ai = getAI();
    const itemsSummary = audit.items.map(i => `- ${i.type}: ${i.condition}`).join('\n');
    
    const oosSummary = audit.oosItems.length > 0 
      ? `Quiebres: ${audit.oosItems.map(sku => sku.skuName).join(', ')}`
      : 'Sin quiebres.';
      
    const checklistSummary = audit.checklist?.map(c => 
      `- ${c.itemName}: ${c.hasMaterial ? 'Presente' : 'Ausente (Motivo: ' + c.reason + ')'}`
    ).join('\n');

    const prompt = `Genera un resumen ejecutivo de auditoría comercial.
    Tienda: ${audit.storeName}
    Auditor: ${audit.auditorName}
    
    Cumplimiento de Materiales (Checklist):
    ${checklistSummary}
    
    Hallazgos de Stock:
    ${oosSummary}
    
    Analiza brevemente el nivel de ejecución y recomienda acciones de reposición si hay materiales ausentes.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });

    return response.text || "Resumen no disponible.";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Error generando el resumen ejecutivo.";
  }
};
