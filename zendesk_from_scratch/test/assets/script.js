// Inicializa el cliente de Zendesk
var client = ZAFClient.init();
console.log("Zendesk client initialized.");

client.invoke("resize", { width: "100%", height: "400px" });
console.log("Sidebar resized.");

// Ruta del archivo JSON (dentro de la carpeta assets)
const jsonFilePath = "assets/clients_data.json";
let customerData = [];

const apiUrl = "http://localhost:3000/customers";

fetch(apiUrl)
  .then(response => {
    console.log("Fetch response status:", response.status);
    if (!response.ok) throw new Error("Error fetching data from the mock API.");
    return response.json();
  })
  .then(data => {
    customerData = Object.values(data); // Ensure we capture all entries
    console.log("Datos cargados desde la API simulada:", customerData);
  })
  .catch(error => {
    console.error("Error al cargar los datos:", error);
    const tableContainer = document.getElementById("customer-data");
    tableContainer.innerHTML = "<p>Error al cargar los datos del cliente.</p>";
  });


// Evento: Cuando se registra la app
client.on("app.registered", function () {
  console.log("App registered.");
  loadCustomerData();
});

// Función: Cargar los datos del cliente
function loadCustomerData() {
  client.get("ticket.requester.name").then(function (data) {
    const customerName = data["ticket.requester.name"];
    console.log("Nombre del cliente obtenido del ticket:", customerName);

    if (!customerName) {
      console.error("El nombre del cliente no está disponible.");
      displayCustomerData([]); // Mostrar mensaje sin datos
      return;
    }

    const filteredData = searchCustomerData(customerName);
    console.log("Datos filtrados:", filteredData);
    displayCustomerData(filteredData);
  }).catch(error => {
    console.error("Error al obtener el nombre del cliente:", error);
  });
}

// Función: Buscar los datos del cliente por nombre
function searchCustomerData(name) {
  console.log("Buscando datos para el cliente:", name);

  const filtered = customerData.filter(customer =>
    customer.Nombre.toLowerCase().includes(name.toLowerCase())
  );

  console.log("Resultados encontrados:", filtered);
  return filtered;
}

// Función: Mostrar los datos del cliente en una tabla
function displayCustomerData(data) {
  console.log("Mostrando datos en la tabla:", data);

  const tableContainer = document.getElementById("customer-data");
  tableContainer.innerHTML = "";

  if (!data || data.length === 0) {
    console.warn("No se encontraron datos para mostrar.");
    tableContainer.innerHTML = "<p>No se encontraron datos para este cliente.</p>";
    return;
  }

  const table = document.createElement("table");
  table.classList.add("customer-table");

  const headerRow = document.createElement("tr");
  ["Cliente ID", "Nombre", "Email", "Teléfono", "Dirección", "Perfil de cliente", "Recomendaciones"].forEach(header => {
    const th = document.createElement("th");
    th.innerText = header;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  data.forEach(row => {
    const tr = document.createElement("tr");
    Object.values(row).forEach(value => {
      const td = document.createElement("td");
      td.innerText = value || "-";
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  console.log("Tabla creada correctamente:", table);
  tableContainer.appendChild(table);
  console.log("Tabla agregada al contenedor.");
}
