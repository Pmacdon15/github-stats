export default async function LanguagesChartHeader({
	userNamePromise,
}: {
	userNamePromise: Promise<string>
}) {
	const userName = await userNamePromise
	return (
		<h2 className="text-(--text-primary)] mb-4 text-center font-bold text-2xl">
			Languages for {userName}
		</h2>
	)
}
