function mostrarLogro(texto) {
  const toast = document.getElementById("wf-achievement");
  const text = document.getElementById("wf-achievement-text");
  text.textContent = texto;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 4000);
}

let logroMostrado = false;

function comprobarColeccion() {
  const articulos = document.querySelectorAll(".articulo");
  const completados = document.querySelectorAll(".articulo.completado").length;
  if (articulos.length > 0 && completados === articulos.length && !logroMostrado) {
    logroMostrado = true;
    mostrarLogro("Colección completada al 100%");
  }
}

function actualizarProgreso() {
  const articulos = document.querySelectorAll(".articulo");
  const completados = document.querySelectorAll(".articulo.completado").length;

  const total = articulos.length;
  const porcentaje = total ? (completados / total) * 100 : 0;

  document.getElementById("contador").textContent =
    `${completados} / ${total} obtenidos`;

  document.getElementById("barraProgreso").style.width =
    `${porcentaje}%`;
}

function aplicarFiltros() {
  const texto = buscador.value.toLowerCase();
  const estado = filtroEstado.value;
  const articulos = document.querySelectorAll(".articulo");

  articulos.forEach(articulo => {
    const nombre = articulo.querySelector("h2").textContent.toLowerCase();
    const matchesTexto = nombre.includes(texto);
    const matchesEstado = 
      estado === "todos" ||
      (estado === "completado" && articulo.classList.contains("completado")) ||
      (estado === "pendiente" && !articulo.classList.contains("completado"));

    articulo.style.display = matchesTexto && matchesEstado ? "" : "none";
  });
}

fetch("json/Warframe.json")
  .then(res => res.json())
  .then(data => {
    const contenedor = document.getElementById("articulos");
    const fragment = document.createDocumentFragment();

    data.forEach(warframe => {
      const articulo = document.createElement("article");
      articulo.className = warframe.prime
        ? "articulo prime"
        : "articulo";

      articulo.innerHTML = `
        <img src="${warframe.imagen}" alt="${warframe.nombre}">
        <div class="info">
          <h2>${warframe.nombre}</h2>
          <p>${warframe.descripcion}</p>
          <button class="leer">Marcar como conseguido</button>
        </div>
      `;

      const boton = articulo.querySelector(".leer");
      const titulo = warframe.nombre;
      const guardado = localStorage.getItem(titulo);

      if (guardado === "leido") {
        articulo.classList.add("completado");
        boton.textContent = "✓ Conseguido";
      }

      boton.addEventListener("click", () => {
        articulo.classList.toggle("completado");

        const conseguido = articulo.classList.contains("completado");

        boton.textContent = conseguido
          ? "✓ Conseguido"
          : "Marcar como conseguido";

        localStorage.setItem(
          titulo,
          conseguido ? "leido" : "pendiente"
        );

        actualizarProgreso();
        aplicarFiltros();
        comprobarColeccion();
      });

      fragment.appendChild(articulo);
    });

    contenedor.appendChild(fragment);

    actualizarProgreso();
    aplicarFiltros();
    comprobarColeccion();
  });

const buscador = document.getElementById("buscador");
const ordenar = document.getElementById("ordenar");
const contenedor = document.getElementById("articulos");
const filtroEstado = document.getElementById("filtroEstado");

ordenar.addEventListener("change", () => {
  const lista = Array.from(contenedor.children);
  lista.sort((a, b) => {
    const A = a.querySelector("h2").textContent;
    const B = b.querySelector("h2").textContent;
    return ordenar.value === "az" ? A.localeCompare(B) : B.localeCompare(A);
  });
  lista.forEach(item => contenedor.appendChild(item));
});

buscador.addEventListener("input", aplicarFiltros);
filtroEstado.addEventListener("change", aplicarFiltros);
