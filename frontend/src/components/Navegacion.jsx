export default function Navegacion({ onInput, value }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Búsqueda anticipada</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Buscar productos</label>

        <div className="relative">
          <input
            id="q"
            type="search"
            placeholder="Escribe al menos 3 caracteres…"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-28 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            value={value}
            onInput={onInput}
          />
        </div>

        <p className="text-sm text-gray-500 mt-3">
          Escribe 3 o más caracteres para ver coincidencias.
        </p>
      </div>
    </div>
  );
}
