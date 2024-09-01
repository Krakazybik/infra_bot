const { exec } = require('child_process');

const commandMutex = {};

const lockCommand = (chatId) => {
  commandMutex[chatId] = true;
};

const unlockCommand = (chatId) => {
  commandMutex[chatId] = false;
};

const validateCommand = async (bot, chatId, userInfo) => {
  if (!userInfo) {
    bot.sendMessage(chatId, 'Сначала зарегистрируйтесь с помощью команды /reg.');
    return false;
  }

  if (!userInfo.confirmed) {
    bot.sendMessage(chatId, 'Ваша регистрация еще не подтверждена администратором.');
    return false;
  }

  const isLocked = commandMutex[chatId];

  if (isLocked) {
    bot.sendMessage(chatId, 'Пожалуйста, дождитесь завершения предыдущей команды.');
    return false;
  }

  return true;
};

function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: './terraform' }, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stderr });
      } else {
        resolve(stdout);
      }
    });
  });
}

module.exports = {
  lockCommand,
  unlockCommand,
  validateCommand,
  execCommand,
};
