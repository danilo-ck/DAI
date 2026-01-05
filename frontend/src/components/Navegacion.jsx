export default function Navegacion({ onInput, value }) {
  return (
    <div className="relative">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-16 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-3 drop-shadow-lg">🔍 Búsqueda Anticipada</h1>
            <p className="text-indigo-100 text-lg">Encuentra productos al instante escribiendo solo 3 caracteres</p>
          </div>

          {/* Input de búsqueda mejorado */}
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-pink-400 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-white rounded-2xl p-2 shadow-2xl">
                <input
                  id="q"
                  type="search"
                  placeholder="Busca productos... (mín. 3 caracteres)"
                  className="w-full px-6 py-4 text-gray-800 placeholder-gray-400 rounded-xl border-0 focus:outline-none focus:ring-0 bg-white"
                  value={value}
                  onInput={onInput}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-600 text-2xl">✨</div>
              </div>
            </div>
            <p className="text-indigo-100 text-sm mt-4 text-center">
              💡 Escribe y obtén resultados instantáneos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
