const encouragingMessages = ['If know one has told you yet today, you deserve endless amounts of pizza and love, and you have a great butt 😁'],
    moment = require('moment-timezone'),
    minHourBoundry = 9,
    maxHourBoundry = 17;

let userList = null,
    api = null,


getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
},

calculateDelay = (forceNextDay) => {
    // ugh timezones suck
    //TODO This should be set in the config for each user
    let thread_timezone = 'Pacific/Auckland';

    let now = new moment().tz(thread_timezone),
        minHour = minHourBoundry,
        maxHour = maxHourBoundry,
        minMinute = 0,
        isTomorrow = false,
        currentHour = now.hours();


    //FIXME very slight chance of a race condition here, where the current date extends past the maxHourBoundry boundry
    // if we are forcing the next day then don't change the range for the minimum hour.
    if (!forceNextDay) {
        if (currentHour >= minHourBoundry && currentHour < maxHourBoundry) {
            minHour = currentHour;
            minMinute = now.minutes();
        }
        else if (currentHour >= maxHourBoundry) {
            isTomorrow = true;
            minHour = minHourBoundry;
        }
    }
    // Select a random hour between the current / minimum and maximum
    let hour = getRandomInt(minHour, maxHour),
        minute = getRandomInt(minMinute, 60);

    // adjust the current time by setting the hour minute and day.
    now.hour(hour);
    now.minute(minute);

    if (isTomorrow || forceNextDay) {
        now.add(1, 'days');
    }
    // Ok so we have our new time, now we need to work out the time in milliseconds between the current time and the new time.
    let current = new moment().tz(thread_timezone),
        milliseconds = now.diff(current, 'milliseconds');

    return Math.abs(milliseconds);
},

queueMessage = (message, api, event, forceNextDay=false) => {
    let milliseconds = calculateDelay(forceNextDay);
    //FIXME probably recursion issue here.
    //TODO save timeout for each user and dispose of properly.
    let timeout = setTimeout((message, api, event) => {
        api.sendMessage(message, event.thread_id);
        queueMessage(message, api, event, true);
    }, milliseconds, message, api, event);
};


module.exports = users => {
    return {
        run: (args, api, event) => {
            let message = '',
                name = null,
                userId = null;

            if (args.length === 0) {
                userId = event.sender_id;
                name = event.sender_name;
            }
            else if (args.length === 1) {
                userText = args[0];
                if (userList === null) {
                    userList = api.getUsers();
                    // Should store list with dual keys, as the userid and the username for easy look up in the future
                    // currently the module does not make use of the users object, but in future this should store all information about a user.
                    let found = false;
                    for (key in users.keys()) {
                        // not explicit checking
                        if (users[key].name.toLowerCase() == args[0].toLowerCase()) {
                            userId = key;
                            found = true;
                        }
                    }
                    if (!found) {
                        return api.sendMessage($$`user not found ${0}`, event.thread_id);
                    }
                }

            }
            else {
                return api.sendMessage($$`register takes at most one arg`, event.thread_id);
            }
            // add more encourging messages and randomly select them
            if (userList && userList[userId]) {
                name = userList[userId].name;
            }

            //FIXME add translation
            message += name + ', ' + encouragingMessages[0];
            api.sendMessage($$`${name}, recieve encouraging message between ${minHourBoundry}:00 and ${maxHourBoundry}:00`, event.thread_id);
            queueMessage(message, api, event);
        },
        command: 'register [<user>]',
        help: $$`register help`
    };
};
