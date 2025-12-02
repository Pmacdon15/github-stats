import { GitBranch, Star, User, UserCheck, UserPlus } from 'lucide-react'
import LanguagePieChart from '@/components/LanguagePieChart'
import {
	type GithubStats,
	getGithubStats,
	getLanguageDistribution,
} from '@/lib/github'

function isErrorWithMessage(error: unknown): error is { message: string } {
	return (
		typeof error === 'object' &&
		error !== null &&
		'message' in error &&
		typeof (error as { message: unknown }).message === 'string'
	)
}

export default async function StatsPage(props: PageProps<'/stats/[username]'>) {
	const userName = (await props.params).username

	let stats: GithubStats | null = null
	let statsError: string | null = null
	let processedLanguageData: { language: string; bytes: number }[] | null =
		null
	let languageError: string | null = null

	if (userName) {
		try {
			stats = await getGithubStats(userName)
		} catch (e: unknown) {
			console.error(e)
			if (isErrorWithMessage(e)) {
				statsError = e.message
			} else {
				statsError = 'An unexpected error occurred.'
			}
			statsError = statsError || 'Failed to fetch GitHub stats.'
		}

		try {
			const languageDistribution = await getLanguageDistribution(userName)

			if (languageDistribution && languageDistribution.length > 0) {
				const totalBytes = languageDistribution.reduce(
					(sum, lang) => sum + lang.bytes,
					0,
				)
				const thresholdPercentage = 2

				const mainLanguages = languageDistribution.filter(
					(lang) =>
						(lang.bytes / totalBytes) * 100 >= thresholdPercentage,
				)

				const otherBytes = languageDistribution
					.filter(
						(lang) =>
							(lang.bytes / totalBytes) * 100 <
							thresholdPercentage,
					)
					.reduce((sum, lang) => sum + lang.bytes, 0)

				processedLanguageData = [...mainLanguages]

				if (otherBytes > 0) {
					processedLanguageData.push({
						language: 'Other',
						bytes: otherBytes,
					})
				}
			}
		} catch (e: unknown) {
			console.error(e)
			if (isErrorWithMessage(e)) {
				languageError = e.message
			} else {
				languageError = 'An unexpected error occurred.'
			}
			languageError =
				languageError || 'Failed to fetch language distribution.'
		}
	} else {
		statsError = 'No username provided in the URL.'
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-canvas)] p-4">
			<div className="w-full max-w-sm rounded-lg border border-[var(--border-default)] bg-[var(--card-bg)] p-6 shadow-sm">
				<h1 className="text-center font-bold text-2xl text-[var(--text-primary)]">
					GitHub Stats for {userName}
				</h1>

				{stats ? (
					<div className="mt-4 space-y-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-[var(--text-secondary)]">
								<User size={18} />
								<p>UserName</p>
							</div>
							<p className="font-medium text-[var(--text-primary)]">
								{stats.username}
							</p>
						</div>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-[var(--text-secondary)]">
								<UserCheck size={18} />
								<p>Followers</p>
							</div>
							<p className="font-medium text-[var(--text-primary)]">
								{stats.followers}
							</p>
						</div>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-[var(--text-secondary)]">
								<UserPlus size={18} />
								<p>Following</p>
							</div>
							<p className="font-medium text-[var(--text-primary)]">
								{stats.following}
							</p>
						</div>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-[var(--text-secondary)]">
								<GitBranch size={18} />
								<p>Public Repos</p>
							</div>
							<p className="font-medium text-[var(--text-primary)]">
								{stats.publicRepos}
							</p>
						</div>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-[var(--text-secondary)]">
								<Star size={18} />
								<p>Stars</p>
							</div>
							<p className="font-medium text-[var(--text-primary)]">
								{stats.stars}
							</p>
						</div>
					</div>
				) : (
					<p className="mt-4 text-center text-[var(--text-secondary)]">
						{statsError ||
							'Failed to load stats for the provided username. Please ensure the username is correct and a GITHUB_TOKEN environment variable is set.'}
					</p>
				)}
			</div>

			<div className="mt-6 w-full max-w-sm rounded-lg border border-[var(--border-default)] bg-[var(--card-bg)] p-6 shadow-sm">
				<h2 className="mb-4 text-center font-bold text-2xl text-[var(--text-primary)]">
					Languages for {userName}
				</h2>
				{processedLanguageData && processedLanguageData.length > 0 ? (
					<LanguagePieChart data={processedLanguageData} />
				) : (
					<p className="text-center text-[var(--text-secondary)]">
						{languageError || 'No language data available.'}
					</p>
				)}
			</div>

			<div className="mt-6 w-full max-w-sm">
				<a
					className="block w-full rounded-md bg-[var(--accent-color)] px-4 py-2 text-center font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
					href="/"
				>
					Back to Home
				</a>
			</div>
		</main>
	)
}
