'use strict';

const Telegram = require('telegram-node-bot');

class OtherwiseController extends Telegram.TelegramBaseController {
    /**
     * 
     * @param {Scope} $ 
     */
    handle($) {
        $.sendMessage('Do not understand. Do you have some weed? =))');
    }
}

module.exports = OtherwiseController;