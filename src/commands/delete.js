const { getUserInfo, updateServerInfo } = require('../db');
const { normalizeServerInfo, logger } = require('../lib/utils');
const { validateCommand, lockCommand, unlockCommand, execCommand } = require('./lib');

function deleteCmd(bot) {
  bot.onText(/\/delete/, async (msg) => {
    const chatId = msg.chat.id;
    const userInfo = await getUserInfo(chatId);
    const isValid = await validateCommand(bot, chatId, userInfo);

    if (!isValid) {
      return;
    }

    lockCommand(chatId);
    bot.sendMessage(chatId, 'Началось удаление сервера. Пожалуйста, дождитесь ответа от бота...');

    const destroyCommand = `TF_WORKSPACE=${chatId} terraform destroy -auto-approve`;
    const deleteWorkspaceCommand = `terraform workspace select default && terraform workspace delete ${chatId}`;

    try {
      await execCommand(destroyCommand);
      await execCommand(deleteWorkspaceCommand);
      await updateServerInfo(chatId, null);

      const serverInfo = normalizeServerInfo(userInfo.server_info);
      logger.info(`Server deleted: ${chatId} - ${serverInfo.server_name}`);

      bot.sendMessage(chatId, `Сервер ${serverInfo.server_name} успешно удален.`);
    } catch (err) {
      logger.error(`Error deleting server: ${chatId} - ${serverInfo.server_name}`, err);
      bot.sendMessage(chatId, `Ошибка: ${err.stderr}`);
    } finally {
      unlockCommand(chatId);
    }
  });
}

module.exports = {
  deleteCmd,
};
