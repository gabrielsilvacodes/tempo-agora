//Variáveis e selção de elementos
const apiKey = "43d4bdbec6fae6c88d6606981cfe84d3";
const apiCountryURl = "";

const cityInput = document.querySelector("#city-input");
const aearchBtn = document.querySelector("search");

const cityElement = document.querySelector("#city");
const tempElement = document.querySelector("#temperature span");
const descElement = document.querySelector("#description");
const iconElement = document.querySelector("#temp_img");

const countryElement = document.querySelector("#country");
const tempMaxElement = document.querySelector("#temp_max");
const tempMinElement = document.querySelector("#temp_min");
const humidityElement = document.querySelector("#humidity");
const windElement = document.querySelector("#wind");

const weatherContainer = document.querySelector("weather-data");

//Funções
const getWeatherData = async (city) => {
  const apiWeatherURL =
    "https://api.openweathermap.org/data/2.5/weather?q={city}&units=metric&appid=${apikey}&lang=pt_br";
};

const showWeatherData = (city) => {};

//Eventos
searchBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const city = cityInput.value;
});
