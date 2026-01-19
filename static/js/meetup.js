document.addEventListener('DOMContentLoaded', function() {
    const MEETUP_URL = 'https://www.meetup.com/code-coffee-philly/';

    // CORS proxies to try in order (fallback chain)
    const CORS_PROXIES = [
        (url) => 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url),
        (url) => 'https://corsproxy.io/?' + encodeURIComponent(url),
    ];

    // Function to fetch Meetup events
    function fetchMeetupEvents() {
        const eventsContainer = document.getElementById('upcoming-events');
        if (!eventsContainer) return;

        // Show loading state
        eventsContainer.innerHTML = '<div class="loading">Loading upcoming events...</div>';

        // Use CORS proxies for both local and production
        tryProxies(0);
    }

    // Try proxies in sequence
    function tryProxies(proxyIndex) {
        if (proxyIndex >= CORS_PROXIES.length) {
            handleError(new Error('All proxies failed'));
            return;
        }

        const proxyUrl = CORS_PROXIES[proxyIndex](MEETUP_URL);
        console.log('Trying proxy', proxyIndex + 1, ':', proxyUrl.split('?')[0]);

        fetch(proxyUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Proxy returned ' + response.status);
                }
                return response.text();
            })
            .then(html => {
                // Verify we got actual Meetup HTML with JSON-LD data we can parse
                if (!html.includes('application/ld+json')) {
                    throw new Error('Response does not contain expected JSON-LD data');
                }
                handleData(html);
            })
            .catch(error => {
                console.warn('Proxy', proxyIndex + 1, 'failed:', error.message);
                // Try next proxy
                tryProxies(proxyIndex + 1);
            });
    }

    // Handle errors
    function handleError(error) {
        console.error('Error fetching Meetup events:', error);
        const eventsContainer = document.getElementById('upcoming-events');
        if (eventsContainer) {
            eventsContainer.innerHTML = '<p style="color: #000000;">Unable to load events. Please check <a href="https://www.meetup.com/code-coffee-philly/" target="_blank" style="color: #000000;">our Meetup page</a>.</p>';
        }
    }

    // Process the HTML data
    function handleData(html) {
        const eventsContainer = document.getElementById('upcoming-events');
        if (!eventsContainer) return;

        // Extract JSON-LD directly from HTML string using regex
        // Note: DOMParser may sanitize script contents, so we use regex instead
        const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
        let events = [];
        let match;

        while ((match = jsonLdRegex.exec(html)) !== null) {
            try {
                const jsonData = JSON.parse(match[1]);
                if (Array.isArray(jsonData)) {
                    // Filter for Event type objects
                    const eventObjects = jsonData.filter(item => item['@type'] === 'Event');
                    events = events.concat(eventObjects);
                }
            } catch (e) {
                // Silently skip malformed JSON-LD blocks
            }
        }

        if (events.length === 0) {
            console.warn('No events found in Meetup response');
            eventsContainer.innerHTML = '<p style="color: #000000;">No upcoming events found. Check back soon!</p>';
            return;
        }

        console.log('Found', events.length, 'events from Meetup');

        // Sort events by date
        events.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

        // Clear loading message
        eventsContainer.innerHTML = '';

        // Display up to 3 upcoming events
        const maxEvents = Math.min(events.length, 3);

        for (let i = 0; i < maxEvents; i++) {
            const event = events[i];

            // Format date and time
            const eventDate = new Date(event.startDate);
            const formattedDate = eventDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            const formattedTime = eventDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });

            // Get location
            let location = 'Location TBA';
            if (event.location && event.location.name) {
                location = event.location.name;
                if (event.location.address && event.location.address.addressLocality) {
                    location += ', ' + event.location.address.addressLocality;
                }
            }

            // Create event card
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            eventCard.style.backgroundColor = 'white';
            eventCard.style.borderRadius = '8px';
            eventCard.style.padding = '15px';
            eventCard.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
            eventCard.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';

            eventCard.innerHTML = `
                <h3 style="margin-top: 0; color: #000000; font-size: 1.2rem;">${event.name}</h3>
                <p style="margin: 8px 0; color: #000000; font-size: 0.9rem;">${formattedDate} at ${formattedTime}</p>
                <p style="margin: 8px 0; color: #000000; font-size: 0.9rem;">${location}</p>
                <a href="${event.url}" target="_blank" style="display: inline-block; margin-top: 10px; padding: 6px 12px; background-color: #59969B; color: white; text-decoration: none; border-radius: 4px; font-size: 0.9rem; transition: background-color 0.2s ease;">View Details</a>
            `;

            eventsContainer.appendChild(eventCard);
        }

    }
    // Call the function to fetch and display events
    fetchMeetupEvents();
});
