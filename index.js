'use strict';

const Telegram = require('telegram-node-bot'),
    PersistentMemoryStorage = require('./adapters/persistentMemoryStorage'),
    storage = new PersistentMemoryStorage(
        `${__dirname}/data/userStorage.json`,
        `${__dirname}/data/chatStorage.json`
    ),
    tg = new Telegram.Telegram('387116379:AAExgkP9iVhXom0h_HZKr3TkBvpkJOMyMmk', {
        workers: 1,
        storage: storage
    });
const TodoController = require('./controllers/todo');
const OtherwiseController = require('./controllers/otherwise');


tg.router.when(new Telegram.TextCommand('/add', 'addCommand'), new TodoController())
    .when(new Telegram.TextCommand('/get', 'getCommand'), new TodoController())
    .when(new Telegram.TextCommand('/check', 'checkCommand'), new TodoController())
    .when(new Telegram.TextCommand('/дай отмазку', 'makeRquestCommand'), new TodoController())
    .otherwise(new OtherwiseController());

function exitHandler(exitCode) {
    storage.flush();
    process.exit(exitCode);
}

process.on('SIGINT', exitHandler.bind(null, 0));
process.on('uncaughtException', exitHandler.bind(null, 1));