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

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function safeUrl(value) {
    var url = String(value || '');
    return /^https?:\/\//i.test(url) ? url : '#';
  }

  function safeClassPart(value) {
    return String(value || 'unknown').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  }

  function renderPhillyNews(items, container) {
    container.innerHTML = items.map(function (item) {
      return '<a href="' + escapeHtml(safeUrl(item.url)) + '" target="_blank" rel="noopener noreferrer" class="feed-item">' +
        '<span class="feed-item-category">' + escapeHtml(item.category) + '</span>' +
        '<h4 class="feed-item-title">' + escapeHtml(item.title) + '</h4>' +
        '<div class="feed-item-meta">' +
          '<span>' + escapeHtml(item.source) + '</span>' +
          '<span>' + escapeHtml(formatDate(item.date)) + '</span>' +
        '</div>' +
      '</a>';
    }).join('');
  }

  function renderGithubTrending(items, container) {
    container.innerHTML = items.map(function (item) {
      return '<a href="' + escapeHtml(safeUrl(item.url)) + '" target="_blank" rel="noopener noreferrer" class="feed-item">' +
        '<h4 class="feed-item-title feed-item-repo">' + escapeHtml(item.name) + '</h4>' +
        '<p class="feed-item-desc">' + escapeHtml(item.description) + '</p>' +
        '<div class="feed-item-meta">' +
          '<span class="feed-item-lang"><span class="lang-dot lang-' + safeClassPart(item.language) + '"></span>' + escapeHtml(item.language) + '</span>' +
          '<span><i class="fa-solid fa-star"></i> ' + escapeHtml(formatStars(item.stars)) + '</span>' +
          '<span class="feed-item-today">+' + escapeHtml(formatStars(item.todayStars)) + ' today</span>' +
        '</div>' +
      '</a>';
    }).join('');
  }

  function renderAiPapers(items, container) {
    container.innerHTML = items.map(function (item) {
      return '<a href="' + escapeHtml(safeUrl(item.url)) + '" target="_blank" rel="noopener noreferrer" class="feed-item">' +
        '<h4 class="feed-item-title">' + escapeHtml(item.title) + '</h4>' +
        '<p class="feed-item-desc">' + escapeHtml(item.summary) + '</p>' +
        '<div class="feed-item-meta">' +
          '<span>' + escapeHtml(item.authors) + '</span>' +
          '<span>' + escapeHtml(formatDate(item.date)) + '</span>' +
        '</div>' +
      '</a>';
    }).join('');
  }

  function renderHackerNews(items, container) {
    container.innerHTML = items.map(function (item) {
      return '<a href="' + escapeHtml(safeUrl(item.url)) + '" target="_blank" rel="noopener noreferrer" class="feed-item">' +
        '<h4 class="feed-item-title">' + escapeHtml(item.title) + '</h4>' +
        '<div class="feed-item-meta">' +
          '<span class="feed-item-hn-score"><i class="fa-solid fa-arrow-up"></i> ' + escapeHtml(item.score) + '</span>' +
          '<span><a href="' + escapeHtml(safeUrl(item.hnUrl)) + '" target="_blank" rel="noopener noreferrer" class="feed-item-comments" onclick="event.stopPropagation()"><i class="fa-solid fa-comment"></i> ' + escapeHtml(item.comments) + '</a></span>' +
          '<span>' + escapeHtml(item.author) + '</span>' +
        '</div>' +
      '</a>';
    }).join('');
  }

  function renderProductHunt(items, container) {
    container.innerHTML = items.map(function (item) {
      return '<a href="' + escapeHtml(safeUrl(item.url)) + '" target="_blank" rel="noopener noreferrer" class="feed-item">' +
        '<h4 class="feed-item-title">' + escapeHtml(item.title) + '</h4>' +
        (item.description ? '<p class="feed-item-desc">' + escapeHtml(item.description) + '</p>' : '') +
        '<div class="feed-item-meta">' +
          '<span><i class="fa-solid fa-user"></i> ' + escapeHtml(item.author) + '</span>' +
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
      return '<a href="' + escapeHtml(safeUrl(item.url)) + '" target="_blank" rel="noopener noreferrer" class="event-feed-card">' +
        '<div class="event-feed-date">' +
          '<span class="event-feed-weekday">' + escapeHtml(weekday) + '</span>' +
          '<span class="event-feed-day">' + escapeHtml(d.getDate()) + '</span>' +
          '<span class="event-feed-month">' + escapeHtml(d.toLocaleDateString('en-US', { month: 'short' })) + '</span>' +
        '</div>' +
        '<div class="event-feed-details">' +
          '<h4 class="event-feed-name">' + escapeHtml(item.name) + '</h4>' +
          '<div class="event-feed-meta">' +
            '<span><i class="fa-solid fa-clock"></i> ' + escapeHtml(time) + '</span>' +
            '<span><i class="fa-solid fa-location-dot"></i> ' + escapeHtml(item.location) + '</span>' +
          '</div>' +
          (item.rsvpCount ? '<span class="event-feed-rsvp"><i class="fa-solid fa-users"></i> ' + escapeHtml(item.rsvpCount) + ' attending</span>' : '') +
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
    var hnContainer = document.getElementById('feed-hacker-news');
    var phContainer = document.getElementById('feed-product-hunt');
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
    if (hnContainer && data.hackerNews && data.hackerNews.length) {
      renderHackerNews(data.hackerNews, hnContainer);
    } else if (hnContainer) {
      hnContainer.closest('.feed-column').style.display = 'none';
    }
    if (phContainer && data.productHunt && data.productHunt.length) {
      renderProductHunt(data.productHunt, phContainer);
    } else if (phContainer) {
      phContainer.closest('.feed-column').style.display = 'none';
    }
    if (eventsContainer && data.upcomingEvents && data.upcomingEvents.length) {
      renderUpcomingEvents(data.upcomingEvents, eventsContainer);
    }
    if (data.lastUpdated) renderLastUpdated(data.lastUpdated);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
