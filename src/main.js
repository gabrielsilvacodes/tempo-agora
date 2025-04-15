// VARIÁVEIS GLOBAIS

const apiKey = import.meta.env.VITE_API_KEY;
const unsplashKey = import.meta.env.VITE_UNSPLASH_KEY;
const unsplashURL =
  "https://api.unsplash.com/photos/random?orientation=landscape&query=";

const el = {
  cityInput: document.querySelector("#city-input"),
  searchBtn: document.querySelector("#search"),
  weatherForm: document.querySelector("#weather-form"),
  city: document.querySelector("#city"),
  tempValue: document.querySelector(".temp-value"),
  tempUnit: document.querySelector(".temp-unit"),
  desc: document.querySelector("#description"),
  icon: document.querySelector("#temp_img"),
  country: document.querySelector("#country"),
  tempMax: document.querySelector("#temp_max"),
  tempMin: document.querySelector("#temp_min"),
  humidity: document.querySelector("#humidity"),
  wind: document.querySelector("#wind"),
  updatedTime: document.querySelector("#updated-time"),
  weatherBox: document.querySelector("#weather-data"),
  errorBox: document.querySelector("#error-message"),
  loader: document.querySelector("#loader"),
  suggestions: document.querySelector("#suggestions"),
  suggestionButtons: document.querySelectorAll("#suggestions button"),
  themeToggleBtn: document.querySelector("#toggle-theme"),
};

// UTILITÁRIOS

const formatTemp = (temp) => temp.toFixed(1).replace(".", ",");
const show = (el) => el?.classList.remove("hide");
const hide = (el) => el?.classList.add("hide");
const showAlert = (msg) => {
  el.errorBox.innerHTML = `<p>${msg}</p>`;
  show(el.errorBox);
};
const normalizeCity = (city) =>
  city
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
const getFormattedDateTime = () =>
  new Date().toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });

// API: CLIMA

async function getWeatherData(city) {
  show(el.loader);
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}&lang=pt_br`;
    const res = await fetch(url);
    return await res.json();
  } catch (error) {
    console.error("Erro ao buscar dados da API:", error);
    return { cod: "error" };
  } finally {
    hide(el.loader);
  }
}

// API: IMAGEM

async function getCityImage(city) {
  const normalized = normalizeCity(city);

  try {
    const res = await fetch(
      `${unsplashURL}${encodeURIComponent(normalized)}&client_id=${unsplashKey}`
    );
    const data = await res.json();
    return data?.urls?.regular || "/fallback.jpg";
  } catch {
    console.warn("Erro ao buscar imagem da cidade. Usando fallback.");
    return "/fallback.jpg";
  }
}

// DOM: CLIMA

function renderWeatherInfo(data) {
  if (!data?.main || !data?.weather || !data?.sys) {
    showAlert("❌ Erro ao exibir os dados. Verifique a resposta da API.");
    return;
  }

  const { name, main, weather, sys, wind } = data;

  el.city.textContent = name;
  el.tempValue.textContent = formatTemp(main.temp);
  el.tempUnit.textContent = "°C";
  el.desc.textContent = weather[0].description;
  el.icon.src = `http://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
  el.icon.alt = weather[0].description;
  el.country.src = `https://flagcdn.com/w40/${sys.country.toLowerCase()}.png`;
  el.country.alt = `Bandeira de ${sys.country}`;

  el.tempMax.textContent = `${formatTemp(main.temp_max)}°C`;
  el.tempMin.textContent = `${formatTemp(main.temp_min)}°C`;
  el.humidity.textContent = `${main.humidity}%`;
  el.wind.textContent = `${formatTemp(wind.speed * 3.6)} km/h`;

  el.updatedTime.textContent = `Última atualização: ${getFormattedDateTime()}`;
  show(el.updatedTime);
}

// BUSCA COMPLETA

async function showWeatherData(city) {
  [el.errorBox, el.weatherBox, el.suggestions].forEach(hide);

  const data = await getWeatherData(city);
  if (data.cod === "404" || data.cod === "error")
    return showAlert("❌ Cidade não encontrada. Tente novamente.");

  renderWeatherInfo(data);

  const image = await getCityImage(normalizeCity(city));
  document.body.style.backgroundImage = `url("${image}")`;

  show(el.weatherBox);
}

// BUSCA

function handleSearch() {
  const city = el.cityInput.value.trim();
  if (!city) return;
  showWeatherData(city);
  el.cityInput.value = "";
  el.cityInput.focus();
}

// TEMA

function updateThemeIcon() {
  const icon = el.themeToggleBtn.querySelector("i");
  const isDark = document.body.classList.contains("dark");

  icon.classList.toggle("fa-moon", !isDark);
  icon.classList.toggle("fa-sun", isDark);
  el.themeToggleBtn.setAttribute(
    "aria-label",
    isDark ? "Alternar para modo claro" : "Alternar para modo escuro"
  );
}

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  updateThemeIcon();
}

function loadThemePreference() {
  const saved = localStorage.getItem("theme");
  const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.body.classList.toggle(
    "dark",
    saved === "dark" || (!saved && prefers)
  );
  updateThemeIcon();
}

// EVENTOS

el.searchBtn.addEventListener("click", (e) => {
  e.preventDefault();
  handleSearch();
});

el.weatherForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleSearch();
});

el.cityInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") handleSearch();
});

el.suggestionButtons.forEach((btn) => {
  const city = btn.id;
  btn.setAttribute("aria-label", `Buscar clima de ${city}`);
  btn.addEventListener("click", () => showWeatherData(city));
});

el.themeToggleBtn.addEventListener("click", toggleTheme);

// INICIALIZAÇÃO

loadThemePreference();
show(el.suggestions);
