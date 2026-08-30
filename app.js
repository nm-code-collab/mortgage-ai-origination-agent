const $ = (id) => document.getElementById(id);
const fields = [
  ['name', 'Borrower name'], ['income', 'Monthly gross income'], ['debts', 'Monthly debt payments'],
  ['housing', 'Estimated monthly housing payment'], ['assets', 'Liquid assets'], ['employment', 'Employment status']
];
const moneyFields = new Set(['income', 'debts', 'housing', 'assets']);

function formatMoney(value) { return `$${Number(value).toLocaleString('en-US', { maximumFractionDigits: 2 })}`; }
function validNumber(value) { return value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0; }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]); }
function addItems(id, values, empty) {
  $(id).innerHTML = (values.length ? values : [empty]).map(v => `<li>${escapeHtml(v)}</li>`).join('');
}
function inputValue(name) { return new FormData($('intake-form')).get(name).trim(); }

function analyze() {
  const data = Object.fromEntries(fields.map(([key]) => [key, inputValue(key)]));
  const docIncome = $('doc-income').value.trim();
  const docAssets = $('doc-assets').value.trim();
  const policy = $('policy').value.trim();
  const known = [], missing = [], conflicts = [], assumptions = [], questions = [], escalations = [];

  fields.forEach(([key, label]) => {
    const val = data[key];
    if (!val) { missing.push(label); questions.push(`Please provide your ${label.toLowerCase()}.`); }
    else if (moneyFields.has(key) && !validNumber(val)) { conflicts.push(`${label} must be a non-negative number; the provided value cannot be used.`); escalations.push(`Validate the ${label.toLowerCase()} entry.`); }
    else known.push(`${label}: ${moneyFields.has(key) ? formatMoney(val) : val}`);
  });
  if (data.income && !docIncome) { missing.push('Documented monthly gross income'); questions.push('Please provide a document supporting monthly gross income.'); }
  if (data.assets && !docAssets) { missing.push('Documented liquid assets'); questions.push('Please provide a document supporting liquid assets.'); }
  [['income', docIncome, 'Monthly gross income'], ['assets', docAssets, 'Liquid assets']].forEach(([key, doc, label]) => {
    if (data[key] && doc && validNumber(data[key]) && validNumber(doc) && Number(data[key]) !== Number(doc)) {
      conflicts.push(`${label}: borrower provided ${formatMoney(data[key])}; source document shows ${formatMoney(doc)}.`);
      escalations.push(`Resolve the ${label.toLowerCase()} discrepancy before relying on it.`);
    }
  });
  if (!policy) { missing.push('Provided mortgage policy'); escalations.push('No policy text was provided, so no policy guidance was applied.'); }
  if (data.employment === 'Self-employed') escalations.push('Self-employment requires human review of income documentation and applicable policy.');
  if (!escalations.length) escalations.push('A loan professional must validate the file and make any lending decision.');
  assumptions.push('None. The assistant did not fill, estimate, or infer any missing financial value.');

  const needed = ['income', 'debts', 'housing'];
  let calculation;
  if (needed.every(key => validNumber(data[key]))) {
    const dti = ((Number(data.debts) + Number(data.housing)) / Number(data.income)) * 100;
    calculation = `<p><strong>Debt-to-income ratio: ${dti.toFixed(1)}%</strong></p><p>(${formatMoney(data.debts)} debts + ${formatMoney(data.housing)} housing) ÷ ${formatMoney(data.income)} gross monthly income.</p><p>This is a calculation, not an approval or eligibility result.</p>`;
  } else calculation = '<p>Not calculated. Gross income, monthly debts, and housing payment must each be known, numeric values.</p>';

  addItems('known-list', known, 'No confirmed intake values yet.');
  addItems('missing-list', missing, 'No missing fields identified from this intake.');
  addItems('conflict-list', conflicts, 'No conflicts identified from entered values.');
  addItems('assumption-list', assumptions, 'No assumptions.');
  $('calculation').innerHTML = calculation;
  addItems('questions-list', questions, 'No additional questions generated from the entered fields.');
  $('policy-result').textContent = policy ? `Policy text is available for human review: “${policy}” No automated policy conclusion is made in this prototype.` : 'No policy text was provided. The assistant cannot retrieve or apply a policy.';
  addItems('escalation-list', escalations, 'Human review is always required.');
  $('results').classList.remove('hidden');
  $('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

$('analyze').addEventListener('click', analyze);
$('load-demo').addEventListener('click', () => {
  const demo = {name:'Jordan Lee', income:'8500', debts:'650', housing:'2800', assets:'42000', employment:'Employed'};
  Object.entries(demo).forEach(([key, value]) => { $('intake-form').elements[key].value = value; });
  $('doc-income').value = '8100'; $('doc-assets').value = '42000'; $('doc-note').value = 'Pay stub and bank statement reviewed';
  $('policy').value = 'Illustrative policy: Documented income must be reviewed by an authorized loan professional. This text does not establish eligibility.';
  analyze();
});
