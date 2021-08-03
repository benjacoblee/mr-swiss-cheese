const CronJob = require("cron").CronJob;
const { calculateDiff } = require("./utils/utils");
const mongoUtil = require("./utils/mongoUtil");

const addReminder = (reminder) => {
  const db = mongoUtil.getDB();
  const collection = db.collection("reminders");
  collection.insertOne(reminder);
};

const getReminders = (chatId) => {
  const db = mongoUtil.getDB();
  const collection = db.collection("reminders");
  const reminders = collection.find({ chatId }).sort({ due: 1 }).toArray();
  return reminders;
};

const checkReminders = (bot) => {
  return new CronJob(
    "* * * * * *",
    async () => {
      const db = mongoUtil.getDB();

      const collection = db.collection("reminders");
      const reminders = await collection
        .find()
        .sort({ due: 1 })
        .limit(3)
        .toArray();

      for (reminder of reminders) {
        if (calculateDiff(reminder.due, reminder.unit) < 0) {
          const { chatId, username, title } = reminder;
          await collection.deleteOne({ _id: reminder._id });
          bot.telegram.sendMessage(
            chatId,
            `Hey ${username}, time to ${title.toLowerCase()}!`
          );
        }
      }
    },
    null,
    false
  );
};

module.exports = { addReminder, getReminders, checkReminders };
