import fs from "fs/promises";
import path from "path";
import { buildQuery, calculatePopularity, sleep } from "./utils.js";

const GITHUB_TOKEN = process.env.FETCH_TOKEN;
const PORTFOLIOS_JSON = "data/portfolios.json";
const README_FILE = "README.md";
const BATCH_SIZE = 20;
const SLEEP_MS = 5000; // 5 second

if (!GITHUB_TOKEN) throw new Error("Missing GITHUB_TOKEN environment variable");

const parseReadmePortfolios = async () => {
  const readme = await fs.readFile(README_FILE, "utf-8");
  const match = readme.match(/## Portfolios([\s\S]*)/);
  if (!match) return [];
  const section = match[1];
  const entries = [];

  for (const line of section.split("\n")) {
    const trimmed = line.trim();
    const m = trimmed.match(/- \[([^\]]+)\]\(([^)]+)\)/);
    if (m) entries.push({ username: m[1], portfolioLink: m[2] });
  }

  return entries;
};

const syncPortfolios = async () => {
  const readmePortfolios = await parseReadmePortfolios();
  console.log(`Found ${readmePortfolios.length} portfolios in README.md`);

  let currentData = [];
  try {
    currentData = JSON.parse(await fs.readFile(PORTFOLIOS_JSON, "utf-8"));
  } catch {
    console.log("No existing portfolios.json found, starting fresh.");
  }

  const mergedMap = new Map();
  for (const p of currentData) mergedMap.set(p.username, { ...p });

  // Update existing portfolio
  for (const { username, portfolioLink } of readmePortfolios) {
    const existing = mergedMap.get(username);
    if (!existing) {
      mergedMap.set(username, { username, portfolioLink });
    } else if (existing.portfolioLink !== portfolioLink) {
      mergedMap.set(username, { ...existing, portfolioLink });
    }
  }

  const mergedArray = Array.from(mergedMap.values());
  const updatedPortfolios = [];

  for (let i = 0; i < mergedArray.length; i += BATCH_SIZE) {
    const batch = mergedArray.slice(i, i + BATCH_SIZE);
    const usernames = batch.map((p) => p.username);

    const query = buildQuery(usernames);
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const { data, errors } = await res.json();
    if (errors) console.warn("GraphQL errors:", errors);

    for (let j = 0; j < batch.length; j++) {
      const portfolio = batch[j];
      const userData = data[`user_${j}`] || data.user || null;

      if (!userData) {
        console.warn(`No GitHub data for ${portfolio.username}`);
        updatedPortfolios.push({
          ...portfolio,
          followers: portfolio.followers ?? 0,
          stars: portfolio.stars ?? 0,
          popularity: calculatePopularity(
            portfolio.followers ?? 0,
            portfolio.stars ?? 0,
          ),
          lastFetched: portfolio.lastFetched ?? Date.now(),
        });
        continue;
      }

      const followers = userData.followers.totalCount;
      const stars = userData.repositories.nodes.reduce(
        (sum, repo) => sum + repo.stargazerCount,
        0,
      );
      const name = userData.name;
      const popularity = calculatePopularity(followers, stars);

      updatedPortfolios.push({
        ...portfolio,
        name,
        followers,
        stars,
        popularity,
        lastFetched: Date.now(),
      });
    }

    console.log(`Processed batch ${i / BATCH_SIZE + 1}`);
    await sleep(SLEEP_MS);
  }

  updatedPortfolios.sort((a, b) =>
    a.username.localeCompare(b.username, "en", { sensitivity: "base" }),
  );

  await fs.mkdir(path.dirname(PORTFOLIOS_JSON), { recursive: true });
  await fs.writeFile(
    PORTFOLIOS_JSON,
    JSON.stringify(updatedPortfolios, null, 2),
  );
  console.log(`Updated ${PORTFOLIOS_JSON} successfully.`);

  const portfoliosMarkdown = updatedPortfolios
    .map((p) => `- [${p.username}](${p.portfolioLink})`)
    .join("\n");
  const readmeContent = await fs.readFile(README_FILE, "utf-8");
  const newReadme = readmeContent.replace(
    /## Portfolios([\s\S]*)/,
    `## Portfolios\n${portfoliosMarkdown}`,
  );
  await fs.writeFile(README_FILE, newReadme);
  console.log("Updated README.md Portfolios section.");
};

syncPortfolios().catch(console.error);
