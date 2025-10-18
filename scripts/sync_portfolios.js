import fs from "fs/promises";
import { sleep, fetchAgain, calculatePopularity, buildQuery } from "./utils.js";

const GITHUB_TOKEN = process.env.FETCH_TOKEN;
const UPDATE_INTERVAL_DAYS = 5;
const PORTFOLIOS_DATA = "data/portfolios.json";
const BATCH_SIZE = 30;
const SLEEP_MS = 10000; // 10 seconds

if (!GITHUB_TOKEN) throw new Error("Missing GITHUB_TOKEN environment variable");

const syncPortfolios = async () => {
  const portfolios = JSON.parse(await fs.readFile(PORTFOLIOS_DATA, "utf-8"));

  const portfoliosToUpdate = portfolios.filter((p) =>
    fetchAgain(p.lastFetched, UPDATE_INTERVAL_DAYS),
  );

  console.log(`Updating ${portfoliosToUpdate.length} portfolios...`);

  const updatedPortfolios = [];

  for (let i = 0; i < portfoliosToUpdate.length; i += BATCH_SIZE) {
    const batch = portfoliosToUpdate.slice(i, i + BATCH_SIZE);
    const usernames = batch.map((p) => p.username);

    const query = buildQuery(usernames);

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const { data, errors } = await response.json();

    if (errors) {
      console.warn("GraphQL errors detected:", errors);
    }

    for (let j = 0; j < batch.length; j++) {
      const portfolio = batch[j];
      const userData = data[`user_${j}`];

      if (!userData) {
        console.warn(`User not found: ${portfolio.username}`);
        updatedPortfolios.push({
          ...portfolio,
          followers: portfolio.followers ?? 0,
          stars: portfolio.stars ?? 0,
          popularity: calculatePopularity(portfolio.followers, portfolio.stars),
          lastFetched: portfolio.lastFetched || Date.now(),
        });
        continue;
      }

      const followers = userData.followers.totalCount;

      const stars = userData.repositories.nodes.reduce(
        (sum, repo) => sum + repo.stargazerCount,
        0,
      );
      const name = userData.name;

      updatedPortfolios.push({
        name: name || portfolio.name,
        username: portfolio.username,
        portfolioLink: portfolio.portfolioLink,
        followers,
        stars,
        popularity: calculatePopularity(followers, stars),
        lastFetched: Date.now(),
      });
    }

    console.log(`Processed batch ${i / BATCH_SIZE + 1}`);
    await sleep(SLEEP_MS);
  }

  const fresh = portfolios.filter(
    (p) => !fetchAgain(p.lastFetched, UPDATE_INTERVAL_DAYS),
  );
  const merged = [...fresh, ...updatedPortfolios];

  await fs.writeFile(PORTFOLIOS_DATA, JSON.stringify(merged, null, 2));

  console.log("Sync complete!");
};

syncPortfolios().catch(console.error);
