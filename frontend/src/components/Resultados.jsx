import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => {
  if (!r.ok) throw new Error(`Error ${r.status}`);
  return r.json();
});

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-pink-400 rounded-full animate-spin"></div>
        <div className="absolute inset-2 bg-slate-900 rounded-full"></div>
        <div className="absolute inset-3 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full animate-pulse"></div>
      </div>
      <p className="text-white font-semibold text-lg">Cargando productos...</p>
    </div>
  );
}

function CardProducto({ p }) {
  const title = p.title || p.nombre || "Producto";
  const img = p.image || p.url_img || "";
  const link = p.link || p.url || "#";

  const isDiscounted = !!p.is_discounted && typeof p.discounted_price === "number" && p.discounted_price > 0;
  const price = isDiscounted ? p.discounted_price : p.price;
  const priceOld = isDiscounted ? p.price : null;

  const unit = p.unit_price_text || p.price_text || "";

  const handleAddToCart = (e) => {
    e.preventDefault();
    window.location.href = `/al_carrito/${encodeURIComponent(p._id)}`;
  };

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
      {/* Badge de descuento */}
      {isDiscounted && (
        <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          ⭐ -20%
        </div>
      )}

      {/* Imagen */}
      <a href={link} target="_blank" rel="noreferrer" className="block relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="h-40 flex items-center justify-center relative">
          <img className="w-32 h-32 object-contain group-hover:scale-110 transition-transform duration-300" src={img} alt={title} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      </a>

      {/* Contenido */}
      <div className="p-4">
        <a href={link} target="_blank" rel="noreferrer" className="block">
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-pink-600 transition">
            {title}
          </h3>
        </a>

        {/* Precio */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-pink-600 text-transparent bg-clip-text">
            {typeof price === "number" ? `${price.toFixed(2)} €` : (p.price_text || "Precio s/d")}
          </span>
          {typeof priceOld === "number" && (
            <span className="text-xs text-gray-400 line-through">
              {priceOld.toFixed(2)} €
            </span>
          )}
        </div>

        {/* Unidad */}
        {unit && <p className="text-xs text-gray-500 mt-1">{unit}</p>}

        {/* Botón */}
        <button
          onClick={handleAddToCart}
          className="w-full mt-4 py-2 px-4 bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          🛒 Añadir al carro
        </button>
      </div>
    </div>
  );
}

export default function Resultados({ de }) {
  const q = (de || "").trim();

  if (q.length < 3) {
    return null;
  }

  const url = `/api/busqueda-anticipada/${encodeURIComponent(q)}`;
  const { data, error, isLoading } = useSWR(url, fetcher);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-500/20 border border-red-500 text-red-100 px-6 py-4 rounded-xl backdrop-blur-sm">
          ⚠️ {error.message || "Error en la búsqueda"}
        </div>
      </div>
    );
  }

  const items = Array.isArray(data?.items) ? data.items : [];
  const count = typeof data?.count === "number" ? data.count : items.length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Resumen de resultados */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Resultados para "<span className="bg-gradient-to-r from-indigo-400 to-pink-400 text-transparent bg-clip-text">{q}</span>"
        </h2>
        <p className="text-indigo-200 flex items-center gap-2">
          <span className="inline-block w-8 h-8 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {count}
          </span>
          producto{count !== 1 ? "s" : ""} encontrado{count !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Grid de productos */}
      {items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔎</div>
          <p className="text-white text-lg font-semibold">No encontramos productos</p>
          <p className="text-indigo-200 mt-2">Intenta con otra búsqueda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {items.map((p) => (
            <CardProducto key={p._id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
