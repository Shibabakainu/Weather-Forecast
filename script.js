const api_key = "5fe02a461abde750edff53794ea647d1" // openweathermapから受け取ったAPIキー

let weatherCardHtml = document.getElementById('weather-cards');
let todayCardHtml = document.getElementById('today');
let mapCardHtml = document.getElementById('map');
let adviceCardHtml = document.getElementById('advice');
var map;
var cityname
//ヘッダーの背景画像をランダムに変える
function randomBG() {              
    var random = Math.floor(Math.random() * 5) + 0;
    var body = ["url(background/pic0.jpg)","url(background/pic1.jpg)","url(background/pic2.jpg)","url(background/pic3.jpg)"];
    document.getElementById("bodyimage").style.backgroundImage=body[random]; 
}

//曜日を取得する
function dayofweek() {
    const weekday = ["日","月","火","水","木","金","土"];

    const d = new Date();
    let youbi = weekday[d.getDay()];
    return youbi;
}
function fivedayofweek(dt) {
    const weekday = ["日","月","火","水","木","金","土"];

    const d = new Date(dt);
    let youbi = weekday[d.getDay()];
    return youbi;
}

//入力した値を取得する
function getVal() {
    const val = document.querySelector('input').value;
    return val;
}

//今日の天気予報を作る
const todayCard = (name, country, weather) => {
    return `<div class="details">
                <div class="location">${name}, ${country}</div>
                <div class="date">${weather.dt_txt.split(" ")[0]}(${dayofweek()})</div>
                <div class="temp"><i class="fa fa-thermometer-half" aria-hidden="true"style="font-size:30px;"></i>  ${(weather.main.temp - 273.15).toFixed(0)}℃</div>                       
                <div class="humidity"><i class="fa fa-tint" aria-hidden="true"></i>  ${weather.main.humidity}%</div>
                <div class="hi-low"><i class="fa fa-thermometer-empty" aria-hidden="true"style="font-size:30px;color:blue"></i>  ${(weather.main.temp_min - 273.15).toFixed(0)}℃<br><i class="fa fa-thermometer" style="font-size:30px;color:red"></i>  ${(weather.main.temp_max - 273.15).toFixed(0)}℃</div>
                <div class="wind"><iconify-icon icon="wi:strong-wind" width="40"></iconify-icon> ${weather.wind.speed}m/s</div>
            </div>
            <div class="icon">
            <img id="img" src="https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png" alt="weather-icon">
                <div class="condition">${weather.weather[0].description}</div>
            </div>`
}
//5日の天気予報を作る
const weatherDetailCard = (dt, temp, humidity, wind, icon) => {
    return `<li class="card">
                <h4>${dt.split(" ")[0]}(${fivedayofweek(dt)})</h4>
                <h6><iconify-icon icon="wi:thermometer" width="40"></iconify-icon> ${(temp - 273.15).toFixed(0)}℃</h6>
                <h6><iconify-icon icon="wi:humidity" width="40"></iconify-icon> ${humidity}%</h6>
                <h6><iconify-icon icon="wi:strong-wind" width="40"></iconify-icon> ${wind} m/s</h6>
                <img id="img" src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="weather-icon">
            </li>
    `
}
//
const adviceCard = (condition) => {
    switch(condition){
        case "light intensity drizzle":
        case "drizzle":
        case "heavy intensity drizzle":
        case "light intensity drizzle rain":
        case "drizzle rain":
        case "heavy intensity drizzle rain":
        case "shower rain and drizzle":
        case "heavy shower rain and drizzle":
        case "shower drizzle":
        case "thunderstorm with light rain":
        case "thunderstorm with rain":
        case "thunderstorm with heavy rain":
        case "light thunderstorm":
        case "thunderstorm":
        case "heavy thunderstorm":
        case "ragged thunderstorm":
        case "thunderstorm with light drizzle":
        case "thunderstorm with drizzle":
        case "thunderstorm with heavy drizzle": 
        case "moderate rain":
        case "heavy intensity rain":
        case "very heavy rain":
        case "extreme rain":
        case "freezing rain":
        case "light intensity shower rain":
        case "shower rain":
        case "heavy intensity shower rain":
        case "ragged shower rain":
        case "light rain":
            return `<div class="advice" id="advice">
                    <h3>アドバイス：傘を持って出かけた方がいいです。</h3>
                </div>
        `
        break; 
        case "light snow":
        case "snow":
        case "heavy snow":
        case "sleet":
        case "light shower sleet":
        case "shower sleet":
        case "light rain and snow":
        case "rain and snow":
        case "light shower snow":
        case "shower snow":
        case "heavy shower snow":
            return `<div class="advice" id="advice">
                    <h3>アドバイス：暖かく着用して出かけた方がいいです。</h3>
                </div>
        `
        break;
        case "clear sky":
            return `<div class="advice" id="advice">
                    <h3>アドバイス：出かけた方がいいです。</h3>
                </div>
        `
        break;
        case "tornado":
            return `<div class="advice" id="advice">
                    <h3>アドバイス：逃げてください。</h3>
                </div>
        `
        break;
        default:
            return `<div class="advice" id="advice">
                    <h3>アドバイス：特にないです。</h3>
                </div>
        `
        break;
    }
    
}
//検索した場所のマップを表示する
const mapCard = (latitude, longitude) => {
    //既にあったマップを消す
    if (map) {
        map.remove();
    }
    //新しいマップを表示する
    map = L.map('map').setView([latitude, longitude], 13);

    //OpenStreetMapのタイルレイヤーを追加する
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    //マップにマーカーを追加する
    L.marker([latitude, longitude]).addTo(map)
    .bindPopup('Specified Location');
}

