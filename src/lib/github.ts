
export type GithubStats = {
  username: string;
  followers: number;
  following: number;
  publicRepos: number;
  stars: number;
};

export async function getGithubStats(username: string): Promise<GithubStats> {

  const userResponse = await fetch(`https://api.github.com/users/${username}`);

  const user = await userResponse.json();



  const reposResponse = await fetch(

    `https://api.github.com/users/${username}/repos?per_page=100`

  );

  const repos = await reposResponse.json();



  const stars = repos.reduce(

    (acc: number, repo: any) => acc + repo.stargazers_count!,

    0

  );

  return {
    username: user.login,
    followers: user.followers,
    following: user.following,
    publicRepos: user.public_repos,
    stars,
  };
}
