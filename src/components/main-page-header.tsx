import { GitHubIcon } from './icons.github'

export default async function MainPageHeader({
	userNamePromise,
}: {
	userNamePromise: Promise<string>
}) {
	const userName = await userNamePromise
	return (
		<div className="flex text-center">
			<GitHubIcon />
			<h1 className="font-bold text-(--text-primary) text-2xl">
				GitHub Stats for {userName}
			</h1>
		</div>
	)
}
