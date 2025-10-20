export default function Header() {
  // Force date in English regardless of browser language
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="bg-amber-100 border-b border-amber-200 p-4 flex justify-between items-center shadow-sm">
      <h1 className="text-2xl font-semibold text-amber-800">
        🥣 Breakfast Club Dashboard
      </h1>
      {/* Capitalize the first letter of the weekday */}
      <span className="text-sm text-amber-700">
        {today.charAt(0).toUpperCase() + today.slice(1)}
      </span>
    </header>
  );
}
