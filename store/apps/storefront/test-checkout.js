const BACKEND_URL = 'http://localhost:9000';
const PUBLISHABLE_KEY = 'pk_41a156e805843ac6a00224f7bed9bfa4994d438a304242648613a39669b35e6a';

const headers = {
  'Content-Type': 'application/json',
  'x-publishable-api-key': PUBLISHABLE_KEY
};

async function request(path, method = 'GET', body = null) {
  const options = {
    method,
    headers
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(`${BACKEND_URL}${path}`, options);
  const data = await res.json();
  if (!res.ok) {
    console.error(`HTTP Error ${res.status} on ${method} ${path}:`, JSON.stringify(data, null, 2));
    throw new Error(`Request failed: ${res.status}`);
  }
  return data;
}

async function runCheckout() {
  console.log('--- Starting Programmatic Checkout Test ---');

  // 1. Get regions
  console.log('Step 1: Fetching regions...');
  const regionsRes = await request('/store/regions');
  const region = regionsRes.regions[0];
  console.log(`Using region: ${region.name} (${region.id})`);

  // 2. Create cart
  console.log('Step 2: Creating a cart...');
  const cartRes = await request('/store/carts', 'POST', {
    region_id: region.id,
    email: 'test-pod@example.com'
  });
  const cartId = cartRes.cart.id;
  console.log(`Cart created with ID: ${cartId}`);

  // 3. Add Printify variant to cart
  console.log('Step 3: Adding Printify item to cart...');
  await request(`/store/carts/${cartId}/line-items`, 'POST', {
    variant_id: 'variant_01KVET91NRP33CDMCMZR224H93', // Shirt S / Black mapped to Printify
    quantity: 1
  });
  console.log('Item added to cart.');

  // 4. Update shipping address
  console.log('Step 4: Updating shipping address...');
  await request(`/store/carts/${cartId}`, 'POST', {
    shipping_address: {
      first_name: 'John',
      last_name: 'Doe',
      address_1: '123 POD Street',
      city: 'Copenhagen',
      country_code: 'dk',
      postal_code: '1000',
      province: 'Copenhagen',
      phone: '123456789'
    }
  });
  console.log('Shipping address updated.');

  // 5. Get shipping options
  console.log('Step 5: Fetching shipping options...');
  const optionsRes = await request(`/store/shipping-options?cart_id=${cartId}`);
  const option = optionsRes.shipping_options[0];
  console.log(`Using shipping option: ${option.name} (${option.id})`);

  // 6. Select shipping method
  console.log('Step 6: Selecting shipping method...');
  await request(`/store/carts/${cartId}/shipping-methods`, 'POST', {
    option_id: option.id
  });
  console.log('Shipping method selected.');

  // 7. Get payment collection and initiate session
  console.log('Step 7: Getting payment collection and initiating payment session...');
  const updatedCartRes = await request(`/store/carts/${cartId}?fields=*payment_collection`);

  if (!updatedCartRes.cart.payment_collection) {
    console.log('Payment collection not found. Attempting to create it via POST /store/payment-collections...');
    try {
      const pcRes = await request('/store/payment-collections', 'POST', { cart_id: cartId });
      console.log('Created payment collection:', JSON.stringify(pcRes, null, 2));
      updatedCartRes.cart.payment_collection = pcRes.payment_collection;
    } catch (err) {
      console.error('Failed to create payment collection:', err.message);
    }
  }

  const paymentCollection = updatedCartRes.cart.payment_collection;
  if (!paymentCollection) {
    throw new Error('Payment collection is still missing.');
  }

  console.log(`Payment collection ID: ${paymentCollection.id}`);

  // In Medusa v2, we initiate a session on the payment collection
  await request(`/store/payment-collections/${paymentCollection.id}/payment-sessions`, 'POST', {
    provider_id: 'pp_system_default'
  });
  console.log('Payment session initiated.');

  // 8. Complete the cart to place the order
  console.log('Step 8: Completing cart...');
  const completeRes = await request(`/store/carts/${cartId}/complete`, 'POST');
  console.log('Checkout complete! Response type:', completeRes.type);
  if (completeRes.type === 'order') {
    console.log(`SUCCESS: Order placed with ID: ${completeRes.order.id}`);
  } else {
    console.log('FAILED: Cart completion did not return an order', completeRes);
  }
}

runCheckout().catch(err => {
  console.error('Test checkout failed:', err);
});
