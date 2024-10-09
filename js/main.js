document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM caricato');

    // Modello (Model)
    let lista = []
    if (localStorage.getItem('lista')) {
        lista = JSON.parse(localStorage.getItem('lista'));
    }

    // Elementi del DOM (View)
    const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=relative_humidity_2m&current_weather=true`;
    const buttonCerca = document.querySelector('.button_cerca');
    let cittaValore = document.querySelector('.citta');
    const displayMeteoHtml = document.querySelector('.display_meteo');
    const listPreferiti = document.querySelector('.lista_prefe');
    const buttonPreferiti = document.querySelector('.button_prefe');

    // Funzioni

    function getWeatherIconPosition(weatherCode) {
        const weatherIcons = {
            0: '278px 278px',          // Sole
            1: '226px 278px',          // Poco nuvoloso
            2: '226px 278px',           
            3: '226px 278px',
            45:'70px 70px',            // nebbia
            48:'70px 70px',           
            51:'174px 278px',          // pioggia leggera
            53:'174px 278px',
            55:'174px 278px',
            56:'174px 278px',
            57:'174px 278px',
            61:'122px 278px',          // Pioggia
            63:'122px 278px',
            65:'122px 278px',
            66:'122px 278px', 
            67:'122px 278px',        
            71:'70px 174px',           // nevicata
            73:'70px 174px',
            75:'70px 174px',
            77:'70px 174px',
            80:'70px 278px',           // pioggia forte
            81:'70px 278px',
            82:'70px 278px',
            85:'70px 122px',           // ghiaccio
            86:'70px 122px',
            95:'226px 174px',          // temporale
            96:'226px 174px',                      
            99:'226px 174px',

            // Aggiungi altre mappature se necessario
        };
    
        return weatherIcons[weatherCode] || '0px 0px'; // Default: Sole
    }
    

    // Funzione per visualizzare il meteo nella sezione dedicata
    function displayMeteo(citta, weatherData) {
        const umidita = weatherData.hourly.relative_humidity_2m[0];
        const weatherIconPosition = getWeatherIconPosition(weatherData.current_weather.weathercode);

        displayMeteoHtml.innerHTML = `
            <h2>Previsioni meteo per ${citta}</h2>
            <p><span>Temperatura attuale:</span> ${weatherData.current_weather.temperature}°C</p>
            <div id="weather-icon-sprite" class="weather-icon" style="background-position: ${weatherIconPosition};"></div> 
            <p><span>Umidità relativa:</span> ${umidita}%</p>
            <p><span>Velocità del vento:</span> ${weatherData.current_weather.windspeed} km/h</p>
        `;
    }

    // Funzione per salvare una città nei preferiti e visualizzarla nella lista
    function saveMeteo(citta, weatherData) {
        const newLi = document.createElement('li');
        const umidita = weatherData.hourly.relative_humidity_2m[0];
        const weatherIconPosition = getWeatherIconPosition(weatherData.current_weather.weathercode);

        newLi.innerHTML = `
            <h3>${citta}</h3>
            <p>Temperatura: ${weatherData.current_weather.temperature}°C</p>
            <div id="weather-icon-sprite" class="weather-icon" style="background-position: ${weatherIconPosition};"></div>
            <p>Umidità: ${umidita}%</p>
            <p>Vento: ${weatherData.current_weather.windspeed} km/h</p>
            <button class="button_rimuovi">Rimuovi</button>
        `;
        listPreferiti.appendChild(newLi);
    }

    // Funzione per mostrare i preferiti salvati dal LocalStorage all'avvio
    function displaySavedFavorites() {
        lista.forEach(async (favorite) => {
            const weatherResponse = await fetch(meteoUrl.replace('{lat}', favorite.latitude).replace('{lon}', favorite.longitude));
            const weatherData = await weatherResponse.json();
            saveMeteo(favorite.citta, weatherData);
        });
    }

    // Funzione per rimuovere una città dai preferiti
    function rimuoviCittaDaPreferiti(event) {
        if (event.target.classList.contains('button_rimuovi')) {
            const li = event.target.parentElement;  // Individua l'elemento <li>

            // Recupero l'indice dell'elemento sulla todoList del DOM
            let deleteIndex = [...listPreferiti.children].findIndex(el => el === li);

            // Elimino l'elemento dal modello
            lista.splice(deleteIndex, 1);

            // Aggiorno il localStorage
            localStorage.setItem('lista', JSON.stringify(lista));

            // Rimuovo il li dal DOM
            li.remove();
        }
    }

    // Eventi (Controller)

    // Mostra i risultati della ricerca meteo
    buttonCerca.addEventListener('click', async function () {
        if (cittaValore.value === '') {
            alert('Devi inserire una città');
            return;
        }

        const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${cittaValore.value}&count=10&language=it&format=json`;

        try {
            const geocodeResponse = await fetch(geocodingUrl);
            const geocodeData = await geocodeResponse.json();

            const lat = geocodeData.results[0].latitude;
            const lon = geocodeData.results[0].longitude;

            const weatherResponse = await fetch(meteoUrl.replace('{lat}', lat).replace('{lon}', lon));
            const weatherData = await weatherResponse.json();

            displayMeteo(cittaValore.value, weatherData);
        } catch (error) {
            alert('Non abbiamo trovato la città');
        }
    });

    // Salva la città nei preferiti
    buttonPreferiti.addEventListener('click', async function () {
        if (cittaValore.value === '') {
            alert('Devi inserire una città');
            return;
        }

        const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${cittaValore.value}&count=10&language=it&format=json`;

        try {
            const geocodeResponse = await fetch(geocodingUrl);
            const geocodeData = await geocodeResponse.json();

            const lat = geocodeData.results[0].latitude;
            const lon = geocodeData.results[0].longitude;

            const weatherResponse = await fetch(meteoUrl.replace('{lat}', lat).replace('{lon}', lon));
            const weatherData = await weatherResponse.json();

            saveMeteo(cittaValore.value, weatherData);

            // Aggiungo il nuovo elemento alla lista e lo salvo nel localStorage
            lista.push({ citta: cittaValore.value, latitude: lat, longitude: lon });
            localStorage.setItem('lista', JSON.stringify(lista));
        } catch (error) {
            alert('Non abbiamo potuto salvare la città');
        }
    });

    // Evento per rimuovere una città dai preferiti
    listPreferiti.addEventListener('click', rimuoviCittaDaPreferiti);

    // Visualizza i preferiti salvati all'avvio
    displaySavedFavorites();
});
