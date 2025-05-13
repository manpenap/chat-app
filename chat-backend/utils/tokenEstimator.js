// Estimador simple de tokens basado en el conteo de palabras
export const estimateTokens = (chatHistory) => {
  const tokenPerWord = 1.5; // Aproximadamente 1.5 tokens por palabra
  const totalWords = chatHistory.reduce((count, entry) => {
    return count + entry.message.split(' ').length;
  }, 0);
  return Math.ceil(totalWords * tokenPerWord);
};