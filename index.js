// Require the necessary discord.js classes
import Pokedex from 'pokedex-promise-v2';
import {
  Client, Intents, Constants, MessageEmbed, MessageActionRow, MessageButton,
} from 'discord.js';
import axios from 'axios';
import dotenv from 'dotenv';
import db from './database/index.js';
import pokedexCommands from './database/controllers/pokedex.js';
import movieCommands from './database/controllers/movies.js';
import typeChart from './typeChartDef.js';

dotenv.config();

const log = (arg) => console.log(arg);

// Create a new client instance
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

const pokedex = new Pokedex();

const sleep = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
  log('The bot is up and running!');

  // slash commands
  const guild = client.guilds.cache.get(process.env.guildId);
  let commands;

  if (guild) {
    commands = guild.commands;
  } else {
    commands = client.applichation?.commands;
  }
  // const commands = client.application?.commands;

  commands?.create({
    name: 'ping',
    description: 'Replies with pong',
  });

  commands?.create({
    name: 'fire',
    description: 'adds fire to your text',
    options: [
      {
        name: 'string',
        description: 'the thing u want to fire',
        required: true,
        type: Constants.ApplicationCommandOptionTypes.STRING,
      },
    ],
  });

  commands?.create({
    name: 'eggplant',
    description: 'eggplants a person',
    options: [
      {
        name: 'string',
        description: 'the thing u want to eggplant',
        required: true,
        type: Constants.ApplicationCommandOptionTypes.STRING,
      },
    ],
  });

  commands?.create({
    name: 'bats',
    description: 'adds bats to your text',
    options: [
      {
        name: 'string',
        description: 'the thing u want to bat',
        required: true,
        type: Constants.ApplicationCommandOptionTypes.STRING,
      },
    ],
  });

  commands?.create({
    name: 'strawberry',
    description: 'adds strawberries to your text',
    options: [
      {
        name: 'string',
        description: 'the thing u want to strawberry',
        required: true,
        type: Constants.ApplicationCommandOptionTypes.STRING,
      },
    ],
  });

  commands?.create({
    name: 'strawjerry',
    description: 'adds strawberries between words',
    options: [
      {
        name: 'string',
        description: 'the thing u want to strawberry',
        required: true,
        type: Constants.ApplicationCommandOptionTypes.STRING,
      },
    ],
  });

  commands?.create({
    name: 'add',
    description: 'Adds two numbers',
    options: [
      {
        name: 'num1',
        description: 'The first number',
        required: true,
        type: Constants.ApplicationCommandOptionTypes.NUMBER,
      },
      {
        name: 'num2',
        description: 'The second number',
        required: true,
        type: Constants.ApplicationCommandOptionTypes.NUMBER,
      },
    ],
  });

  commands?.create({
    name: 'pokemon',
    description: 'Returns information about a Pokemon',
    options: [
      {
        name: 'name',
        description: 'The name of the Pokemon',
        required: true,
        type: Constants.ApplicationCommandOptionTypes.STRING,
      },
    ],
  });

  commands?.create({
    name: 'randompokemon',
    description: 'Returns a random Pokemom',
  });

  commands?.create({
    name: 'pokedex',
    description: 'Returns your pokedex',
  });

  commands?.create({
    name: 'removepokemon',
    description: 'Removes a Pokemon from your Pokedex',
    options: [
      {
        name: 'name',
        description: 'The name of the Pokemon you wish to remove',
        required: true,
        type: Constants.ApplicationCommandOptionTypes.STRING,
      },
    ],
  });

  commands?.create({
    name: 'findmovie',
    description: 'finds a movie and returns information about it',
    options: [
      {
        name: 'name',
        description: 'the name of the movie',
        required: true,
        type: Constants.ApplicationCommandOptionTypes.STRING,
      },
    ],
  });

  commands?.create({
    name: 'jerry',
    description: 'You can\'t just call people the r word jerry',
  });
});

