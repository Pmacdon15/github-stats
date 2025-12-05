import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'
import { getGithubStats } from '@/lib/github'
import {
	GhIcon,
	GitBranchIcon,
	StarIcon,
	UserCheckIcon,
	UserIcon,
	UserPlusIcon,
} from '@/lib/icons'

export const runtime = 'edge'

export async function GET(
	_request: NextRequest,
	props: { params: Promise<{ username: string }> },
) {
	const { username } = await props.params

	if (!username) {
		return new Response('Username is required', { status: 400 })
	}

	try {
		const stats = await getGithubStats(username)

		const textPrimary = '#ffffff'
		const textSecondary = '#a0aec0'
		const _accentColor = '#0969da'

		return new ImageResponse(
			<div
				style={{
					height: '100%',
					width: '100%',
					backgroundColor: '#1a202c',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<div
					style={{
						height: '100%',
						width: '100%',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: '#1a202c',
						border: `1px solid #4a5568`,
						borderRadius: '8px',
						padding: '24px',
						fontFamily:
							'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
					}}
				>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							width: '100%',
						}}
					>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								marginBottom: '16px',
								color: textPrimary,
								padding: '24px',
							}}
						>
							<img
								alt="Not for a browser"
								height="24"
								src={`data:image/svg+xml;base64,${btoa(GhIcon)}`}
								style={{ marginRight: '12px' }}
								width="24"
							/>
							<h1
								style={{
									fontSize: '24px',
									fontWeight: 700,
									marginLeft: 'auto',
									marginRight: 'auto',
								}}
							>
								Git Hub Stats for {stats.username}
							</h1>
						</div>

						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								width: '100%',
								gap: '12px',
							}}
						>
							{/* UserName */}
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									width: '100%',
								}}
							>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: '8px',
										color: textSecondary,
									}}
								>
									<img
										alt="Not for a browser"
										height="18"
										src={`data:image/svg+xml;base64,${btoa(UserIcon)}`}
										width="18"
									/>
									<span style={{ fontSize: '14px' }}>
										Username
									</span>
								</div>
								<span
									style={{
										fontSize: '14px',
										fontWeight: 500,
										color: textPrimary,
									}}
								>
									{stats.username}
								</span>
							</div>

							{/* Followers */}
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									width: '100%',
								}}
							>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: '8px',
										color: textSecondary,
									}}
								>
									<img
										alt="Not for a browser"
										height="18"
										src={`data:image/svg+xml;base64,${btoa(UserCheckIcon)}`}
										width="18"
									/>
									<span style={{ fontSize: '14px' }}>
										Followers
									</span>
								</div>
								<span
									style={{
										fontSize: '14px',
										fontWeight: 500,
										color: textPrimary,
									}}
								>
									{stats.followers}
								</span>
							</div>

							{/* Following */}
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									width: '100%',
								}}
							>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: '8px',
										color: textSecondary,
									}}
								>
									<img
										alt="Not for a browser"
										height="18"
										src={`data:image/svg+xml;base64,${btoa(UserPlusIcon)}`}
										width="18"
									/>
									<span style={{ fontSize: '14px' }}>
										Following
									</span>
								</div>
								<span
									style={{
										fontSize: '14px',
										fontWeight: 500,
										color: textPrimary,
									}}
								>
									{stats.following}
								</span>
							</div>

							{/* Public Repos */}
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									width: '100%',
								}}
							>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: '8px',
										color: textSecondary,
									}}
								>
									<img
										alt="Not for a browser"
										height="18"
										src={`data:image/svg+xml;base64,${btoa(GitBranchIcon)}`}
										width="18"
									/>
									<span style={{ fontSize: '14px' }}>
										Public Repos
									</span>
								</div>
								<span
									style={{
										fontSize: '14px',
										fontWeight: 500,
										color: textPrimary,
									}}
								>
									{stats.publicRepos}
								</span>
							</div>

							{/* Stars */}
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									width: '100%',
								}}
							>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: '8px',
										color: textSecondary,
									}}
								>
									<img
										alt="Not for a browser"
										height="18"
										src={`data:image/svg+xml;base64,${btoa(StarIcon)}`}
										width="18"
									/>
									<span style={{ fontSize: '14px' }}>
										Stars
									</span>
								</div>
								<span
									style={{
										fontSize: '14px',
										fontWeight: 500,
										color: textPrimary,
									}}
								>
									{stats.stars}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>,
			{
				width: 420,
				height: 300,
				headers: {
					'Cache-Control': 's-maxage=3600, stale-while-revalidate',
				},
			},
		)
	} catch (error: unknown) {
		console.error('Error generating image:', error)
		return new Response('Failed to generate image', { status: 500 })
	}
}
