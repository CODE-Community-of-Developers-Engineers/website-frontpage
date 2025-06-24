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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeEventsCarousel);
function showEventsSlide(index) {
    const container = document.getElementById('eventsContainer');
    const cards = document.querySelectorAll('.event-card');
    const indicators = document.querySelectorAll('.events-indicator');
    
    if (!container || cards.length === 0) return;
    
    if (index >= cards.length) currentEventsIndex = 0;
    if (index < 0) currentEventsIndex = cards.length - 1;
    
    // Calculate transform based on card width and gap
    const cardWidth = 280; // min-width of event-card
    const gap = 16; // 1rem gap
    const translateX = -(currentEventsIndex * (cardWidth + gap));
    
    container.style.transform = `translateX(${translateX}px)`;
    
    // Update indicators
    indicators.forEach((indicator, i) => {
        indicator.classList.remove('active');
        if (i === currentEventsIndex) {
            indicator.classList.add('active');
        }
    });
}

function changeEventsSlide(direction) {
    currentEventsIndex += direction;
    showEventsSlide(currentEventsIndex);
}

function currentEventsSlide(index) {
    currentEventsIndex = index - 1;
    showEventsSlide(currentEventsIndex);
}

// Initialize carousels
document.addEventListener('DOMContentLoaded', function() {
    // Initialize main carousel
    const slides = document.querySelectorAll('.carousel-slide');
    if (slides.length > 0) {
        showSlide(0);
        
        // Start auto-advance for main carousel
        setInterval(() => {
            changeSlide(1);
        }, 5000);
    }
    
    // Initialize events carousel
    const eventsContainer = document.getElementById('eventsContainer');
    if (eventsContainer) {
        showEventsSlide(0);
        
        // Start auto-advance for events carousel
        setInterval(() => {
            changeEventsSlide(1);
        }, 4000);
    }
});

// Keyboard navigation for main carousel
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
        changeSlide(-1);
    } else if (e.key === 'ArrowRight') {
        changeSlide(1);
    }
});

