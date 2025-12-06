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

// interface LanguageBytes {
// 	[key: string]: number
// }

interface GitHubAPIError {
	message: string
	documentation_url?: string
}

type GitHubUserResponse = GitHubUser | GitHubAPIError
type GitHubRepoResponse = GitHubRepo[] | GitHubAPIError
// type GitHubLanguagesResponse = LanguageBytes | GitHubAPIError

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

export async function getGithubStats(
	username: string,
): Promise<GithubStats | { error: string }> {
	const headers = getAuthHeaders()

	const [userResult, reposResult] = await Promise.all([
		fetch(`https://api.github.com/users/${username}`, {
			headers,
		}).then((res) => res.json()),
		fetch(`https://api.github.com/users/${username}/repos?per_page=100`, {
			headers,
		}).then((res) => res.json()),
	])

	const user = userResult as GitHubUserResponse
	if (isGitHubAPIError(user)) {
		return { error: user.message }
	}

	const repos = reposResult as GitHubRepoResponse
	if (!Array.isArray(repos)) {
		if (isGitHubAPIError(repos)) {
			console.error('GitHub API Error (repos):', repos)
			return { error: repos.message }
		}
		console.error(
			'GitHub API Error (repos): Unexpected non-array response',
			repos,
		)
		return {
			error: 'Failed to fetch repositories: Unexpected response format.',
		}
	}

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
): Promise<{ language: string; bytes: number }[] | { error: string }> {
	const headers = getAuthHeaders()
	const graphqlEndpoint = 'https://api.github.com/graphql'

	const query = `
    query($username: String!, $cursor: String) {
      user(login: $username) {
        repositories(first: 100, after: $cursor, ownerAffiliations: OWNER, isFork: false) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
              edges {
                size
                node {
                  name
                }
              }
            }
          }
        }
      }
    }
  `

	const languageBytes: { [key: string]: number } = {}
	let hasNextPage = true
	let cursor: string | null = null

	try {
		while (hasNextPage) {
			const response: Response = await fetch(graphqlEndpoint, {
				method: 'POST',
				headers: {
					...headers,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					query,
					variables: { username, cursor },
				}),
			})

			if (!response.ok) {
				throw new Error(`GitHub API responded with ${response.status}`)
			}

			const result = await response.json()

			if (result.errors) {
				console.error('GitHub GraphQL API Error:', result.errors)
				throw new Error(
					result.errors[0].message || 'Error fetching language data.',
				)
			}

			const repositories = result.data?.user?.repositories
			if (!repositories) {
				// This can happen if the user is not found, GraphQL returns data: { user: null }
				return { error: `User '${username}' not found.` }
			}

			for (const repo of repositories.nodes) {
				for (const lang of repo.languages.edges) {
					const { name } = lang.node
					const { size } = lang
					if (languageBytes[name]) {
						languageBytes[name] += size
					} else {
						languageBytes[name] = size
					}
				}
			}

			hasNextPage = repositories.pageInfo.hasNextPage
			cursor = repositories.pageInfo.endCursor
		}

		return Object.entries(languageBytes)
			.map(([language, bytes]) => ({ language, bytes }))
			.sort((a, b) => b.bytes - a.bytes)
	} catch (error: unknown) {
		console.error('Error in getLanguageDistribution:', error)
		const message =
			error instanceof Error
				? error.message
				: 'An unknown error occurred.'
		return { error: message }
	}
}
