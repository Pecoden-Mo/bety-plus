import dotenv from 'dotenv';
import emailService from './utils/emailService.js';

dotenv.config();

async function testEmailPerformance() {
  console.log('Testing email service performance...');

  const testEmail = 'teytytyu@gmail.com';
  const testToken = 'test-token-123';
  const testUserAgent = 'Test Browser';
  const testIP = '127.0.0.1';

  const startTime = Date.now();

  try {
    const result = await emailService.sendResetEmail(
      testEmail,
      testToken,
      testUserAgent,
      testIP
    );

    const duration = Date.now() - startTime;

    console.log('Email test result:', result);
    console.log(`Total duration: ${duration}ms`);

    if (duration > 5000) {
      console.log('WARNING: Email sending took more than 5 seconds!');
      console.log('Possible issues:');
      console.log('1. SMTP server connection timeout');
      console.log('2. Network latency');
      console.log('3. Gmail authentication issues');
      console.log('4. Rate limiting by Gmail');
    } else {
      console.log('Email performance looks good!');
    }
  } catch (error) {
    console.error('Email test failed:', error);
    console.log('Common causes:');
    console.log('1. Invalid SMTP credentials');
    console.log('2. Gmail app password not configured');
    console.log('3. Network connectivity issues');
    console.log('4. Gmail security settings blocking access');
  }
}

// Run the test
testEmailPerformance();
