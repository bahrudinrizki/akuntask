import assert from 'node:assert/strict';

const base = process.env.API_URL ?? 'http://localhost:3000/api/v1';
const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

async function request(path, init = {}, token) {
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers },
  });
  const body = await response.json();
  return { response, body };
}

const registration = await request('/auth/register', {
  method: 'POST',
  body: JSON.stringify({
    companyName: `E2E Closing ${unique}`,
    userName: 'E2E Owner',
    userEmail: `e2e-${unique}@akuntask.test`,
    userPassword: 'password123',
  }),
});
assert.equal(registration.response.status, 201, JSON.stringify(registration.body));
const token = registration.body.accessToken;
assert.ok(token, 'register must return access token');

const onboarding = await request('/onboarding', {}, token);
assert.equal(onboarding.response.status, 200);
assert.equal(onboarding.body.onboardingCompleted, false);
assert.equal(onboarding.body.onboardingStep, 0);

const profile = await request('/onboarding/profile', { method: 'POST', body: JSON.stringify({ industry: 'Retail', address: 'Jl. E2E No. 1' }) }, token);
assert.equal(profile.response.status, 201);
assert.equal(profile.body.onboardingStep, 1);

const template = await request('/onboarding/template', { method: 'POST', body: JSON.stringify({ template: 'PSAK_FULL' }) }, token);
assert.equal(template.response.status, 201);
assert.equal(template.body.onboardingStep, 2);

const warehouse = await request('/onboarding/warehouse', { method: 'POST', body: JSON.stringify({ name: 'Gudang E2E' }) }, token);
assert.equal(warehouse.response.status, 201);
const completed = await request('/onboarding/complete', { method: 'POST' }, token);
assert.equal(completed.response.status, 201);
assert.equal(completed.body.company.onboardingCompleted, true);

const coa = await request('/coa', {}, token);
assert.equal(coa.response.status, 200);
assert.ok(coa.body.length >= 40, 'new company must receive default PSAK COA');
const account = (code) => {
  const value = coa.body.find((item) => item.code === code);
  assert.ok(value, `COA ${code} must exist`);
  return value.id;
};
const kas = account('1101');
const modal = account('3101');
const penjualan = account('4101');
const gaji = account('5201');

for (const journal of [
  { date: '2026-10-01', description: 'Modal awal', lines: [{ coaId: kas, debit: 50_000_000 }, { coaId: modal, credit: 50_000_000 }] },
  { date: '2026-10-15', description: 'Penjualan', lines: [{ coaId: kas, debit: 10_000_000 }, { coaId: penjualan, credit: 10_000_000 }] },
  { date: '2026-10-20', description: 'Beban gaji', lines: [{ coaId: gaji, debit: 3_000_000 }, { coaId: kas, credit: 3_000_000 }] },
]) {
  const result = await request('/journals', { method: 'POST', body: JSON.stringify(journal) }, token);
  assert.equal(result.response.status, 201, JSON.stringify(result.body));
  assert.equal(result.body.totalDebit, result.body.totalCredit);
}

const before = await request('/reports/balance-sheet?asOf=2026-10-31', {}, token);
assert.equal(before.response.status, 200);
assert.equal(before.body.balanced, false, 'balance sheet before closing must expose net income gap');

const closing = await request('/journals/closing', { method: 'POST', body: JSON.stringify({ from: '2026-10-01', to: '2026-10-31' }) }, token);
assert.equal(closing.response.status, 201, JSON.stringify(closing.body));
assert.equal(closing.body.netProfit, 7_000_000);
assert.equal(closing.body.closingJournals.length, 2);
assert.ok(closing.body.closingJournals.every((journal) => journal.status === 'CLOSING'));

const after = await request('/reports/balance-sheet?asOf=2026-10-31', {}, token);
assert.equal(after.response.status, 200);
assert.equal(after.body.assetsTotal, 57_000_000);
assert.equal(after.body.totalLiabilitiesEquity, 57_000_000);
assert.equal(after.body.balanced, true, 'ACC-008 must balance balance sheet after closing');

const profitLoss = await request('/reports/profit-loss?from=2026-10-01&to=2026-10-31', {}, token);
assert.equal(profitLoss.response.status, 200);
assert.equal(profitLoss.body.netProfit, 0, 'revenue and expenses must be zero after closing');

const trialBalance = await request('/reports/trial-balance?asOf=2026-10-31', {}, token);
assert.equal(trialBalance.response.status, 200);
assert.equal(trialBalance.body.balanced, true);
assert.equal(trialBalance.body.totalDebit, trialBalance.body.totalCredit);

const duplicate = await request('/journals/closing', { method: 'POST', body: JSON.stringify({ from: '2026-10-01', to: '2026-10-31' }) }, token);
assert.equal(duplicate.response.status, 400, 'closing same period must be idempotent');

console.log('E2E full flow passed: register → onboarding → journals → ACC-008 close → balanced reports');
