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

  const totalChildren = mon + tue;
  const kcalPerChild = 450;
  const optimalCalories = kcalPerChild * totalChildren;

  // Base food plan
  const mergedItems = {};
  mergedItems["milk"] = totalChildren * 0.3;
  mergedItems["fruit"] = totalChildren * 1;
  mergedItems["yogurt"] = totalChildren * 0.1;
  mergedItems["oats"] = totalChildren * 0.1;
  mergedItems["bread"] = totalChildren * 1;

  const milkLiters = mergedItems["milk"];
  const oatsKg = mergedItems["oats"];
  mergedItems["milo"] = milkLiters * 50;
  mergedItems["sugar"] = (milkLiters * 10 + oatsKg * 50) / 1000;
  mergedItems["flour"] = (tue * 25) / 1000;
  mergedItems["eggs"] = Math.ceil(tue * 0.25);
  mergedItems["butter"] = tue * 8;
  mergedItems["baking_powder"] = tue * 5;

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

  const handleLeftoverChange = (item, value) => {
    if (value === "") setLeftovers((p) => ({ ...p, [item]: "" }));
    else setLeftovers((p) => ({ ...p, [item]: Number(value) }));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      setMon(Number(monInput));
      setTue(Number(tueInput));
      loadData(mon, tue);
    }
  };

  const toBuyItems = Object.entries(mergedItems).reduce((acc, [item, qty]) => {
    const leftover =
      leftovers[item] === "" || leftovers[item] == null
        ? 0
        : Number(leftovers[item]);
    const toBuy = Math.max(qty - leftover, 0);
    const displayQty =
      item === "eggs" || item === "bread"
        ? Math.round(qty)
        : Math.round(qty * 100) / 100;
    const displayToBuy =
      item === "eggs" || item === "bread"
        ? Math.round(toBuy)
        : Math.round(toBuy * 100) / 100;
    acc[item] = { qty: displayQty, toBuy: displayToBuy };
    return acc;
  }, {});

  const baseTotal = normalizedTotals[cheapest] || 0;
  const totalRatio =
    Object.entries(toBuyItems).reduce((sum, [key, val]) => {
      const planned = mergedItems[key] || 0;
      return sum + (planned > 0 ? val.toBuy / planned : 0);
    }, 0) / Object.keys(mergedItems).length;
  const adjustedTotal = Math.max(baseTotal * totalRatio, 0.01);

  const totalLeftoverRatio =
    Object.entries(leftovers).reduce((sum, [item, val]) => {
      const planned = mergedItems[item] || 0;
      return sum + (planned > 0 ? (Number(val) || 0) / planned : 0);
    }, 0) / Object.keys(mergedItems).length;
  const actualCalories = Math.round(optimalCalories * (1 - totalLeftoverRatio));

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
          <h3 className="text-gray-700 font-medium">Estimated Total Cost (To Buy)</h3>
          <p className="text-orange-600 font-bold text-lg mt-2">
            ${adjustedTotal.toFixed(2)}
          </p>
        </div>
      </div>

      {/* 🏪 Supermarket Comparison */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          🏪 Supermarket Comparison
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-center">
          {Object.entries(normalizedTotals).map(([key, value]) => (
            <div
              key={key}
              className={`rounded-xl p-4 border ${
                key === cheapest ? "border-yellow-400 bg-yellow-50" : "border-gray-200"
              }`}
            >
              <h4
                className={`font-semibold text-lg ${
                  key === "paknsave"
                    ? "text-yellow-600"
                    : key === "countdown"
                    ? "text-green-700"
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
                <p className="text-yellow-600 text-sm mt-1">✅ Cheapest Option</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 🧾 Product List + To Buy */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          🧾 Product List — Needed, Leftover & To Buy
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(toBuyItems).map(([item, val], i) => {
            const unit = units[item] || "";
            const leftover = leftovers[item] ?? "";
            return (
              <div
                key={i}
                className="flex justify-between items-center bg-amber-50 p-3 rounded-lg text-sm text-gray-800"
              >
                <div>
                  <strong>{item}</strong> — {val.qty} {unit}
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-gray-600 text-xs">Leftover:</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={leftover}
                    onChange={(e) => handleLeftoverChange(item, e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="w-16 text-center border rounded-md p-1 text-xs"
                  />
                  <div className="bg-green-50 px-2 py-1 rounded text-xs font-semibold text-green-700">
                    To Buy: {val.toBuy} {unit}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🍎 Calories */}
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
          , <em>Food and Nutrition Guidelines for Healthy Children and Young People (Aged 2–18 years)</em>.  
          Recommendation: breakfast ≈ <strong>450 kcal per child</strong> (20–25 % of daily energy needs).
        </p>
      </div>
    </section>
  );
}
