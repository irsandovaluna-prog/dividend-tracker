module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { ticker = 'PEP' } = req.query;
  try {
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    const period1 = Math.floor(fiveYearsAgo.getTime() / 1000);
    const period2 = Math.floor(Date.now() / 1000);
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${period1}&period2=${period2}&interval=1d`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const json = await response.json();
    const quotes = json.chart.result[0];
    const timestamps = quotes.timestamp;
    const ohlc = quotes.indicators.quote[0];
    const result = timestamps.map((ts, i) => ({
      date: new Date(ts * 1000).toISOString().split('T')[0],
      open: ohlc.open[i],
      close: ohlc.close[i],
    })).filter(r => r.open && r.close);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