//天気予報の情報を受け取る
async function getResults() {   
    const val = document.querySelector('input').value;
    //天気のAPI
    let weatherData = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${getVal()}&appid=${api_key}`);
    weatherData = await weatherData.json();
    //一日一個の天気予報のフィルター
    let uniqueDay = [];
    const fiveDaysForecast = weatherData.list.filter(forecast => {
        let forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueDay.includes(forecastDate)) {
            return uniqueDay.push(forecastDate);
        }
    });
    //jsonファイルから情報を受け取る
    let name = weatherData.city.name;
    let country = weatherData.city.country;
    let latitude = weatherData.city.coord.lat;
    let longitude = weatherData.city.coord.lon;
    weatherCardHtml.innerHTML = "";
    todayCardHtml.innerHTML = "";
    mapCardHtml.innerHTML = "";
    adviceCardHtml.innerHTML = "";
    fiveDaysForecast.forEach((weather, idx) => {
        if (idx != 0){
            let card_html = weatherDetailCard(weather.dt_txt, weather.main.temp, weather.main.humidity, weather.wind.speed, weather.weather[0].icon);
            weatherCardHtml.insertAdjacentHTML("beforeend",card_html);
        } else {
            let todayCard_html = todayCard(name, country, weather);
            todayCardHtml.insertAdjacentHTML("beforeend", todayCard_html);
            let advice_html = adviceCard(weather.weather[0].description);
            adviceCardHtml.insertAdjacentHTML("beforeend",advice_html);
        }
    });

    let map_html = mapCard(latitude, longitude);
    mapCardHtml.insertAdjacentHTML("beforeend", map_html);
}

//ユーザーの座標を受け取って現在地の天気予報を作る
function userLocation() {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            fetch(`http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${api_key}`)
            .then(response => response.json())
            .then(async data => {
                const cityname = data[0].name;
                //天気のAPI
                let weatherData = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityname}&appid=${api_key}`);
                weatherData = await weatherData.json();
                //一日一個の天気予報のフィルター
                let uniqueDay = [];
                const fiveDaysForecast = weatherData.list.filter(forecast => {
                    let forecastDate = new Date(forecast.dt_txt).getDate();
                    if (!uniqueDay.includes(forecastDate)) {
                        return uniqueDay.push(forecastDate);
                    }
                });
                //jsonファイルから情報を受け取る
                let name = weatherData.city.name;
                let country = weatherData.city.country;
                let latitude = weatherData.city.coord.lat;
                let longitude = weatherData.city.coord.lon;
                weatherCardHtml.innerHTML = "";
                todayCardHtml.innerHTML = "";
                mapCardHtml.innerHTML = "";
                adviceCardHtml.innerHTML = "";
                fiveDaysForecast.forEach((weather, idx) => {
                    if (idx != 0){
                        let card_html = weatherDetailCard(weather.dt_txt, weather.main.temp, weather.main.humidity, weather.wind.speed, weather.weather[0].icon);
                        weatherCardHtml.insertAdjacentHTML("beforeend",card_html);
                    } else {
                        let todayCard_html = todayCard(name, country, weather);
                        todayCardHtml.insertAdjacentHTML("beforeend", todayCard_html);
                        let advice_html = adviceCard(weather.weather[0].description);
                        adviceCardHtml.insertAdjacentHTML("beforeend",advice_html);
                    }
                });

                let map_html = mapCard(latitude, longitude);
                mapCardHtml.insertAdjacentHTML("beforeend", map_html);
            })
            .catch(error => {
                console.error('Error fetching data', error);
            })
        }
    )
}