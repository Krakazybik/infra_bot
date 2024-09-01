function startCmd(bot) {
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Добро пожаловать! Используйте /help для получения списка команд.');
  });
}

module.exports = {
  startCmd,
};
