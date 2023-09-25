import { Client } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { BotEvent } from '../types';
import consola from 'consola';

let isDev: boolean;
if (process.env.NODE_ENV === 'production') isDev = false;
else if (process.env.NODE_ENV === 'development') isDev = true;
else isDev = false;

module.exports = (client: Client) => {
  let eventsDir = join(__dirname, '../events');
  readdirSync(eventsDir).forEach(file => {
    if (isDev) {
      if (file.endsWith('.ts')) {
        try {
          let event: BotEvent = require(`${eventsDir}/${file}`).default;
          event.once ? client.once(event.name, (...args) => event.execute(...args)) : client.on(event.name, (...args) => event.execute(...args));
          consola.info(`Loaded Bot Event Handler: ${event.name}`);
        } catch (e) {
          consola.error(e);
        }
      }
    } else {
      if (file.endsWith('.js')) {
        try {
          let event: BotEvent = require(`${eventsDir}/${file}`).default;
          event.once ? client.once(event.name, (...args) => event.execute(...args)) : client.on(event.name, (...args) => event.execute(...args));
          consola.info(`Loaded Bot Event Handler: ${event.name}`);
        } catch (e) {
          consola.error(e);
        }
      }
    }
  });
}