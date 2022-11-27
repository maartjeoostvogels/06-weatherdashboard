const WEATHER_API_BASE_URL = 'https://api.openweathermap.org';
const WEATHER_API_KEY = '707c8398dd088c4758c51be5e6996e2b';
const MAX_DAILY_FORECAST = 5;

const recentLocations = [];

const onSubmitSearchForm = (event) => {
    event.preventDefault();
    const userLocation = locationInput.value;
    if (userLocation === '') {
        setLocationError('Please enter a location');
    } else {
        lookupLocation(userLocation);
    }
}

const clearError = () => {
    const errorDisplay = document.getElementById('error');
    errorDisplay.textContent = '';
}

const setLocationError = (text) => {
    const errorDisplay = document.getElementById('error');
    errorDisplay.textContent = text;

    setTimeout(clearError, 3000);
}

const addRecentLocation = (location) => {
    if (!location) return;

    recentLocations.push(location);

    localStorage.setItem('recentLocations', JSON.stringify(recentLocations));
    updateRecentLocationsList();
}

const updateRecentLocationsList = () => {
    const recentLocationsList = document.getElementById('recent-locations');
    recentLocationsList.innerHTML = '';
    recentLocations.forEach(location => {
        const newLocation = document.createElement('li');
        newLocation.classList.add('recent');
        newLocation.addEventListener('click', onClickRecentLocation);
        console.log(location);
        newLocation.textContent = location.name;

        recentLocationsList.appendChild(newLocation);
    });
}

const loadRecentLocations = () => {
    const locations = localStorage.getItem('recentLocations');
    if (locations) {
        recentLocations.push(...JSON.parse(locations));
        updateRecentLocationsList();
    }
}

const onClickRecentLocation = (event) => {
    const locationName = event.target.textContent;

    recentLocations.filter(location=> {
        if (location.name === locationName) {
            displayWeather(location);
        }
    })
}

const lookupLocation = (search) => {
    var apiUrl = `${WEATHER_API_BASE_URL}/geo/1.0/direct?q=${search}&limit=5&appid=${WEATHER_API_KEY}`;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const location = data[0];
            console.log(location)
            addRecentLocation(location);
            displayWeather(location);
        })
}

const displayCurrentWeather = (weatherData) => {
    const currentWeather = weatherData.current;
    const formattedDate = new Date(currentWeather.dt * 1000).toLocaleDateString('en-GB', {dateStyle: 'short'});

    document.getElementById('location-name').textContent += ` (${formattedDate})`;
    document.getElementById('temperature').textContent = `${currentWeather.temp}*`;
    document.getElementById('wind-speed').textContent = `${currentWeather.wind_speed}MPH`;
    document.getElementById('humidity').textContent = `${currentWeather.humidity}%`;
    document.getElementById('uv-index').textContent = `${currentWeather.uvi}`;
}

const displayWeatherForecast = (weatherData) => {
    const dailyData = weatherData.daily;

    document.getElementById('forecast').style.display = 'block';

    const forecastList = document.getElementById('forecast');
    forecastList.innerHTML = '';

    for (let i = 0; i < MAX_DAILY_FORECAST; i++) {
        const dailyForecast = dailyData[i];
        const day = new Date(dailyForecast.dt * 1000).toLocaleDateString('en-GB', {dateStyle: 'short'});
        const temp = `${dailyForecast.temp.day} *`;
        const humidity = `${dailyForecast.humidity} %`;
        const wind = `${dailyForecast.wind_speed} MPH`;

        const newForecast = document.createElement('div');
        newForecast.classList.add('forecast-day');
        newForecast.innerHTML = `
            <h3 class="date">${day}</h3>

            <dl class="weather-info">
                <dt>Temperature</dt>
                <dd>${temp}</dd>

                <dt>Wind Speed</dt>
                <dd>${wind}</dd>

                <dt>Humidity</dt>
                <dd>${humidity}</dd>
            </dl>
        `;
        forecastList.appendChild(newForecast);
    }
}

const getWeather = (lat, lon) => {
    var apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly&appid=d91f911bcf2c0f925fb6535547a5ddc9`
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            displayCurrentWeather(data);
            displayWeatherForecast(data);
        })
}

const displayWeather = (weatherData) => {
    document.getElementById('location-name').textContent = `${weatherData.name}, ${weatherData.country}`;

    getWeather(weatherData.lat, weatherData.lon);
}

const onClickLocationButton = (event) => {
    event.preventDefault();
    const location = event.target.id;
    console.log(`Looking up predefined location ${location}`);
    lookupLocation(location);
}

const locationInput = document.getElementById('location');
const searchForm = document.getElementById('search-form');
const locationButtons = document.querySelectorAll('.location-btn');

searchForm.addEventListener('submit', onSubmitSearchForm);
locationButtons.forEach(element => element.addEventListener('click', onClickLocationButton));

loadRecentLocations();