//Variáveis e selção de elementos
const apiKey = "43d4bdbec6fae6c88d6606981cfe84d3";
const apiUnsplash = "https://source.unsplash.com/1600x900/?";

const cityInput = document.querySelector("#city-input");
const searchBtn = document.querySelector("#search");

const cityElement = document.querySelector("#city");
const tempElement = document.querySelector("#temperature span");
const descElement = document.querySelector("#description");
const iconElement = document.querySelector("#temp_img");

const countryElement = document.querySelector("#country");
const tempMaxElement = document.querySelector("#temp_max");
const tempMinElement = document.querySelector("#temp_min");
const humidityElement = document.querySelector("#humidity");
const windElement = document.querySelector("#wind");

const weatherContainer = document.querySelector("#weather-data");

const errorMessageContainer = document.querySelector("#error-message");
const loader = document.querySelector("#loader");

const suggestionContainer = document.querySelector("#suggestions");
const suggestionButtons = document.querySelectorAll("#suggestions button");

//Funções
const toggleLoader = () => {
  loader.classList.toggle("hide");
};

const getWeatherData = async (city) => {
  const apiWeatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}&lang=pt_br`;

  const res = await fetch(apiWeatherURL);
  const data = await res.json();

  return data;
};

const showErrorMessage = () => {
  errorMessageContainer.classList.remove("hide");
};

const hideInformation = () => {
  errorMessageContainer.classList.add("hide");
  weatherContainer.classList.add("hide");

  suggestionContainer.classList.add("hide");
};

const showWeatherData = async (city) => {
  hideInformation();
  toggleLoader();

  const data = await getWeatherData(city);

  toggleLoader();

  if (data.cod === "404") {
    showErrorMessage();
    return;
  }

  cityElement.innerText = data.name;
  tempElement.innerText = parseInt(data.main.temp);
  descElement.innerText = data.weather[0].description;
  iconElement.setAttribute(
    "src",
    `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
  );

  countryElement.setAttribute(
    "src",
    `https://flagcdn.com/w40/${data.sys.country.toLowerCase()}.png`
  );

  tempMaxElement.innerText = `${Math.round(data.main.temp_max)}°C`;
  tempMinElement.innerText = `${Math.round(data.main.temp_min)}°C`;

  humidityElement.innerText = `${data.main.humidity}%`;
  windElement.innerText = `${Math.round(data.wind.speed * 3.6)} km/h`;

  document.body.style.backgroundImage = `url("${apiUnsplash + city}")`;

  weatherContainer.classList.remove("hide");
};

//Eventos
searchBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const city = cityInput.value;

  showWeatherData(city);
  cityInput.value = "";
});

cityInput.addEventListener("keyup", (e) => {
  if (e.code === "Enter") {
    const city = e.target.value;
    showWeatherData(city);
    cityInput.value = ""; // limpa após Enter também
  }
});

suggestionButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const city = btn.getAttribute("id");

    showWeatherData(city);
  });
});
