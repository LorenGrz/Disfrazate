const lines: readonly string[] = [
  "4.812.337 tiendas revisadas",
  "ignorando Temu por razones legales",
  "encontramos 14 vampiros en Quilmes",
  "Todo por $999.999 no contestó el teléfono",
  "una momia en Once pide cambio exacto",
  "hay un dinosaurio inflable atascado en el ascensor",
  "negociando con un loro en Mercado Pirata",
  "7 bananas sospechosas en Caballito",
];

export function Ticker() {
  return (
    <div
      className="ticker text-small"
      role="group"
      aria-label="Scraping en vivo"
    >
      <div className="ticker-track">
        <ul className="ticker-group">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <ul className="ticker-group" aria-hidden="true">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
