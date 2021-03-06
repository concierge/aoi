module.exports = () => {
    return {
        run: function(args, api, event, opts) {
            if (args.length > 1) {
                api.sendMessage($$`help for one command`, event.thread_id);
                return;
            }
            let msg;
            if (args.length === 1) {
                if (!opts[args[0]] || args[0] === 'help') {
                    api.sendMessage($$`no help for command`, event.thread_id);
                    return;
                }
                msg = `${opts[args[0]].command}\n--------------------\n${opts[args[0]].detailedHelp}`;
                api.sendMessage(msg, event.thread_id);
            }
            else {
                msg = '';
                for (let opt in opts) {
                    if (opt === 'help') {
                        continue;
                    }
                    msg += `${opts[opt].command}\n\t${opts[opt].help}\n`;
                }
                api.sendMessage(msg, event.thread_id);
            }
        },
        command: 'help [<command>]'
    };
};
