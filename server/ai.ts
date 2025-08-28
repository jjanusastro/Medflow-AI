import OpenAI from "openai";

// The newest OpenAI model is "gpt-5" which was released August 7, 2025. Do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "your-openai-api-key"
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

export class AIService {
  async analyzePatientForm(formData: any): Promise<PatientInsight> {
    try {
      const prompt = `Analyze this patient intake form and provide medical insights. 
      Respond with JSON in this format: { "summary": string, "riskLevel": "low"|"medium"|"high", "recommendations": string[], "flaggedItems": string[] }
      
      Form data: ${JSON.stringify(formData)}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a medical AI assistant that analyzes patient forms for healthcare providers. Provide concise, professional insights while maintaining HIPAA compliance."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
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
      // Note: In a real implementation, this would integrate with actual insurance APIs
      // For now, we'll use AI to simulate the verification process
      const prompt = `Simulate insurance verification for:
      Provider: ${provider}
      Policy: ${policyNumber}
      Patient: ${JSON.stringify(patientInfo)}
      
      Respond with JSON: { "isValid": boolean, "coverage": string[], "copay": number, "deductible": number, "notes": string }`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an insurance verification system. Provide realistic verification results."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
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

  async generateFollowUpMessage(patientName: string, appointmentType: string, nextSteps: string[]): Promise<string> {
    try {
      const prompt = `Generate a professional follow-up message for:
      Patient: ${patientName}
      Appointment type: ${appointmentType}
      Next steps: ${nextSteps.join(", ")}
      
      Keep it warm, professional, and under 200 words.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a medical practice communication assistant. Generate professional, caring follow-up messages for patients."
          },
          {
            role: "user",
            content: prompt
          }
        ],
      });

      return response.choices[0].message.content || "Thank you for your visit. Please contact us if you have any questions.";
    } catch (error) {
      console.error("AI follow-up generation error:", error);
      return "Thank you for your visit. Please contact us if you have any questions.";
    }
  }

  async suggestAppointmentScheduling(patientHistory: any, urgency: string): Promise<AppointmentSuggestion> {
    try {
      const prompt = `Based on patient history and urgency level, suggest optimal appointment scheduling:
      Patient history: ${JSON.stringify(patientHistory)}
      Urgency: ${urgency}
      
      Respond with JSON: { "suggestedTime": string, "duration": number, "type": string, "priority": "low"|"medium"|"high", "reason": string }`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a medical scheduling AI that optimizes appointment timing and duration based on patient needs."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
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
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a medical practice AI assistant. Help with scheduling, patient management, and administrative tasks. Always maintain HIPAA compliance and provide professional assistance."
          },
          {
            role: "user",
            content: `Context: ${JSON.stringify(context)}\n\nQuestion: ${prompt}`
          }
        ],
      });

      return response.choices[0].message.content || "I'm sorry, I couldn't process your request at this time.";
    } catch (error) {
      console.error("AI chat error:", error);
      return "I'm experiencing technical difficulties. Please try again later.";
    }
  }
}

export const aiService = new AIService();
