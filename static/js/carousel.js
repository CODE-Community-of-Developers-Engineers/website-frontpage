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



// Initialize carousels
document.addEventListener('DOMContentLoaded', function() {
    // Initialize main carousel
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    
    if (slides.length > 0) {
        showSlide(0, slides, indicators);
        
        // Start auto-advance for main carousel
        let autoAdvanceInterval = setInterval(() => {
            changeSlide(1);
        }, 5000);
        
        // Pause auto-advance on hover
        const carousel = document.querySelector('.carousel-container');
        if (carousel) {
            carousel.addEventListener('mouseenter', () => {
                clearInterval(autoAdvanceInterval);
            });
            
            carousel.addEventListener('mouseleave', () => {
                autoAdvanceInterval = setInterval(() => {
                    changeSlide(1);
                }, 5000);
            });
        }
    }
    
    // Initialize events slider
    const eventsSlides = document.querySelectorAll('.events-slide');
    const eventsIndicators = document.querySelectorAll('.events-indicator');
    
    if (eventsSlides.length > 0) {
        showEventsSlide(0, eventsSlides, eventsIndicators);
        
        // Start auto-advance for events slider
        let eventsAutoInterval = setInterval(() => {
            changeEventsSlide(1);
        }, 4000);
        
        // Pause auto-advance on hover for events slider
        const eventsSlider = document.querySelector('.events-slider-container');
        if (eventsSlider) {
            eventsSlider.addEventListener('mouseenter', () => {
                clearInterval(eventsAutoInterval);
            });
            
            eventsSlider.addEventListener('mouseleave', () => {
                eventsAutoInterval = setInterval(() => {
                    changeEventsSlide(1);
                }, 4000);
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

