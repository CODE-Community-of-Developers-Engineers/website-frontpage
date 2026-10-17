document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    let isMenuOpen = false;

    function openMenu() {
        mobileNav.classList.add('active');
        document.body.style.overflow = 'hidden';
        isMenuOpen = true;
    }

    function closeMenu() {
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
        isMenuOpen = false;
    }

    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            if (!isMenuOpen) {
                openMenu();
            } else {
                closeMenu();
            }
        });

        mobileNav.addEventListener('click', function(e) {
            // Close when tapping outside the panel
            if (e.target === mobileNav) {
                closeMenu();
            }
            // Close when a link is tapped, so in-page links (e.g. #events) are not left covered by the menu
            if (e.target.closest('a')) {
                closeMenu();
            }
        });

        // Close mobile menu on window resize if screen becomes large
        window.addEventListener('resize', function() {
            if (window.innerWidth > 960) {
                closeMenu();
            }
        });
    } else {
        console.log('Mobile menu elements not found:', { mobileMenuBtn, mobileNav }); // Debug log
    }
});
