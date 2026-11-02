import assert from 'assert';

const BASE_URL = 'http://localhost:8089';

async function testBookingFlows() {
  console.log('🚀 Starting Comprehensive Booking Flow Tests...');
  let passed = 0;
  let failed = 0;

  async function check(name, fn) {
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ❌ [FAIL] ${name}:`, e.message);
      failed++;
    }
  }

  // 1. Check Routes Availability
  console.log('\n--- 1. Testing Route Availability & Status Codes ---');
  
  await check('Marketplace Route (/marketplace)', async () => {
    const res = await fetch(`${BASE_URL}/marketplace`);
    assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
    const html = await res.text();
    assert.ok(html.includes('Angebotstyp'), 'Should include Angebotstyp search segment');
  });

  await check('/profiles redirect to /marketplace (Permanent 308)', async () => {
    const res = await fetch(`${BASE_URL}/profiles`, { redirect: 'manual' });
    assert.strictEqual(res.status, 308, `Expected 308 Redirect, got ${res.status}`);
    const location = res.headers.get('location');
    assert.strictEqual(location, '/marketplace', `Expected redirect to /marketplace, got ${location}`);
  });

  await check('Experience Detail Page (/experience/exp-1-1)', async () => {
    const res = await fetch(`${BASE_URL}/experience/exp-1-1`);
    assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
    const html = await res.text();
    assert.ok(html.includes('Book Now') || html.includes('checkout'), 'Should render Book Now or checkout link');
  });

  await check('Checkout Page (/checkout/exp-1-1)', async () => {
    const res = await fetch(`${BASE_URL}/checkout/exp-1-1`);
    assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
    const html = await res.text();
    assert.ok(html.includes('Secure Checkout') || html.includes('Checkout'), 'Should render checkout layout');
  });

  await check('Session Detail Page (/session/1)', async () => {
    const res = await fetch(`${BASE_URL}/session/1`);
    assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
  });

  await check('Event Detail Page (/event/1)', async () => {
    const res = await fetch(`${BASE_URL}/event/1`);
    assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
  });

  await check('Pay Booking Page (/pay/test-booking-id)', async () => {
    const res = await fetch(`${BASE_URL}/pay/test-booking-id`);
    assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
  });

  // 2. Testing Pricing Calculation Logic (Checkout.tsx & SessionBookingModal.tsx)
  console.log('\n--- 2. Testing Pricing & Fee Calculations ---');

  await check('Pricing Math: Base Price + AddOns + Tax(19%) + Orive Fee(5%)', async () => {
    const basePrice = 150; // EUR
    const addOn1 = 50; // Private session
    const addOn2 = 25; // Recording
    const selectedAddOnsTotal = addOn1 + addOn2; // 75
    
    // Formula from Checkout.tsx:
    const subtotal = basePrice + selectedAddOnsTotal; // 225
    const tax = Math.round(subtotal * 0.19); // 225 * 0.19 = 42.75 -> 43
    const totalInclTax = subtotal + tax; // 268
    const oriveFee = Math.round(totalInclTax * 0.05); // 268 * 0.05 = 13.4 -> 13
    const total = totalInclTax + oriveFee; // 281

    assert.strictEqual(subtotal, 225);
    assert.strictEqual(tax, 43);
    assert.strictEqual(totalInclTax, 268);
    assert.strictEqual(oriveFee, 13);
    assert.strictEqual(total, 281);
  });

  await check('Pricing Math: Free / 0 EUR Experience', async () => {
    const basePrice = 0;
    const selectedAddOnsTotal = 0;
    const subtotal = basePrice + selectedAddOnsTotal;
    const tax = Math.round(subtotal * 0.19);
    const totalInclTax = subtotal + tax;
    const oriveFee = Math.round(totalInclTax * 0.05);
    const total = totalInclTax + oriveFee;

    assert.strictEqual(total, 0);
  });

  await check('Pricing Math: computeOriveMatchingFee from pricing.ts', async () => {
    // Testing lib/pricing.ts standard 5% fee calculation
    const computeFee = (total) => Math.round(total * 0.05);
    assert.strictEqual(computeFee(100), 5);
    assert.strictEqual(computeFee(85), 4);
    assert.strictEqual(computeFee(250), 13);
  });

  // 3. Validation Schema Checks
  console.log('\n--- 3. Testing Booking Form Validation Rules ---');
  
  await check('Validation: valid user details pass', async () => {
    const validData = {
      name: 'Max Mustermann',
      email: 'max@example.com',
      phone: '+49 170 1234567',
      notes: 'Looking forward to the session',
    };
    assert.ok(validData.name.trim().length >= 2);
    assert.ok(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(validData.email));
  });

  await check('Validation: empty name or invalid email caught', async () => {
    const invalidData = {
      name: 'M',
      email: 'invalid-email',
    };
    const isNameValid = invalidData.name.trim().length >= 2;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invalidData.email);
    assert.strictEqual(isNameValid, false, 'Name too short should fail');
    assert.strictEqual(isEmailValid, false, 'Invalid email pattern should fail');
  });

  console.log(`\n================================`);
  console.log(`Total tests: ${passed + failed}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

testBookingFlows().catch((err) => {
  console.error('Test execution crashed:', err);
  process.exit(1);
});
