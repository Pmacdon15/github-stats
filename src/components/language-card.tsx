import { Suspense } from 'react'
import LanguagePieChart from './LanguagePieChart'
import LanguagesChartHeader from './languages-chart-header'

export default async function LanguageCard({
	languagePromise,
	userNamePromise,
}: {
	languagePromise: Promise<
		{ language: string; bytes: number }[] | { error: string }
	>
	userNamePromise: Promise<string>
}) {
	const languageDistribution = await languagePromise

	let processedLanguageData: { language: string; bytes: number }[] | null =
		null	

	if ('error' in languageDistribution) {
		return (
			<div className="mt-4 space-y-3">
				<p className="text-lg font-medium text-(--text-primary)">
					Oops, couldn't load GitHub stats!
				</p>
			</div>
		)
	}

	try {
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
	}

	return (
		<div className="mt-6 w-full max-w-sm rounded-lg border border-(--border-default) bg-(--card-bg) p-6 shadow-sm">
			<Suspense>
				<LanguagesChartHeader userNamePromise={userNamePromise} />
			</Suspense>
			{processedLanguageData && processedLanguageData.length > 0 && (
				<LanguagePieChart data={processedLanguageData} />
			)}
		</div>
	)
}
