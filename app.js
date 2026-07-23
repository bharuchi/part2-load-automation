const fetchButton = document.querySelector('#fetch-button');
const pushButton = document.querySelector('#push-button');
const status = document.querySelector('#status');
const loadsBody = document.querySelector('#loads-body');
const fetchedCount = document.querySelector('#fetched-count');
const sanitizedCount = document.querySelector('#sanitized-count');
const pushedCount = document.querySelector('#pushed-count');
const emailNote = document.querySelector('#email-note');
const responsePanel = document.querySelector('#response-panel');
const responseMeta = document.querySelector('#response-meta');
const apiResponse = document.querySelector('#api-response');

let sanitizedLoads = [];

function setStatus(message, type = 'neutral') {
  status.textContent = message;
  status.dataset.type = type;
}

function setBusy(button, busy, label) {
  button.disabled = busy;
  if (busy) button.dataset.label = button.textContent;
  button.textContent = busy ? label : button.dataset.label || button.textContent;
}

function showApiResponse(payload, meta = '', type = 'neutral') {
  responsePanel.hidden = false;
  responseMeta.textContent = meta;
  apiResponse.dataset.type = type;
  apiResponse.textContent = typeof payload === 'string'
    ? payload
    : JSON.stringify(payload, null, 2);
}

function clearApiResponse() {
  responsePanel.hidden = true;
  responseMeta.textContent = '';
  apiResponse.textContent = '';
  apiResponse.dataset.type = 'neutral';
}

function route(load) {
  return `${load.origin_city}, ${load.origin_state} → ${load.destination_city}, ${load.destination_state}`;
}

function row(load) {
  return `<tr>
    <td>${load.load_number}</td>
    <td>${load.bol_number}</td>
    <td>${route(load)}</td>
    <td>${load.ship_date} / ${load.delivery_date}</td>
    <td>${load.weight.toLocaleString()} lbs</td>
    <td>${load.equipment_type}</td>
  </tr>`;
}

function renderLoads() {
  sanitizedCount.textContent = sanitizedLoads.length;
  loadsBody.innerHTML = sanitizedLoads.length
    ? sanitizedLoads.map(row).join('')
    : '<tr><td colspan="6" class="empty">No valid loads were returned.</td></tr>';
}

async function readJson(response) {
  const body = await response.json();
  if (!response.ok) {
    const error = new Error(body.error || body.message || `Request failed (${response.status})`);
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return body;
}

fetchButton.addEventListener('click', async () => {
  setBusy(fetchButton, true, 'Fetching…');
  pushButton.disabled = true;
  clearApiResponse();
  setStatus('Fetching all open Walmart tenders…');
  try {
    const body = await readJson(await fetch('/api/fetch-loads'));
    sanitizedLoads = body.loads;
    fetchedCount.textContent = body.sourceCount;
    pushedCount.textContent = '0';
    emailNote.textContent = `Authenticated as ${body.candidateEmail}`;
    renderLoads();
    pushButton.disabled = !sanitizedLoads.length;
    setStatus(`${sanitizedLoads.length} load${sanitizedLoads.length === 1 ? '' : 's'} sanitized and ready to push.`, 'success');
  } catch (error) {
    sanitizedLoads = [];
    renderLoads();
    setStatus(error.message, 'error');
  } finally {
    setBusy(fetchButton, false);
  }
});

pushButton.addEventListener('click', async () => {
  setBusy(pushButton, true, 'Pushing…');
  setStatus(`Pushing ${sanitizedLoads.length} SHV-ready load${sanitizedLoads.length === 1 ? '' : 's'}…`);
  try {
    const response = await fetch('/api/push-loads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loads: sanitizedLoads })
    });
    const body = await response.json();
    showApiResponse(body, `POST /api/push-loads → ${response.status}`, response.ok ? 'neutral' : 'error');

    if (!response.ok) {
      throw Object.assign(new Error(body.error || body.message || `Request failed (${response.status})`), { body });
    }

    pushedCount.textContent = body.accepted?.length || 0;
    const rejected = body.rejected || [];
    setStatus(rejected.length
      ? `${body.accepted?.length || 0} accepted; ${rejected.length} rejected.`
      : `${body.accepted?.length || 0} load${body.accepted?.length === 1 ? '' : 's'} accepted by SHV.`, rejected.length ? 'error' : 'success');
  } catch (error) {
    if (error.body) showApiResponse(error.body, 'POST /api/push-loads failed', 'error');
    else showApiResponse({ error: error.message }, 'POST /api/push-loads failed', 'error');
    setStatus(error.message, 'error');
  } finally {
    setBusy(pushButton, false);
  }
});
