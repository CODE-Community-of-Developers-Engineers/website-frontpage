document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Hamburger clicked'); // Debug log
            
            if (mobileNav.classList.contains('active')) {
                mobileNav.classList.remove('active');
                mobileNav.style.display = 'none';
                document.body.style.overflow = '';
            } else {
                mobileNav.classList.add('active');
                mobileNav.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
        
        // Close mobile menu when clicking outside
        mobileNav.addEventListener('click', function(e) {
            if (e.target === mobileNav) {
                mobileNav.classList.remove('active');
                mobileNav.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
        
        // Close mobile menu on window resize if screen becomes large
        window.addEventListener('resize', function() {
            if (window.innerWidth > 1300) {
                mobileNav.classList.remove('active');
                mobileNav.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    } else {
        console.log('Mobile menu elements not found:', { mobileMenuBtn, mobileNav }); // Debug log
    }
});
