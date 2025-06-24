// Events carousel functionality
let currentEventsIndex = 0;

// Event data with images, names, and dates
const eventsData = [
    {
        image: '/images/events/coffee-coding-session.svg',
        name: 'Weekend Coding Session',
        date: 'December 28, 2024'
    },
    {
        image: '/images/events/tech-talk-evening.svg',
        name: 'Tech Talk Evening',
        date: 'January 5, 2025'
    },
    {
        image: '/images/events/networking-mixer.svg',
        name: 'Networking Mixer & Coffee Social',
        date: 'January 12, 2025'
    },
    {
        image: '/images/events/hackathon-kickoff.svg',
        name: 'Hackathon Kickoff',
        date: 'January 19, 2025'
    },
    {
        image: '/images/events/workshop-series.svg',
        name: 'Workshop Series: Learn & Build',
        date: 'January 26, 2025'
    }
];

function initializeEventsCarousel() {
    const carousel = document.getElementById('eventsCarousel');
    if (!carousel) return;
    
    // Clear any existing content
    carousel.innerHTML = '';
    
    // Create slides
    eventsData.forEach((event, index) => {
        const slide = document.createElement('div');
        slide.className = `carousel-slide${index === 0 ? ' active' : ''}`;
        slide.innerHTML = `
            <div class="slide-background" style="background-image: url('${event.image}')"></div>
            <div class="slide-content">
                <h3>${event.name}</h3>
                <p class="event-date">${event.date}</p>
            </div>
        `;
        carousel.appendChild(slide);
    });
    
    // Initialize the first slide
    showEventsSlide(0);
}

function showEventsSlide(index) {
    const slides = document.querySelectorAll('#eventsCarousel .carousel-slide');
    const indicators = document.querySelectorAll('.carousel-indicators .indicator');
    
    if (index >= slides.length) currentEventsIndex = 0;
    if (index < 0) currentEventsIndex = slides.length - 1;
    
    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (i === currentEventsIndex) {
            slide.classList.add('active');
        }
    });
    
    indicators.forEach((indicator, i) => {
        indicator.classList.remove('active');
        if (i === currentEventsIndex) {
            indicator.classList.add('active');
        }
    });
}

function changeSlide(direction) {
    currentEventsIndex += direction;
    showEventsSlide(currentEventsIndex);
}

function currentSlide(index) {
    currentEventsIndex = index - 1;
    showEventsSlide(currentEventsIndex);
}

// Legacy function name for compatibility
function showSlide(index) {
    showEventsSlide(index);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeEventsCarousel);