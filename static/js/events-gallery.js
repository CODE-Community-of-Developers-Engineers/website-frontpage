// Events gallery - renders one photo tile per image listed in events-data.js
(function() {
    'use strict';

    // Pure: turn an events-data.js entry into what a tile needs
    function toTile(item, basePath) {
        return {
            // Handle spaces and special characters in filenames
            image: `${basePath}/images/events/${encodeURIComponent(item.filename)}`,
            name: item.name
        };
    }

    function createTileElement(tile) {
        const figure = document.createElement('figure');
        figure.className = 'events-gallery-tile';

        const img = document.createElement('img');
        img.src = tile.image;
        img.alt = tile.name;
        img.loading = 'lazy';

        const caption = document.createElement('figcaption');
        caption.textContent = tile.name;

        figure.appendChild(img);
        figure.appendChild(caption);
        return figure;
    }

    function renderEventsGallery() {
        const gallery = document.getElementById('eventsGallery');
        if (!gallery) return;

        const items = window.eventsImageData || [];
        if (items.length === 0) {
            console.error('No events data available from events-data.js - check if script loaded');
            gallery.innerHTML = '<p class="events-gallery-empty">No event images found</p>';
            return;
        }

        const basePath = window.siteBasePath || '';
        items
            .map(item => toTile(item, basePath))
            .forEach(tile => gallery.appendChild(createTileElement(tile)));
    }

    document.addEventListener('DOMContentLoaded', renderEventsGallery);
})();
