// Carousel functionality
let currentSlideIndex = 0;
const slides = document.querySelectorAll('.carousel-slide');
const indicators = document.querySelectorAll('.indicator');

function showSlide(index) {
    // Hide all slides
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    // Show current slide
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