const { listUsers } = require('../db');
const { logger } = require('../lib/utils');

function listUsersCmd(bot, ctx) {
  bot.onText(/\/list_users/, async (msg) => {
    const chatId = msg.chat.id;

    if (!ctx.adminChatIds.includes(chatId)) {
      bot.sendMessage(chatId, 'У вас нет прав для выполнения этой команды.');
      return;
    }

    try {
      const rows = await listUsers();

      if (rows.length === 0) {
        bot.sendMessage(chatId, 'Нет зарегистрированных пользователей.');
        return;
      }

      let userList = 'Список пользователей:\n';
      rows.forEach((row) => {
        userList += `Chat ID: ${row.chat_id}, Email: ${row.email}, Подтвержден: ${row.confirmed ? 'Да' : 'Нет'}, Заблокирован: ${row.banned ? 'Да' : 'Нет'}\n`;
      });

      logger.info(`Listed users by ${chatId}`);

      bot.sendMessage(chatId, userList);
    } catch (err) {
      logger.error(`Error listing users`, err);
      bot.sendMessage(chatId, `Ошибка: ${err}`);
    }
  });
}

module.exports = {
  listUsersCmd,
};
