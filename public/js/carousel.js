// Carousel functionality
let currentSlideIndex = 0;
const slides = document.querySelectorAll('.carousel-slide');
const indicators = document.querySelectorAll('.indicator');

function showSlide(index) {
    // Remove all classes from slides
    slides.forEach((slide, i) => {
        slide.classList.remove('active', 'prev', 'next');
        if (i < index) {
            slide.classList.add('prev');
        } else if (i > index) {
            slide.classList.add('next');
        }
    });
    
    // Remove active from indicators
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    // Show current slide and indicator
    if (slides[index]) {
        slides[index].classList.add('active');
        indicators[index].classList.add('active');
    }
}

function changeSlide(direction) {
    currentSlideIndex += direction;
    
    if (currentSlideIndex >= slides.length) {
        currentSlideIndex = 0;
    }
    if (currentSlideIndex < 0) {
        currentSlideIndex = slides.length - 1;
    }
    
    showSlide(currentSlideIndex);
}

function currentSlide(index) {
    currentSlideIndex = index - 1;
    showSlide(currentSlideIndex);
}

// Auto-advance carousel every 5 seconds
function autoAdvance() {
    changeSlide(1);
}

// Initialize carousel
document.addEventListener('DOMContentLoaded', function() {
    if (slides.length > 0) {
        showSlide(0);
        
        // Start auto-advance
        setInterval(autoAdvance, 5000);
        
        // Pause auto-advance on hover
        const carousel = document.querySelector('.carousel-container');
        if (carousel) {
            let autoAdvanceInterval = setInterval(autoAdvance, 5000);
            
            carousel.addEventListener('mouseenter', () => {
                clearInterval(autoAdvanceInterval);
            });
            
            carousel.addEventListener('mouseleave', () => {
                autoAdvanceInterval = setInterval(autoAdvance, 5000);
            });
        }
    }
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
        changeSlide(-1);
    } else if (e.key === 'ArrowRight') {
        changeSlide(1);
    }
});

// Events Slider functionality
let currentEventsSlideIndex = 0;
const eventsSlides = document.querySelectorAll('.events-slide');
const eventsIndicators = document.querySelectorAll('.events-indicator');

function showEventsSlide(index) {
    // Hide all slides
    eventsSlides.forEach(slide => slide.classList.remove('active'));
    eventsIndicators.forEach(indicator => indicator.classList.remove('active'));
    
    // Show current slide
    if (eventsSlides[index]) {
        eventsSlides[index].classList.add('active');
        eventsIndicators[index].classList.add('active');
    }
}

function changeEventsSlide(direction) {
    currentEventsSlideIndex += direction;
    
    if (currentEventsSlideIndex >= eventsSlides.length) {
        currentEventsSlideIndex = 0;
    }
    if (currentEventsSlideIndex < 0) {
        currentEventsSlideIndex = eventsSlides.length - 1;
    }
    
    showEventsSlide(currentEventsSlideIndex);
}

function currentEventsSlide(index) {
    currentEventsSlideIndex = index - 1;
    showEventsSlide(currentEventsSlideIndex);
}

// Auto-advance events slider every 4 seconds
function autoAdvanceEvents() {
    changeEventsSlide(1);
}

// Initialize events slider
document.addEventListener('DOMContentLoaded', function() {
    if (eventsSlides.length > 0) {
        showEventsSlide(0);
        
        // Start auto-advance for events slider
        let eventsAutoInterval = setInterval(autoAdvanceEvents, 4000);
        
        // Pause auto-advance on hover for events slider
        const eventsSlider = document.querySelector('.events-slider-container');
        if (eventsSlider) {
            eventsSlider.addEventListener('mouseenter', () => {
                clearInterval(eventsAutoInterval);
            });
            
            eventsSlider.addEventListener('mouseleave', () => {
                eventsAutoInterval = setInterval(autoAdvanceEvents, 4000);
            });
        }
    }
});