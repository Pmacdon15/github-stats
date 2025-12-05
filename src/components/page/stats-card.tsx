import { GitBranch, Star, User, UserCheck, UserPlus } from 'lucide-react'
import type { GithubStats } from '@/lib/github'

export default async function StatsCard({
	statsPromise,
}: {
	statsPromise: Promise<GithubStats | { error: string }>
}) {
	const stats = await statsPromise

	if ('error' in stats) {
		return (
			<div className="mt-4 space-y-3">
				<p className="text-lg font-medium text-(--text-primary)">
					Oops, couldn't load GitHub stats!
				</p>
			</div>
		)
	}

	return (
		<div className="mt-4 space-y-3">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2 text-(--text-secondary)">
					<User color="#3fb950" size={18} />
					<p>UserName</p>
				</div>
				<p className="font-medium text-(--text-primary)">
					{stats.username}
				</p>
			</div>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2 text-(--text-secondary)">
					<UserCheck color="#3fb950" size={18} />
					<p>Followers</p>
				</div>
				<p className="font-medium text-(--text-primary)">
					{stats.followers}
				</p>
			</div>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2 text-(--text-secondary)">
					<UserPlus color="#3fb950" size={18} />
					<p>Following</p>
				</div>
				<p className="font-medium text-(--text-primary)">
					{stats.following}
				</p>
			</div>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2 text-(--text-secondary)">
					<GitBranch color="#3fb950" size={18} />
					<p>Public Repos</p>
				</div>
				<p className="font-medium text-(--text-primary)">
					{stats.publicRepos}
				</p>
			</div>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2 text-(--text-secondary)">
					<Star color="#3fb950" size={18} />
					<p>Stars</p>
				</div>
				<p className="text-(--text-primary)] font-medium">
					{stats.stars}
				</p>
			</div>
		</div>
	)
}
