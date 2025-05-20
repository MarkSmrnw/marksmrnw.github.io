/**
 * footer-loader.js - Dynamically loads the footer HTML into all pages
 * This script fetches the footer.html file and injects it into the page
 * where the footer-placeholder element is located.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Find the footer placeholder div
    const footerPlaceholder = document.getElementById('footer-placeholder');
    
    if (footerPlaceholder) {
        // Fetch the footer HTML file
        fetch('src/includes/footer.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(data => {
                // Insert the footer HTML into the placeholder
                footerPlaceholder.innerHTML = data;
                
                // Initialize any footer-specific scripts that may rely on the footer being loaded
                // For example, if your banner handler needs to access footer elements:
                if (typeof initRandomTextInFooter === 'function') {
                    initRandomTextInFooter();
                }
            })
            .catch(error => {
                console.error('Error loading footer:', error);
                footerPlaceholder.innerHTML = '<p>Error loading footer. Please try refreshing the page.</p>';
            });
    }
});

/**
 * This function initializes any random text in the footer
 * It's called after the footer is loaded
 */
function initRandomTextInFooter() {
    // Check if span_random_1 exists (it should be in the footer)
    const randomTextSpan = document.getElementById('span_random_1');
    if (randomTextSpan) {
        // Array of possible random texts
        const randomTexts = [
            "♥",
            "Liebe",
            "Passion",
            "Herzblut",
            "Schweiß und Tränen",
            "unendlicher Geduld",
            "rockigen Vibes",
            "Rocket Power"
        ];
        
        // Select a random text
        const randomText = randomTexts[Math.floor(Math.random() * randomTexts.length)];
        
        // Update the span
        randomTextSpan.textContent = randomText;
    }
}
