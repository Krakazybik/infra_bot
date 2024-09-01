const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./tg.db');

function initDB() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY,
          chat_id INTEGER UNIQUE,
          email TEXT,
          confirmed BOOLEAN DEFAULT 0,
          server_info TEXT,
          active_cmd TEXT
      )`);

    db.run(`CREATE TABLE IF NOT EXISTS servers (
          id INTEGER PRIMARY KEY,
          name TEXT UNIQUE,
          owner_chat_id INTEGER,
          FOREIGN KEY(owner_chat_id) REFERENCES users(chat_id)
      )`);
  });
}

async function getUserInfo(chatId, callback) {
  return await new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE chat_id = ?', [chatId], (err, row) => {
      if (err) {
        return reject(null);
      } else {
        return resolve(row);
      }
    });
  });
}

function getServerInfo(chatId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT server_info FROM users WHERE chat_id = ?', [chatId], (err, row) => {
      if (err) {
        return reject(err);
      }
      resolve(row ? row.server_info : null);
    });
  });
}

async function updateServerInfo(chatId, serverInfo) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE users SET server_info = ? WHERE chat_id = ?',
      [serverInfo, chatId],
      function (err) {
        if (err) {
          return reject(err);
        }
        resolve(this.changes);
      },
    );
  });
}

async function confirmUser(chatId) {
  return new Promise((resolve, reject) => {
    db.run('UPDATE users SET confirmed = 1 WHERE chat_id = ?', [chatId], function (err) {
      if (err) {
        return reject(err);
      }
      resolve(this.changes);
    });
  });
}

async function banUser(chatId) {
  return new Promise((resolve, reject) => {
    db.run('UPDATE users SET confirmed = 0 WHERE chat_id = ?', [chatId], function (err) {
      if (err) {
        return reject(err);
      }
      resolve(this.changes);
    });
  });
}

async function listUsers() {
  return new Promise((resolve, reject) => {
    db.all('SELECT chat_id, email, confirmed FROM users', [], (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}

async function registerUser(chatId, email) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE chat_id = ?', [chatId], (err, row) => {
      if (err) {
        return reject(err);
      }

      if (row) {
        return reject('Вы уже зарегистрированы.');
      }

      db.run(
        'INSERT INTO users (chat_id, email, confirmed) VALUES (?, ?, 0)',
        [chatId, email],
        (err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        },
      );
    });
  });
}

const hasEmailQuery = `SELECT * FROM users WHERE email = ?`;

module.exports = {
  initDB,
  getUserInfo,
  updateServerInfo,
  getServerInfo,
  confirmUser,
  banUser,
  listUsers,
  registerUser,
};
