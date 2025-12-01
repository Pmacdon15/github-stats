import { type GithubStats, getGithubStats } from "@/lib/github";



export default async function StatsPage(props:PageProps<'/stats/[username]'>) {
  const userName = (await props.params).username

  let stats: GithubStats | null = null;
  let error: string | null = null;

  if (userName) {
    try {
      stats = await getGithubStats(userName);
    } catch (e: any) {
      console.error(e);
      error = e.message || "Failed to fetch GitHub stats.";
    }
  } else {
    error = "No username provided in the URL.";
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          GitHub Stats for {userName}
        </h1>

        {stats ? (
          <div className="mt-4">
            <div className="flex justify-between">
              <p className="text-gray-600">UserName</p>
              <p className="font-medium text-gray-800">{stats.username}</p>
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-gray-600">Followers</p>
              <p className="font-medium text-gray-800">{stats.followers}</p>
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-gray-600">Following</p>
              <p className="font-medium text-gray-800">{stats.following}</p>
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-gray-600">Public Repos</p>
              <p className="font-medium text-gray-800">{stats.publicRepos}</p>
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-gray-600">Stars</p>
              <p className="font-medium text-gray-800">{stats.stars}</p>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-center text-gray-600">
            {error ||
              "Failed to load stats for the provided username. Please ensure the username is correct and a GITHUB_TOKEN environment variable is set."}
          </p>
        )}
      </div>
    </main>
  );
}
