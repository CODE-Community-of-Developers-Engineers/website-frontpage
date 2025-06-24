document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Hamburger clicked', mobileNav.classList.contains('active')); // Debug log
            
            mobileNav.classList.toggle('active');
            
            if (mobileNav.classList.contains('active')) {
                console.log('Showing mobile menu', 'Display style:', getComputedStyle(mobileNav).display);
                document.body.style.overflow = 'hidden';
                // Force visibility for debugging
                mobileNav.style.display = 'flex';
                mobileNav.style.opacity = '1';
                mobileNav.style.visibility = 'visible';
            } else {
                console.log('Hiding mobile menu');
                document.body.style.overflow = '';
                mobileNav.style.display = 'none';
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
