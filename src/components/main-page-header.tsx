import { Github } from 'lucide-react'

export default async function MainPageHeader({
	userNamePromise,
}: {
	userNamePromise: Promise<string>
}) {
	const userName = await userNamePromise
	return (
		<div className="flex text-center ">
			<Github color="#3fb950" />
			<h1 className="font-bold text-(--text-primary) text-2xl">
				GitHub Stats for {userName}
			</h1>
		</div>
	)
}
