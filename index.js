// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const { token, guildId, discussionsCategoryId, solutionsCategoryId } = require('./config.json');

const schedule = require('node-schedule');
const rule = new schedule.RecurrenceRule();
rule.tz = 'Etc/UTC';
rule.hour = 5
rule.minute = 0
rule.second = 0

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
    client.user.setActivity('Advent of Code 2021', { type: 'WATCHING' })
    let guildPromise = client.guilds.fetch(guildId);
    console.log('Ready!');

    guildPromise.then(guild => {
        // Fetch discussions category
        let discussions = guild.channels.fetch(discussionsCategoryId);
            //.then(channel => console.log(`The channel name is: ${channel.name}`))
            //.catch(console.error);

        // Fetch solutions category
        let solutions = guild.channels.fetch(solutionsCategoryId);
            //.then(channel => console.log(`The channel name is: ${channel.name}`))
            //.catch(console.error);

        discussions.then(d => {
            console.log(d.name);
        }).catch(console.error);
    });
});

const job = schedule.scheduleJob(rule, () => {
    console.log(new Date().toUTCString());
});

// Login to Discord with your client's config
client.login(token);