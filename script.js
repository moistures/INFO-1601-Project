let map;
let marker;

// Function to initialize the map
window.initMap = function() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 48.8584, lng: 2.2945},
        zoom: 5
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const countriesContainer = document.getElementById('countries-list');
    const searchBox = document.getElementById('search-box');
    const continentSelect = document.getElementById('continent-select');
    const languageSelect = document.getElementById('language-select');
    const populationSort = document.getElementById('population-sort');
    const modal = document.getElementById('country-modal');
    const closeModalIcon = document.querySelector('.close-icon');

    let countriesData = [];

    async function fetchCountries() {
        try {
            const response = await fetch('https://restcountries.com/v3.1/all');
            countriesData = await response.json();
            countriesData.sort((a, b) => a.name.common.localeCompare(b.name.common));
            populateLanguagesDropdown();
            displayCountries(countriesData);
        } catch (error) {
            console.error("Failed to fetch countries:", error);
            countriesContainer.innerHTML = '<p>Error loading countries.</p>';
        }
    }

    function populateLanguagesDropdown() {
        let languageOptions = new Set();
        countriesData.forEach(country => {
            if (country.languages) {
                Object.values(country.languages).forEach(language => {
                    languageOptions.add(language);
                });
            }
        });
        languageOptions = Array.from(languageOptions).sort();
        languageSelect.innerHTML = '<option value="">All Languages</option>';
        languageOptions.forEach(language => {
            const option = document.createElement('option');
            option.value = language;
            option.textContent = language;
            languageSelect.appendChild(option);
        });
    }

    function displayCountries(countries) {
        countriesContainer.innerHTML = '';
        countries.forEach(country => {
            const countryElement = document.createElement('div');
            countryElement.className = 'country-card';
            countryElement.innerHTML = `
                <img src="${country.flags.svg}" alt="Flag of ${country.name.common}">
                <h2>${country.name.common}</h2>
                <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
                <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</p>
            `;
            countryElement.onclick = () => openModal(country);
            countriesContainer.appendChild(countryElement);
        });
    }

    function openModal(country) {
        const countryDetails = document.getElementById('country-details');
        const modalFlag = document.getElementById('modal-flag');
        modal.classList.add('visible');

        modalFlag.src = country.flags.svg;
        modalFlag.alt = "Flag of " + country.name.common;

        countryDetails.innerHTML = `
            <h1>${country.name.common}</h1>
            <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</p>
            <p><strong>Region:</strong> ${country.region}</p>
            <p><strong>Subregion:</strong> ${country.subregion}</p>
            <p><strong>Languages:</strong> ${country.languages ? Object.values(country.languages).join(', ') : 'N/A'}</p>
            <p><strong>Currencies:</strong> ${country.currencies ? Object.values(country.currencies).map(c => `${c.name} (${c.symbol})`).join(', ') : 'N/A'}</p>
            <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
            <p><a href="${country.tld[0] ? `https://en.wikipedia.org/wiki/${country.name.common}` : '#'}" target="_blank" class="details-link">More details</a></p>
            <a href="${country.maps.googleMaps}" target="_blank" class="details-link">View in Google Maps</a>
        `;

        if (country.latlng && country.latlng.length === 2) {
            setMapLocation(country.latlng[0], country.latlng[1], country.name.common);
        } else {
            console.log("Latitude and longitude data is missing.");
        }
    }

    function setMapLocation(lat, lng, countryName) {
        if (map) {
            const location = new google.maps.LatLng(lat, lng);
            map.setCenter(location);
            map.setZoom(6);

            if (marker) marker.setMap(null);

            marker = new google.maps.Marker({
                position: location,
                map: map,
                title: countryName
            });

            const infoWindow = new google.maps.InfoWindow({
                content: `<div class="info-content"><strong>${countryName}</strong></div>`
            });

            marker.addListener('click', function() {
                infoWindow.open(map, marker);
            });

            infoWindow.open(map, marker);
        } else {
            console.log("Map object is not initialized yet.");
        }
    }

    modal.addEventListener('click', function(event) {
        if (event.target === modal || event.target === closeModalIcon) {
            modal.classList.remove('visible');
            if (marker) marker.setMap(null);  
        }
    });

    function sortAndFilterCountries() {
        let sortedCountries = [...countriesData];

        if (populationSort.value === 'asc') {
            sortedCountries.sort((a, b) => a.population - b.population);
        } else if (populationSort.value === 'desc') {
            sortedCountries.sort((a, b) => b.population - a.population);
        }

        sortedCountries = sortedCountries.filter(country => {
            const matchesContinent = continentSelect.value ? country.region === continentSelect.value : true;
            const matchesLanguage = languageSelect.value ? country.languages && Object.values(country.languages).includes(languageSelect.value) : true;
            const matchesSearchText = country.name.common.toLowerCase().includes(searchBox.value.toLowerCase());
            return matchesContinent && matchesLanguage && matchesSearchText;
        });

        if (!populationSort.value) {
            sortedCountries.sort((a, b) => a.name.common.localeCompare(b.name.common));
        }

        displayCountries(sortedCountries);
    }

    searchBox.addEventListener('input', sortAndFilterCountries);
    continentSelect.addEventListener('change', sortAndFilterCountries);
    languageSelect.addEventListener('change', sortAndFilterCountries);
    populationSort.addEventListener('change', sortAndFilterCountries);

    fetchCountries();
});
