const { confirmUser } = require('../db');
const { logger } = require('../lib/utils');

function confirmCmd(bot, ctx) {
  bot.onText(/\/confirm (\d+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userIdToConfirm = parseInt(match[1], 10);

    if (!ctx.adminChatIds.includes(chatId)) {
      bot.sendMessage(chatId, 'У вас нет прав для выполнения этой команды.');
      return;
    }

    try {
      const changes = await confirmUser(chatId);

      if (changes === 0) {
        bot.sendMessage(chatId, 'Пользователь не найден.');
      } else {
        bot.sendMessage(chatId, 'Пользователь успешно подтвержден.');
        bot.sendMessage(userIdToConfirm, 'Ваша регистрация подтверждена администратором.');
        logger.info(`User ${userIdToConfirm} confirmed by ${chatId}`);
      }
    } catch (err) {
      logger.error(`Error confirming user ${userIdToConfirm} by ${chatId}`, err);
      bot.sendMessage(chatId, `Ошибка: ${err}`);
    }
  });
}

module.exports = {
  confirmCmd,
};
