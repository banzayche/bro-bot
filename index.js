'use strict';

const TelegramBot = require('node-telegram-bot-api');
const MessageColector = require('./controllers/MessageColector');

// replace the value below with the Telegram token you receive from @BotFather
const token = '---';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// IF MESSAGE MATCHES "/echo [whatever]"
bot.onText(/дай отмазку/, (msg, match) => new MessageColector(msg, match, bot));

// WORKS on every MESSAGE
// Listen for any kind of message. There are different kinds of
// messages.
// bot.on('message', (msg) => {
//   const chatId = msg.chat.id;

//   // send a message to the chat acknowledging receipt of their message
//   bot.sendMessage(chatId, 'Received your message');
// });