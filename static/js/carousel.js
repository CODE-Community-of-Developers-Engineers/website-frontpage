document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('#carousel-slides .slide');
    const indicators = document.querySelectorAll('#carousel-indicators .indicator');
    const captions = document.querySelectorAll('#carousel-captions .caption');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    
    function showSlide(index) {
        // Hide all slides and captions
        slides.forEach((slide, i) => {
            if (i === index) {
                slide.style.opacity = '1';
                slide.style.display = 'block';
            } else {
                slide.style.opacity = '0';
                slide.style.display = 'none';
            }
        });
        
        captions.forEach((caption, i) => {
            if (i === index) {
                caption.style.display = 'block';
            } else {
                caption.style.display = 'none';
            }
        });
        
        // Update indicators
        indicators.forEach((indicator, i) => {
            if (i === index) {
                indicator.style.backgroundColor = 'white';
                indicator.style.transform = 'scale(1.2)';
            } else {
                indicator.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
                indicator.style.transform = 'scale(1)';
            }
        });
        
        currentSlide = index;
    }
    
    function nextSlide() {
        const next = (currentSlide + 1) % totalSlides;
        showSlide(next);
    }
    
    function prevSlide() {
        const prev = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(prev);
    }
    
    // Event listeners for navigation buttons
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }
    
    // Event listeners for indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => showSlide(index));
    });
    
    // Auto-advance carousel every 5 seconds
    setInterval(nextSlide, 5000);
    
    // Initialize with first slide
    showSlide(0);
});
