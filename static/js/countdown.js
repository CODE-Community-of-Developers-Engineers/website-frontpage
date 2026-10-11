(function () {
  const widgets = document.querySelectorAll('[data-countdown]');
  if (!widgets.length) return;

  const second = 1000;
  const minute = 60 * second;
  const hour = 60 * minute;
  const day = 24 * hour;

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function setText(widget, selector, value) {
    widget.querySelector(selector).textContent = value;
  }

  function render(widget) {
    const start = Date.parse(widget.dataset.countdownStart);
    const end = Date.parse(widget.dataset.countdownEnd);

    if (Number.isNaN(start) || Number.isNaN(end)) {
      throw new Error('Invalid countdown date configuration');
    }

    const now = Date.now();
    let remaining = start - now;
    let heading = 'Hackathon starts in';
    let status = 'January 23 at 10:00 AM EST';

    if (now >= start && now < end) {
      remaining = end - now;
      heading = 'Hackathon ends in';
      status = 'Submissions close January 23 at 5:00 PM EST';
    } else if (now >= end) {
      remaining = 0;
      heading = 'Hackathon complete';
      status = 'Thanks for building with us.';
    }

    const days = Math.floor(remaining / day);
    const hours = Math.floor((remaining % day) / hour);
    const minutes = Math.floor((remaining % hour) / minute);
    const seconds = Math.floor((remaining % minute) / second);

    setText(widget, '[data-countdown-days]', pad(days));
    setText(widget, '[data-countdown-hours]', pad(hours));
    setText(widget, '[data-countdown-minutes]', pad(minutes));
    setText(widget, '[data-countdown-seconds]', pad(seconds));
    setText(widget, '[data-countdown-heading]', heading);
    setText(widget, '[data-countdown-status]', status);
  }

  widgets.forEach(function (widget) {
    render(widget);
    window.setInterval(function () {
      render(widget);
    }, second);
  });
}());
