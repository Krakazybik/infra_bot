const { getUserInfo, getServerInfo } = require('../db');
const { validateCommand } = require('./lib');
const { getFormatedServerInfo } = require('../lib/utils');

function infoCmd(bot) {
  bot.onText(/\/info/, async (msg) => {
    const chatId = msg.chat.id;

    const userInfo = await getUserInfo(chatId);
    const isValid = await validateCommand(bot, chatId, userInfo);

    if (!isValid) {
      return;
    }

    const serverInfo = await getServerInfo(chatId);

    if (!serverInfo) {
      bot.sendMessage(chatId, 'Информация о сервере не найдена.');
    } else {
      bot.sendMessage(chatId, `Информация о сервере: ${getFormatedServerInfo(serverInfo)}`, {
        parse_mode: 'Markdown',
      });
    }
  });
}

module.exports = {
  infoCmd,
};
