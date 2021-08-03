const { validTimeUnits, reminderInput } = require("../constants");
const moment = require("moment");

const toggleOptions = (options, option) => {
  for (const [key] of Object.entries(options)) {
    options[key] = false;
  }

  if (option) options[option] = true;
};

const validateUnit = (unit) => validTimeUnits.includes(unit);

const validateDate = (dateStr) => {
  return (
    moment(dateStr, "DD-MM-YY").isValid() &&
    moment(dateStr, "DD-MM-YY").diff(moment(new Date()), "days") >= 0
  );
};

const validateAmount = (duration) =>
  !isNaN(parseInt(duration)) && duration >= 1;

const clearReminderInput = () => {
  for (let key in reminderInput) {
    reminderInput[key] = "";
  }
};

const generateHTMLForReminders = (reminders) => {
  let html = "";

  reminders.forEach((reminder, idx) => {
    const { due, unit, title } = reminder;
    const diff = calculateDiff(due, unit);
    const humanizedDiff = moment.duration(diff, unit).humanize();
    html += `${idx + 1}. ${
      title.charAt(0).toUpperCase() + title.slice(1)
    } in ${humanizedDiff}\n`;
  });

  return html;
};

const calculateDiff = (due, unit) => {
  const now = moment(Date.now());
  const later = moment(due);
  const diff = later.diff(now, unit, true);
  return diff;
};

const generateHTMLForNews = (newsArticles) => {
  let html = "";
  newsArticles.forEach((article) => {
    const { link, contentSnippet } = article;
    html += `${contentSnippet
      .replace(/(\r\n|\n|\r)/gm, " ")
      .replace(/\s+/g, " ")} <a href="${link}">Read more</a>\n\n`;
  });

  return html;
};

const generateHTMLForAllDayForecast = (forecast) => {
  const { today, tonight } = forecast;

  let html = `<b>${moment(today.time.start).format("ddd, hA")} - ${moment(
    today.time.end
  ).format("ddd, hA")}</b>\n`;

  for (let [key, value] of Object.entries(today)) {
    if (key === "regions") {
      for (let [location, forecastVal] of Object.entries(value)) {
        location = location.charAt(0).toUpperCase() + location.slice(1);
        html += `${location}: <b>${forecastVal}</b>\n`;
      }
    }
  }

  html += `\n<b>${moment(tonight.time.start).format("ddd, hA")} - ${moment(
    tonight.time.end
  ).format("ddd, hA")}</b>\n`;

  for (let [key, value] of Object.entries(tonight)) {
    if (key === "regions") {
      for (let [location, forecastVal] of Object.entries(value)) {
        location = location.charAt(0).toUpperCase() + location.slice(1);
        html += `${location}: <b>${forecastVal}</b>\n`;
      }
    }
  }

  return html;
};

const generateHTMLForFourDayForecast = (forecasts) => {
  let html = "";

  for (let forecastObj of forecasts) {
    const { timestamp, forecast } = forecastObj;
    html += `<b>${moment(timestamp).format(
      "ddd, Do MMM"
    )}</b>\n${forecast}\n\n`;
  }

  return html;
};

const chunkArrs = (arr, chunkSize) => {
  const chunkedArr = [];
  let i = 0;

  while (i < arr.length) {
    chunkedArr.push(arr.slice(i, (i += chunkSize)));
  }

  return chunkedArr;
};

module.exports = {
  toggleOptions,
  validateUnit,
  validateDate,
  clearReminderInput,
  validateAmount,
  generateHTMLForReminders,
  calculateDiff,
  generateHTMLForNews,
  generateHTMLForAllDayForecast,
  generateHTMLForFourDayForecast,
  chunkArrs,
};
