import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => {
  if (!r.ok) throw new Error(`Error ${r.status}`);
  return r.json();
});

function Spinner() {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <div className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-gray-700 animate-spin"></div>
      Cargando…
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
    console.log("Añadir al carrito:", p._id);
    // Aquí puedes implementar la lógica del carrito
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition overflow-hidden">
      <a href={link} target="_blank" rel="noreferrer" className="block">
        <div className="h-32 flex items-center justify-center bg-gray-50">
          <img className="w-28 h-28 object-contain" src={img} alt={title} />
        </div>
      </a>

      <div className="p-3">
        <div className="text-sm text-gray-900 leading-snug line-clamp-3 min-h-[3.5rem]">
          {title}
        </div>

        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-gray-900">
              {typeof price === "number" ? `${price.toFixed(2)} €` : (p.price_text || "Precio s/d")}
            </span>

            {typeof priceOld === "number" && (
              <span className="text-xs text-gray-400 line-through">
                {priceOld.toFixed(2)} €
              </span>
            )}
          </div>

          <div className="text-xs text-gray-500 mt-1">{unit}</div>

          {isDiscounted && (
            <div className="mt-2">
              <span className="inline-block text-xs font-semibold text-red-700 bg-red-100 px-2 py-1 rounded-full">
                Rebajado
              </span>
            </div>
          )}
        </div>

        <div className="mt-3">
          <button
            onClick={handleAddToCart}
            className="block w-full text-center text-sm rounded-xl px-3 py-2 border border-yellow-600 text-yellow-800 hover:bg-yellow-100 transition"
          >
            Añadir al carro
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Resultados({ de }) {
  const q = (de || "").trim();

  if (q.length < 3) {
    return null;
  }

  const url = `http://localhost:8000/api/busqueda-anticipada/${encodeURIComponent(q)}`;
  const { data, error, isLoading } = useSWR(url, fetcher);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 mt-6 text-sm text-red-600">
        {error.message || "Error"}
      </div>
    );
  }

  const items = Array.isArray(data?.items) ? data.items : [];
  const count = typeof data?.count === "number" ? data.count : items.length;

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="mt-6">
        <p className="text-sm text-gray-700">
          Resultados para "<span className="font-semibold">{q}</span>":{" "}
          <span className="font-semibold text-gray-900">{count}</span>
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500 mt-4">No hay resultados.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {items.map((p) => (
            <CardProducto key={p._id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
