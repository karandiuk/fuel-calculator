/*
 * Налаштування норм витрати пального.
 * Значення вказані у літрах на 100 км.
 *
 * Щоб додати норми для авто 2 або авто 3, заповніть відповідний
 * об'єкт числами за аналогією з auto1.
 */
const VEHICLES = {
  auto1: {
    name: "Авто 129",
    rates: {
      general: 6.2,
      kyiv: 7.1,
      zhytomyr: 6.8,
      berdychiv: 6.5,
      outside: 5.3
    }
  },

  // Шаблон для авто 2 — замініть null на норми у л/100 км:
  // general: Загальна норма
  // kyiv: Міські умови (Київ)
  // zhytomyr: Міські умови (Житомир)
  // berdychiv: Міські умови (Бердичів)
  // outside: За межами населених пунктів
  auto2: {
    name: "Авто 2",
    rates: {
      general: null,
      kyiv: null,
      zhytomyr: null,
      berdychiv: null,
      outside: null
    }
  },

  // Шаблон для авто 3:
  auto3: {
    name: "Авто 3",
    rates: {
      general: null,
      kyiv: null,
      zhytomyr: null,
      berdychiv: null,
      outside: null
    }
  }
};

const CATEGORIES = [
  { key: "general", label: "Загальна норма" },
  { key: "kyiv", label: "Міські умови (Київ)" },
  { key: "zhytomyr", label: "Міські умови (Житомир)" },
  { key: "berdychiv", label: "Міські умови (Бердичів)" },
  { key: "outside", label: "За межами населених пунктів" }
];

let selectedVehicleKey = "auto1";

const vehiclePage = document.getElementById("vehicle-page");
const distancePage = document.getElementById("distance-page");
const vehicleCards = document.querySelectorAll(".vehicle-card");
const continueButton = document.getElementById("continue-button");
const backButton = document.getElementById("back-button");
const clearButton = document.getElementById("clear-button");
const distanceFields = document.getElementById("distance-fields");

function selectVehicle(key) {
  selectedVehicleKey = key;

  vehicleCards.forEach((card) => {
    const isSelected = card.dataset.vehicle === key;
    card.classList.toggle("selected", isSelected);
    card.setAttribute("aria-pressed", String(isSelected));
  });
}

vehicleCards.forEach((card) => {
  card.addEventListener("click", () => {
    const key = card.dataset.vehicle;
    const vehicle = VEHICLES[key];

    // Не дозволяємо перейти до авто, для якого ще не задані норми.
    const hasRates = vehicle && CATEGORIES.every(
      (category) => Number.isFinite(vehicle.rates[category.key]) && vehicle.rates[category.key] >= 0
    );

    if (!hasRates) return;
    selectVehicle(key);
  });
});

function createDistanceFields(vehicle) {
  distanceFields.innerHTML = "";

  CATEGORIES.forEach((category) => {
    const rate = vehicle.rates[category.key];
    const row = document.createElement("div");
    row.className = "distance-row";

    const label = document.createElement("label");
    label.className = "distance-label";
    label.htmlFor = `distance-${category.key}`;

    const title = document.createElement("strong");
    title.textContent = category.label;

    const norm = document.createElement("small");
    norm.textContent = `Норма: ${rate.toLocaleString("uk-UA", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2
    })} л/100 км`;

    label.append(title, norm);

    const inputWrap = document.createElement("div");
    inputWrap.className = "input-wrap";

    const input = document.createElement("input");
    input.className = "distance-input";
    input.id = `distance-${category.key}`;
    input.name = category.key;
    input.type = "text";
    input.inputMode = "numeric";
    input.autocomplete = "off";
    input.placeholder = "0";
    input.value = "";
    input.setAttribute("aria-label", `${category.label}, кілометри`);

    // Дозволяємо лише цілі невід'ємні числа. Фільтр також обробляє вставлення.
    input.addEventListener("input", () => {
      const cleaned = input.value.replace(/[^0-9]/g, "");
      if (input.value !== cleaned) input.value = cleaned;
      calculateFuel();
    });

    input.addEventListener("keydown", (event) => {
      const allowedKeys = [
        "Backspace", "Delete", "Tab", "Escape", "Enter",
        "ArrowLeft", "ArrowRight", "Home", "End"
      ];
      if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) return;
      if (!/^[0-9]$/.test(event.key)) event.preventDefault();
    });

    const suffix = document.createElement("span");
    suffix.className = "input-suffix";
    suffix.textContent = "км";

    inputWrap.append(input, suffix);

    const rowResult = document.createElement("div");
    rowResult.className = "row-result";

    const resultLabel = document.createElement("span");
    resultLabel.textContent = "Витрата за категорією";

    const resultValue = document.createElement("strong");
    resultValue.id = `fuel-${category.key}`;
    resultValue.textContent = "0,00 л";

    rowResult.append(resultLabel, resultValue);
    row.append(label, inputWrap, rowResult);
    distanceFields.append(row);
  });

  calculateFuel();
}

function readDistance(key) {
  const input = document.getElementById(`distance-${key}`);
  return input ? (Number.parseInt(input.value, 10) || 0) : 0;
}

function formatFuel(value) {
  return value.toLocaleString("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function calculateFuel() {
  const vehicle = VEHICLES[selectedVehicleKey];
  if (!vehicle) return;

  let totalFuel = 0;
  let totalDistance = 0;

  CATEGORIES.forEach((category) => {
    const distance = readDistance(category.key);
    const rate = vehicle.rates[category.key];
    const fuel = (rate / 100) * distance;

    totalFuel += fuel;
    totalDistance += distance;

    const categoryOutput = document.getElementById(`fuel-${category.key}`);
    if (categoryOutput) categoryOutput.textContent = `${formatFuel(fuel)} л`;
  });

  document.getElementById("total-fuel").textContent = formatFuel(totalFuel);
  document.getElementById("total-distance").textContent =
    totalDistance.toLocaleString("uk-UA");
}

function showDistancePage() {
  const vehicle = VEHICLES[selectedVehicleKey];
  document.getElementById("selected-vehicle-name").textContent = vehicle.name;
  createDistanceFields(vehicle);

  vehiclePage.classList.add("hidden");
  distancePage.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showVehiclePage() {
  distancePage.classList.add("hidden");
  vehiclePage.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

continueButton.addEventListener("click", showDistancePage);
backButton.addEventListener("click", showVehiclePage);

clearButton.addEventListener("click", () => {
  CATEGORIES.forEach((category) => {
    const input = document.getElementById(`distance-${category.key}`);
    if (input) input.value = "";
  });
  calculateFuel();
});

selectVehicle("auto1");
