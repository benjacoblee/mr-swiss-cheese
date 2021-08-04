export {};

require("dotenv").config();
import { Telegraf, Markup } from "telegraf";
import express from "express";
import moment from "moment";
import { addReminder, checkReminders, getReminders } from "./reminders";
import { getLocalNews, getGlobalNews } from "./news";
import {
  getLocations,
  getTwoHourForecast,
  getAllDayForecast,
  getFourDayForecast,
} from "./weather";
import {
  toggleOptions,
  validateUnit,
  clearReminderInput,
  validateAmount,
  generateHTMLForReminders,
  generateHTMLForNews,
  generateHTMLForAllDayForecast,
  generateHTMLForFourDayForecast,
  validateDate,
  chunkArrs,
} from "./utils";
import {
  optionsKeys,
  reminderInput,
  validTimeUnits,
  helpText,
  startText,
  options,
} from "./constants";
import { connectToServer } from "./utils/mongoUtil";

const app = express();
const PORT = parseInt(process.env.PORT) || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

bot.use(async (ctx, next) => {
  console.time(`Processing update ${ctx.update.update_id}`);
  await next();
  console.log(options);
  console.timeEnd(`Processing update ${ctx.update.update_id}`);
});

bot.start((ctx) => ctx.replyWithHTML(startText));

bot.command("help", (ctx) => ctx.replyWithHTML(helpText));

bot.command("cancel", (ctx) => {
  toggleOptions(options);
  ctx.reply("Ok! Cancelling current operation.", Markup.removeKeyboard());
});

bot.command("remind", (ctx) => {
  const { IS_REMIND } = optionsKeys;
  toggleOptions(options, IS_REMIND);
  clearReminderInput();

  ctx.reply("Ok, what do you want to be reminded about?");

  bot.on("text", (ctx, next) => {
    if (!options.isRemind) {
      return next();
    }
    if (options.isRemind) {
      let { text } = ctx.update.message;

      if (!reminderInput.title) {
        reminderInput.title = text;
        ctx.replyWithHTML(
          `Ok, please specify a unit of time. Alternatively, you can provide a date in this format: <i>'DD-MM-YY'</i>`,
          Markup.keyboard(chunkArrs(validTimeUnits, 2))
        );
      } else if (!reminderInput.unit) {
        if (validateDate(text)) {
          const diff = moment(text, "DD-MM-YY").add(1, "day");
          const diffToDisplay = moment(diff).diff(Date.now(), "days");

          ctx.reply(
            `Ok! I will remind you to ${
              reminderInput.title
            } in ${diffToDisplay} day${
              moment(Date.now()).diff(diff, "days") > 1 ? "s" : ""
            }!`,
            Markup.removeKeyboard()
          );

          reminderInput.due = diff.toDate();

          addReminder({
            chatId: ctx.update.message.chat.id,
            title: reminderInput.title,
            due: reminderInput.due,
            username: ctx.update.message.from.username,
          });
        } else if (validateUnit(text)) {
          reminderInput.unit = text;
          ctx.reply(
            `Ok, how many ${reminderInput.unit}?`,
            Markup.removeKeyboard()
          );
        } else {
          ctx.reply(
            "Sorry, that's invalid.",
            Markup.keyboard(chunkArrs(validTimeUnits, 2))
          );
        }
      } else if (!reminderInput.due) {
        if (!validateAmount(text)) {
          ctx.reply(`Sorry, has to be one or more ${reminderInput.unit}!`);
        } else if (validateAmount(text)) {
          reminderInput.due = parseInt(text);

          ctx.reply(
            `Ok! I will remind you to ${reminderInput.title} in ${
              reminderInput.due
            } ${reminderInput.unit.substr(0, reminderInput.unit.length - 1)}${
              reminderInput.due > 1 ? "s" : ""
            }!`
          );

          reminderInput.due = moment(Date.now())
            .add(reminderInput.due, reminderInput.unit)
            .toDate();

          addReminder({
            chatId: ctx.update.message.chat.id,
            title: reminderInput.title,
            unit: reminderInput.unit,
            due: reminderInput.due,
            username: ctx.update.message.from.username,
          });
        }
      }
    }
  });
});

bot.command("reminders", async (ctx) => {
  const chatId = ctx.update.message.chat.id;
  const reminders = await getReminders(chatId);

  if (reminders.length) {
    const html = generateHTMLForReminders(reminders);
    ctx.replyWithHTML(html);
  } else {
    ctx.reply("Sorry, you don't have any reminders yet.");
  }
});

bot.command("news", (ctx) => {
  const { IS_NEWS } = optionsKeys;
  toggleOptions(options, IS_NEWS);

  ctx.reply(
    "Ok, where do you want your news from?",
    Markup.keyboard([["/local", "/global"]])
  );

  bot.command("local", async (ctx) => {
    if (options.isNews) {
      ctx.reply(`Ok, getting ${ctx.message.text} news...`);
      const news = await getLocalNews();
      const html = generateHTMLForNews(news);
      ctx.replyWithHTML(html, Markup.removeKeyboard());
    }
  });

  bot.command("global", async (ctx) => {
    if (options.isNews) {
      ctx.reply(`Ok, getting ${ctx.message.text} news...`);
      const news = await getGlobalNews();
      const html = generateHTMLForNews(news);
      ctx.replyWithHTML(html, Markup.removeKeyboard());
    }
  });
});

bot.command("weather", (ctx) => {
  const { IS_WEATHER } = optionsKeys;
  toggleOptions(options, IS_WEATHER);

  ctx.reply(
    "Ok, I can send you a two-hour, 24-hour, or four-day forecast.",
    Markup.keyboard([["/twohour", "/allday"], ["/fourday"]])
  );

  bot.command("allday", async (ctx) => {
    if (options.isWeather) {
      ctx.reply("Ok, getting all-day forecast...", Markup.removeKeyboard());
      const forecast = await getAllDayForecast();
      const html = generateHTMLForAllDayForecast(forecast);
      ctx.replyWithHTML(html);
    }
  });

  bot.command("twohour", async (ctx) => {
    if (options.isWeather) {
      const locations = await getLocations();

      ctx.reply(
        "Ok, choose a location.",
        Markup.keyboard(chunkArrs(Object.values(locations), 2))
      );

      bot.hears(locations, async (ctx) => {
        if (options.isWeather) {
          const location = ctx.message.text;

          ctx.reply(
            `Ok, getting two-hour forecast for ${location}...`,
            Markup.removeKeyboard()
          );

          const forecastObj = await getTwoHourForecast(location);
          const { area, forecast } = forecastObj;

          if (forecast) {
            ctx.replyWithHTML(`Forecast for ${area}: <b>${forecast}</b>`);
          }
        }
      });
    }
  });

  bot.command("fourday", async (ctx) => {
    if (options.isWeather) {
      ctx.reply("Ok, getting four-day forecast...", Markup.removeKeyboard());
      const forecasts = await getFourDayForecast();
      const html = generateHTMLForFourDayForecast(forecasts);
      ctx.replyWithHTML(html);
    }
  });
});

connectToServer(async (err) => {
  if (err) {
    throw new Error();
  } else {
    console.log("Connected to MongoDB...");
    await bot.launch();
    console.log("Bot is up...");
    checkReminders(bot).start();
  }
});

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
