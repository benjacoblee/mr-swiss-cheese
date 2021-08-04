export const optionsKeys = {
  IS_REMIND: "isRemind",
  IS_REMINDER: "isReminder",
  IS_NEWS: "isNews",
  IS_WEATHER: "isWeather",
};

export const reminderInput = {
  title: "",
  due: null,
  unit: "",
};

export const validTimeUnits = [
  "years",
  "months",
  "weeks",
  "days",
  "hours",
  "minutes",
  "seconds",
];

export const startText =
  "Hi! I'm Mr. Swiss Cheese. Check out what I can do with <a href='/help'>/help</a>. I am still in development, so I can be a little glitchy. If that happens, try to <a href='/cancel'>/cancel</a> the current operation";

export const helpText = `
Hi! I'm Mr Swiss Cheese. Here's a list of things I can do:\n
<b><a href="/help">/help</a></b> Show all available commands
<b><a href="/remind">/remind</a></b> Set reminders
<b><a href="/reminders">/reminders</a></b> Show all my reminders
<b><a href="/news">/news</a></b> Get local or global news
<b><a href="/weather">/weather</a></b> Get brief forecasts
<b><a href="/cancel">/cancel</a></b> Cancels current operation\n
`;

export const options = {
  isRemind: false,
  isReminder: false,
  isNews: false,
  isWeather: false,
};
