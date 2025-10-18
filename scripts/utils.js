export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchAgain = (timestamp, update_interval_days) => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInMs = now - past;
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24); // convert to days
  return diffInDays > update_interval_days;
};


export const calculatePopularity = (followers, stars) =>
  Number(followers || 0) + Number(stars || 0);


export const buildQuery = (usernames) => `
  query {
    ${usernames
      .map(
        (username, idx) => `
        user_${idx}: user(login: "${username}") {
          login
          name
          followers { totalCount }
          repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
            nodes {
              stargazerCount
            }
          }
        }
      `
      )
      .join("\n")}
  }
`;