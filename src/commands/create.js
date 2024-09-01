const { getUserInfo, updateServerInfo } = require('../db');
const { validateCommand, lockCommand, unlockCommand, execCommand } = require('./lib');
const { getFormatedServerInfo, logger, normalizeServerInfo } = require('../lib/utils');

function createCmd(bot) {
  bot.onText(/\/create/, async (msg) => {
    const chatId = msg.chat.id;
    const userInfo = await getUserInfo(chatId);
    const isValid = await validateCommand(bot, chatId, userInfo);

    if (!isValid) {
      return;
    }

    lockCommand(chatId);

    bot.sendMessage(chatId, 'Началось создание сервера. Пожалуйста, дождитесь ответа от бота...');
    // Выполнение команд Terraform
    const workspaceCommand = `terraform workspace new ${chatId}`;
    const initCommand = `TF_WORKSPACE=${chatId} terraform init`;
    const applyCommand = `TF_WORKSPACE=${chatId} terraform apply -var='cf_allowed_email=["${userInfo.email}"]' -auto-approve `;
    const outputCommand = `TF_WORKSPACE=${chatId} terraform output -json`;

    try {
      await execCommand(workspaceCommand);
      await execCommand(initCommand);
      await execCommand(applyCommand);
      const output = await execCommand(outputCommand);

      const serverInfo = getFormatedServerInfo(output);
      await updateServerInfo(chatId, output);

      logger.info(
        `New server created by user: ${chatId} - ${userInfo.email}`,
        normalizeServerInfo(output),
      );

      bot.sendMessage(chatId, `Сервер успешно создан. Данные для подключения:\n${serverInfo}`, {
        parse_mode: 'Markdown',
      });
    } catch (err) {
      logger.error(`Error creating server: ${chatId} - ${userInfo.email}`, err);
      bot.sendMessage(chatId, `Ошибка: ${err.stderr}`);
    } finally {
      unlockCommand(chatId);
    }
  });
}

module.exports = {
  createCmd,
};
