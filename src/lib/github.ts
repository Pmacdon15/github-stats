interface GitHubUser {
	login: string
	followers: number
	following: number
	public_repos: number
}

interface GitHubRepo {
	stargazers_count: number | null
	fork: boolean
	languages_url: string
}

interface LanguageBytes {
	[key: string]: number
}

interface GitHubAPIError {
	message: string
	documentation_url?: string
}

type GitHubUserResponse = GitHubUser | GitHubAPIError
type GitHubRepoResponse = GitHubRepo[] | GitHubAPIError
type GitHubLanguagesResponse = LanguageBytes | GitHubAPIError

function isGitHubAPIError(response: unknown): response is GitHubAPIError {
	return (
		typeof response === 'object' &&
		response !== null &&
		'message' in response &&
		typeof (response as GitHubAPIError).message === 'string'
	)
}

function getAuthHeaders(): Record<string, string> {
	const headers: Record<string, string> = {}
	const token = process.env.GITHUB_TOKEN
	if (token) {
		headers.Authorization = `Bearer ${token}`
	}
	return headers
}

export type GithubStats = {
	username: string

	followers: number

	following: number

	publicRepos: number

	stars: number
}

export async function getGithubStats(username: string): Promise<GithubStats> {
	const userResponse = await fetch(
		`https://api.github.com/users/${username}`,
		{
			headers: getAuthHeaders(),
		},
	)

	const user: GitHubUserResponse = await userResponse.json()

	if (isGitHubAPIError(user)) {
		throw new Error(user.message)
	}

	// Now 'user' is correctly narrowed to GitHubUser

	const reposResponse = await fetch(
		`https://api.github.com/users/${username}/repos?per_page=100`,

		{
			headers: getAuthHeaders(),
		},
	)

	const reposData: GitHubRepoResponse = await reposResponse.json()

	// Type guard to check if it's an array of repos

	if (!Array.isArray(reposData)) {
		// If it's not an array, it must be a GitHubAPIError

		if (isGitHubAPIError(reposData)) {
			console.error('GitHub API Error (repos):', reposData)

			throw new Error(reposData.message)
		} else {
			// Fallback for unexpected non-array response

			console.error(
				'GitHub API Error (repos): Unexpected non-array response',

				reposData,
			)

			throw new Error(
				'Failed to fetch repositories: Unexpected response format.',
			)
		}
	}

	// Now `reposData` is guaranteed to be GitHubRepo[]

	const repos: GitHubRepo[] = reposData

	const stars = repos.reduce(
		(acc: number, repo: GitHubRepo) => acc + (repo.stargazers_count ?? 0),

		0,
	)

	return {
		username: user.login,

		followers: user.followers,

		following: user.following,

		publicRepos: user.public_repos,

		stars,
	}
}

export async function getLanguageDistribution(
	username: string,
): Promise<{ language: string; bytes: number }[]> {
	const languageBytes: { [key: string]: number } = {}

	let allRepos: GitHubRepo[] = []

	let page = 1

	let hasMoreRepos = true

	while (hasMoreRepos) {
		const reposResponse = await fetch(
			`https://api.github.com/users/${username}/repos?per_page=100&page=${page}`,

			{
				headers: getAuthHeaders(),
			},
		)

		const reposData: GitHubRepoResponse = await reposResponse.json()

		// Type guard to check if it's an array of repos

		if (!Array.isArray(reposData)) {
			// If it's not an array, it must be a GitHubAPIError

			if (isGitHubAPIError(reposData)) {
				console.error(
					'GitHub API Error (language distribution):',

					reposData,
				)

				throw new Error(reposData.message)
			} else {
				// Fallback for unexpected non-array response

				console.error(
					'GitHub API Error (language distribution): Unexpected non-array response',

					reposData,
				)

				throw new Error(
					'Failed to fetch repositories for language distribution: Unexpected response format.',
				)
			}
		}

		const repos: GitHubRepo[] = reposData

		if (repos.length === 0) {
			hasMoreRepos = false
		} else {
			allRepos = allRepos.concat(repos)

			page++
		}
	}

	for (const repo of allRepos) {
		if (repo.fork) continue

		const languagesResponse = await fetch(repo.languages_url, {
			headers: getAuthHeaders(),
		})

		const languages: GitHubLanguagesResponse =
			await languagesResponse.json()

		if (isGitHubAPIError(languages)) {
			// Check for error message in languages response

			console.error('GitHub API Error (languages for repo):', languages)

			throw new Error(languages.message)
		}

		// Now `languages` is guaranteed to be LanguageBytes

		for (const lang in languages) {
			if (typeof languages[lang] === 'number') {
				// Ensure it's a number, not the 'message' property

				if (languageBytes[lang]) {
					languageBytes[lang] += languages[lang]
				} else {
					languageBytes[lang] = languages[lang]
				}
			}
		}
	}

	return Object.entries(languageBytes)

		.map(([language, bytes]) => ({ language, bytes }))

		.sort((a, b) => b.bytes - a.bytes) // Sort by bytes in descending order
}
