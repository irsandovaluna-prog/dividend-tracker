/* eslint-disable */
import { useState, useEffect, useCallback } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const DIVIDENDS = [
  {id:"2020Q1",lbl:"2020 Q1",decl:"Jan 28, 2020",ex:"Mar 5, 2020",pay:"Mar 31, 2020",amt:1.0225},
  {id:"2020Q2",lbl:"2020 Q2",decl:"Apr 28, 2020",ex:"Jun 4, 2020",pay:"Jun 30, 2020",amt:1.0225},
  {id:"2020Q3",lbl:"2020 Q3",decl:"Jul 28, 2020",ex:"Sep 3, 2020",pay:"Sep 30, 2020",amt:1.0225},
  {id:"2020Q4",lbl:"2020 Q4",decl:"Oct 27, 2020",ex:"Dec 3, 2020",pay:"Jan 7, 2021",amt:1.0225},
  {id:"2021Q1",lbl:"2021 Q1",decl:"Jan 26, 2021",ex:"Mar 4, 2021",pay:"Mar 31, 2021",amt:1.0225},
  {id:"2021Q2",lbl:"2021 Q2",decl:"Apr 27, 2021",ex:"Jun 3, 2021",pay:"Jun 30, 2021",amt:1.075},
  {id:"2021Q3",lbl:"2021 Q3",decl:"Jul 27, 2021",ex:"Sep 2, 2021",pay:"Sep 30, 2021",amt:1.075},
  {id:"2021Q4",lbl:"2021 Q4",decl:"Oct 26, 2021",ex:"Dec 2, 2021",pay:"Jan 7, 2022",amt:1.075},
  {id:"2022Q1",lbl:"2022 Q1",decl:"Jan 25, 2022",ex:"Mar 3, 2022",pay:"Mar 31, 2022",amt:1.075},
  {id:"2022Q2",lbl:"2022 Q2",decl:"Apr 26, 2022",ex:"Jun 2, 2022",pay:"Jun 30, 2022",amt:1.15},
  {id:"2022Q3",lbl:"2022 Q3",decl:"Jul 26, 2022",ex:"Sep 1, 2022",pay:"Sep 30, 2022",amt:1.15},
  {id:"2022Q4",lbl:"2022 Q4",decl:"Oct 25, 2022",ex:"Dec 1, 2022",pay:"Jan 6, 2023",amt:1.15},
  {id:"2023Q1",lbl:"2023 Q1",decl:"Jan 24, 2023",ex:"Mar 2, 2023",pay:"Mar 31, 2023",amt:1.15},
  {id:"2023Q2",lbl:"2023 Q2",decl:"Apr 25, 2023",ex:"Jun 1, 2023",pay:"Jun 30, 2023",amt:1.265},
  {id:"2023Q3",lbl:"2023 Q3",decl:"Jul 25, 2023",ex:"Aug 31, 2023",pay:"Sep 29, 2023",amt:1.265},
  {id:"2023Q4",lbl:"2023 Q4",decl:"Oct 24, 2023",ex:"Nov 30, 2023",pay:"Jan 5, 2024",amt:1.265},
  {id:"2024Q1",lbl:"2024 Q1",decl:"Jan 23, 2024",ex:"Feb 29, 2024",pay:"Apr 1, 2024",amt:1.265},
  {id:"2024Q2",lbl:"2024 Q2",decl:"Apr 23, 2024",ex:"Jun 7, 2024",pay:"Jun 28, 2024",amt:1.355},
  {id:"2024Q3",lbl:"2024 Q3",decl:"Jul 23, 2024",ex:"Sep 6, 2024",pay:"Sep 30, 2024",amt:1.355},
  {id:"2024Q4",lbl:"2024 Q4",decl:"Oct 22, 2024",ex:"Dec 6, 2024",pay:"Jan 6, 2025",amt:1.355},
];

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

