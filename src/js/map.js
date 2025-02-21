/**
 * Skapar en karta med Leaflet och centrerar den på en specifik position.
 * 
 * @constant {Object} map - Leaflet-kartobjektet.
 * @property {Function} setView - Metod som sätter kartans centrum och zoomnivå.
 * @param {string} 'map' - ID för HTML-elementet där kartan kommer att renderas.
 * @param {Array<number>} [59.3293, 18.0686] - Array med latitud och longitud för kartans centrum.
 * @param {number} 5 - Zoomnivå för kartan.
 */
const map = L.map('map').setView([59.3293, 18.0686], 5);

/**
 * Lägg till en OpenStreetMap-tile layer till en Leaflet-karta.
 * 
 * @param {object} map - En Leaflet-karta som tile layer ska läggas till.
 */
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

/**
 * Variabel för att innehålla markören
 */
let marker;

/**
 * Flytta kartan och lägg till en markör vid specifika koordinater.
 * 
 * @param {number} lat - Latitud för markören.
 * @param {number} lon - Longitud för markören.
 * @param {string} displayName - Namn som ska visas i popupen.
 */
function addMarker(lat, lon, displayName) {
    // Flytta kartan
    map.setView([lat, lon], 12); //inzoomad

    // Om markör redan finns - ta bort den
    if (marker) map.removeLayer(marker);

    // Lägg till en ny markör
    marker = L.marker([lat, lon])
        .addTo(map)
        .bindPopup(`<strong>${displayName}</strong>`)
        .openPopup();
}

/**
 * Sök plats med Nominatim OpenStreetMap API och flytta kartan samt lägg till markör.
 * 
 * Funktionen skickar en sökförfrågan till Nominatim OpenStreetMap API baserat på användarens inmatning,
 * och om en plats hittas flyttas kartan till platsens koordinater och en markör läggs till. Om ingen plats hittas
 * visas ett varningsmeddelande till användaren.
 * 
 * @async
 * @function searchLocation
 * @returns {void} Visar en varning om ingen plats hittas eller om API-anropet misslyckas.
 */
async function searchLocation() {
    const query = document.getElementById('search-input').value;
    if (!query) {
        alert('Vänligen ange en plats!');
        return;
    }

    // Kombinerar den färdiga urln nedan med det som kommer från sökfältet
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
    // använder url för att hämta positionen på kartan
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'MinKartaFrontend/1.0 (tolu2403@student.miun.se)'
            }
        });
        const data = await response.json();

        if (data.length > 0) {
            const { lat, lon, display_name } = data[0];

            // Flytta kartan och lägg till markör
            addMarker(lat, lon, display_name);
        } else {
            alert('Ingen plats hittades!');
        }
    } catch (error) {
        console.error('Fel vid API-anrop:', error);
        alert('Kunde inte söka platsen. Kontrollera din internetanslutning.');
    }
}

/**
 * Hämta GPS-position och flytta kartan samt lägg till markör.
 */
function getGPSPos() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
            let latitude = position.coords.latitude;
            let longitude = position.coords.longitude;

            console.log(latitude);
            console.log(longitude);

            // Flytta kartan och lägg till markör
            addMarker(latitude, longitude, "Din position");
        }, function (error) {
            console.error("Fel vid hämtning av position: " + error.message);
        });
    } else {
        console.error("Webbläsaren stöder inte geolokalisering!");
    }
}

// Lägg till händelselyssnare för GPS-knappen
document.getElementById("gps-button").addEventListener("click", getGPSPos);


/**
 * Lägg till en click event listener på sökknappen.
 * 
 * När knappen klickas på, hämtas värdet från sökfältet och en plats söks med funktionen searchLocation.
 * Om en plats hittas, uppdateras kartan och en markör placeras på den hittade platsen.
 * 
 * @event
 */
document.getElementById('search-button').addEventListener('click', searchLocation);
/**
 * Skapa en eventlyssnare på input-fältet.
 * 
 * När ENTER trycks ner, söks platsen som finns i sökfältet med funktionen searchLocation.
 * 
 * @event
 */
document.getElementById('search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchLocation();
    }
});


