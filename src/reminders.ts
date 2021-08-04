const CronJob = require("cron").CronJob;
import { getDB } from "./utils/mongoUtil";
import { calculateDiff } from "./utils";

export const addReminder = (reminder) => {
  const db = getDB();
  const collection = db.collection("reminders");
  collection.insertOne(reminder);
};

export const getReminders = (chatId) => {
  const db = getDB();
  const collection = db.collection("reminders");
  const reminders = collection.find({ chatId }).sort({ due: 1 }).toArray();
  return reminders;
};

export const checkReminders = (bot) => {
  return new CronJob(
    "* * * * * *",
    async () => {
      const db = getDB();

      const collection = db.collection("reminders");
      const reminders = await collection
        .find()
        .sort({ due: 1 })
        .limit(3)
        .toArray();

      for (let reminder of reminders) {
        if (calculateDiff(reminder.due, reminder.unit) < 0) {
          const { chatId, username, title } = reminder;
          await collection.deleteOne({ _id: reminder._id }).then(() => {
            bot.telegram.sendMessage(
              chatId,
              `Hey ${username}, time to ${title.toLowerCase()}!`
            );
          });
        }
      }
    },
    null,
    false
  );
};
