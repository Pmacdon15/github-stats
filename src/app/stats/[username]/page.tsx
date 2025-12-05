import Link from 'next/link'
import { Suspense } from 'react'
import LanguageCard from '@/components/language-card'
import MainPageHeader from '@/components/main-page-header'
import StatsCard from '@/components/page/stats-card'
import { getGithubStats, getLanguageDistribution } from '@/lib/github'
import Spinner from '@/components/spinner'

export default async function StatsPage(props: PageProps<'/stats/[username]'>) {
	const userNamePromise = props.params.then((params) => params.username)

	const statsPromise = props.params.then((params) =>
		getGithubStats(params.username),
	)

	const languagePromise = props.params.then((params) =>
		getLanguageDistribution(params.username),
	)

	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-(--bg-canvas) p-4">
			<div className="w-full max-w-sm rounded-lg border border-(--border-default) bg-(--card-bg) p-6 shadow-sm">
				<Suspense>
					<MainPageHeader userNamePromise={userNamePromise} />
				</Suspense>
				<Suspense>
					<StatsCard statsPromise={statsPromise} />
				</Suspense>
			</div>
			<Suspense
				fallback={
					<div className="mt-6 w-full max-w-sm rounded-lg border border-(--border-default) bg-(--card-bg) p-6 shadow-sm">
						<h2 className="text-(--text-primary)] mb-4 text-center font-bold text-2xl flex flex-col gap-2">
							Languages loading <Spinner/>
						</h2>
					</div>
				}
			>
				<LanguageCard
					languagePromise={languagePromise}
					userNamePromise={userNamePromise}
				/>
			</Suspense>
			<Link
				className="bg-(--accent-color)] block w-full rounded-md px-4 py-2 text-center font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
				href="/"
			>
				Back to Home
			</Link>
		</main>
	)
}
