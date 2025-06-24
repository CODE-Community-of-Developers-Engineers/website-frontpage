document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    let isMenuOpen = false;
    
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Hamburger clicked, current state:', isMenuOpen);
            
            if (!isMenuOpen) {
                // Open menu
                mobileNav.classList.add('active');
                document.body.style.overflow = 'hidden';
                isMenuOpen = true;
                console.log('Opening mobile menu');
            } else {
                // Close menu
                mobileNav.classList.remove('active');
                document.body.style.overflow = '';
                isMenuOpen = false;
                console.log('Closing mobile menu');
            }
        });
        
        // Close mobile menu when clicking outside
        mobileNav.addEventListener('click', function(e) {
            if (e.target === mobileNav) {
                mobileNav.classList.remove('active');
                document.body.style.overflow = '';
                isMenuOpen = false;
                console.log('Closing menu via background click');
            }
        });
        
        // Close mobile menu on window resize if screen becomes large
        window.addEventListener('resize', function() {
            if (window.innerWidth > 1300) {
                mobileNav.classList.remove('active');
                document.body.style.overflow = '';
                isMenuOpen = false;
            }
        });
    } else {
        console.log('Mobile menu elements not found:', { mobileMenuBtn, mobileNav }); // Debug log
    }
});
