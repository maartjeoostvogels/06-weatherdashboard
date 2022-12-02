const WEATHER_API_BASE_URL = 'https://api.openweathermap.org';
const WEATHER_API_KEY = '707c8398dd088c4758c51be5e6996e2b';
const MAX_DAILY_FORECAST = 5;

let recentLocations = [];

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
    if (recentLocations.length > 0) {
    const clearLocation = document.createElement('button');
    clearLocation.classList.add('clear-recents');
    clearLocation.textContent = 'Clear Recent Locations';
    clearLocation.addEventListener('click', onClickClearLocation);
    recentLocationsList.appendChild(clearLocation);
    }
}

const onClickClearLocation = () => {
    localStorage.clear();
    recentLocations = [];
    loadRecentLocations();
}

const loadRecentLocations = () => {
    const locations = localStorage.getItem('recentLocations');
    if (locations) {
        recentLocations.push(...JSON.parse(locations));
    }
    updateRecentLocationsList();
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
    console.log('Current Weather', currentWeather);
    const formattedDate = new Date(currentWeather.dt * 1000).toLocaleDateString('en-GB', {dateStyle: 'short'});

    document.querySelector('.weather-icon').innerHTML = `<img src="http://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png">`;
    document.querySelector('.weather-date').textContent = `(${formattedDate})`;
    document.getElementById('temperature').textContent = `${currentWeather.temp} °F`;
    document.getElementById('wind-speed').textContent = `${currentWeather.wind_speed} MPH`;
    document.getElementById('humidity').textContent = `${currentWeather.humidity} %`;
    document.getElementById('uv-index').textContent = `${currentWeather.uvi}`;
}

const displayWeatherForecast = (weatherData) => {
    const dailyData = weatherData.daily;

    const forecastList = document.getElementById('forecast');
    forecastList.innerHTML = '<h3>5-Day Forecast</h3>';

    for (let i = 0; i < MAX_DAILY_FORECAST; i++) {
        const dailyForecast = dailyData[i];
        console.log('Daily Forecast', dailyForecast);
        const day = new Date(dailyForecast.dt * 1000).toLocaleDateString('en-GB', {dateStyle: 'short'});
        const temp = `${dailyForecast.temp.day}&nbsp;°F`;
        const humidity = `${dailyForecast.humidity}&nbsp;%`;
        const wind = `${dailyForecast.wind_speed}&nbsp;MPH`;

        const newForecast = document.createElement('div');
        newForecast.classList.add('forecast-day');
        newForecast.innerHTML = `
            <h4 class="date">${day}</h4>

            <img src="http://openweathermap.org/img/wn/${dailyForecast.weather[0].icon}@2x.png" width="60px" height="60px">

            <dl class="weather-info">
                <dt>Temp</dt>
                <dd>${temp}</dd>

                <dt>Wind</dt>
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

const locationInput = document.getElementById('location');
const searchForm = document.getElementById('search-form');

searchForm.addEventListener('submit', onSubmitSearchForm);

loadRecentLocations();