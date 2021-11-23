// Require the necessary discord.js classes
const { Client, Intents, MessageEmbed } = require('discord.js');
const { token, guildId, discussionsCategoryId, solutionsCategoryId, listenerRoleId, modRoleId } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

function createDiscussionMessage(day, solutionChannel) {
    let url = `https://adventofcode.com/2020/day/${day}`;
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
    // Fetch guild as well as dicussion and solution categories
    try {
        let guild = await client.guilds.fetch(guildId);
        let discussions = await guild.channels.fetch(discussionsCategoryId);
        let solutions = await guild.channels.fetch(solutionsCategoryId);

        console.log(discussions.name);
        console.log(solutions.name);

        const schedule = require('node-schedule');
        const rule = new schedule.RecurrenceRule();
        rule.tz = 'Etc/UTC';
        rule.hour = 5
        rule.minute = 0

        const job = schedule.scheduleJob(rule, async () => {
            console.log("Shceduled job ran");
            //console.log(`This would be a new challenge! ${new Date().toUTCString()}`);
            let date = new Date();

            let newDiscussionChannel = await discussions.createChannel(`day-${date.getDate()}-diskusjon`, {});
            newDiscussionChannel.setPosition(0);
            let newSolutionChannel = await solutions.createChannel(`day-${date.getDate()}-løsninger`, {});
            newSolutionChannel.setPosition(0);

            guild.roles.fetch(listenerRoleId)
                // todo before dec 1, construct correct solution channel-message and set the rules to only post in december
                .then(listener => {
                    newDiscussionChannel.send({ embeds: [createDiscussionMessage(date.getDate(), newSolutionChannel)]});
                    newDiscussionChannel.send(`${listener}`);
                    newSolutionChannel.send(`Test message for ${listener}, 1 2 3`)
                });
        });
    } catch (err) {
        console.error("Error during inital fetch: " + err);
    }
});

// Login to Discord with your client's config
client.login(token);