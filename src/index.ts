import fetch from "node-fetch";
import dayjs from "dayjs";
import dotenv from "dotenv";
import { Item } from "./@types/qiita-type";

dotenv.config();

const args = process.argv.slice(2);
const targetYear = parseInt(args[0]);

const fetchPosts = async () => {
  let page = 1;
  let posts: Item[];
  let allPosts: Item[] = [];
  do {
    const response = await fetch(
      `https://qiita.com/api/v2/authenticated_user/items?page=${page}&per_page=100`,
      {
        method: "get",
        headers: {
          Authorization: `Bearer ${process.env.QIITA_API_KEY}`
        }
      }
    );
    posts = await response.json();

    allPosts = [...posts, ...allPosts];

    page += 1;
  } while (posts.length !== 0);

  const currentYearPosts = allPosts.filter(
    p =>
      dayjs(p.created_at).isAfter(dayjs(`${targetYear}-01-01`)) &&
      dayjs(p.created_at).isBefore(`${targetYear + 1}-1-1`)
  );
  const currentYearLikeCount = currentYearPosts.reduce((acc, p) => {
    return acc + p.likes_count;
  }, 0);

  console.log(`${targetYear}の投稿数`, currentYearPosts.length);
  console.log(
    `${targetYear}の記事の総コントリビューション`,
    currentYearLikeCount
  );
  console.log(
    `${targetYear}の記事の平均コントリビューション`,
    Math.floor((currentYearLikeCount * 100) / currentYearPosts.length) / 100
  );
};


fetchPosts();
