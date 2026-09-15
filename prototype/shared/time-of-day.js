// Apply before styles paint; the map and hosted activities share this preference.
(() => {
  const key = 'bubbles-time-of-day';
  const root = document.documentElement;
  root.dataset.timeOfDay = localStorage.getItem(key) === 'day' ? 'day' : 'night';

  document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('[data-time-toggle]');
    const updateButtons = () => buttons.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.timeToggle === root.dataset.timeOfDay));
    });
    buttons.forEach(button => button.addEventListener('click', () => {
      root.dataset.timeOfDay = button.dataset.timeToggle;
      localStorage.setItem(key, root.dataset.timeOfDay);
      updateButtons();
    }));
    updateButtons();
  });
})();
