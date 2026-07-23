const { SHV_API, upstream, send } = require('./_shared');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  const loads = req.body?.loads;
  if (!Array.isArray(loads) || !loads.length) return send(res, 400, { error: 'Provide a non-empty loads array.' });
  if (loads.length > 50) return send(res, 400, { error: 'SHV accepts at most 50 loads per request.' });
  try {
    const payload = await upstream(SHV_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loads })
    });
    return send(res, 200, payload);
  } catch (error) {
    return send(res, error.statusCode || 500, { error: error.message, details: error.body });
  }
};
