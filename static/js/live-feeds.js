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
    container.replaceChildren(...items.map(function (item) {
      var card = document.createElement('a');
      card.href = safeUrl(item.url);
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.className = 'feed-item';

      var title = document.createElement('h4');
      title.className = 'feed-item-title feed-item-repo';
      title.textContent = item.name;
      var description = document.createElement('p');
      description.className = 'feed-item-desc';
      description.textContent = item.description;

      var meta = document.createElement('div');
      meta.className = 'feed-item-meta';
      var language = document.createElement('span');
      language.className = 'feed-item-lang';
      language.textContent = item.language;
      var dot = document.createElement('span');
      dot.className = 'lang-dot lang-' + safeClassPart(item.language);
      language.prepend(dot);
      var stars = document.createElement('span');
      var starIcon = document.createElement('i');
      starIcon.className = 'fa-solid fa-star';
      stars.append(starIcon, ' ' + formatStars(item.stars));
      meta.append(language, stars);
      if (Number.isFinite(item.todayStars)) {
        var today = document.createElement('span');
        today.className = 'feed-item-today';
        today.textContent = '+' + formatStars(item.todayStars) + ' today';
        meta.append(today);
      }
      card.append(title, description, meta);
      return card;
    }));
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
      return '<div class="feed-item">' +
        '<h4 class="feed-item-title"><a href="' + escapeHtml(safeUrl(item.url)) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(item.title) + '</a></h4>' +
        '<div class="feed-item-meta">' +
          '<span class="feed-item-hn-score"><i class="fa-solid fa-arrow-up"></i> ' + escapeHtml(item.score) + '</span>' +
          '<span><a href="' + escapeHtml(safeUrl(item.hnUrl)) + '" target="_blank" rel="noopener noreferrer" class="feed-item-comments"><i class="fa-solid fa-comment"></i> ' + escapeHtml(item.comments) + '</a></span>' +
          '<span>' + escapeHtml(item.author) + '</span>' +
        '</div>' +
      '</div>';
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
    var sorted = items.filter(function (item) {
      return new Date(item.date).getTime() > Date.now();
    }).sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    });
    if (!sorted.length) {
      container.textContent = 'No upcoming events listed. Check Meetup for the latest schedule.';
      return;
    }
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
    el.textContent = 'Last checked ' + date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });
  }

  function init() {
    var data = window.LIVE_FEEDS;
    var feeds = [
      ['phillyNews', 'feed-philly-news', renderPhillyNews],
      ['githubTrending', 'feed-github-trending', renderGithubTrending],
      ['aiPapers', 'feed-ai-papers', renderAiPapers],
      ['hackerNews', 'feed-hacker-news', renderHackerNews],
      ['productHunt', 'feed-product-hunt', renderProductHunt],
      ['upcomingEvents', 'feed-upcoming-events', renderUpcomingEvents]
    ];
    feeds.forEach(function (feed) {
      var container = document.getElementById(feed[1]);
      if (!container) return;
      var source = data && data.sources && data.sources[feed[0]];
      if (!source || source.status !== 'ok') {
        container.textContent = 'This feed is temporarily unavailable. Please check back later.';
        return;
      }
      if (feed[0] === 'upcomingEvents' || data[feed[0]].length) {
        feed[2](data[feed[0]], container);
      } else {
        container.textContent = 'No items are currently listed.';
      }
      var lastSuccess = Date.parse(source.lastSuccessAt);
      if (!Number.isFinite(lastSuccess) || Date.now() - lastSuccess > 36 * 60 * 60 * 1000) {
        var notice = document.createElement('p');
        notice.className = 'feed-item';
        notice.textContent = 'This feed has not refreshed recently. These items may be out of date.';
        container.prepend(notice);
      }
    });
    if (data && data.lastUpdated) {
      renderLastUpdated(data.lastUpdated);
    } else {
      var lastUpdated = document.getElementById('feeds-last-updated');
      if (lastUpdated) lastUpdated.textContent = 'Feeds are temporarily unavailable.';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
