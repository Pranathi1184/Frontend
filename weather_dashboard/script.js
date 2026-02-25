// BEST PRACTICE: Store sensitive keys securely (e.g., in a backend or environment variable)
// For this front-end example, we use a placeholder.
const API_KEY = '3d492a3315a4f8e27d543fd62abd8cf8'; 
const CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

// Elements
const bgLayer = document.getElementById("weather-bg");
const cityNameEl = document.getElementById("city-name");
const currentDateEl = document.getElementById("current-day-date");
const tempEl = document.getElementById("temperature");
const weatherIconEl = document.getElementById("weather-icon");
const descriptionEl = document.getElementById("description");
const feelsLikeEl = document.querySelector("#feels-like .highlight-temp");
const windEl = document.getElementById("wind-speed");
const humidityEl = document.getElementById("humidity");
const visibilityEl = document.getElementById("visibility");
const pressureEl = document.getElementById("pressure");
const sunriseEl = document.getElementById("sunrise");
const sunsetEl = document.getElementById("sunset");
const forecastGrid = document.querySelector(".forecast-grid");
const errorMessageEl = document.getElementById("error-message");
const extraCities = document.getElementById("extra-cities");

const searchForm = document.getElementById("city-search");
const searchInput = document.getElementById("city-input");
const geoBtn = document.getElementById("geo-btn");

// ---------- Weather Background Mapping ----------
function getWeatherClass(main, desc) {
  main = main.toLowerCase();
  desc = desc.toLowerCase();

  if (main.includes("clear")) return "weather-clear";
  if (desc.includes("few clouds") || desc.includes("scattered")) return "weather-partlycloudy";
  if (main.includes("clouds") && desc.includes("overcast")) return "weather-overcast";
  if (main.includes("clouds")) return "weather-cloudy";
  if (desc.includes("light rain")) return "weather-lightrain";
  if (desc.includes("heavy rain")) return "weather-heavyrain";
  if (main.includes("rain")) return "weather-rainy";
  if (desc.includes("light snow")) return "weather-lightsnow";
  if (desc.includes("heavy snow")) return "weather-heavysnow";
  if (main.includes("snow")) return "weather-snowy";
  if (main.includes("thunderstorm")) return "weather-thunder";
  if (main.includes("mist") || main.includes("fog") || main.includes("haze")) return "weather-mist";

  return "weather-clear"; // fallback
}

// ---------- Fetch Weather ----------
async function fetchWeather(city, type = "city") {
  try {
    errorMessageEl.classList.add("hidden");
    let url;

    if (type === "coords") {
      const { lat, lon } = city;
      url = `${CURRENT_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    } else {
      url = `${CURRENT_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error("City not found");
    const data = await res.json();

    renderWeather(data);
    fetchForecast(data.coord.lat, data.coord.lon);
  } catch (err) {
    errorMessageEl.textContent = err.message;
    errorMessageEl.classList.remove("hidden");
  }
}

// ---------- Render Main Weather ----------
function renderWeather(data) {
  cityNameEl.textContent = data.name;
  currentDateEl.textContent = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  tempEl.textContent = `${Math.round(data.main.temp)}°C`;
  descriptionEl.textContent = data.weather[0].description;
  weatherIconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  feelsLikeEl.textContent = `${Math.round(data.main.feels_like)}°`;

  windEl.textContent = `${data.wind.speed} km/h`;
  humidityEl.textContent = `${data.main.humidity}%`;
  visibilityEl.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
  pressureEl.textContent = `${data.main.pressure} hPa`;

  const sunrise = new Date(data.sys.sunrise * 1000);
  const sunset = new Date(data.sys.sunset * 1000);
  sunriseEl.textContent = sunrise.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  sunsetEl.textContent = sunset.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // 🌞 vs 🌙 Night mode
  const now = new Date();
  let cls = getWeatherClass(data.weather[0].main, data.weather[0].description);
  if (now < sunrise || now > sunset) {
    cls = cls + "-night"; // switch to night variant
  }
  bgLayer.className = "weather-background " + cls;

  document.getElementById("weather-display").classList.remove("hidden");
}

// ---------- Fetch Forecast ----------
async function fetchForecast(lat, lon) {
  try {
    const res = await fetch(`${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    const data = await res.json();

    const days = {};
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString("en-US", { weekday: "short" });
      const hour = date.getHours();

      if (!days[day] || Math.abs(hour - 12) < Math.abs(days[day].hour - 12)) {
        days[day] = { ...item, hour };
      }
    });

    renderForecast(Object.values(days).slice(0, 5));
  } catch (err) {
    console.error("Forecast error:", err);
  }
}

// ---------- Render Forecast ----------
function renderForecast(items) {
  forecastGrid.innerHTML = "";
  items.forEach(item => {
    const date = new Date(item.dt * 1000);
    const day = date.toLocaleDateString("en-US", { weekday: "short" });
    forecastGrid.innerHTML += `
      <div class="forecast-day-card">
        <p>${day}</p>
        <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="">
        <p>${Math.round(item.main.temp_max)}°C | ${Math.round(item.main.temp_min)}°C</p>
      </div>
    `;
  });
}

// ---------- Other Locations ----------
const otherCities = ["Delhi", "Mumbai"];

async function loadOtherCities() {
  extraCities.innerHTML = "";
  for (const city of otherCities) {
    try {
      // Current weather
      const r = await fetch(`${CURRENT_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`);
      const d = await r.json();

      // Forecast
      const f = await fetch(`${FORECAST_URL}?lat=${d.coord.lat}&lon=${d.coord.lon}&appid=${API_KEY}&units=metric`);
      const fd = await f.json();

      // Today's min/max
      let today = new Date().toLocaleDateString("en-US", { day: "numeric", month: "short" });
      let minTemp = Infinity, maxTemp = -Infinity;

      fd.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayStr = date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
        if (dayStr === today) {
          minTemp = Math.min(minTemp, item.main.temp_min);
          maxTemp = Math.max(maxTemp, item.main.temp_max);
        }
      });

      const condition = d.weather[0].description;
      const temp = Math.round(d.main.temp);

      extraCities.innerHTML += `
        <div class="city-mini">
          <span>${d.name}</span>
          <div class="mini-right">
            <span class="mini-cond">${condition}</span>
            <img src="https://openweathermap.org/img/wn/${d.weather[0].icon}.png" alt="">
            <span>${temp}°C</span>
            <span class="mini-range">(${Math.round(minTemp)}°/${Math.round(maxTemp)}°)</span>
          </div>
        </div>`;
    } catch (err) {
      console.error("Other city error:", err);
    }
  }
}

// ---------- Events ----------
searchForm.addEventListener("submit", e => {
  e.preventDefault();
  const city = searchInput.value.trim();
  if (city) fetchWeather(city, "city");
});

geoBtn.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    pos => fetchWeather({ lat: pos.coords.latitude, lon: pos.coords.longitude }, "coords"),
    () => alert("Location access denied")
  );
});

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  fetchWeather("Bengaluru", "city");
  loadOtherCities();
});
