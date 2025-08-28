import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { aiService } from "./ai";
import { emailService } from "./email";
import { paymentService } from "./payment";
import { insertPatientSchema, insertAppointmentSchema, insertFormSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Practice routes
  app.get("/api/practice/:id", requireAuth, async (req, res) => {
    try {
      const practice = await storage.getPractice(req.params.id);
      if (!practice) {
        return res.status(404).json({ message: "Practice not found" });
      }
      res.json(practice);
    } catch (error) {
      res.status(500).json({ message: "Error fetching practice" });
    }
  });

  // Patient routes
  app.get("/api/patients", requireAuth, async (req, res) => {
    try {
      if (!req.user?.practiceId) {
        return res.status(400).json({ message: "User not associated with a practice" });
      }
      const patients = await storage.getPatientsByPractice(req.user.practiceId);
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Error fetching patients" });
    }
  });

  app.post("/api/patients", requireAuth, async (req, res) => {
    try {
      if (!req.user?.practiceId) {
        return res.status(400).json({ message: "User not associated with a practice" });
      }
      
      const patientData = { ...req.body, practiceId: req.user.practiceId };
      const validatedData = insertPatientSchema.parse(patientData);
      const patient = await storage.createPatient(validatedData);
      
      res.status(201).json(patient);
    } catch (error) {
      res.status(400).json({ message: "Error creating patient" });
    }
  });

  app.get("/api/patients/:id", requireAuth, async (req, res) => {
    try {
      const patient = await storage.getPatient(req.params.id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Error fetching patient" });
    }
  });

  // Appointment routes
  app.get("/api/appointments", requireAuth, async (req, res) => {
    try {
      if (!req.user?.practiceId) {
        return res.status(400).json({ message: "User not associated with a practice" });
      }
      
      const { date } = req.query;
      let appointments;
      
      if (date) {
        appointments = await storage.getAppointmentsByDate(req.user.practiceId, date as string);
      } else {
        appointments = await storage.getAppointmentsByPractice(req.user.practiceId);
      }
      
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching appointments" });
    }
  });

  app.post("/api/appointments", requireAuth, async (req, res) => {
    try {
      if (!req.user?.practiceId) {
        return res.status(400).json({ message: "User not associated with a practice" });
      }
      
      const appointmentData = { 
        ...req.body, 
        practiceId: req.user.practiceId,
        providerId: req.user.id 
      };
      const validatedData = insertAppointmentSchema.parse(appointmentData);
      const appointment = await storage.createAppointment(validatedData);
      
      res.status(201).json(appointment);
    } catch (error) {
      res.status(400).json({ message: "Error creating appointment" });
    }
  });

  app.put("/api/appointments/:id", requireAuth, async (req, res) => {
    try {
      const appointment = await storage.updateAppointment(req.params.id, req.body);
      res.json(appointment);
    } catch (error) {
      res.status(400).json({ message: "Error updating appointment" });
    }
  });

  // Form routes
  app.get("/api/forms/patient/:patientId", requireAuth, async (req, res) => {
    try {
      const forms = await storage.getFormsByPatient(req.params.patientId);
      res.json(forms);
    } catch (error) {
      res.status(500).json({ message: "Error fetching forms" });
    }
  });

  app.post("/api/forms", requireAuth, async (req, res) => {
    try {
      const validatedData = insertFormSchema.parse(req.body);
      const form = await storage.createForm(validatedData);
      
      // Process form with AI if enabled
      if (req.body.aiProcess) {
        const insights = await aiService.analyzePatientForm(form.data);
        await storage.updateForm(form.id, {
          aiProcessed: true,
          aiInsights: insights
        });
      }
      
      res.status(201).json(form);
    } catch (error) {
      res.status(400).json({ message: "Error creating form" });
    }
  });

  app.put("/api/forms/:id", requireAuth, async (req, res) => {
    try {
      const form = await storage.updateForm(req.params.id, req.body);
      res.json(form);
    } catch (error) {
      res.status(400).json({ message: "Error updating form" });
    }
  });

  // AI Assistant routes
  app.post("/api/ai/chat", requireAuth, async (req, res) => {
    try {
      const { message, context } = req.body;
      const response = await aiService.chatWithAssistant(message, context);
      
      // Store interaction
      if (req.user?.id && req.user?.practiceId) {
        await storage.createAiInteraction({
          userId: req.user.id,
          practiceId: req.user.practiceId,
          type: "chat",
          prompt: message,
          response,
          metadata: { context }
        });
      }
      
      res.json({ response });
    } catch (error) {
      res.status(500).json({ message: "Error processing AI request" });
    }
  });

  app.post("/api/ai/analyze-form", requireAuth, async (req, res) => {
    try {
      const { formData } = req.body;
      const insights = await aiService.analyzePatientForm(formData);
      
      if (req.user?.id && req.user?.practiceId) {
        await storage.createAiInteraction({
          userId: req.user.id,
          practiceId: req.user.practiceId,
          type: "analysis",
          prompt: "Form analysis",
          response: JSON.stringify(insights),
          metadata: { formData }
        });
      }
      
      res.json(insights);
    } catch (error) {
      res.status(500).json({ message: "Error analyzing form" });
    }
  });

  app.post("/api/ai/verify-insurance", requireAuth, async (req, res) => {
    try {
      const { provider, policyNumber, patientInfo } = req.body;
      const verification = await aiService.verifyInsurance(provider, policyNumber, patientInfo);
      
      // Store verification result
      await storage.createInsuranceVerification({
        patientId: patientInfo.id,
        provider,
        policyNumber,
        status: verification.isValid ? "verified" : "denied",
        coverage: verification,
        aiVerified: true
      });
      
      res.json(verification);
    } catch (error) {
      res.status(500).json({ message: "Error verifying insurance" });
    }
  });

  app.post("/api/ai/suggest-appointment", requireAuth, async (req, res) => {
    try {
      const { patientHistory, urgency } = req.body;
      const suggestion = await aiService.suggestAppointmentScheduling(patientHistory, urgency);
      res.json(suggestion);
    } catch (error) {
      res.status(500).json({ message: "Error generating appointment suggestion" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/practice-stats", requireAuth, async (req, res) => {
    try {
      if (!req.user?.practiceId) {
        return res.status(400).json({ message: "User not associated with a practice" });
      }
      
      const stats = await storage.getPracticeStats(req.user.practiceId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching practice statistics" });
    }
  });

  app.get("/api/ai/interactions", requireAuth, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "User ID not found" });
      }
      const interactions = await storage.getAiInteractionsByUser(req.user.id);
      res.json(interactions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching AI interactions" });
    }
  });

  // Email routes
  app.post("/api/email/appointment-reminder", requireAuth, async (req, res) => {
    try {
      const { patientEmail, patientName, appointmentDate, appointmentTime } = req.body;
      
      const success = await emailService.sendAppointmentReminder(
        patientEmail,
        patientName,
        appointmentDate,
        appointmentTime
      );
      
      if (success) {
        res.json({ message: "Appointment reminder sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send appointment reminder" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error sending appointment reminder" });
    }
  });

  app.post("/api/email/welcome", requireAuth, async (req, res) => {
    try {
      const { patientEmail, patientName } = req.body;
      
      const success = await emailService.sendWelcomeEmail(patientEmail, patientName);
      
      if (success) {
        res.json({ message: "Welcome email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send welcome email" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error sending welcome email" });
    }
  });

  // Payment routes (Mock/Temporary)
  app.post("/api/payment/create-intent", requireAuth, async (req, res) => {
    try {
      const { amount, currency = "usd" } = req.body;
      
      const paymentIntent = await paymentService.createPaymentIntent(amount, currency);
      
      res.json({
        clientSecret: paymentIntent.clientSecret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error) {
      res.status(500).json({ message: "Error creating payment intent" });
    }
  });

  app.post("/api/payment/create-subscription", requireAuth, async (req, res) => {
    try {
      const { email, name, priceId } = req.body;
      
      // Create mock customer
      const customer = await paymentService.createCustomer(email, name);
      
      // Create mock subscription
      const subscription = await paymentService.createSubscription(customer.id, priceId);
      
      res.json({
        subscriptionId: subscription.id,
        customerId: customer.id,
        status: subscription.status
      });
    } catch (error) {
      res.status(500).json({ message: "Error creating subscription" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
