// public/js/cambio-precio.js
(() => {
  const API_BASE = "/api/productos"; // ajusta si tu prefix es otro

  function euro(n) {
    if (typeof n !== "number" || isNaN(n)) return "";
    return `${n.toFixed(2)} €`;
  }

  async function actualizarPrecio(productId, precio, esRebaja) {
    // Construir payload según tu API
    const body = esRebaja
      ? { is_discounted: true, discounted_price: precio, price: undefined } // opcionalmente no toques price
      : { is_discounted: false, discounted_price: 0, price: precio };

    // Limpia undefined para enviar JSON limpio
    Object.keys(body).forEach(k => body[k] === undefined && delete body[k]);

    const res = await fetch(`${API_BASE}/${encodeURIComponent(productId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json;charset=utf-8" },
      body: JSON.stringify(body),
      credentials: "same-origin" // para cookies JWT si las usas en el mismo origen
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Error ${res.status}`);
    }
    return res.json();
  }

  function renderEstado(el, msg, ok = true) {
    el.textContent = msg;
    el.classList.remove("text-muted", "text-danger", "text-success");
    el.classList.add(ok ? "text-success" : "text-danger");
  }

  function disableUi(btn, input, check, disabled) {
    btn.disabled = disabled;
    input.disabled = disabled;
    if (check) check.disabled = disabled;
    btn.textContent = disabled ? "Guardando..." : "Cambiar precio";
  }

  function refrescarPrecioVisual(cardRoot, updated) {
    // Encuentra spans de precio dentro de la card para reflejar visualmente
    const priceNew = cardRoot.querySelector(".price-new");
    const priceOld = cardRoot.querySelector(".price-old");
    const price = cardRoot.querySelector(".price");

    const isDiscounted = !!updated.is_discounted && Number(updated.discounted_price) > 0;
    const base = typeof updated.price === "number" ? updated.price : null;
    const disc = typeof updated.discounted_price === "number" ? updated.discounted_price : null;

    if (isDiscounted && disc != null) {
      // Mostrar precio rebajado
      if (price) price.remove();
      if (!priceNew) {
        // Si tu plantilla no tenía price-new/price-old, crea elementos mínimos
        const pWrap = cardRoot.querySelector(".card-text") || cardRoot;
        const badge = document.createElement("span");
        badge.className = "badge bg-danger me-2";
        badge.textContent = "Rebajado";
        const spanNew = document.createElement("span");
        spanNew.className = "price-new";
        spanNew.textContent = euro(disc);
        pWrap.innerHTML = "";
        pWrap.appendChild(badge);
        pWrap.appendChild(spanNew);
        if (base != null) {
          const spanOld = document.createElement("span");
          spanOld.className = "price-old ms-2";
          spanOld.textContent = euro(base);
          pWrap.appendChild(spanOld);
        }
      } else {
        priceNew.textContent = euro(disc);
        if (base != null) {
          if (priceOld) priceOld.textContent = euro(base);
        }
      }
    } else {
      // Mostrar precio normal (sin rebaja)
      if (priceNew) priceNew.remove();
      if (priceOld) priceOld.remove();
      // Si había badge "Rebajado" manual, límpialo
      const badge = cardRoot.querySelector(".badge.bg-danger");
      if (badge) badge.remove();

      if (price) {
        if (base != null) price.textContent = euro(base);
      } else {
        const pWrap = cardRoot.querySelector(".card-text") || cardRoot;
        const span = document.createElement("span");
        span.className = "price";
        span.textContent = euro(base ?? 0);
        pWrap.innerHTML = "";
        pWrap.appendChild(span);
      }
    }
  }

  function onClickCambiar(evt) {
    const btn = evt.currentTarget;
    const box = btn.closest(".edit-price");
    if (!box) return;

    const input = box.querySelector(".precio-input");
    const check = box.querySelector(".es-rebaja");
    const estado = box.querySelector(".estado-accion") || { textContent: "", classList: { add() {}, remove() {} } };

    const id = box.dataset.productId;
    const raw = input.value.trim();
    const price = Number(raw.replace(",", ".")); // por si escriben coma
    const esRebaja = !!(check && check.checked);

    if (!isFinite(price) || price < 0) {
      renderEstado(estado, "Precio inválido", false);
      return;
    }

    disableUi(btn, input, check, true);
    renderEstado(estado, "Guardando...", true);

    actualizarPrecio(id, price, esRebaja)
      .then(updated => {
        renderEstado(estado, "Precio actualizado", true);

        // Actualiza el área visual de precio (la card contenedora)
        const card = btn.closest(".card") || document;
        refrescarPrecioVisual(card, updated);

        // Actualiza el input con lo devuelto por el servidor
        const effective = (updated.is_discounted && updated.discounted_price > 0)
          ? updated.discounted_price : updated.price;
        input.value = (typeof effective === "number" ? effective.toFixed(2) : "");
      })
      .catch(err => {
        console.error(err);
        renderEstado(estado, err.message || "Error actualizando", false);
      })
      .finally(() => {
        disableUi(btn, input, check, false);
      });
  }

  function init() {
    // Selecciona todos los botones de cambio
    const botones = document.querySelectorAll(".cambiar-precio-btn");
    botones.forEach(btn => btn.addEventListener("click", onClickCambiar));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

