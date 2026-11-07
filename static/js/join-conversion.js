(function() {
    const SEND_TO = 'AW-18553752846/mTX5CLzJz7EdEI6aj49F';

    function isJoinLink(href) {
        let url;
        try {
            url = new URL(href, 'https://example.invalid/');
        } catch (error) {
            return false;
        }

        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return false;
        }

        const host = url.hostname.toLowerCase();
        return host === 'meetup.com' || host.endsWith('.meetup.com') ||
            host === 'discord.gg' ||
            ((host === 'discord.com' || host === 'discordapp.com') && url.pathname.startsWith('/invite/')) ||
            (host.endsWith('.devpost.com') && url.pathname.startsWith('/register')) ||
            (host === 'docs.google.com' && url.pathname.startsWith('/forms/'));
    }

    function trackJoinClick(event) {
        if (event.type === 'auxclick' && event.button !== 1) {
            return;
        }

        if (!event.target || typeof event.target.closest !== 'function') {
            return;
        }

        const anchor = event.target.closest('a[href]');
        if (!anchor || !isJoinLink(anchor.href)) {
            return;
        }

        if (typeof window.gtag !== 'function') {
            console.error('Cannot track join conversion: window.gtag is not a function.');
            return;
        }

        window.gtag('event', 'conversion', { send_to: SEND_TO });
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { isJoinLink };
    }

    if (typeof document !== 'undefined') {
        document.addEventListener('click', trackJoinClick, true);
        document.addEventListener('auxclick', trackJoinClick, true);
    }
})();