export default function App() {
  const [allPrices, setAllPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selId, setSelId] = useState("2024Q4");

  useEffect(() => {
    fetch("/api/prices?ticker=PEP")
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setAllPrices(data);
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const getWindow = useCallback((div) => {
    if (!allPrices.length) return [];
    const exDate = new Date(div.ex);
    return allPrices.filter(row => {
      const d = new Date(row.date);
      const diff = daysBetween(exDate, d);
      return diff >= -30 && diff <= 30;
    }).map(row => ({
      date: new Date(row.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      open: row.open,
      close: row.close,
      diff: daysBetween(exDate, new Date(row.date)),
    }));
  }, [allPrices]);

  const sel = DIVIDENDS.find(d => d.id === selId);
  const window = sel ? getWindow(sel) : [];
  const declDiff = sel ? daysBetween(sel.decl, sel.ex) : 0;
  const payDiff = sel ? daysBetween(sel.ex, sel.pay) : 0;

  const chartData = {
    labels: window.map(r => r.diff === 0 ? "Ex-div" : r.diff > 0 ? `+${r.diff}d` : `${r.diff}d`),
    datasets: [
      { label: "Open", data: window.map(r => r.open), borderColor: "#2a78d6", backgroundColor: "rgba(42,120,214,0.06)", tension: 0.3, pointRadius: 0, pointHoverRadius: 4, fill: true, borderWidth: 2 },
      { label: "Close", data: window.map(r => r.close), borderColor: "#1baf7a", backgroundColor: "rgba(27,175,122,0.06)", tension: 0.3, pointRadius: 0, pointHoverRadius: 4, fill: true, borderWidth: 2 },
    ],
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: c => ` ${c.dataset.label}: $${c.parsed.y.toFixed(2)}` } },
    },
    scales: {
      x: { grid: { color: "#e1e0d9" }, ticks: { color: "#898781", font: { size: 10 }, maxTicksLimit: 13 } },
      y: { grid: { color: "#e1e0d9" }, ticks: { color: "#898781", font: { size: 11 }, callback: v => "$" + v.toFixed(0) } },
    },
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#0b0b0b" }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>Dividend price tracker</h1>
          <span style={{ background: "#E6F1FB", color: "#0C447C", fontSize: 12, fontWeight: 500, padding: "3px 10px", borderRadius: 20 }}>PEP · PepsiCo</span>
        </div>
        <span style={{ fontSize: 11, color: "#898781" }}>5-year history · 2020–2024 · ±30 days per event</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 8, marginBottom: 20 }}>
        {[
          { label: "Events tracked", val: "20", sub: "quarterly · 5 yrs" },
          { label: "Dividend range", val: "$1.02–$1.36", sub: "per share" },
          { label: "Dividend growth", val: "+33%", sub: "2020 → 2024", color: "#1baf7a" },
          { label: "Payout frequency", val: "Quarterly", sub: "Mar · Jun · Sep · Dec" },
        ].map(k => (
          <div key={k.label} style={{ background: "#f5f5f3", borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ fontSize: 11, color: "#898781", marginBottom: 3 }}>{k.label}</div>
            <div style={{ fontSize: 18, fontWeight: 500, color: k.color || "#0b0b0b" }}>{k.val}</div>
            <div style={{ fontSize: 11, color: "#898781", marginTop: 2 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, fontWeight: 500, color: "#52514e", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Select a dividend event</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 6, marginBottom: 16 }}>
        {DIVIDENDS.slice().reverse().map(d => (
          <div key={d.id} onClick={() => setSelId(d.id)}
            style={{ background: selId === d.id ? "#E6F1FB" : "#fff", border: `0.5px solid ${selId === d.id ? "#378ADD" : "#e0dfd8"}`, borderRadius: 8, padding: "7px 10px", cursor: "pointer" }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: selId === d.id ? "#0C447C" : "#0b0b0b" }}>{d.lbl}</div>
            <div style={{ fontSize: 11, color: "#898781", marginTop: 2 }}>Ex: {d.ex}</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#1baf7a", marginTop: 2 }}>${d.amt.toFixed(4)}</div>
          </div>
        ))}
      </div>

      {sel && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16, padding: "8px 12px", background: "#f5f5f3", borderRadius: 8 }}>
          {[
            { dot: "#378ADD", label: "Declaration", val: sel.decl },
            { dot: "#e34948", label: "Ex-dividend", val: sel.ex },
            { dot: "#1baf7a", label: "Pay date", val: sel.pay },
            { dot: null, label: "Dividend", val: `$${sel.amt.toFixed(4)}/share`, green: true },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, marginRight: 8 }}>
              {item.dot && <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.dot, flexShrink: 0 }} />}
              <span style={{ color: "#898781" }}>{item.label}:</span>
              <span style={{ fontWeight: 500, color: item.green ? "#1baf7a" : "#0b0b0b" }}>{item.val}</span>
            </div>
          ))}
        </div>
      )}

      {loading && <div style={{ textAlign: "center", padding: 40, color: "#898781" }}>Loading price data from Yahoo Finance...</div>}
      {error && <div style={{ textAlign: "center", padding: 40, color: "#e34948" }}>Error: {error}</div>}

      {!loading && !error && window.length > 0 && (
        <>
          <div style={{ position: "relative", width: "100%", height: 240, marginBottom: 8 }}>
            <Line data={chartData} options={chartOptions} />
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 20, alignItems: "center" }}>
            {[
              { swatch: "#2a78d6", label: "Open price" },
              { swatch: "#1baf7a", label: "Close price" },
              { line: "#378ADD", label: "Declaration" },
              { line: "#e34948", label: "Ex-dividend" },
              { line: "#1baf7a", label: "Pay date" },
            ].map((l, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#52514e" }}>
                {l.swatch && <div style={{ width: 10, height: 10, borderRadius: 2, background: l.swatch }} />}
                {l.line && <div style={{ width: 2, height: 12, borderRadius: 1, background: l.line }} />}
                {l.label}
              </div>
            ))}
          </div>

          <div style={{ fontSize: 11, fontWeight: 500, color: "#52514e", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Daily price table — ±30 days</div>
          <div style={{ border: "0.5px solid #e0dfd8", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ maxHeight: 320, overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, tableLayout: "fixed" }}>
                <thead>
                  <tr style={{ background: "#f5f5f3", position: "sticky", top: 0 }}>
                    {["#", "Date", "Day", "Open", "Close", "Change", "Change %", "Event"].map(h => (
                      <th key={h} style={{ padding: "7px 10px", textAlign: "left", color: "#898781", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "0.5px solid #e0dfd8" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {window.map((row, i) => {
                    const chg = row.close - row.open;
                    const pct = (chg / row.open) * 100;
                    const isEx = row.diff === 0;
                    const isDecl = Math.abs(row.diff + declDiff) <= 1;
                    const isPay = Math.abs(row.diff - payDiff) <= 1;
                    const bg = isEx ? "#FAEEDA" : isDecl ? "#E6F1FB" : isPay ? "#EAF3DE" : "transparent";
                    const tc = isEx ? "#854F0B" : isDecl ? "#185FA5" : isPay ? "#3B6D11" : "#0b0b0b";
                    const evtLabel = isEx ? "Ex-dividend" : isDecl ? "Declaration" : isPay ? "Pay date" : "";
                    const evtBg = isEx ? "#FAEEDA" : isDecl ? "#E6F1FB" : isPay ? "#EAF3DE" : "";
                    const evtTc = isEx ? "#854F0B" : isDecl ? "#185FA5" : isPay ? "#3B6D11" : "";
                    return (
                      <tr key={i} style={{ background: bg, borderBottom: "0.5px solid #e0dfd8" }}>
                        <td style={{ padding: "6px 10px", color: "#898781" }}>{i + 1}</td>
                        <td style={{ padding: "6px 10px", color: tc }}>{row.date}</td>
                        <td style={{ padding: "6px 10px", color: "#898781", fontSize: 11 }}>{row.diff === 0 ? "0" : row.diff > 0 ? `+${row.diff}` : row.diff}</td>
                        <td style={{ padding: "6px 10px", color: tc }}>${row.open.toFixed(2)}</td>
                        <td style={{ padding: "6px 10px", color: tc }}>${row.close.toFixed(2)}</td>
                        <td style={{ padding: "6px 10px", color: chg >= 0 ? "#1baf7a" : "#e34948" }}>{chg >= 0 ? "+" : "-"}${Math.abs(chg).toFixed(2)}</td>
                        <td style={{ padding: "6px 10px", color: pct >= 0 ? "#1baf7a" : "#e34948" }}>{pct >= 0 ? "+" : ""}{pct.toFixed(2)}%</td>
                        <td style={{ padding: "6px 10px" }}>
                          {evtLabel && <span style={{ background: evtBg, color: evtTc, fontSize: 10, padding: "1px 6px", borderRadius: 3, fontWeight: 500 }}>{evtLabel}</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
