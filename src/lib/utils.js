const pino = require('pino');

const getFormatedServerInfo = (serverInfo) => {
  try {
    const info = JSON.parse(serverInfo);

    return `
      Имя сервера: \`${info?.server_name?.value}\`
      User: \`root\`
      Password: \`${info?.linux_password?.value}\`
      Dev: \`${info?.dev_url?.value}\`
      SSH: \`${info?.ssh_url?.value}\`
      Web: \`${info?.web_url?.value}\`
    `;
  } catch (e) {
    logger.error(e.message);
    return 'Информация о сервере отсутствует.';
  }
};

let logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

const normalizeServerInfo = (serverInfo) => {
  const info = JSON.parse(serverInfo);
  return Object.entries(info).reduce((acc, [key, value]) => {
    return { ...acc, [key]: value.value };
  }, {});
};

module.exports = { logger, getFormatedServerInfo, normalizeServerInfo };
