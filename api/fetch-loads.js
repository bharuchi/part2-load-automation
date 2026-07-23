const { CANDIDATE_EMAIL, WALMART_API, sanitizeLoad, upstream, send } = require('./_shared');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
  try {
    const payload = await upstream(WALMART_API);
    const loads = payload.loads.map(sanitizeLoad);
    return send(res, 200, { sourceCount: payload.count, candidateEmail: CANDIDATE_EMAIL, loads });
  } catch (error) {
    return send(res, error.statusCode || 500, { error: error.message, details: error.body });
  }
};
