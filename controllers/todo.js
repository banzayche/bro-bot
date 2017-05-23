'use strict';

const Telegram = require('telegram-node-bot');
const unirest = require('unirest');
let htmlparser = require("htmlparser2");
let select = require('soupselect').select;
const random = require('node-random-number');

const basar = ['Думаю, йоба..', 'Тихо нах.. дай порнуху докачаю..', 'Уно моменто..',
               'Сверяюсь со звездами..', 'Вычисляю суть жизнии..', 'Ща все будет..', 'Надоел!'];

class TodoController extends Telegram.TelegramBaseController {
    
    /**
     * 
     * @param {Scope} $ 
     */
    addHandler($) {
        let username = this._getName($.message);

        let todo = $.message.text.split(' ').slice(1).join(' '); //To throw away /add command, and get only text
        if (!todo) return $.sendMessage('Please add your fucking deal to save it.');

        $.getUserSession('todos').then(todos => {
            if (!Array.isArray(todos)) $.setUserSession('todos', [todo]);
            else $.setUserSession('todos', todos.concat([todo]));
            $.sendMessage(`Now I have one more deal from you.. *${username}*`, { parse_mode: 'Markdown' });
        });
    }

    getHandler($) {
        let username = this._getName($.message);
        $.getUserSession('todos').then(todos => $.sendMessage(this._serializeList(todos, username), { parse_mode: 'Markdown' }));
    }

    checkHandler($) {
        let username = this._getName($.message);
        let index = parseInt($.message.text.split(' ').slice(1)[0]);
        if (isNaN(index)) return $.sendMessage(`Sorry *${username}*, you didn\'t pass a valid index.`, { parse_mode: 'Markdown' });

        $.getUserSession('todos').then(todos => {
            if ((index - 1) > todos.length) return $.sendMessage(`Sorry *${username}*, you didn\'t pass a valid index.`, { parse_mode: 'Markdown' });

            todos.splice(index - 1, 1);
            $.setUserSession('todos', todos);
            $.sendMessage('Checked todo successfuly.');
        });
    }

    makeRequestHandler($) {
        $.sendMessage(basar[random({start: 0, end: basar.length - 1})]);

        let number = random({start: 1, end: 50})[0];

        var Request = unirest.get(`http://copout.me/get-excuse/${number}`);
        Request.query({
            _pjax: '#section-excuse'
        });
        Request.end(function (response) {
            var handler = new htmlparser.DomHandler(function(err, dom) {
                if (err) {
                    $.sendMessage('Error occured');
                } 
                else {
                    var titles;
                    try {
                      titles = select(dom, 'blockquote')[0].children[0].data;
                      $.sendMessage(titles);
                    } catch (error) {
                      $.sendMessage('Херня дело, попробуй позже..');
                    }
                    
                }                
            });
            new htmlparser.Parser(handler).parseComplete(response.body)
        });
    }

    get routes() {
        return {
            'addCommand': 'addHandler',
            'getCommand': 'getHandler',
            'checkCommand': 'checkHandler',
            'makeRquestCommand': 'makeRequestHandler'
        };
    }

    _serializeList(todoList, username) {
        let serialized = `Your nasty deals, * ${ username }: * \n\n`;
        todoList.forEach((t, i) => serialized += ` * ${ i + 1 } * - ${ t };\n`);
        return serialized;
    }

    _getName(messageInfo) {
        let name = messageInfo.from.username || messageInfo.from.firstName;
        return name;
    }
}

module.exports = TodoController;