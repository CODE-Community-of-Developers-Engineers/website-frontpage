document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Hamburger clicked', mobileNav.classList.contains('active')); // Debug log
            
            mobileNav.classList.toggle('active');
            
            if (mobileNav.classList.contains('active')) {
                console.log('Showing mobile menu');
                document.body.style.overflow = 'hidden';
                // Force visibility with !important equivalent
                mobileNav.style.setProperty('display', 'flex', 'important');
                mobileNav.style.setProperty('opacity', '1', 'important');
                mobileNav.style.setProperty('visibility', 'visible', 'important');
                mobileNav.style.setProperty('background-color', 'rgba(255, 0, 0, 0.8)', 'important');
                
                // Also force the content to be visible
                const content = mobileNav.querySelector('.mobile-nav-content');
                if (content) {
                    content.style.setProperty('background-color', 'white', 'important');
                    content.style.setProperty('border', '5px solid blue', 'important');
                    content.style.setProperty('padding', '2rem', 'important');
                    content.style.setProperty('border-radius', '10px', 'important');
                }
                console.log('After setting styles:', getComputedStyle(mobileNav).display);
            } else {
                console.log('Hiding mobile menu');
                document.body.style.overflow = '';
                mobileNav.style.setProperty('display', 'none', 'important');
                mobileNav.style.removeProperty('background-color');
            }
        });
        
        // Close mobile menu when clicking outside
        mobileNav.addEventListener('click', function(e) {
            if (e.target === mobileNav) {
                mobileNav.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        // Close mobile menu on window resize if screen becomes large
        window.addEventListener('resize', function() {
            if (window.innerWidth > 1300) {
                mobileNav.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    } else {
        console.log('Mobile menu elements not found:', { mobileMenuBtn, mobileNav }); // Debug log
    }
});
