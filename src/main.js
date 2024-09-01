require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { startCmd } = require('./commands/start');
const { infoCmd } = require('./commands/info');
const { initDB } = require('./db');
const { createCmd } = require('./commands/create');
const { deleteCmd } = require('./commands/delete');
const { banCmd } = require('./commands/ban');
const { confirmCmd } = require('./commands/confirm');
const { listUsersCmd } = require('./commands/list-users');
const { regCmd } = require('./commands/reg');
const { helpCmd } = require('./commands/help');
const { logger } = require('./lib/utils');

const botFactory = ({ token, adminChatIds }) => {
  const ctx = { adminChatIds };

  const bot = new TelegramBot(token, { polling: true });

  function use(callback) {
    callback(bot, ctx);
    return bot;
  }

  bot.use = use;

  return bot;
};

function bootstrap() {
  initDB();
  logger.info('DB initialized');
  const adminChatIds = process.env.ADMIN_CHAT_IDS.split(',').map(Number);
  const token = process.env.TOKEN;

  botFactory({ token, adminChatIds })
    .use(createCmd)
    .use(startCmd)
    .use(infoCmd)
    .use(deleteCmd)
    .use(banCmd)
    .use(confirmCmd)
    .use(listUsersCmd)
    .use(regCmd)
    .use(helpCmd);

  logger.info('Bot started');
}

bootstrap();
