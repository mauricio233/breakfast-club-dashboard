// src/api/fetchLiveData.js
export async function fetchLiveData(mon, tue) {
  const totalKids = mon + tue;
  const url = `https://breakfast-club.onrender.com/jit/plan?mon=${mon}&tue=${tue}&live=true`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const data = await res.json();

    console.log("✅ Live API data loaded:", data); // 👈 Verás esto en la consola

    // ✅ Si el backend tiene monday_items y tuesday_items (estructura real del API)
    if (data.monday_items || data.tuesday_items) {
      return {
        mode: "live",
        monday_items: data.monday_items || {},
        tuesday_items: data.tuesday_items || {},
        totals: data.totals || {},
        cheapest: data.cheapest || null,
      };
    }

    // ⚠️ Fallback si el formato no coincide
    throw new Error("Unexpected API structure");

  } catch (err) {
    console.warn("⚠️ Using fallback demo data:", err.message);

    // DEMO PRODUCTS (offline fallback)
    const baseProducts = [
      { name: "Milk 2L", unit: "bottles", baseQty: 5, prices: { paknsave: 4.2, countdown: 4.6, newworld: 4.5 } },
      { name: "Bread Loaf", unit: "units", baseQty: 10, prices: { paknsave: 1.9, countdown: 2.1, newworld: 2.0 } },
      { name: "Bananas", unit: "kg", baseQty: 6, prices: { paknsave: 3.5, countdown: 3.9, newworld: 3.8 } },
      { name: "Butter", unit: "packs", baseQty: 2, prices: { paknsave: 5.2, countdown: 5.8, newworld: 5.6 } },
      { name: "Yogurt 1kg", unit: "tubs", baseQty: 3, prices: { paknsave: 4.8, countdown: 5.1, newworld: 5.0 } },
      { name: "Eggs (12)", unit: "boxes", baseQty: 3, prices: { paknsave: 7.5, countdown: 7.9, newworld: 7.8 } },
    ];

    const scaleFactor = totalKids / 50;
    const items = baseProducts.map((p) => ({
      ...p,
      qty: Math.max(1, Math.round(p.baseQty * scaleFactor)),
    }));

    const totals = { paknsave: 0, countdown: 0, newworld: 0 };
    items.forEach((p) => {
      totals.paknsave += p.qty * p.prices.paknsave;
      totals.countdown += p.qty * p.prices.countdown;
      totals.newworld += p.qty * p.prices.newworld;
    });

    return { items, totals, mode: "fallback" };
  }
}
