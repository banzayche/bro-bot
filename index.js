'use strict';

const TelegramBot = require('node-telegram-bot-api');
const MessageColector = require('./controllers/MessageColector');
let _ = require('lodash');

// replace the value below with the Telegram token you receive from @BotFather
const token = '387116379:AAGHOhcMN4DH0RzEagC3hMmLj7msVfGGlHk';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

bot.on('callback_query', function(msg) {
    var user = msg.from.id;
    var match = /\/дай отмазку (.+)/.exec(msg.data);
    
    if (match) new MessageColector(_.set(msg, 'chat.id', match[1]), ['/дай отмазку'], bot)
});
// IF MESSAGE MATCHES "[whatever]"
bot.onText(/(.+)/, (msg, match) => new MessageColector(msg, match, bot));

// WORKS on every MESSAGE
// Listen for any kind of message. There are different kinds of
// messages.
// bot.on('message', (msg) => {
//   const chatId = msg.chat.id;

//   // send a message to the chat acknowledging receipt of their message
//   bot.sendMessage(chatId, 'Received your message');
// });