// Require the necessary discord.js classes, as well as configurations from config.json
const { Client, Intents, MessageEmbed } = require('discord.js');
const { token, guildId, discussionsCategoryId, solutionsCategoryId, listenerRoleId, modRoleId } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

function createDiscussionMessage(day, solutionChannel) {
    const url = `https://adventofcode.com/2021/day/${day}`;
    return new MessageEmbed()
        .setTitle(`Dag ${day}`)
        .setURL(url)
        .setDescription(`Da er utfordringene for dag ${day} publisert! ${url}
        Lykke til, og publiser gjerne løsningene dine i ${solutionChannel} om du vil når du er ferdig!:)`)
        .setTimestamp();
}

// When the client is ready, run this code (only once)
client.once('ready', async () => {
    client.user.setActivity('Advent of Code 2021', { type: 'WATCHING' })
    console.log("Ready!");
    // Fetch dicussion and solution categories for appending the daily channels
    try {
        const guild = await client.guilds.fetch(guildId);
        const discussions = await guild.channels.fetch(discussionsCategoryId);
        const solutions = await guild.channels.fetch(solutionsCategoryId);

        // The daily challenges are posted at 05:00 UTC+0, so create new channels at this time every day
        // note, RecurrenceRule month is 0-11 unlike cron-parse 
        const schedule = require('node-schedule');
        const rule = new schedule.RecurrenceRule();
        rule.tz = 'Etc/UTC';
        rule.month = 11;
        rule.day = [schedule.Range(1, 25)];
        rule.hour = 5;
        rule.minute = 1;
        rule.second = 0;

        const job = schedule.scheduleJob(rule, async () => {
            console.log("Shceduled job ran");
            const date = new Date();

            const newDiscussionChannel = await discussions.createChannel(`day-${date.getDate()}-diskusjon`, {});
            newDiscussionChannel.setPosition(0);
            const newSolutionChannel = await solutions.createChannel(`day-${date.getDate()}-løsninger`, {});
            newSolutionChannel.setPosition(0);

            guild.roles.fetch(listenerRoleId)
                .then(listener => {
                    newDiscussionChannel.send({ embeds: [createDiscussionMessage(date.getDate(), newSolutionChannel)]});
                    newDiscussionChannel.send(`${listener}`);
                });
        });
    } catch (err) {
        console.error(err);
    }
});

// Login to Discord with your client's config
client.login(token);