import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'
import { getLanguageDistribution } from '@/lib/github'
import { GhIcon } from '@/lib/icons'


// Function to generate consistent colors for languages
const getLanguageColor = (index: number) => {
	const colors = [
		'#954EA3', // Purple
		'#2AFB3D', // Green
		'#7B00F1', // Darker Purple
		'#A771DA', // Lighter Purple
		'#8A5470', // Brownish
		'#0518FA', // Blue
		'#FF5733', // Orange
		'#33FF57', // Light Green
		'#3357FF', // Light Blue
		'#FF33FF', // Magenta
		'#33FFFF', // Cyan
		'#FFFF33', // Yellow
	]
	return colors[index % colors.length]
}

export async function GET(
	_request: NextRequest,
	props: { params: Promise<{ username: string }> },
) {
	const { username } = await props.params

	if (!username) {
		return new Response('Username is required', { status: 400 })
	}

	try {
		const languages = await getLanguageDistribution(username)
		const textPrimary = '#ffffff'
		const textSecondary = '#a0aec0'

		// Process languages: top 5 and 'Other'
		const topLanguages = languages.slice(0, 5)
		const otherLanguages = languages.slice(5)
		const otherBytes = otherLanguages.reduce(
			(acc, lang) => acc + lang.bytes,
			0,
		)
		const totalBytes = languages.reduce((acc, lang) => acc + lang.bytes, 0)

		const chartData =
			otherBytes > 0
				? [
						...topLanguages,
						{ language: 'Other', bytes: otherBytes },
					]
				: topLanguages

		// Create the conic-gradient for the pie chart with rounded percentages
		let gradient = 'conic-gradient('
		let currentAngle = 0
		chartData.forEach((lang, index) => {
			const angle = parseFloat(((lang.bytes / totalBytes) * 360).toFixed(2)) // Angle in degrees
			const color = getLanguageColor(index)
			currentAngle += angle
			gradient += `${color} ${currentAngle.toFixed(2)}deg, `
		})
		gradient = `${gradient.slice(0, -2)})`

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
							justifyContent: 'center',
							alignItems: 'center',
							width: '100%',
							marginBottom: '16px',
							color: textPrimary,
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
								margin: 0,
								textAlign: 'center',
							}}
						>
							Language Distribution for {username}
						</h1>
					</div>

					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							gap: '40px',
							width: '100%',
							flexGrow: 1,
						}}
					>
						{totalBytes > 0 ? (
							<>
								<div
									style={{
										width: '150px',
										height: '150px',
										borderRadius: '50%',
										background: gradient,
										boxShadow: '0 0 10px rgba(0,0,0,0.5)',
									}}
								/>
								<div
									style={{
										display: 'flex',
										flexDirection: 'column',
										gap: '8px',
									}}
								>
									{chartData.map((lang, index) => (
										<div
											key={lang.language}
											style={{
												display: 'flex',
												alignItems: 'center',
											}}
										>
											<div
												style={{
													width: '10px',
													height: '10px',
													borderRadius: '50%',
													backgroundColor:
														getLanguageColor(index),
													marginRight: '8px',
												}}
											/>
											<span
												style={{
													color: textPrimary,
													fontSize: '14px',
												}}
											>
												{lang.language}:{' '}
												{(
													(lang.bytes / totalBytes) *
													100
												).toFixed(2)}
												%
											</span>
										</div>
									))}
								</div>
							</>
						) : (
							<span style={{ color: textSecondary, fontSize: '18px' }}>
								No language data available for this user.
							</span>
						)}
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
		console.error('Error generating chart:', error)
		return new Response('Failed to generate chart', { status: 500 })
	}
}
