const { WALMART_API, SHV_API, sanitizeLoad, upstream, send } = require('./_shared');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });

  try {
    const walmart = await upstream(WALMART_API);
    const results = [];

    for (const raw of walmart.loads || []) {
      let sent;
      try {
        sent = sanitizeLoad(raw);
      } catch (error) {
        results.push({
          status: 'error',
          load_number: String(raw?.load_no ?? '').trim() || '(no load number)',
          message: error.message,
          sent: null
        });
        continue;
      }

      try {
        const payload = await upstream(SHV_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ load: sent })
        });
        const rejected = payload.rejected || [];
        if (rejected.length) {
          results.push({
            status: 'rejected',
            load_number: sent.load_number,
            message: payload.message,
            errors: rejected[0]?.errors || rejected,
            sent
          });
        } else {
          results.push({
            status: 'pushed',
            load_number: sent.load_number,
            message: payload.message,
            sent
          });
        }
      } catch (error) {
        results.push({
          status: 'error',
          load_number: sent.load_number,
          message: error.message,
          errors: error.body,
          sent
        });
      }
    }

    const accepted = results.filter((r) => r.status === 'pushed').length;
    return send(res, 200, {
      status: 'ok',
      message: `${accepted}/${results.length} load(s) accepted into the system of record.`,
      accepted: results.filter((r) => r.status === 'pushed').map((r) => r.load_number),
      rejected: results.filter((r) => r.status !== 'pushed').map((r) => ({
        load_number: r.load_number,
        errors: r.errors || [r.message]
      })),
      results
    });
  } catch (error) {
    return send(res, error.statusCode || 500, { error: error.message, details: error.body });
  }
};
