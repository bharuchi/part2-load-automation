const RAW_COLUMNS = [
  'load_no',
  'frt_ord_no',
  'shipper_nm',
  'orig_city',
  'orig_st',
  'dest_city',
  'dest_st',
  'shp_dt',
  'del_dt',
  'wgt',
  'mode'
];

const fetchButton = document.querySelector('#fetch-button');
const pushButton = document.querySelector('#push-button');
const errBanner = document.querySelector('#err-banner');
const rawSection = document.querySelector('#raw-section');
const rawHeading = document.querySelector('#raw-heading');
const rawHead = document.querySelector('#raw-head');
const rawBody = document.querySelector('#raw-body');
const resultsSection = document.querySelector('#results-section');
const resultsHeading = document.querySelector('#results-heading');
const resultsList = document.querySelector('#results-list');

let rawLoads = [];

function setError(message) {
  if (!message) {
    errBanner.hidden = true;
    errBanner.textContent = '';
    return;
  }
  errBanner.hidden = false;
  errBanner.textContent = message;
}

function setBusy(button, busy, busyLabel) {
  button.disabled = busy || (button === pushButton && !rawLoads.length);
  if (busy) button.dataset.label = button.dataset.label || button.textContent;
  button.textContent = busy ? busyLabel : (button.dataset.label || button.textContent);
}

function renderRawLoads() {
  rawSection.hidden = false;
  rawHeading.textContent = `Raw tenders from Walmart portal (${rawLoads.length})`;
  rawHead.innerHTML = RAW_COLUMNS.map((col) => `<th>${col}</th>`).join('');

  if (!rawLoads.length) {
    rawBody.innerHTML = `<tr><td class="muted" colspan="${RAW_COLUMNS.length}">No open tenders returned.</td></tr>`;
    return;
  }

  rawBody.innerHTML = rawLoads.map((load) =>
    `<tr>${RAW_COLUMNS.map((col) => `<td>${String(load[col] ?? '')}</td>`).join('')}</tr>`
  ).join('');
}

function renderResults(results) {
  resultsSection.hidden = false;
  const accepted = results.filter((r) => r.status === 'pushed').length;
  resultsHeading.textContent = `Push results (${accepted}/${results.length} accepted)`;

  resultsList.innerHTML = results.map((result) => {
    const status = result.status || 'error';
    const errors = result.errors
      ? `<pre>${escapeHtml(JSON.stringify(result.errors, null, 2))}</pre>`
      : '';
    const message = status !== 'pushed' && result.message
      ? `<div class="errmsg">${escapeHtml(result.message)}</div>`
      : '';

    return `<div class="card ${status}">
      <h3>
        <span class="badge ${status}">${escapeHtml(status)}</span>
        ${escapeHtml(result.load_number || '(no load number)')}
      </h3>
      ${message}
      ${status !== 'pushed' ? errors : ''}
      <div class="kv">Sent to TMS:</div>
      <pre>${escapeHtml(JSON.stringify(result.sent, null, 2))}</pre>
    </div>`;
  }).join('');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

fetchButton.addEventListener('click', async () => {
  setBusy(fetchButton, true, 'Fetching…');
  setError('');
  resultsSection.hidden = true;
  resultsList.innerHTML = '';
  pushButton.disabled = true;
  try {
    const response = await fetch('/api/fetch-loads');
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Fetch failed');
    rawLoads = Array.isArray(body.loads) ? body.loads : [];
    renderRawLoads();
    pushButton.disabled = !rawLoads.length;
  } catch (error) {
    rawLoads = [];
    rawSection.hidden = true;
    setError(error.message);
  } finally {
    setBusy(fetchButton, false);
    if (!rawLoads.length) pushButton.disabled = true;
  }
});

pushButton.addEventListener('click', async () => {
  setBusy(pushButton, true, 'Pushing…');
  setError('');
  try {
    const response = await fetch('/api/push-loads', { method: 'POST' });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Push failed');
    renderResults(body.results || []);
  } catch (error) {
    setError(error.message);
  } finally {
    setBusy(pushButton, false);
  }
});
