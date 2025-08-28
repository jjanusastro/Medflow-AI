// Temporary Stripe placeholder service
// This simulates payment processing until you're ready to add real Stripe keys

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed';
}

export interface Subscription {
  id: string;
  customerId: string;
  status: 'active' | 'inactive' | 'past_due';
  priceId: string;
  currentPeriodEnd: Date;
}

export class MockPaymentService {
  // Simulate creating a payment intent
  async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<PaymentIntent> {
    const mockId = `pi_mock_${Date.now()}`;
    const mockSecret = `${mockId}_secret_mock${Math.random().toString(36).substring(7)}`;
    
    console.log('💳 Mock Payment Intent Created:');
    console.log(`Amount: $${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`);
    console.log(`Payment Intent ID: ${mockId}`);
    console.log('---');
    
    return {
      id: mockId,
      clientSecret: mockSecret,
      amount,
      currency,
      status: 'pending'
    };
  }

  // Simulate creating a subscription
  async createSubscription(customerId: string, priceId: string): Promise<Subscription> {
    const mockSubId = `sub_mock_${Date.now()}`;
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    console.log('📄 Mock Subscription Created:');
    console.log(`Customer ID: ${customerId}`);
    console.log(`Price ID: ${priceId}`);
    console.log(`Subscription ID: ${mockSubId}`);
    console.log(`Next billing: ${nextMonth.toLocaleDateString()}`);
    console.log('---');
    
    return {
      id: mockSubId,
      customerId,
      status: 'active',
      priceId,
      currentPeriodEnd: nextMonth
    };
  }

  // Simulate creating a customer
  async createCustomer(email: string, name: string): Promise<{ id: string; email: string; name: string }> {
    const mockCustomerId = `cus_mock_${Date.now()}`;
    
    console.log('👤 Mock Customer Created:');
    console.log(`Customer ID: ${mockCustomerId}`);
    console.log(`Email: ${email}`);
    console.log(`Name: ${name}`);
    console.log('---');
    
    return {
      id: mockCustomerId,
      email,
      name
    };
  }

  // Mock payment verification
  async verifyPayment(paymentIntentId: string): Promise<boolean> {
    console.log(`✅ Mock Payment Verified: ${paymentIntentId}`);
    return true; // Always successful in mock mode
  }
}

export const paymentService = new MockPaymentService();