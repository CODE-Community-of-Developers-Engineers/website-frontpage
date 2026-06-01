// Live feeds renderer - reads from live-feeds-data.js and renders to DOM
(function () {
  function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return diffDays + 'd ago';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function formatStars(n) {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return n.toString();
  }

  function renderPhillyNews(items, container) {
    container.innerHTML = items.map(function (item) {
      return '<a href="' + item.url + '" target="_blank" rel="noopener noreferrer" class="feed-item">' +
        '<span class="feed-item-category">' + item.category + '</span>' +
        '<h4 class="feed-item-title">' + item.title + '</h4>' +
        '<div class="feed-item-meta">' +
          '<span>' + item.source + '</span>' +
          '<span>' + formatDate(item.date) + '</span>' +
        '</div>' +
      '</a>';
    }).join('');
  }

  function renderGithubTrending(items, container) {
    container.innerHTML = items.map(function (item) {
      return '<a href="' + item.url + '" target="_blank" rel="noopener noreferrer" class="feed-item">' +
        '<h4 class="feed-item-title feed-item-repo">' + item.name + '</h4>' +
        '<p class="feed-item-desc">' + item.description + '</p>' +
        '<div class="feed-item-meta">' +
          '<span class="feed-item-lang"><span class="lang-dot lang-' + item.language.toLowerCase() + '"></span>' + item.language + '</span>' +
          '<span><i class="fa-solid fa-star"></i> ' + formatStars(item.stars) + '</span>' +
          '<span class="feed-item-today">+' + formatStars(item.todayStars) + ' today</span>' +
        '</div>' +
      '</a>';
    }).join('');
  }

  function renderAiPapers(items, container) {
    container.innerHTML = items.map(function (item) {
      return '<a href="' + item.url + '" target="_blank" rel="noopener noreferrer" class="feed-item">' +
        '<h4 class="feed-item-title">' + item.title + '</h4>' +
        '<p class="feed-item-desc">' + item.summary + '</p>' +
        '<div class="feed-item-meta">' +
          '<span>' + item.authors + '</span>' +
          '<span>' + formatDate(item.date) + '</span>' +
        '</div>' +
      '</a>';
    }).join('');
  }

  function renderUpcomingEvents(items, container) {
    var sorted = items.slice().sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    });
    container.innerHTML = sorted.map(function (item) {
      var d = new Date(item.date);
      var weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
      var month = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      var time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      return '<a href="' + item.url + '" target="_blank" rel="noopener noreferrer" class="event-feed-card">' +
        '<div class="event-feed-date">' +
          '<span class="event-feed-weekday">' + weekday + '</span>' +
          '<span class="event-feed-day">' + d.getDate() + '</span>' +
          '<span class="event-feed-month">' + d.toLocaleDateString('en-US', { month: 'short' }) + '</span>' +
        '</div>' +
        '<div class="event-feed-details">' +
          '<h4 class="event-feed-name">' + item.name + '</h4>' +
          '<div class="event-feed-meta">' +
            '<span><i class="fa-solid fa-clock"></i> ' + time + '</span>' +
            '<span><i class="fa-solid fa-location-dot"></i> ' + item.location + '</span>' +
          '</div>' +
          (item.rsvpCount ? '<span class="event-feed-rsvp"><i class="fa-solid fa-users"></i> ' + item.rsvpCount + ' attending</span>' : '') +
        '</div>' +
      '</a>';
    }).join('');
  }

  function renderLastUpdated(dateStr) {
    var el = document.getElementById('feeds-last-updated');
    if (!el) return;
    var date = new Date(dateStr);
    el.textContent = 'Updated ' + date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });
  }

  function init() {
    var data = window.LIVE_FEEDS;
    if (!data) return;

    var newsContainer = document.getElementById('feed-philly-news');
    var githubContainer = document.getElementById('feed-github-trending');
    var papersContainer = document.getElementById('feed-ai-papers');
    var eventsContainer = document.getElementById('feed-upcoming-events');

    if (newsContainer && data.phillyNews && data.phillyNews.length) {
      renderPhillyNews(data.phillyNews, newsContainer);
    } else if (newsContainer) {
      newsContainer.closest('.feed-column').style.display = 'none';
    }
    if (githubContainer && data.githubTrending && data.githubTrending.length) {
      renderGithubTrending(data.githubTrending, githubContainer);
    } else if (githubContainer) {
      githubContainer.closest('.feed-column').style.display = 'none';
    }
    if (papersContainer && data.aiPapers && data.aiPapers.length) {
      renderAiPapers(data.aiPapers, papersContainer);
    } else if (papersContainer) {
      papersContainer.closest('.feed-column').style.display = 'none';
    }
    if (eventsContainer && data.upcomingEvents) renderUpcomingEvents(data.upcomingEvents, eventsContainer);
    if (data.lastUpdated) renderLastUpdated(data.lastUpdated);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
