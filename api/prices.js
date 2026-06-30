const yahooFinance = require('yahoo-finance2').default;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { ticker = 'PEP' } = req.query;
  try {
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    const result = await yahooFinance.historical(ticker, {
      period1: fiveYearsAgo.toISOString().split('T')[0],
      period2: new Date().toISOString().split('T')[0],
      interval: '1d',
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
