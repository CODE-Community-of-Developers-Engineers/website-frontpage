// Carousel functionality
let currentSlideIndex = 0;
let currentEventsIndex = 0;

function showSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    
    if (index >= slides.length) currentSlideIndex = 0;
    if (index < 0) currentSlideIndex = slides.length - 1;
    
    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (i === currentSlideIndex) {
            slide.classList.add('active');
        }
    });
    
    indicators.forEach((indicator, i) => {
        indicator.classList.remove('active');
        if (i === currentSlideIndex) {
            indicator.classList.add('active');
        }
    });
}

function changeSlide(direction) {
    currentSlideIndex += direction;
    showSlide(currentSlideIndex);
}

function currentSlide(index) {
    currentSlideIndex = index - 1;
    showSlide(currentSlideIndex);
}

// Events carousel functions
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

