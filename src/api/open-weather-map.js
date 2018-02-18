import axios from 'axios';

// TODO replace the key with yours
const key = '36978c6550efee0e27e50850cc57adda';
const baseUrl = `http://api.openweathermap.org/data/2.5/weather?appid=${key}`;
const forecastBaseUrl = `http://api.openweathermap.org/data/2.5/forecast?appid=${key}`;

export function getWeatherGroup(code) {
    let group = 'na';
    if (200 <= code && code < 300) {
        group = 'thunderstorm';
    } else if (300 <= code && code < 400) {
        group = 'drizzle';
    } else if (500 <= code && code < 600) {
        group = 'rain';
    } else if (600 <= code && code < 700) {
        group = 'snow';
    } else if (700 <= code && code < 800) {
        group = 'atmosphere';
    } else if (800 === code) {
        group = 'clear';
    } else if (801 <= code && code < 900) {
        group = 'clouds';
    }
    return group;
}

export function capitalize(string) {
    return string.replace(/\b\w/g, l => l.toUpperCase());
}

let weatherSource = axios.CancelToken.source();

export function getWeather(city, unit) {
    var url = `${baseUrl}&q=${encodeURIComponent(city)}&units=${unit}`;

    console.log(`Making request to: ${url}`);

    return axios.get(url, {cancelToken: weatherSource.token}).then(function(res) {
        if (res.data.cod && res.data.message) {
            throw new Error(res.data.message);
        } else {
            return {
                city: capitalize(city),
                code: res.data.weather[0].id,
                group: getWeatherGroup(res.data.weather[0].id),
                description: res.data.weather[0].description,
                temp: res.data.main.temp,
                unit: unit // or 'imperial'
            };
        }
    }).catch(function(err) {
        if (axios.isCancel(err)) {
            console.error(err.message, err);
        } else {
            throw err;
        }
    });
}

export function getWeatherByCoord(lat, lon, unit) {
    var url = `${baseUrl}&lat=${lat}&lon=${lon}&units=${unit}`;

    console.log(`Making request to: ${url}`);

    return axios.get(url, {cancelToken: weatherSource.token}).then(res => {
        return {
                code: res.data.weather[0].id,
                group: getWeatherGroup(res.data.weather[0].id),
                description: res.data.weather[0].description,
                temp: res.data.main.temp,
                city: res.data.name,
                unit: unit // or 'imperial'
        };
    }).catch(err => {
        if (axios.isCancel(err)) {
            console.error(err.message, err);
        } else {
            throw err;
        }        
    });
}

export function cancelWeather() {
    weatherSource.cancel('Request canceled');
}

export function getForecast(lat, lon, unit) {
    var url = `${forecastBaseUrl}&lat=${lat}&lon=${lon}&units=${unit}`;

    console.log(`Making Forecast request to: ${url}`);

    const weekday = new Array(7);
    weekday[0] = "Sun";
    weekday[1] = "Mon";
    weekday[2] = "Tue";
    weekday[3] = "Wed";
    weekday[4] = "Thu";
    weekday[5] = "Fri";
    weekday[6] = "Sat";

    return axios.get(url, {cancelToken: weatherSource.token}).then(function(res) {
        if (res.data.cod && res.data.list === 'undefined') {
            throw new Error(res.data.message);
        } else {
            console.log("res.data =",res.data)
            let offset = 0;
            const listOfWeek = res.data.list.filter((value, index) => {
                if (offset === index) {
                    offset = offset + 8;
                    const date = new Date(value.dt * 1000);
                    value['weekday'] = weekday[date.getDay()];
                    return value;
                }
            });
            return {
                city: capitalize(res.data.city.name),
                listOfWeek: listOfWeek,
                code: listOfWeek[0].weather[0].id,
                group: getWeatherGroup(listOfWeek[0].weather[0].id),
                description: listOfWeek[0].weather[0].description,
                temp: listOfWeek[0].main.temp,
                unit: unit // or 'imperial'
            };
        }
    }).catch(function(err) {
        if (axios.isCancel(err)) {
            console.error(err.message, err);
        } else {
            throw err;
        }
    });
}

export function cancelForecast() {
    // TODO
}

