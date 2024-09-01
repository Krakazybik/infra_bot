function helpCmd(bot) {
  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;

    const helpMessage = `
      Доступные команды:
      /start - Информация о боте
      /reg your@email - Регистрация пользователя с указанием email
      /create - Создание сервера
      /delete - Удаление сервера
      /info - Информация о сервере
      /help - Список команд
      `;
    bot.sendMessage(chatId, helpMessage);
  });
}

module.exports = {
  helpCmd,
};
