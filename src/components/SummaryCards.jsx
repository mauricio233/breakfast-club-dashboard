import { useEffect, useState } from "react";
import { fetchLiveData } from "../api/fetchLiveData";

export default function SummaryCards() {
  const [monInput, setMonInput] = useState(25);
  const [tueInput, setTueInput] = useState(30);

  const [mon, setMon] = useState(25);
  const [tue, setTue] = useState(30);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  async function loadData(m, t) {
    setLoading(true);
    const result = await fetchLiveData(m, t);
    setData(result);
    setLoading(false);
  }

  useEffect(() => {
    loadData(mon, tue);
  }, [mon, tue]);

  if (loading || !data) {
    return (
      <p className="text-center text-gray-500 mt-10 animate-pulse">
        Loading data...
      </p>
    );
  }

  // --- Normalize totals ---
  const totals = data.totals || {};
  const normalizedTotals = {
    paknsave: totals["Pak'nSave"] ?? totals.paknsave ?? 0,
    countdown: totals["Countdown"] ?? totals.countdown ?? 0,
    newworld: totals["New World"] ?? totals.newworld ?? 0,
  };

  const cheapestEntry = Object.entries(normalizedTotals).sort(
    (a, b) => a[1] - b[1]
  )[0];
  const cheapest = cheapestEntry ? cheapestEntry[0] : "paknsave";

  const cheapestName =
    cheapest === "paknsave"
      ? "Pak’nSave"
      : cheapest === "countdown"
      ? "Countdown"
      : "New World";

  const totalChildren = mon + tue;
  const optimalCalories = 2000;
  const actualCalories = Math.round(optimalCalories * (totalChildren / 50));

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      setMon(Number(monInput));
      setTue(Number(tueInput));
    }
  };

  // ✅ Merge monday_items + tuesday_items safely
  const mergedItems = {};
  const monday = data.monday_items || {};
  const tuesday = data.tuesday_items || {};

  for (const [key, val] of Object.entries(monday)) {
    const clean = key.trim().toLowerCase();
    mergedItems[clean] = (mergedItems[clean] || 0) + Number(val);
  }
  for (const [key, val] of Object.entries(tuesday)) {
    const clean = key.trim().toLowerCase();
    mergedItems[clean] = (mergedItems[clean] || 0) + Number(val);
  }

  // ✅ Fix backend typo ("four" → "flour")
  if (mergedItems["four"] && !mergedItems["flour"]) {
    mergedItems["flour"] = mergedItems["four"];
    delete mergedItems["four"];
  }

  // ✅ Units mapping
  const units = {
    milk: "L",
    tea: "kg",
    bread: "units",
    fruit: "pieces",
    oats: "kg",
    yogurt: "kg",
    flour: "kg",
    eggs: "eggs",
    sugar: "kg",
    baking_powder: "packs",
    butter: "g",
    milo: "g",
  };

  return (
    <section className="p-6 space-y-8">
      {/* Mode indicator */}
      {data.mode === "fallback" ? (
        <div className="bg-amber-100 text-amber-700 p-2 rounded text-center text-sm font-medium">
          ⚠️ Using demo data — live supermarket API unavailable
        </div>
      ) : (
        <div className="bg-green-100 text-green-700 p-2 rounded text-center text-sm font-medium">
          ✅ Live supermarket data loaded successfully
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Monday */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center">
          <span className="text-4xl mb-2">🍞</span>
          <h3 className="text-gray-700 font-medium">Children Monday</h3>
          <input
            type="number"
            min="0"
            value={monInput}
            onChange={(e) => setMonInput(e.target.value)}
            onKeyDown={handleKeyPress}
            className="mt-2 w-20 text-center border rounded-md p-1"
          />
        </div>

        {/* Tuesday */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center">
          <span className="text-4xl mb-2">🥞</span>
          <h3 className="text-gray-700 font-medium">Children Tuesday</h3>
          <input
            type="number"
            min="0"
            value={tueInput}
            onChange={(e) => setTueInput(e.target.value)}
            onKeyDown={handleKeyPress}
            className="mt-2 w-20 text-center border rounded-md p-1"
          />
        </div>

        {/* Cheapest supermarket */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center">
          <span className="text-4xl mb-2">🛒</span>
          <h3 className="text-gray-700 font-medium">Cheapest Supermarket</h3>
          <p className="text-orange-600 font-bold text-lg mt-2">{cheapestName}</p>
        </div>

        {/* Estimated total cost */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center">
          <span className="text-4xl mb-2">💰</span>
          <h3 className="text-gray-700 font-medium">Estimated Total Cost</h3>
          <p className="text-orange-600 font-bold text-lg mt-2">
            ${normalizedTotals[cheapest].toFixed(2)}
          </p>
        </div>
      </div>

      {/* Update button */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            setMon(Number(monInput));
            setTue(Number(tueInput));
          }}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          🔄 Update Data
        </button>
      </div>

      {/* Supermarket comparison */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          🏪 Supermarket Comparison
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-center">
          {Object.entries(normalizedTotals).map(([key, value]) => (
            <div
              key={key}
              className={`rounded-xl p-4 border ${
                key === cheapest
                  ? "border-green-400 bg-green-50"
                  : "border-gray-200"
              }`}
            >
              <h4
                className={`font-semibold text-lg ${
                  key === "paknsave"
                    ? "text-green-700"
                    : key === "countdown"
                    ? "text-blue-700"
                    : "text-red-700"
                }`}
              >
                {key === "paknsave"
                  ? "Pak’nSave"
                  : key === "countdown"
                  ? "Countdown"
                  : "New World"}
              </h4>
              <p className="text-xl font-bold">${value.toFixed(2)}</p>
              {key === cheapest && (
                <p className="text-green-700 text-sm mt-1">✅ Cheapest Option</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Product List with rounded quantities */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          🧾 Product List ({data.mode === "fallback" ? "Demo" : "Live"})
        </h3>

        {Object.keys(mergedItems).length > 0 ? (
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(mergedItems).map(([item, qty], i) => {
              const unit = units[item] || "";
              const roundedQty = Math.round(qty); // 🔹 Redondea valores

              return (
                <div
                  key={i}
                  className="p-3 bg-amber-50 rounded-lg text-sm text-gray-800"
                >
                  <strong>{item}</strong> — {roundedQty} {unit}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 italic">No products available.</p>
        )}
      </div>

      {/* Calories Overview */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          🍎 Calories Overview
        </h3>
        <p className="text-gray-700">
          <strong>Optimal Calories:</strong> {optimalCalories} kcal
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Actual Calories:</strong> {actualCalories} kcal
        </p>
        <div className="w-full bg-orange-100 rounded-full h-3">
          <div
            className="bg-orange-500 h-3 rounded-full"
            style={{
              width: `${Math.min(
                (actualCalories / optimalCalories) * 100,
                100
              )}%`,
            }}
          ></div>
        </div>
      </div>
    </section>
  );
}
