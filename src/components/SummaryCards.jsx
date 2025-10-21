import { useEffect, useState } from "react";
import { fetchLiveData } from "../api/fetchLiveData";

export default function SummaryCards() {
  const [monInput, setMonInput] = useState(25);
  const [tueInput, setTueInput] = useState(30);
  const [mon, setMon] = useState(25);
  const [tue, setTue] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [leftovers, setLeftovers] = useState({});

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

  // ✅ Total children both days
  const totalChildren = mon + tue;

  // 🔥 Calories
  const kcalPerChild = 450;
  const optimalCalories = kcalPerChild * totalChildren;

  // 🧮 Items base
  const mergedItems = {};

  // 🧁 Shared items (both days)
  mergedItems["milk"] = totalChildren * 0.3; // L
  mergedItems["fruit"] = totalChildren * 1; // pieces
  mergedItems["yogurt"] = totalChildren * 0.1; // kg
  mergedItems["oats"] = totalChildren * 0.1; // kg
  mergedItems["bread"] = totalChildren * 1; // ✅ units for both days

  // 🧮 Milo and Sugar (shared)
  const milkLiters = mergedItems["milk"];
  const oatsKg = mergedItems["oats"];
  mergedItems["milo"] = milkLiters * 50; // g
  mergedItems["sugar"] = (milkLiters * 10 + oatsKg * 50) / 1000; // kg

  // 🧇 Waffles ingredients (Tuesday only)
  mergedItems["flour"] = (tue * 25) / 1000; // kg
  mergedItems["eggs"] = Math.ceil(tue * 0.25); // units
  mergedItems["butter"] = tue * 8; // g
  mergedItems["baking_powder"] = tue * 5; // g

  // ✅ Units
  const units = {
    milk: "L",
    fruit: "pieces",
    yogurt: "kg",
    oats: "kg",
    bread: "units",
    milo: "g",
    sugar: "kg",
    flour: "kg",
    eggs: "eggs",
    butter: "g",
    baking_powder: "g",
  };

  // 🧮 Leftovers input
  const handleLeftoverChange = (item, value) => {
    setLeftovers((prev) => ({ ...prev, [item]: Number(value) || 0 }));
  };

  const totalLeftoverRatio =
    Object.entries(leftovers).reduce((sum, [item, val]) => {
      const planned = mergedItems[item] || 0;
      return sum + (planned > 0 ? val / planned : 0);
    }, 0) / Object.keys(mergedItems).length;

  const actualCalories = Math.round(optimalCalories * (1 - totalLeftoverRatio));

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      setMon(Number(monInput));
      setTue(Number(tueInput));
    }
  };

  return (
    <section className="p-6 space-y-8">
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

        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center">
          <span className="text-4xl mb-2">🛒</span>
          <h3 className="text-gray-700 font-medium">Cheapest Supermarket</h3>
          <p className="text-orange-600 font-bold text-lg mt-2">{cheapestName}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center">
          <span className="text-4xl mb-2">💰</span>
          <h3 className="text-gray-700 font-medium">Estimated Total Cost</h3>
          <p className="text-orange-600 font-bold text-lg mt-2">
            ${normalizedTotals[cheapest].toFixed(2)}
          </p>
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          🧾 Product List ({data.mode === "fallback" ? "Demo" : "Live"}) & Leftovers
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(mergedItems).map(([item, qty], i) => {
            const unit = units[item] || "";
            const displayQty =
              item === "eggs" || item === "bread"
                ? Math.round(qty)
                : Math.round(qty * 100) / 100;

            return (
              <div
                key={i}
                className="flex justify-between items-center bg-amber-50 p-3 rounded-lg text-sm text-gray-800"
              >
                <div>
                  <strong>{item}</strong> — {displayQty} {unit}
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-gray-600 text-xs">Leftover:</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={leftovers[item] || ""}
                    onChange={(e) => handleLeftoverChange(item, e.target.value)}
                    className="w-16 text-center border rounded-md p-1 text-xs"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calories */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          🍎 Calories Overview
        </h3>
        <p className="text-gray-700">
          <strong>Optimal Calories:</strong> {optimalCalories} kcal
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Actual (Consumed) Calories:</strong> {actualCalories} kcal
        </p>
        <div className="w-full bg-orange-100 rounded-full h-3">
          <div
            className={`h-3 rounded-full ${
              actualCalories > optimalCalories * 0.9
                ? "bg-green-500"
                : actualCalories > optimalCalories * 0.6
                ? "bg-orange-400"
                : "bg-red-500"
            }`}
            style={{
              width: `${Math.min(
                (actualCalories / optimalCalories) * 100,
                100
              )}%`,
            }}
          ></div>
        </div>

        <p className="text-gray-500 text-sm mt-2 italic">
          Source:{" "}
          <a
            href="https://www.health.govt.nz/publication/food-and-nutrition-guidelines-children-and-young-people-aged-2-18-years"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Ministry of Health NZ (2012)
          </a>
          , <em>Food and Nutrition Guidelines for Healthy Children and Young
          People (Aged 2–18 years)</em>. Recommendation: breakfast should provide
          approximately <strong>450 kcal per child</strong> (20–25% of daily
          energy needs).
        </p>
      </div>
    </section>
  );
}
