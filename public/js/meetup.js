// Meetup Events Integration
document.addEventListener('DOMContentLoaded', function() {
    const eventsContainer = document.getElementById('upcoming-events');
    
    if (!eventsContainer) return;
    
    // Simulated events data - in production, this would come from Meetup API
    // For now, we'll show a message directing users to Meetup
    function displayEvents() {
        eventsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">
                <h3 style="color: #3B2521; margin-bottom: 15px;">Join Us for Upcoming Events!</h3>
                <p style="color: #555; margin-bottom: 20px;">
                    Check out our latest events and RSVP on Meetup. We host regular coding sessions, 
                    tech talks, networking events, and workshops throughout the month.
                </p>
                <a href="https://www.meetup.com/code-coffee-philly/events/" 
                   target="_blank" 
                   style="display: inline-block; padding: 12px 25px; background-color: #59969B; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; transition: background-color 0.3s ease;">
                    View Events on Meetup →
                </a>
            </div>
        `;
    }
    
    // Display the events
    displayEvents();
});
