const Parser = require("rss-parser");
const parser = new Parser();

const getLocalNews = async () => {
  console.log("Getting news...");
  return await parser
    .parseURL("https://www.channelnewsasia.com/rssfeeds/8396082")
    .then((res) => res.items.splice(0, 5));
};

const getGlobalNews = async () => {
  console.log("Getting news...");
  return await parser
    .parseURL("https://www.channelnewsasia.com/rssfeeds/8395884")
    .then((res) => res.items.splice(0, 5));
};

module.exports = {
  getLocalNews,
  getGlobalNews,
};
