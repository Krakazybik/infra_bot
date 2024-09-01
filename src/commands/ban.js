const { banUser } = require('../db');
const { logger } = require('../lib/utils');

function banCmd(bot, ctx) {
  bot.onText(/\/ban (\d+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userIdToBan = parseInt(match[1], 10);

    if (!ctx.adminChatIds.includes(chatId)) {
      bot.sendMessage(chatId, 'У вас нет прав для выполнения этой команды.');
      return;
    }

    try {
      const changes = await banUser(chatId);

      if (changes === 0) {
        bot.sendMessage(chatId, 'Пользователь не найден.');
      } else {
        bot.sendMessage(chatId, 'Пользователь успешно заблокирован.');
        bot.sendMessage(userIdToBan, 'Вы были заблокированы администратором.');
      }
    } catch (err) {
      logger.error(`Error banning user ${userIdToBan} by ${chatId}`, err);
      bot.sendMessage(chatId, `Ошибка: ${err}`);
    }
  });
}

module.exports = {
  banCmd,
};
