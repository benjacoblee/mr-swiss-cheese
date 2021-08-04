import Parser from "rss-parser";
const parser = new Parser();

export const getLocalNews = async () => {
  const res = await parser.parseURL(
    "https://www.channelnewsasia.com/rssfeeds/8396082"
  );
  const { items } = res;
  return items.splice(0, 5);
};

export const getGlobalNews = async () => {
  const res = await parser.parseURL(
    "https://www.channelnewsasia.com/rssfeeds/8395884"
  );
  const { items } = res;
  return items.splice(0, 5);
};
