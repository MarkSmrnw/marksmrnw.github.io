document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('pageTransitionOverlay');
    const body = document.body;
    const overlayTransitionDuration = 750; // New, shorter duration
    const bodyFadeDuration = 400; // Must match CSS transition duration

    if (overlay && body) {
        // Ensure overlay is in its 'covering' state initially (translateY(0%))
        overlay.classList.remove('slide-out');

        // After a very brief moment for rendering, slide overlay out
        requestAnimationFrame(() => {
            setTimeout(() => { // setTimeout ensures transition class is applied after initial render
                overlay.classList.add('slide-out');
            }, 20); 
        });

        overlay.addEventListener('transitionend', () => {
            if (overlay.classList.contains('slide-out')) {
                body.classList.remove('content-hidden'); // Fade in body content
            }
        }, { once: false }); // Use false if multiple transitions might occur, handle specific property if needed
         // Fallback for body fade-in if transitionend doesn't fire as expected for overlay
        setTimeout(() => {
            if (overlay.classList.contains('slide-out')) {
                 body.classList.remove('content-hidden');
            }
        }, overlayTransitionDuration + 50);

    } else {
        body.classList.remove('content-hidden'); // No overlay, just show content
    }

    // Link Click Animation
    const internalLinks = document.querySelectorAll(
        'a[href]:not([href^="#"]):not([href^="javascript:"]):not([target="_blank"])'
    );

    internalLinks.forEach(link => {
        try {
            const url = new URL(link.href, window.location.origin);
            // Ensure it's an internal link to a different page
            if (url.origin === window.location.origin &&
                (url.pathname !== window.location.pathname || url.search !== window.location.search || url.hash !== window.location.hash)) {
                link.addEventListener('click', function(event) {
                    event.preventDefault();
                    const destination = this.href;

                    body.classList.add('content-hidden'); // Fade out body content

                    // Wait for body fade out before bringing overlay in
                    setTimeout(() => {
                        if (overlay) {
                            overlay.classList.remove('slide-out'); // Slide overlay in
                            
                            // Failsafe navigation if transitionend doesn't fire
                            let navigated = false;
                            const navigateOnce = () => {
                                if (!navigated) {
                                    navigated = true;
                                    window.location.href = destination;
                                }
                            };
                            
                            overlay.addEventListener('transitionend', (e) => {
                                if (e.propertyName === 'transform' && !overlay.classList.contains('slide-out')) {
                                   navigateOnce();
                                }
                            }, { once: false }); // Listen for specific transition
                            setTimeout(navigateOnce, overlayTransitionDuration + 50); // Failsafe timeout
                        } else {
                            window.location.href = destination; // Navigate if no overlay
                        }
                    }, bodyFadeDuration); 
                });
            }
        } catch (e) {
            // Invalid URL, ignore
            // console.warn("Could not parse link href for transition:", link.href, e);
        }
    });
});
