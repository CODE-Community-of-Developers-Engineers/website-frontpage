// Hero video - stops the silent background video for visitors who prefer reduced motion
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        const video = document.querySelector('.hero-media video');
        if (!video) return;

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            video.removeAttribute('autoplay');
            video.pause();
        }
    });
})();
