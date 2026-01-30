// Random phrases for input placeholder
export const randomPhrases = [
  "晚餐吃什麼",
  "今天天氣晴，我想要吃蛋餅",
  "哈哈笑死",
  "來一杯珍奶不要珍珠",
  "她愛我，但我愛你",
  "你是誰?",
  "你在公三小",
  "3.9 和 3.11 哪個大",
  "告訴我下一期樂透號碼",
  "我餓了",
  "宇宙充滿了質子、中子、電子，還有奶子",
  "君日本語本當上手",
  "我要做須多夜花的狗",
  "原神，啟動！",
  "給開司一罐啤酒",
  "小丑竟是我自己",
  "媽媽這個人好帥",
  "你這腿我能玩一年",
  "我不做人啦！JOJO！",
  "我願稱你為最強",
  "我叫做大中天。大中天，泥終於來惹！",
  "All in BTC!",
  "你看起來好像我前男友",
  "這裡不是須多夜花的頻道，這裡是臭甲俱樂部",
  "客家人，幫我點個讚好不好！點讚不用錢！",
  "老鐵你這是真的牛逼！",
  "你會不會唱原住民拍手歌",
  "我要打開恐懼的大門了，還要打開比較大的門",
  "我只是路過的假面騎士，給我記住了！",
  "親愛的，你看我今天有沒有什麼不一樣?",
  "我從以前就一直喜歡你，請你跟我交往！",
  "麵麵、好燙燙、幫人家吹吹，好不好"
];

/**
 * Get a random phrase from the phrases array
 * @returns {string} A random phrase
 */
export function getRandomPhrase() {
  const index = Math.floor(Math.random() * randomPhrases.length);
  return randomPhrases[index];
}
