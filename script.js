const API_KEY = "YOUR_API_KEY_HERE";
const BASE = "https://api.openweathermap.org/data/2.5";
const ICON = "https://openweathermap.org/img/wn";

let unit = "metric";
let theme = "light";

const el = {
  input: document.getElementById("searchInput"),
  search: document.getElementById("searchBtn"),
  location: document.getElementById("locationBtn"),
  unitBtn: document.getElementById("unitBtn"),
  themeBtn: document.getElementById("themeBtn"),

  current: document.getElementById("current"),
  city: document.getElementById("city"),
  desc: document.getElementById("description"),
  temp: document.getElementById("temp"),
  icon: document.getElementById("icon"),
  feels: document.getElementById("feels"),
  humidity: document.getElementById("humidity"),
  wind: document.getElementById("wind"),

  hourlySection: document.getElementById("hourlySection"),
  hourly: document.getElementById("hourly"),

  dailySection: document.getElementById("dailySection"),
  daily: document.getElementById("daily"),
};

// EVENTS
el.search.onclick = () => fetchCity(el.input.value);
el.unitBtn.onclick = toggleUnit;
el.themeBtn.onclick = toggleTheme;
el.location.onclick = getLocation;

// FETCH BY CITY
async function fetchCity(city) {
  if (!city) return;

  const [current, forecast] = await Promise.all([
    fetch(`${BASE}/weather?q=${city}&units=${unit}&appid=${API_KEY}`).then(r => r.json()),
    fetch(`${BASE}/forecast?q=${city}&units=${unit}&appid=${API_KEY}`).then(r => r.json())
  ]);

  renderCurrent(current);
  renderHourly(forecast.list.slice(0,6));
  renderDaily(forecast.list);
}

// CURRENT WEATHER
function renderCurrent(data) {
  el.current.classList.remove("hidden");

  el.city.textContent = `${data.name}, ${data.sys.country}`;
  el.desc.textContent = data.weather[0].description;
  el.temp.textContent = `${Math.round(data.main.temp)}°`;
  el.icon.src = `${ICON}/${data.weather[0].icon}@2x.png`;

  el.feels.textContent = `Feels: ${Math.round(data.main.feels_like)}°`;
  el.humidity.textContent = `Humidity: ${data.main.humidity}%`;
  el.wind.textContent = `Wind: ${data.wind.speed} ${unit === "metric" ? "m/s" : "mph"}`;
}

// HOURLY
function renderHourly(list) {
  el.hourlySection.classList.remove("hidden");
  el.hourly.innerHTML = "";

  list.forEach(h => {
    const div = document.createElement("div");
    div.className = "hour-card";
    div.innerHTML = `
      <p>${new Date(h.dt*1000).getHours()}:00</p>
      <img src="${ICON}/${h.weather[0].icon}.png">
      <p>${Math.round(h.main.temp)}°</p>
    `;
    el.hourly.appendChild(div);
  });
}

// DAILY
function renderDaily(list) {
  el.dailySection.classList.remove("hidden");
  el.daily.innerHTML = "";

  const days = {};
  list.forEach(i => {
    const d = new Date(i.dt*1000).toDateString();
    if (!days[d]) days[d] = [];
    days[d].push(i);
  });

  Object.keys(days).slice(0,5).forEach(day => {
    const temps = days[day].map(x => x.main.temp);
    const card = document.createElement("div");
    card.className = "daily-card";
    card.innerHTML = `
      <p>${day.split(" ")[0]}</p>
      <p>${Math.round(Math.max(...temps))}° / ${Math.round(Math.min(...temps))}°</p>
    `;
    el.daily.appendChild(card);
  });
}

// LOCATION
function getLocation() {
  navigator.geolocation.getCurrentPosition(pos => {
    fetchCityByCoords(pos.coords.latitude, pos.coords.longitude);
  });
}

async function fetchCityByCoords(lat, lon) {
  const data = await fetch(
    `${BASE}/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`
  ).then(r => r.json());
  fetchCity(data.name);
}

// UNIT
function toggleUnit() {
  unit = unit === "metric" ? "imperial" : "metric";
  el.unitBtn.textContent = unit === "metric" ? "°C" : "°F";
}

// THEME
function toggleTheme() {
  theme = theme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme);
}
