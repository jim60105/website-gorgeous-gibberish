// Random phrases for input placeholder
export const randomPhrases = [
  "晚餐吃什麼",
  "今天天氣晴",
  "你怎麼看太陽從東邊出來",
  "珍奶好喝",
  "她不愛我",
  "你是誰?",
  "你在公三小",
  "3.9 和 3.11 哪個大",
  "告訴我下一期樂透號碼",
  "我餓了"
];

/**
 * Get a random phrase from the phrases array
 * @returns {string} A random phrase
 */
export function getRandomPhrase() {
  const index = Math.floor(Math.random() * randomPhrases.length);
  return randomPhrases[index];
}
