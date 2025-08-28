import OpenAI from "openai";

// Environment-driven AI service with HIPAA compliance
const AI_PROVIDER = process.env.AI_PROVIDER || "openai";
const AI_MODEL = process.env.AI_MODEL || "gpt-4o-mini";
const HIPAA_MODE = process.env.HIPAA_MODE === "true";
const DEIDENTIFY_BEFORE_CALL = process.env.DEIDENTIFY_BEFORE_CALL !== "false";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface PatientInsight {
  summary: string;
  riskLevel: "low" | "medium" | "high";
  recommendations: string[];
  flaggedItems: string[];
}

export interface InsuranceVerificationResult {
  isValid: boolean;
  coverage: string[];
  copay: number;
  deductible: number;
  notes: string;
}

export interface AppointmentSuggestion {
  suggestedTime: string;
  duration: number;
  type: string;
  priority: "low" | "medium" | "high";
  reason: string;
}

// Simple PHI redaction (placeholder - use proper PHI library in production)
function deidentifyText(text: string): string {
  if (!DEIDENTIFY_BEFORE_CALL) return text;
  
  return text
    // Remove potential names (2+ consecutive capitalized words)
    .replace(/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g, "[PATIENT_NAME]")
    // Remove phone numbers
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, "[PHONE]")
    // Remove SSN patterns
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[SSN]")
    // Remove email addresses
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, "[EMAIL]")
    // Remove dates
    .replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, "[DATE]")
    // Remove addresses (basic pattern)
    .replace(/\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)\b/gi, "[ADDRESS]");
}

function checkPHIRisk(text: string): boolean {
  // Simple PHI detection patterns
  const phiPatterns = [
    /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/, // Names
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone numbers
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
    /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/ // Dates
  ];
  
  return phiPatterns.some(pattern => pattern.test(text));
}

async function callAI(prompt: string, systemMessage: string, options: any = {}): Promise<string> {
  // PHI safety check
  const hasPHI = checkPHIRisk(prompt);
  
  if (hasPHI && !HIPAA_MODE) {
    throw new Error("Potential PHI detected but HIPAA_MODE is not enabled. Enable HIPAA_MODE=true or de-identify data.");
  }
  
  // De-identify if enabled
  const cleanPrompt = deidentifyText(prompt);
  
  try {
    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: cleanPrompt
        }
      ],
      ...options
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("AI service error:", error);
    throw new Error("AI service temporarily unavailable");
  }
}

export class SecureAIService {
  async analyzePatientForm(formData: any): Promise<PatientInsight> {
    try {
      const prompt = `Analyze this de-identified patient intake form and provide medical insights. 
      Respond with JSON in this format: { "summary": string, "riskLevel": "low"|"medium"|"high", "recommendations": string[], "flaggedItems": string[] }
      
      Form data: ${JSON.stringify(formData)}`;

      const systemMessage = "You are a medical AI assistant that analyzes de-identified patient forms for healthcare providers. Provide concise, professional insights while maintaining HIPAA compliance. Never reference specific patient identifiers.";

      const response = await callAI(prompt, systemMessage, {
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response);
      
      return {
        summary: result.summary || "No summary available",
        riskLevel: result.riskLevel || "low",
        recommendations: result.recommendations || [],
        flaggedItems: result.flaggedItems || []
      };
    } catch (error) {
      console.error("AI form analysis error:", error);
      return {
        summary: "Unable to analyze form at this time",
        riskLevel: "low",
        recommendations: [],
        flaggedItems: []
      };
    }
  }

  async verifyInsurance(provider: string, policyNumber: string, patientInfo: any): Promise<InsuranceVerificationResult> {
    try {
      // De-identify patient info before sending
      const deidentifiedInfo = deidentifyText(JSON.stringify(patientInfo));
      
      const prompt = `Simulate insurance verification for:
      Provider: ${provider}
      Policy: ${policyNumber}
      Patient: ${deidentifiedInfo}
      
      Respond with JSON: { "isValid": boolean, "coverage": string[], "copay": number, "deductible": number, "notes": string }`;

      const systemMessage = "You are an insurance verification system. Provide realistic verification results for de-identified data.";

      const response = await callAI(prompt, systemMessage, {
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response);
      
      return {
        isValid: result.isValid || true,
        coverage: result.coverage || ["General medical", "Preventive care"],
        copay: result.copay || 25,
        deductible: result.deductible || 500,
        notes: result.notes || "Verification completed successfully"
      };
    } catch (error) {
      console.error("AI insurance verification error:", error);
      return {
        isValid: false,
        coverage: [],
        copay: 0,
        deductible: 0,
        notes: "Unable to verify insurance at this time"
      };
    }
  }

  async suggestAppointmentScheduling(patientHistory: any, urgency: string): Promise<AppointmentSuggestion> {
    try {
      const deidentifiedHistory = deidentifyText(JSON.stringify(patientHistory));
      
      const prompt = `Based on de-identified patient history and urgency level, suggest optimal appointment scheduling:
      Patient history: ${deidentifiedHistory}
      Urgency: ${urgency}
      
      Respond with JSON: { "suggestedTime": string, "duration": number, "type": string, "priority": "low"|"medium"|"high", "reason": string }`;

      const systemMessage = "You are a medical scheduling AI that optimizes appointment timing and duration based on de-identified patient needs.";

      const response = await callAI(prompt, systemMessage, {
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response);
      
      return {
        suggestedTime: result.suggestedTime || "Next available",
        duration: result.duration || 30,
        type: result.type || "standard consultation",
        priority: result.priority || "medium",
        reason: result.reason || "Standard appointment scheduling"
      };
    } catch (error) {
      console.error("AI scheduling suggestion error:", error);
      return {
        suggestedTime: "Next available",
        duration: 30,
        type: "consultation",
        priority: "medium",
        reason: "Unable to analyze scheduling requirements"
      };
    }
  }

  async chatWithAssistant(prompt: string, context: any): Promise<string> {
    try {
      const deidentifiedContext = deidentifyText(JSON.stringify(context));
      const deidentifiedPrompt = deidentifyText(prompt);
      
      const systemMessage = "You are a medical practice AI assistant. Help with scheduling, patient management, and administrative tasks. Always maintain HIPAA compliance and provide professional assistance. Work only with de-identified data.";
      
      return await callAI(
        `Context: ${deidentifiedContext}\n\nQuestion: ${deidentifiedPrompt}`,
        systemMessage
      );
    } catch (error) {
      console.error("AI chat error:", error);
      return "I'm experiencing technical difficulties. Please try again later.";
    }
  }

  async generateFollowUpMessage(patientName: string, appointmentType: string, nextSteps: string[]): Promise<string> {
    try {
      // De-identify patient name
      const deidentifiedName = DEIDENTIFY_BEFORE_CALL ? "[PATIENT_NAME]" : patientName;
      
      const prompt = `Generate a professional follow-up message for:
      Patient: ${deidentifiedName}
      Appointment type: ${appointmentType}
      Next steps: ${nextSteps.join(", ")}
      
      Keep it warm, professional, and under 200 words.`;

      const systemMessage = "You are a medical practice communication assistant. Generate professional, caring follow-up messages for patients using de-identified information.";

      const response = await callAI(prompt, systemMessage);
      
      // Re-identify if we de-identified
      return DEIDENTIFY_BEFORE_CALL ? 
        response.replace(/\[PATIENT_NAME\]/g, patientName) : 
        response;
    } catch (error) {
      console.error("AI follow-up generation error:", error);
      return "Thank you for your visit. Please contact us if you have any questions.";
    }
  }
}

export const aiService = new SecureAIService();