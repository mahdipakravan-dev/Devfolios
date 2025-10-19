import fs from "fs/promises";
import path from "path";
import { buildQuery, calculatePopularity } from "./utils.js";

const GITHUB_TOKEN = process.env.FETCH_TOKEN;
const PORTFOLIOS_JSON = "data/portfolios.json";
const README_FILE = "README.md";

if (!GITHUB_TOKEN) throw new Error("Missing FETCH_TOKEN environment variable");

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

const syncReadme = async () => {
  const readmePortfolios = await parseReadmePortfolios();
  console.log(`Found ${readmePortfolios.length} portfolios in README.md`);

  let currentData = [];
  try {
    currentData = JSON.parse(await fs.readFile(PORTFOLIOS_JSON, "utf-8"));
  } catch {
    console.log("🆕 No existing portfolios.json found, starting fresh.");
  }

  const currentUsernames = new Set(currentData.map((p) => p.username));
  const newEntries = readmePortfolios.filter(
    (p) => !currentUsernames.has(p.username),
  );

  if (newEntries.length === 0) {
    console.log("No new portfolios to fetch.");
    return;
  }

  console.log(`Fetching data for ${newEntries.length} new portfolios...`);

  const query = buildQuery(newEntries.map((p) => p.username));
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

  const fetchedPortfolios = [];
  let idx = 0;

  for (const { username, portfolioLink } of newEntries) {
    const userData = data[`user_${idx}`] || data.user || null;
    idx++;

    if (!userData) {
      console.warn(`No GitHub data for ${username}`);
      continue;
    }

    const followers = userData.followers.totalCount;
    const stars = userData.repositories.nodes.reduce(
      (sum, repo) => sum + repo.stargazerCount,
      0,
    );
    const name = userData.name;
    const popularity = calculatePopularity(followers, stars);

    fetchedPortfolios.push({
      username,
      name,
      portfolioLink,
      followers,
      stars,
      popularity,
      lastFetched: Date.now(),
    });
  }

  const merged = [...currentData, ...fetchedPortfolios].sort((a, b) =>
    a.username.localeCompare(b.username, "en", { sensitivity: "base" }),
  );

  await fs.mkdir(path.dirname(PORTFOLIOS_JSON), { recursive: true });
  await fs.writeFile(PORTFOLIOS_JSON, JSON.stringify(merged, null, 2));
  console.log(
    `Updated ${PORTFOLIOS_JSON} with ${fetchedPortfolios.length} new entries.`,
  );
};

syncReadme().catch(console.error);