// if a slash command is used, responds appropriately
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  const { commandName, options, user } = interaction;

  if (commandName === 'ping') {
    interaction.reply({
      content: 'pong',
      ephemeral: true,
    });
  } else if (commandName === 'fire') {
    const fire = options.get('string').value.replace(/\s/g, '').split('').join('🔥').replace(/^/, '🔥')
      .concat('🔥');
    interaction.reply({
      content: fire,
    });
  } else if (commandName === 'eggplant') {
    const fire = options.get('string').value.replace(/\s/g, '').split('').join('🍆').replace(/^/, '🍆')
      .concat('🍆');
    interaction.reply({
      content: fire,
    });
  } else if (commandName === 'bats') {
    const fire = options.get('string').value.replace(/\s/g, '').split('').join('🦇').replace(/^/, '🦇')
      .concat('🦇');
    interaction.reply({
      content: fire,
    });
  } else if (commandName === 'strawberry') {
    const fire = options.get('string').value.replace(/\s/g, '').split('').join('🍓').replace(/^/, '🍓')
      .concat('🍓');
    interaction.reply({
      content: fire,
    });
  } else if (commandName === 'strawjerry') {
    const fire = options.get('string').value.split(' ').join('🍓').replace(/^/, '🍓')
      .concat('🍓')
      .concat('<@76535312855076864>');
    interaction.reply({
      content: fire,
    });
  } else if (commandName === 'add') {
    const num1 = options.getNumber('num1');
    const num2 = options.getNumber('num2');

    await interaction.deferReply({});

    await new Promise((resolve) => setTimeout(resolve, 2000));

    await interaction.editReply({
      content: `The sum is ${num1 + num2}`,
    });
  } else if (commandName === 'pokemon') {
    const pokemon = options.get('name');
    const pokeData = await pokedex.getPokemonByName(pokemon.value);

    const types = [];
    pokeData.types.forEach((slot) => {
      types.push(slot.type.name);
    });

    let effectiveChart = {};
    if (types.length > 1) {
      effectiveChart = Object.entries(typeChart[types[1]])
        .reduce(
          (acc, [key, value]) => ({ ...acc, [key]: acc[key] * value }),
          { ...typeChart[types[0]] },
        );
    } else {
      effectiveChart = typeChart[types[0]];
    }

    const displayChart = [];
    Object.entries(effectiveChart).forEach((type) => {
      displayChart.push(`${type[0]}: ${type[1]}`);
    });

    const pokeEmbed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(pokeData?.name)
      .setThumbnail(pokeData?.sprites.front_default)
      .addFields(
        { name: 'id', value: `${pokeData?.id}`, inline: true },
        { name: 'height', value: `${pokeData?.height}`, inline: true },
        { name: 'types', value: `${types.join(', ')}`, inline: true },
      )
      .addFields(
        { name: 'type effectiveness', value: `${displayChart.join('\n')}`, inline: true },
      );

    interaction.reply({ embeds: [pokeEmbed] });
  } else if (commandName === 'randompokemon') {
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('addtopokedex')
          .setLabel('Add To Pokedex')
          .setStyle('PRIMARY'),
      );
    const pokeData = await pokedex.getPokemonByName((Math.floor(Math.random() * 898)));

    const types = [];
    pokeData.types.forEach((slot) => {
      types.push(slot.type.name);
    });

    let effectiveChart = {};
    if (types.length > 1) {
      effectiveChart = Object.entries(typeChart[types[1]])
        .reduce(
          (acc, [key, value]) => ({ ...acc, [key]: acc[key] * value }),
          { ...typeChart[types[0]] },
        );
    } else {
      effectiveChart = typeChart[types[0]];
    }

    const displayChart = [];
    Object.entries(effectiveChart).forEach((type) => {
      displayChart.push(`${type[0]}: ${type[1]}`);
    });

    const pokeEmbed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(pokeData?.name)
      .setThumbnail(pokeData?.sprites.front_default)
      .addFields(
        { name: 'id', value: `${pokeData?.id}`, inline: true },
        { name: 'height', value: `${pokeData?.height}`, inline: true },
        { name: 'types', value: `${types.join(', ')}`, inline: true },
      )
      .addFields(
        { name: 'type effectiveness', value: `${displayChart.join('\n')}`, inline: true },
      );

    interaction.reply({ embeds: [pokeEmbed], components: [row] })
      .then(async () => {
        await sleep(60000);
        interaction.editReply({ embeds: [pokeEmbed], components: [] });
      });
  } else if (commandName === 'pokedex') {
    pokedexCommands.getPokedex(user.id)
      .then((data) => {
        if (data.length !== 0) {
          const dexObj = {};
          data.forEach((entry) => {
            dexObj[entry.pokeData[0].fields[0].value] = entry.pokeData[0].title;
          });

          const displayArr = [];
          Object.entries(dexObj).forEach((entry) => {
            displayArr.push(`#${entry[0]}: ${entry[1]}`);
          });

          const pokedexEmbed = new MessageEmbed()
            .setColor('#ff0000')
            .setTitle('Pokedex')
            .setThumbnail('https://static.wikia.nocookie.net/leonhartimvu/images/3/37/RG_Pok%C3%A9dex.png/revision/latest?cb=20180721122026')
            .addFields(
              { name: 'Entries', value: displayArr.join('\n') },
            );
          interaction.reply({ embeds: [pokedexEmbed] });
        } else {
          interaction.reply({ content: 'your pokedex is empty' });
        }
      })
      .catch((err) => {
        log(err);
        interaction.reply({ content: 'unable to get your pokedex' });
      });
  } else if (commandName === 'removepokemon') {
    const name = options.get('name');
    pokedexCommands.getOne(user.id, name.value)
      .then((data) => {
        const pokeData = data[0].pokeData[0];

        const row = new MessageActionRow()
          .addComponents(
            new MessageButton()
              .setCustomId('removefrompokedex')
              .setLabel('Remove this pokemon')
              .setStyle('PRIMARY'),
            new MessageButton()
              .setCustomId('cancelremove')
              .setLabel('Cancel')
              .setStyle('DANGER'),
          );

        const pokeEmbed = new MessageEmbed()
          .setColor('#ff0000')
          .setTitle('Remove this pokemon?')
          .addFields(
            { name: 'Name', value: pokeData.title },
            { name: 'id', value: pokeData.fields[0].value },
          )
          .setThumbnail(pokeData.thumbnail.url);
        interaction.reply({ embeds: [pokeEmbed], components: [row], ephemeral: true })
          .then(async () => {
            await sleep(60000);
            interaction.editReply({ embeds: [pokeEmbed], components: [], ephemeral: true });
          });
      })
      .catch((err) => {
        log(err);
        const errEmbed = new MessageEmbed()
          .setColor('#ff0000')
          .setTitle('you do not own that pokemon');
        interaction.reply({ embeds: [errEmbed] });
      });
  } else if (commandName === 'findmovie') {
    const movieName = options.get('name');

    axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_KEY}&language=en-US&query=${movieName.value}`)
      .then((searchResult) => searchResult.data.results[0].id)
      .then((movieId) => axios.get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_KEY}&language=en-US`))
      .then((movieData) => {
        const movie = movieData.data;
        log(movie);
        const movieEmbed = new MessageEmbed()
          .setColor('#FFFF00')
          .setTitle(movie.original_title)
          .addFields(
            { name: 'Release Date', value: `${movie.release_date}`, inline: true },
            { name: 'Runtime', value: `${movie.runtime} minutes`, inline: true },
            { name: 'Rating', value: `${movie.vote_average} / 10`, inline: true },
          )
          .addFields(
            { name: 'Description', value: `${movie.overview}` },
          )
          .setImage(`https://image.tmdb.org/t/p/w500/${movie.poster_path}`);

        interaction.reply({ embeds: [movieEmbed] });
      })
      .catch((err) => {
        log(err);
        const errEmbed = new MessageEmbed()
          .setColor('#ff0000')
          .setTitle(`No movie by the name ${movieName.value} was not found`);
        interaction.reply({ embeds: [errEmbed] });
      });
  } else if (commandName === 'jerry') {
    interaction.reply('You can\'t just call people the r word Jerry');
  }
});

