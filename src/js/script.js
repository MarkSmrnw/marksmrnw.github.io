document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContentLoaded event fired.');

    const tlsLogo = document.getElementById('tlsLogo');
    const fvssLogo = document.getElementById('fvssLogo');
    const schoolInfoWindow = document.getElementById('schoolInfoWindow');
    const schoolInfoHeading = document.getElementById('schoolInfoWindowHeading');
    const schoolInfoText = document.getElementById('schoolInfoWindowText');
    const closeButton = document.getElementById('closeInfoWindowButton');
    const schulvergleichBox = document.getElementById('schulvergleichBox');

    let currentVisibleLogo = null;

    const schoolData = {
        tls: {
            name: "Theodor-Litt-Schule Neumünster",
            info: "Die Theodor-Litt-Schule (TLS) in Neumünster ist ein Regionales Berufsbildungszentrum (RBZ) der Stadt Neumünster. Sie bietet eine Vielzahl von Bildungsgängen in gewerblich-technischen Bereichen an.",
            address: "Parkstraße 12-18, 24534 Neumünster",
            url: "https://www.tls-nms.de/"
        },
        fvss: {
            name: "Freiherr-vom-Stein-Schule Neumünster",
            info: "Die Freiherr-vom-Stein-Schule in Neumünster ist ein Gymnasium, das für sein breites Bildungsangebot und verschiedene Schulprofile bekannt ist. Sie legt Wert auf die individuelle Förderung der Schülerinnen und Schüler.",
            address: "Caesar-Flaischlen-Straße 28, 24534 Neumünster",
            url: "https://www.steinschule-nms.de/"
        }
    };

    function _setupAndDisplayModal(logoElement, schoolKey) {
        const data = schoolData[schoolKey];
        schoolInfoHeading.textContent = data.name;
        let infoHtml = `<p>${data.info}</p>`;
        if (data.address) {
            infoHtml += `<p><strong>Adresse:</strong> ${data.address}</p>`;
        }
        if (data.url) {
            infoHtml += `<p><strong>Website:</strong> <a href="${data.url}" target="_blank" rel="noopener noreferrer">${data.url}</a></p>`;
        }
        schoolInfoText.innerHTML = infoHtml;

        // Reset styles that might conflict
        schoolInfoWindow.style.position = 'absolute';
        schoolInfoWindow.style.transform = ''; // CSS transform handles animation, reset explicit JS transform
        schoolInfoWindow.style.maxWidth = '300px';
        schoolInfoWindow.style.maxHeight = '';
        schoolInfoWindow.style.overflowY = 'visible';
        schoolInfoWindow.style.top = '';
        schoolInfoWindow.style.left = '';

        schoolInfoWindow.style.display = 'block'; // Make it part of layout for calculations

        const modalWidth = schoolInfoWindow.offsetWidth;
        const modalHeight = schoolInfoWindow.offsetHeight;
        const margin = 15;

        if (window.innerWidth >= 768) { // Desktop view
            // ... (Desktop positioning logic - unverändert) ...
            let topPosition = logoElement.offsetTop + (logoElement.offsetHeight / 2) - (modalHeight / 2);
            let leftPosition;
            const parentWidth = schulvergleichBox.offsetWidth;
            const parentHeight = schulvergleichBox.offsetHeight;
            const logoLeft = logoElement.offsetLeft;
            const logoRight = logoElement.offsetLeft + logoElement.offsetWidth;

            if (schoolKey === 'tls') {
                leftPosition = logoLeft - modalWidth - margin;
                if (leftPosition < margin) {
                    if (logoRight + margin + modalWidth <= parentWidth - margin) {
                        leftPosition = logoRight + margin;
                    } else {
                        leftPosition = margin;
                    }
                }
            } else {
                leftPosition = logoRight + margin;
                if (leftPosition + modalWidth > parentWidth - margin) {
                    if (logoLeft - modalWidth - margin >= margin) {
                        leftPosition = logoLeft - modalWidth - margin;
                    } else {
                        leftPosition = parentWidth - modalWidth - margin;
                    }
                }
            }
            if (leftPosition < margin) leftPosition = margin;
            if (leftPosition + modalWidth > parentWidth - margin) leftPosition = parentWidth - modalWidth - margin;
            if (modalWidth + 2 * margin > parentWidth) leftPosition = (parentWidth - modalWidth) / 2;
            if (topPosition < margin) topPosition = margin;
            if (topPosition + modalHeight > parentHeight - margin) topPosition = parentHeight - modalHeight - margin;
            if (modalHeight + 2 * margin > parentHeight) topPosition = (parentHeight - modalHeight) / 2;
            if (topPosition < margin) topPosition = margin;

            schoolInfoWindow.style.top = `${topPosition}px`;
            schoolInfoWindow.style.left = `${leftPosition}px`;
            // Ensure CSS transform for animation is not overridden by JS fixed positioning transform
            if (schoolInfoWindow.style.position !== 'fixed') {
                 schoolInfoWindow.style.transform = ''; // Reset for animation if not fixed
            }


        } else { // Mobile view
            schoolInfoWindow.style.position = 'fixed';
            schoolInfoWindow.style.left = '50%';
            schoolInfoWindow.style.top = '50%';
            // The transform for centering will be combined with animation transform by the browser
            // So we set the base centering transform here, animation adds to it or overrides scale/translateY
            schoolInfoWindow.style.transform = 'translate(-50%, -50%)'; // Base for fixed centering
            schoolInfoWindow.style.maxWidth = '90vw';
            schoolInfoWindow.style.maxHeight = '80vh';
            schoolInfoWindow.style.overflowY = 'auto';
        }
        
        // Force reflow before adding 'visible' class to ensure transition plays
        schoolInfoWindow.offsetHeight; 
        schoolInfoWindow.classList.add('visible');
        currentVisibleLogo = logoElement;
    }

    function showInfoWindow(logoElement, schoolKey) {
        const isAlreadyVisible = schoolInfoWindow.classList.contains('visible');

        if (isAlreadyVisible && currentVisibleLogo === logoElement) {
            // If trying to show the same already visible modal, do nothing (click handler will hide it)
            return;
        }

        if (isAlreadyVisible) { // Modal is visible, but for a different logo or forcing re-show
            schoolInfoWindow.classList.remove('visible');
            // Wait for the hide animation to complete before showing the new one
            schoolInfoWindow.addEventListener('transitionend', function onSwitchHideEnd() {
                _setupAndDisplayModal(logoElement, schoolKey);
            }, { once: true }); // {once: true} automatically removes the listener after it fires
        } else { // Modal is not visible
            _setupAndDisplayModal(logoElement, schoolKey);
        }
    }

    function hideInfoWindow() {
        if (!schoolInfoWindow.classList.contains('visible')) {
            return; // Not visible, nothing to hide
        }

        schoolInfoWindow.classList.remove('visible');
        
        // Set display to none after the transition ends
        // Check if there's an actual transition happening
        const style = getComputedStyle(schoolInfoWindow);
        const transitionDuration = parseFloat(style.transitionDuration.split(',')[0]) * 1000; // Get first duration for opacity/transform

        if (transitionDuration > 0) {
            schoolInfoWindow.addEventListener('transitionend', function onHideEnd() {
                schoolInfoWindow.style.display = 'none';
            }, { once: true });
        } else {
            // If no transition (e.g. duration is 0s), hide immediately
            schoolInfoWindow.style.display = 'none';
        }
        currentVisibleLogo = null;
    }

    // Ensure the element exists before adding event listeners
    tlsLogo?.addEventListener('click', function (event) {
        event.stopPropagation();
        // If it's the current logo and visible, hide it. Otherwise, show it.
        if (currentVisibleLogo === tlsLogo && schoolInfoWindow.classList.contains('visible')) {
            hideInfoWindow();
        } else {
            showInfoWindow(tlsLogo, 'tls');
        }
    });

    // Ensure the element exists before adding event listeners
    fvssLogo?.addEventListener('click', function (event) {
        event.stopPropagation();
        if (currentVisibleLogo === fvssLogo && schoolInfoWindow.classList.contains('visible')) {
            hideInfoWindow();
        } else {
            showInfoWindow(fvssLogo, 'fvss');
        }
    });

    // Ensure the element exists before adding event listeners
    closeButton?.addEventListener('click', function () {
        hideInfoWindow();
    });

    document.addEventListener('click', function (event) {
        if (schoolInfoWindow){
            if (schoolInfoWindow.classList.contains('visible') &&
                !schoolInfoWindow.contains(event.target) &&
                currentVisibleLogo &&
                !currentVisibleLogo.contains(event.target)) {
                hideInfoWindow();
            }
        }
    });

    const cdMonthsEl = document.getElementById('cdMonths');
    const cdDaysEl = document.getElementById('cdDays');
    const cdHoursEl = document.getElementById('cdHours');
    const cdMinutesEl = document.getElementById('cdMinutes');
    const cdSecondsEl = document.getElementById('cdSeconds');
    const countdownContainer = document.getElementById('countdownContainer');

    if (countdownContainer && cdMonthsEl && cdDaysEl && cdHoursEl && cdMinutesEl && cdSecondsEl) {
        const targetDate = new Date("June 12, 2025 00:00:01").getTime();

        function animateValue(element, newValue) {
            const currentValue = element.textContent;
            const formattedNewValue = newValue.toString().padStart(2, '0');

            if (currentValue !== formattedNewValue) {
                element.textContent = formattedNewValue;
                element.classList.add('tick');
                element.addEventListener('animationend', () => {
                    element.classList.remove('tick');
                }, { once: true });
            } else if (currentValue === "--") { // Initial population if placeholder exists
                 element.textContent = formattedNewValue;
            }
        }
        
        function updateCountdown() {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                countdownContainer.innerHTML = "<span class='jersey-10-regular event-ended-message'>Event hat begonnen!</span>";
                clearInterval(countdownInterval);
                // Optional: Style für .event-ended-message in CSS hinzufügen
                // z.B.: .event-ended-message { font-size: 1.2em; color: var(--color-main1); }
                return;
            }

            let endDate = new Date(targetDate);
            let startDate = new Date(now);

            let yearsLeft = endDate.getFullYear() - startDate.getFullYear();
            let monthsLeft = endDate.getMonth() - startDate.getMonth();
            let daysLeft = endDate.getDate() - startDate.getDate();

            if (daysLeft < 0) {
                monthsLeft--;
                const daysInPrevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate();
                daysLeft += daysInPrevMonth;
            }

            if (monthsLeft < 0) {
                yearsLeft--;
                monthsLeft += 12;
            }
            
            const displayMonths = yearsLeft * 12 + monthsLeft;
            const displayDays = daysLeft;

            const s_in_ms = 1000;
            const m_in_ms = s_in_ms * 60;
            const h_in_ms = m_in_ms * 60;
            const d_in_ms = h_in_ms * 24;

            const displayHours = Math.floor((distance % d_in_ms) / h_in_ms);
            const displayMinutes = Math.floor((distance % h_in_ms) / m_in_ms);
            const displaySeconds = Math.floor((distance % m_in_ms) / s_in_ms);

            animateValue(cdMonthsEl, displayMonths);
            animateValue(cdDaysEl, displayDays);
            animateValue(cdHoursEl, displayHours);
            animateValue(cdMinutesEl, displayMinutes);
            animateValue(cdSecondsEl, displaySeconds);
        }

        const countdownInterval = setInterval(updateCountdown, 1000);
        updateCountdown(); // Initialer Aufruf, um den Countdown sofort anzuzeigen
    }

    // Team Modal Elemente
    const teamInfoModal = document.getElementById('teamInfoModal');
    const closeTeamModalButton = document.getElementById('closeTeamModalButton');
    const teamModalNameEl = document.getElementById('teamModalName');
    const teamModalImageEl = document.getElementById('teamModalImage');
    const teamModalDescriptionEl = document.getElementById('teamModalDescription');

    function openTeamModal(teamData, schoolShapeClass) {
        if (!teamInfoModal || !teamData) return;

        teamModalNameEl.textContent = teamData.name || "Team Information";
        if (teamData.image) {
            teamModalImageEl.src = teamData.image;
            teamModalImageEl.alt = teamData.name || "Team Logo";
            teamModalImageEl.style.display = 'inline-block';
        } else {
            teamModalImageEl.style.display = 'none';
        }
        teamModalDescriptionEl.textContent = teamData.description || "Keine Beschreibung verfügbar.";
        
        // Optional: Shape-Klasse zum Modal hinzufügen für spezifisches Styling
        // teamInfoModal.querySelector('.custom-modal-content').className = 'custom-modal-content'; // Reset classes
        // teamInfoModal.querySelector('.custom-modal-content').classList.add(schoolShapeClass.replace('-placeholder-shape', '-modal-style'));


        teamInfoModal.classList.add('visible');
    }

    function closeTeamModal() {
        if (!teamInfoModal) return;
        teamInfoModal.classList.remove('visible');
    }

    if (closeTeamModalButton) {
        closeTeamModalButton.addEventListener('click', closeTeamModal);
    }
    if (teamInfoModal) {
        teamInfoModal.addEventListener('click', function(event) {
            // Schließen, wenn auf den Hintergrund (das Modal selbst) geklickt wird, nicht auf den Inhalt
            if (event.target === teamInfoModal) {
                closeTeamModal();
            }
        });
    }

    function generateTeamPlaceholders(loadedTeamsConfig) {
        const teamRowContainers = document.querySelectorAll('.team-row-container');

        teamRowContainers.forEach(container => {
            const schoolId = container.dataset.schoolId;
            const schoolConfig = loadedTeamsConfig[schoolId];
            const shapesRow = container.querySelector('.shapes-row');

            if (!schoolConfig || !shapesRow) {
                console.warn(`Konfiguration oder .shapes-row nicht gefunden für Schule: ${schoolId}`);
                return;
            }

            shapesRow.innerHTML = ''; 

            schoolConfig.teams.forEach(team => {
                const placeholder = document.createElement('div');
                placeholder.classList.add('team-shape-placeholder', schoolConfig.shapeClass);
                placeholder.setAttribute('role', 'button'); 
                placeholder.setAttribute('tabindex', '0');  

                const contentWrapper = document.createElement('div');
                contentWrapper.classList.add('team-shape-content');                // Setze Hintergrundbild für den contentWrapper
                const fallbackImageUrl = 'src/media/image/teams/TempTeamLogo.png';
                let primaryImageUrl = '';

                if (team.image && team.image.trim() !== '') {
                    primaryImageUrl = team.image;
                }
                
                // CSS behandelt den Fallback eleganter, wenn mehrere URLs angegeben werden.
                // Wenn primaryImageUrl leer ist, wird nur das Fallback-Bild verwendet.
                if (primaryImageUrl) {
                    contentWrapper.style.backgroundImage = `url('${primaryImageUrl}'), url('${fallbackImageUrl}')`;
                } else {
                    contentWrapper.style.backgroundImage = `url('${fallbackImageUrl}')`;
                }
                
                // Das <img> Element wird nicht mehr erstellt für den Platzhalter.
                
                if (team.name) {
                    const nameSpan = document.createElement('span');
                    nameSpan.classList.add('team-name-display');
                    nameSpan.textContent = team.name;
                    placeholder.appendChild(nameSpan); // Name wird direkt zum placeholder hinzugefügt (außerhalb des contentWrapper)
                }
                
                placeholder.appendChild(contentWrapper);
                shapesRow.appendChild(placeholder);

                placeholder.addEventListener('click', () => openTeamModal(team, schoolConfig.shapeClass));
                placeholder.addEventListener('keydown', (event) => { 
                    if (event.key === 'Enter' || event.key === ' ') {
                        openTeamModal(team, schoolConfig.shapeClass);
                    }
                });
            });
        });
    }    // Funktion zum Laden der Team-Konfiguration
    async function loadAndDisplayTeams() {
        try {
            console.log('Versuche, die Team-Konfiguration zu laden...');
            const response = await fetch('src/data/teams.json'); // Pfad zur Konfigurationsdatei
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const loadedTeamsConfig = await response.json();
            console.log('Team-Konfiguration erfolgreich geladen:', loadedTeamsConfig);
            generateTeamPlaceholders(loadedTeamsConfig);
        } catch (error) {
            console.error("Fehler beim Laden oder Verarbeiten der Team-Konfiguration (teams.json):", error);            // Optional: Zeige eine Fehlermeldung im UI an, falls die Teams nicht geladen werden können
            const teamsSection = document.getElementById('teamsSection');
            if (teamsSection) {
                console.log('Zeige Fehlermeldung im Teams-Bereich an');
                teamsSection.querySelector('.col-12.mb-4').insertAdjacentHTML('afterend', 
                    "<div class='col-12'><p class='text-center jersey-10-regular' style='color: var(--text-color); font-size: 1.2em; background-color: rgba(255, 0, 0, 0.1); padding: 10px; border-radius: 5px;'>Team-Informationen konnten nicht geladen werden. Fehler: " + error.message + "</p></div>"
                );
            }
        }
    }

    loadAndDisplayTeams(); // Ruft die Funktion auf, um die Teams zu laden und zu generieren

    const bodyElement = document.body; // Ensure body is accessed after DOM is loaded

    // Theme Toggle Logic REMOVED

    // Verify if themeToggleButtons are detected
    // themeToggleButtons = document.querySelectorAll('#themeToggleButton'); //REMOVED
    // if (themeToggleButtons.length === 0) { //REMOVED
    // console.warn("No theme toggle buttons found. Ensure the ID matches in the HTML files."); //REMOVED
    // } else { //REMOVED
    // console.log('Theme toggle buttons found:', themeToggleButtons); //REMOVED
    // } //REMOVED

    // Debugging theme application //REMOVED
    // const currentTheme = loadThemePreference(); //REMOVED
    // console.log('Loaded theme preference:', currentTheme); //REMOVED
    // applyTheme(currentTheme || 'dark'); //REMOVED
});

console.log('Script loaded successfully');