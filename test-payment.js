// Quick test to verify Stripe service is working
import stripeService from './services/stripeService.js';

async function testStripeService() {
  try {
    console.log('🧪 Testing Stripe Service...');

    // Test creating a checkout session
    const testSession = await stripeService.createCheckoutSession({
      amount: 5000, // 50.00 SAR
      currency: 'SAR',
      paymentId: 'test-payment-123',
      successUrl: 'https://yourapp.com/success',
      cancelUrl: 'https://yourapp.com/cancel',
      customerEmail: 'test@example.com',
    });

    console.log('✅ Stripe Checkout Session Created Successfully!');
    console.log('📧 Session ID:', testSession.id);
    console.log('🔗 Payment URL:', testSession.url);
    console.log('💰 Amount:', testSession.amount_total / 100, 'SAR');

    return true;
  } catch (error) {
    console.error('❌ Stripe Service Test Failed:', error.message);
    return false;
  }
}

// Run the test
testStripeService()
  .then((success) => {
    if (success) {
      console.log('\n🎉 Secure Payment System is Ready!');
      console.log('🔒 No card data handled in your app');
      console.log('✨ Stripe handles all sensitive payment information');
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
