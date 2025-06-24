// Events carousel functionality wrapped in IIFE to avoid global conflicts
(function() {
    'use strict';
    
    // Check if carousel is already initialized
    if (window.carouselInitialized) {
        return;
    }
    window.carouselInitialized = true;
    
    let currentEventsIndex = 0;
    let eventsData = [];
    let carouselInterval;

function loadEventImages() {
    console.log('Loading event images...');
    console.log('window.eventsImageData:', window.eventsImageData);
    
    // Use the data from events-data.js if available
    if (window.eventsImageData && window.eventsImageData.length > 0) {
        eventsData = window.eventsImageData.map(item => {
            // Handle spaces and special characters in filenames
            const encodedFilename = encodeURIComponent(item.filename);
            const baseURL = window.location.pathname.includes('/Code-And-Coffee-philidelphia-Website') 
                ? '/Code-And-Coffee-philidelphia-Website' 
                : '';
            
            const imageUrl = `${baseURL}/images/events/${encodedFilename}`;
            console.log(`Processing event: ${item.name} -> ${imageUrl}`);
            
            return {
                image: imageUrl,
                name: item.name
            };
        });
        console.log(`Loaded ${eventsData.length} events from events-data.js`);
    } else {
        console.warn('No events data available from events-data.js - check if script loaded');
        eventsData = [];
    }
    return eventsData;
}

function initializeEventsCarousel() {
    const carousel = document.getElementById('eventsCarousel');
    if (!carousel) return;
    
    // Load images
    loadEventImages();
    
    // Clear any existing content
    carousel.innerHTML = '';
    
    if (eventsData.length === 0) {
        carousel.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 2rem;">No event images found</div>';
        return;
    }
    
    // Create slides
    eventsData.forEach((event, index) => {
        const slide = document.createElement('div');
        slide.className = `carousel-slide${index === 0 ? ' active' : ''}`;
        slide.innerHTML = `
            <div class="slide-background" style="background-image: url('${event.image}')"></div>
            <div class="slide-content">
                <h3>${event.name}</h3>
            </div>
        `;
        carousel.appendChild(slide);
    });
    
    // Update indicators to match number of images
    updateCarouselIndicators();
    
    // Initialize the first slide
    showEventsSlide(0);
}

function updateCarouselIndicators() {
    const indicatorContainer = document.querySelector('.carousel-indicators');
    if (!indicatorContainer) return;
    
    // Clear existing indicators
    indicatorContainer.innerHTML = '';
    
    // Create new indicators based on number of events
    eventsData.forEach((_, index) => {
        const indicator = document.createElement('button');
        indicator.className = `indicator${index === 0 ? ' active' : ''}`;
        indicator.onclick = () => currentSlide(index + 1);
        indicatorContainer.appendChild(indicator);
    });
}

function showEventsSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.carousel-indicators .indicator');
    
    if (slides.length === 0) return;
    
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

function startCarouselAutoAdvance() {
    carouselInterval = setInterval(() => {
        if (eventsData.length > 1) {
            changeSlide(1);
        }
    }, 3000);
}

function stopCarouselAutoAdvance() {
    if (carouselInterval) {
        clearInterval(carouselInterval);
    }
}

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        initializeEventsCarousel();
        startCarouselAutoAdvance();
        
        // Pause auto-advance when user hovers over carousel
        const carouselContainer = document.querySelector('.carousel-container');
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', stopCarouselAutoAdvance);
            carouselContainer.addEventListener('mouseleave', startCarouselAutoAdvance);
        }
    });

    // Expose necessary functions globally for onclick handlers
    window.changeSlide = changeSlide;
    window.currentSlide = currentSlide;
    
})(); // End IIFE