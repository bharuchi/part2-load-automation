const CANDIDATE_EMAIL = 'taha_bharuchi@hotmail.com';
const WALMART_API = 'https://wmt-freight-portal.vercel.app/api/sap/loads';
const SHV_API = 'https://shv-logistics-tms.vercel.app/api/sor/loads';

function cleanText(value) {
  return String(value ?? '').trim();
}

function toShvDate(value) {
  const digits = cleanText(value).replace(/\D/g, '');
  if (!/^\d{8}$/.test(digits)) throw new Error(`Invalid Walmart date: ${value}`);
  return `${digits.slice(2, 4)}${digits.slice(0, 2)}${digits.slice(4)}`;
}

function toWeight(value) {
  const digits = cleanText(value).replace(/\D/g, '');
  const weight = Number(digits);
  if (!Number.isSafeInteger(weight) || weight <= 0) throw new Error(`Invalid Walmart weight: ${value}`);
  return weight;
}

function equipmentFor(mode) {
  return cleanText(mode).toUpperCase() === 'AMBIENT' ? "Dry Van 53'" : "Reefer 53'";
}

function sanitizeLoad(load) {
  return {
    load_number: cleanText(load.load_no),
    bol_number: cleanText(load.frt_ord_no),
    shipper_name: cleanText(load.shipper_nm),
    origin_city: cleanText(load.orig_city),
    origin_state: cleanText(load.orig_st),
    destination_city: cleanText(load.dest_city),
    destination_state: cleanText(load.dest_st),
    ship_date: toShvDate(load.shp_dt),
    delivery_date: toShvDate(load.del_dt),
    weight: toWeight(load.wgt),
    equipment_type: equipmentFor(load.mode)
  };
}

async function upstream(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${CANDIDATE_EMAIL}`,
      ...(options.headers || {})
    }
  });
  const body = await response.json();
  if (!response.ok) {
    const error = new Error(body.message || body.error || `Upstream request failed (${response.status})`);
    error.statusCode = response.status;
    error.body = body;
    throw error;
  }
  return body;
}

function send(res, status, body) {
  res.status(status).json(body);
}

module.exports = {
  CANDIDATE_EMAIL,
  WALMART_API,
  SHV_API,
  sanitizeLoad,
  upstream,
  send
};
