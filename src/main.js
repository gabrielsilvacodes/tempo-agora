// Variáveis e seleção de elementos
const apiKey = import.meta.env.VITE_API_KEY;
const unsplashKey = import.meta.env.VITE_UNSPLASH_KEY;
const apiUnsplash =
  "https://api.unsplash.com/photos/random?orientation=landscape&query=";

const cityInput = document.querySelector("#city-input");
const searchBtn = document.querySelector("#search");
const weatherForm = document.querySelector("#weather-form");

const cityElement = document.querySelector("#city");
const tempElement = document.querySelector("#temperature span");
const descElement = document.querySelector("#description");
const iconElement = document.querySelector("#temp_img");

const countryElement = document.querySelector("#country");
const tempMaxElement = document.querySelector("#temp_max");
const tempMinElement = document.querySelector("#temp_min");
const humidityElement = document.querySelector("#humidity");
const windElement = document.querySelector("#wind");
const updatedTimeElement = document.querySelector("#updated-time");

const weatherContainer = document.querySelector("#weather-data");
const errorMessageContainer = document.querySelector("#error-message");
const loader = document.querySelector("#loader");

const suggestionContainer = document.querySelector("#suggestions");
const suggestionButtons = document.querySelectorAll("#suggestions button");

const themeToggleBtn = document.querySelector("#toggle-theme");

// Funções utilitárias
const showLoader = () => loader.classList.remove("hide");
const hideLoader = () => loader.classList.add("hide");
const showSuggestions = () => suggestionContainer.classList.remove("hide");
const hideSuggestions = () => suggestionContainer.classList.add("hide");

const showAlert = (msg) => {
  errorMessageContainer.innerHTML = `<p>${msg}</p>`;
  errorMessageContainer.classList.remove("hide");
};

const hideErrorMessage = () => errorMessageContainer.classList.add("hide");
const hideWeatherData = () => weatherContainer.classList.add("hide");
const showWeatherDataContainer = () =>
  weatherContainer.classList.remove("hide");

const normalizeCity = (city) =>
  city
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();

const getWeatherData = async (city) => {
  showLoader();
  try {
    const apiWeatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}&lang=pt_br`;
    const res = await fetch(apiWeatherURL);
    return await res.json();
  } catch (err) {
    console.error("Erro ao buscar dados da API:", err);
    return { cod: "error" };
  } finally {
    hideLoader();
  }
};

const getCityImage = async (city) => {
  try {
    const res = await fetch(
      `${apiUnsplash}${encodeURIComponent(city)}&client_id=${unsplashKey}`
    );
    const data = await res.json();
    return data?.urls?.regular || "/fallback.jpg";
  } catch (err) {
    console.warn("Erro ao buscar imagem da cidade, fallback usado.");
    return "/fallback.jpg";
  }
};

const showWeatherData = async (city) => {
  hideErrorMessage();
  hideWeatherData();
  hideSuggestions();

  const data = await getWeatherData(city);

  if (data.cod === "404" || data.cod === "error") {
    showAlert("❌ Não foi possível encontrar a cidade.");
    return;
  }

  cityElement.innerText = data.name;
  tempElement.innerText = data.main.temp
    .toFixed(1)
    .toString()
    .replace(".", ",");
  descElement.innerText = data.weather[0].description;

  iconElement?.setAttribute(
    "src",
    `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
  );
  countryElement?.setAttribute(
    "src",
    `https://flagcdn.com/w40/${data.sys.country.toLowerCase()}.png`
  );
  tempMaxElement.innerText = `${data.main.temp_max
    .toFixed(1)
    .toString()
    .replace(".", ",")}°C`;
  tempMinElement.innerText = `${data.main.temp_min
    .toFixed(1)
    .toString()
    .replace(".", ",")}°C`;
  humidityElement.innerText = `${data.main.humidity}%`;
  windElement.innerText = `${(data.wind.speed * 3.6)
    .toFixed(1)
    .toString()
    .replace(".", ",")} km/h`;

  const normalized = normalizeCity(city);
  const cityImage = await getCityImage(normalized);
  document.body.style.backgroundImage = `url("${cityImage}")`;

  updatedTimeElement.innerText = `Última atualização: ${getFormattedDateTime()}`;
  updatedTimeElement.classList.remove("hide");

  showWeatherDataContainer();
};

const handleSearch = () => {
  const city = cityInput.value.trim();
  if (city !== "") {
    showWeatherData(city);
    cityInput.value = "";
  }
};

const getFormattedDateTime = () => {
  const now = new Date();
  return now.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const loadThemePreference = () => {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme) {
    document.body.classList.toggle("dark", savedTheme === "dark");
  } else {
    // Usa o tema do navegador se nada estiver salvo
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    document.body.classList.toggle("dark", prefersDark);
  }

  updateThemeIcon();
};

// Alterna entre dark e light
const toggleTheme = () => {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  updateThemeIcon();
};

// Atualiza o ícone do botão
const updateThemeIcon = () => {
  const icon = themeToggleBtn.querySelector("i");
  const isDark = document.body.classList.contains("dark");

  icon.classList.toggle("fa-moon", !isDark); // ícone lua (claro)
  icon.classList.toggle("fa-sun", isDark); // ícone sol (escuro)
};

// Eventos
searchBtn.addEventListener("click", (e) => {
  e.preventDefault();
  handleSearch();
});

weatherForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleSearch();
});

cityInput.addEventListener("keyup", (e) => {
  if (e.code === "Enter") {
    handleSearch();
  }
});

suggestionButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const city = btn.getAttribute("id");
    showWeatherData(city);
  });
});

themeToggleBtn.addEventListener("click", toggleTheme);

// Inicial
showSuggestions();
loadThemePreference();
