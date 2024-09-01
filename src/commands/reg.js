const { registerUser } = require('../db');
const { regSchema } = require('../lib/schemas');
const { logger } = require('../lib/utils');

function regCmd(bot, ctx) {
  bot.onText(/\/reg (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const email = match[1];
    console.log('email', email);
    try {
      regSchema.parse(email);
    } catch (e) {
      bot.sendMessage(chatId, e.message);
      return;
    }

    try {
      await registerUser(chatId, email);

      bot.sendMessage(
        chatId,
        'Регистрация прошла успешно. Ожидайте подтверждения от администратора.',
      );
      logger.info(`New user registered: ${chatId}, ${email}`);

      const adminMessage = `Новый пользователь зарегистрировался:\nChat ID: ${chatId}\nEmail: ${email}\nДля подтверждения используйте команду /confirm ${chatId}`;

      ctx.adminChatIds.forEach((adminChatId) => {
        bot.sendMessage(adminChatId, adminMessage);
      });
    } catch (err) {
      logger.error(`Error registering user ${chatId}`, err);
      bot.sendMessage(chatId, `Ошибка: ${err}`);
    }
  });
}

module.exports = {
  regCmd,
};
