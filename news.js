const Parser = require("rss-parser");
const parser = new Parser();

const getLocalNews = async () => {
  const res = await parser.parseURL(
    "https://www.channelnewsasia.com/rssfeeds/8396082"
  );
  const { items } = res;
  return items.splice(0, 5);
};

const getGlobalNews = async () => {
  const res = await parser.parseURL(
    "https://www.channelnewsasia.com/rssfeeds/8395884"
  );
  const { items } = res;
  return items.splice(0, 5);
};

module.exports = {
  getLocalNews,
  getGlobalNews,
};
