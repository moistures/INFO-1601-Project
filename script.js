document.addEventListener('DOMContentLoaded', () => {
    const countriesContainer = document.getElementById('countries-list');
    const searchBox = document.getElementById('search-box');
    const continentSelect = document.getElementById('continent-select');
    const languageSelect = document.getElementById('language-select');
    const populationSort = document.getElementById('population-sort');
    const modal = document.getElementById('country-modal');
    const closeModalIcon = document.querySelector('.close-icon');
    const countryDetails = document.getElementById('country-details');

    let countriesData = [];

    async function fetchCountries() {
        try {
            const response = await fetch('https://restcountries.com/v3.1/all');
            countriesData = await response.json();
            countriesData.sort((a, b) => a.name.common.localeCompare(b.name.common)); // Default alphabetical sort
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
        countriesContainer.innerHTML = ''; // Clear the container first
        countries.forEach(country => {
            const countryElement = document.createElement('div');
            countryElement.className = 'country-card';
            countryElement.innerHTML = `
                <img src="${country.flags.svg}" alt="Flag of ${country.name.common}">
                <h2>${country.name.common}</h2>
                <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
                <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</p>
            `;
            countryElement.style.animation = 'none'; // Disable animation initially
            countryElement.offsetHeight; // Trigger reflow
            countryElement.style.animation = null; // Enable animation
            countryElement.onclick = () => openModal(country);
            countriesContainer.appendChild(countryElement);
        });
    }

    function openModal(country) {
        countryDetails.innerHTML = `
            <img src="${country.flags.svg}" alt="Flag of ${country.name.common}" style="width: 100%; border-radius: 0;">
            <div class="country-info">
                <h1>${country.name.common}</h1>
                <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</p>
                <p><strong>Region:</strong> ${country.region}</p>
                <p><strong>Subregion:</strong> ${country.subregion}</p>
                <p><strong>Languages:</strong> ${country.languages ? Object.values(country.languages).join(', ') : 'N/A'}</p>
                <p><strong>Currencies:</strong> ${country.currencies ? Object.values(country.currencies).map(c => `${c.name} (${c.symbol})`).join(', ') : 'N/A'}</p>
                <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
                <a href="${country.tld[0] ? `https://en.wikipedia.org/wiki/${country.name.common}` : '#'}" target="_blank" class="details-link">More details</a>
            </div>
        `;
        modal.classList.add('visible');
    }

    modal.addEventListener('click', function(event) {
        if (event.target === modal || event.target === closeModalIcon) {
            modal.classList.remove('visible');
        }
    });

    function sortAndFilterCountries() {
        let sortedCountries = [...countriesData]; // Copy of the data to sort and filter

        // Apply population sort if selected
        if (populationSort.value === 'asc') {
            sortedCountries.sort((a, b) => a.population - b.population);
        } else if (populationSort.value === 'desc') {
            sortedCountries.sort((a, b) => b.population - a.population);
        }

        // Filter by continent, language, and search text
        sortedCountries = sortedCountries.filter(country => {
            const matchesContinent = continentSelect.value ? country.region === continentSelect.value : true;
            const matchesLanguage = languageSelect.value ? country.languages && Object.values(country.languages).includes(languageSelect.value) : true;
            const matchesSearchText = country.name.common.toLowerCase().includes(searchBox.value.toLowerCase());
            return matchesContinent && matchesLanguage && matchesSearchText;
        });

        // Apply default alphabetical sort if no population sort selected
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
