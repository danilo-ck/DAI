import { useState } from "react";
import Navegacion from "./components/Navegacion";
import Resultados from "./components/Resultados";

export default function App() {
  const [busqueda, setBusqueda] = useState("");

  const handleInput = (evt) => {
    const value = evt.target.value;
    setBusqueda(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navegacion onInput={handleInput} value={busqueda} />
      <Resultados de={busqueda} />
    </div>
  );
}
