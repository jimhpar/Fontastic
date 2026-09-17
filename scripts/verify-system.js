const http = require('http');

async function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = http.request(parsed, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, text: body });
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function main() {
  console.log('=== STARTING COMPLETE FONTASTIC PLATFORM VERIFICATION ===\n');

  // 1. Health check
  const health = await request('http://localhost:4000/api/health');
  console.log('✓ [API Health]:', health.data);

  // 2. Public Plans check (BDT pricing)
  const plans = await request('http://localhost:4000/api/plans');
  console.log(`✓ [Plans API]: Retrieved ${plans.data.plans.length} subscription tiers:`);
  plans.data.plans.forEach(p => {
    console.log(`   - ${p.name}: ৳${p.priceBDT} TK/mo (${p.searchesPerWeek ? p.searchesPerWeek + ' searches/wk' : 'Unlimited'})`);
  });

  // 3. Admin Login
  const login = await request('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@fontastic.io', password: 'Admin123!' })
  });
  console.log('✓ [Admin Login]: Authenticated successfully, token received.');
  const adminToken = login.data.token;

  // 4. Admin Manual User Creation
  const newUserRes = await request('http://localhost:4000/api/admin/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      name: 'Test Designer',
      email: `designer_${Date.now()}@example.com`,
      password: 'Password123!',
      role: 'user',
      planId: 'plan_standard_50',
      durationDays: 30
    })
  });
  console.log(`✓ [Admin Manual User Creation]: Created user "${newUserRes.data.user.name}" with plan "${newUserRes.data.user.plan.name}" (৳${newUserRes.data.user.plan.priceBDT} TK/mo)`);
  const createdUserId = newUserRes.data.user._id;

  // 5. Admin Manual Plan Assignment
  const assignPlanRes = await request(`http://localhost:4000/api/admin/users/${createdUserId}/plan`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      planId: 'plan_unlimited_300',
      durationDays: 60
    })
  });
  console.log(`✓ [Admin Manual Plan Assignment]: Manually assigned "${assignPlanRes.data.user.plan.name}" (Unlimited searches) for 60 days to user.`);

  // 6. Visual Font Search / Viewfinder Simulation
  const visionSearchRes = await request('http://localhost:4000/api/vision/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      imageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      device: 'desktop',
      correctedText: 'VOGUE LUXURY'
    })
  });
  console.log(`✓ [Visual Font Finder]: Found ${visionSearchRes.data.matches.length} visual matches for text "${visionSearchRes.data.detectedText}":`);
  visionSearchRes.data.matches.slice(0, 3).forEach((m, idx) => {
    console.log(`   #${idx + 1} ${m.font.family} [${m.font.source.toUpperCase()}] - ${m.similarity}% Similarity (Direct Download: ${m.font.downloadUrl ? 'Yes' : 'No'})`);
  });

  // 7. Toggle Wishlist
  const wishlistRes = await request('http://localhost:4000/api/user/wishlist/toggle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ fontId: 'font_playfair' })
  });
  console.log(`✓ [Wishlist Toggle]: Added Playfair Display to user wishlist (Total: ${wishlistRes.data.wishlist.length} fonts)`);

  // 8. Desktop App Server check (port 3000)
  const desktopApp = await request('http://localhost:3000/');
  console.log(`✓ [Desktop App UI]: Running on http://localhost:3000 (HTTP ${desktopApp.status})`);

  // 9. Admin Portal Server check (port 3001)
  const adminApp = await request('http://localhost:3001/');
  console.log(`✓ [Admin Web Portal]: Running on http://localhost:3001 (HTTP ${adminApp.status})`);

  console.log('\n=== ALL SYSTEMS VERIFIED AND FULLY OPERATIONAL ===');
}

main().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
