(function () {
  const tabs = Array.from(document.querySelectorAll('#events [role="tab"]'));
  if (!tabs.length) return;

  function select(tab) {
    tabs.forEach(other => {
      const selected = other === tab;
      other.setAttribute('aria-selected', String(selected));
      other.tabIndex = selected ? 0 : -1;
      other.classList.toggle('btn-secondary', !selected);
      document.getElementById(other.getAttribute('aria-controls')).hidden = !selected;
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
      if (!step) return;
      event.preventDefault();
      const next = tabs[(index + step + tabs.length) % tabs.length];
      select(next);
      next.focus();
    });
  });

  // The markup shows both feeds and hides the tabs, so the Meetup feed stays usable if this script fails
  select(tabs[0]);
  tabs[0].closest('[role="tablist"]').hidden = false;
})();
