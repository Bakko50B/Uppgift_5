    // 1. Skapa kartan centrerad på Sverige
    const map = L.map('map').setView([59.3293, 18.0686], 6);

    // 2. Lägg till OpenStreetMap-tilelayer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    let marker;

    // 3. Sök plats med Nominatim API
    async function searchLocation() {
        const query = document.getElementById('search-input').value;
        if (!query) {
            alert('Vänligen ange en plats!');
            return;
        }

        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;

        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'MyLeafletApp/1.0 (myemail@example.com)' // Ändra till din e-postadress!
                }
            });
            const data = await response.json();

            if (data.length > 0) {
                const { lat, lon, display_name } = data[0];

                // Flytta kartan och lägg till markör
                map.setView([lat, lon], 12);
                
                // Om markör redan finns - ta bort den
                if (marker) map.removeLayer(marker);

                // Lägg till en ny markör
                marker = L.marker([lat, lon])
                    .addTo(map)
                    .bindPopup(`<strong>${display_name}</strong>`)
                    .openPopup();
            } else {
                alert('Ingen plats hittades!');
            }
        } catch (error) {
            console.error('Fel vid API-anrop:', error);
            alert('Kunde inte söka platsen. Kontrollera din internetanslutning.');
        }
    }

    // Lägg till sökhändelser
    document.getElementById('search-button').addEventListener('click', searchLocation);
    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchLocation();
        }
    });

