import LanguagePieChart from '@/components/LanguagePieChart'
import { getLanguageDistribution } from '@/lib/github'

function isErrorWithMessage(error: unknown): error is { message: string } {
	return (
		typeof error === 'object' &&
		error !== null &&
		'message' in error &&
		typeof (error as { message: unknown }).message === 'string'
	)
}

interface PageProps {
	params: Promise<{ username: string }>
}

export default async function ChartPage(props: PageProps) {
	const { username } = await props.params
	let processedLanguageData: { language: string; bytes: number }[] | null =
		null
	let languageError: string | null = null

	try {
		const languageDistribution = await getLanguageDistribution(username)

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
						(lang.bytes / totalBytes) * 100 < thresholdPercentage,
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

	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-canvas)] p-4">
			<div className="w-full max-w-sm rounded-lg border border-[var(--border-default)] bg-[var(--card-bg)] p-6 shadow-sm">
				<h1 className="mb-4 text-center font-bold text-2xl text-[var(--text-primary)]">
					Languages for {username}
				</h1>

				{processedLanguageData && processedLanguageData.length > 0 ? (
					<LanguagePieChart data={processedLanguageData} />
				) : (
					<p className="text-center text-[var(--text-secondary)]">
						{languageError || 'No language data available.'}
					</p>
				)}

				<div className="mt-6 text-center">
					<a
						className="text-[var(--accent-color)] hover:underline"
						href={`/stats/${username}`}
					>
						Back to Stats
					</a>
				</div>
			</div>
		</main>
	)
}
