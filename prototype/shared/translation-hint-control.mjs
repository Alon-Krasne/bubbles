export function configureTranslationHintButton(button, language) {
  let enabled = false;
  const render = () => {
    button.ownerDocument.documentElement.classList.toggle('translation-help-enabled', enabled);
    button.setAttribute('aria-pressed', String(enabled));
    button.textContent = enabled ? '💡 הסתרת רמז' : '💡 רמז';
    button.title = 'הפעילו רמז ואז רחפו מעל מילה או חפץ לתרגום';
  };
  button.hidden = language !== 'en';
  button.onclick = () => { enabled = !enabled; render(); };
  render();
}
