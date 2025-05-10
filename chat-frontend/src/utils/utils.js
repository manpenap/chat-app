/**
 * Capitaliza la primera letra de cada oración en un texto.
 * @param {string} text - El texto a capitalizar.
 * @returns {string} - El texto con las oraciones capitalizadas.
 */
export const capitalizeSentences = (text) => {
  return text.replace(/(?:^|\.\s+|\?\s+|!\s+)([a-z])/g, (match, p1) =>
    match.replace(p1, p1.toUpperCase())
  );
};

/**
 * Reproduce un texto como audio usando la API de Speech Synthesis.
 * @param {string} text - El texto a reproducir.
 */
export const playText = (text) => {
  if (!("speechSynthesis" in window)) {
    console.error("Este navegador no soporta síntesis de voz.");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 1;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
};