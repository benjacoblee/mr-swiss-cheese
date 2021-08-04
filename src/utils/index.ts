export {};

import moment from "moment";
import { validTimeUnits, reminderInput } from "../constants";

export const toggleOptions = (
  options: {
    isRemind: boolean;
    isReminder: boolean;
    isNews: boolean;
    isWeather: boolean;
  },
  option?: string
) => {
  for (const [key] of Object.entries(options)) {
    options[key] = false;
  }

  if (option) options[option] = true;
};

export const validateUnit = (unit: string) => {
  return validTimeUnits.includes(unit);
};

export const validateDate = (dateStr: string) =>
  moment(dateStr, "DD-MM-YY", true).isValid() &&
  moment(dateStr, "DD-MM-YY").diff(moment(new Date()), "days") >= 0;

export const validateAmount = (duration: string) =>
  !isNaN(parseInt(duration)) && parseInt(duration) > 1;

export const clearReminderInput = () => {
  for (let key in reminderInput) {
    reminderInput[key] = "";
  }
};

export const generateHTMLForReminders = (reminders) => {
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

export const calculateDiff = (due, unit) => {
  const now = moment(Date.now());
  const later = moment(due);
  const diff = later.diff(now, unit, true);
  return diff;
};

export const generateHTMLForNews = (newsArticles) => {
  let html = "";
  newsArticles.forEach((article) => {
    const { link, contentSnippet } = article;
    html += `${contentSnippet
      .replace(/(\r\n|\n|\r)/gm, " ")
      .replace(/\s+/g, " ")} <a href="${link}">Read more</a>\n\n`;
  });

  return html;
};

export const generateHTMLForAllDayForecast = (forecast) => {
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

export const generateHTMLForFourDayForecast = (forecasts) => {
  let html = "";

  for (let forecastObj of forecasts) {
    const { timestamp, forecast } = forecastObj;
    html += `<b>${moment(timestamp).format(
      "ddd, Do MMM"
    )}</b>\n${forecast}\n\n`;
  }

  return html;
};

export const chunkArrs = (arr, chunkSize) => {
  const chunkedArr = [];
  let i = 0;

  while (i < arr.length) {
    chunkedArr.push(arr.slice(i, (i += chunkSize)));
  }

  return chunkedArr;
};
