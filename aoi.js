let opts,
    users = null;

exports.load = platform => {
    users = require('./src/users.js')(exports.config);
    opts = {
        'register': require('./src/commands/register.js')(users),
        //'unregister': require('./src/commands/unregister.js')(users),
        'help': require('./src/commands/help.js')()
    };
};

exports.unload = () => {
    users = null;
};


// listen on all text sent, to the module.
// TODO future module for text parsing
exports.match = () => {return true};

exports.run = (api, event) => {
    const commands = event.arguments;
    let command = null;

    if (commands[0] === api.commandPrefix + 'aoi' && commands[1] && opts[commands[1].toLowerCase()]) {
        command = commands[1].toLowerCase();
        commands.splice(0, 2);
        opts[command].run(commands, api, event, opts);
    }

    // send through to some intelligent module later

    return true;
};