// responds to button presses
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  const { customId, user, message } = interaction;

  if (customId === 'addtopokedex') {
    pokedexCommands.addEntry({
      userId: user.id,
      name: message.embeds[0].title,
      pokeData: message.embeds[0],
    })
      .then(async (res) => {
        log(`successfully added ${res.name} to pokedex`);

        interaction.component
          .setStyle('SUCCESS')
          .setLabel('Pokemon added to your pokedex')
          .setDisabled(true);

        await interaction.update({
          content: `added to <@${user.id}> 's pokedex`,
          components: [new MessageActionRow()
            .addComponents(interaction.component)],
        });
      })
      .catch((err) => log(err));
  } else if (customId === 'removefrompokedex') {
    const name = message.embeds[0].fields[0].value;

    pokedexCommands.removeEntry(user.id, name)
      .then((res) => {
        log(res);

        interaction.component
          .setStyle('SUCCESS')
          .setLabel('Removed')
          .setDisabled(true);
        interaction.update({
          content: `removed ${name} from <@${user.id}> 's pokedex`,
          components: [new MessageActionRow()
            .addComponents(interaction.component)],
        });
      })
      .catch((err) => {
        log(err);
        interaction.reply({ content: `${name} is not in your pokedex` });
      });
  } else if (customId === 'cancelremove') {
    interaction.component
      .setStyle('DANGER')
      .setLabel('Canceled')
      .setDisabled(true);
    interaction.update({
      content: 'canceled action',
      components: [new MessageActionRow()
        .addComponents(interaction.component)],
    });
  }
});

// responds to messages
client.on('messageCreate', (message) => {
  const msg = message.content.toLowerCase().split(' ');

  if (message.content.toLowerCase() === 'good morning botmilk') {
    message.reply({
      content: `good morning ${message.author}!`,
    });
  }

  if (message.content.toLowerCase().includes('what time is it botmilk')) {
    message.reply({
      content: `<t:${Math.floor(new Date().getTime() / 1000)}>`,
    });
  }

  if ((msg.includes('thank') || msg.includes('thanks')) && msg.includes('botmilk')) {
    message.reply({
      content: `You're welcome ${message.author}!!`,
    });
  }

  if (message.content.toLowerCase().includes('am i trash botmilk')) {
    message.reply({
      content: `You are not trash ${message.author}`,
    });
  }
});

// Login to Discord with your client's token
client.login(process.env.token);
