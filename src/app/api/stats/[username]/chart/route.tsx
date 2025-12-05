import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'
import { getLanguageDistribution } from '@/lib/github'
import { GhIcon } from '@/lib/icons'

interface LanguageData {
	language: string
	bytes: number
}
// Function to generate consistent colors for languages
const getLanguageColor = (index: number) => {
	const colors = [
		'#0088FE',
		'#00C49F',
		'#FFBB28',
		'#FF8042',
		'#AF19FF',
		'#FF197D',
		'#19FFFF',
		'#FF9919',
		'#82CA9D',
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

	const textPrimary = '#ffffff'
	const textSecondary = '#a0aec0'
	try {
		const languages = await getLanguageDistribution(username)

		// Check if languages is an array
		if (!Array.isArray(languages)) {
			return new Response(
				languages.error || 'Failed to fetch language data',
				{ status: 500 },
			)
		}

		// Now TypeScript knows languages is an array
		const topLanguages = languages.slice(0, 5)
		const otherLanguages = languages.slice(5)
		const otherBytes = otherLanguages.reduce(
			(acc, lang) => acc + lang.bytes,
			0,
		)
		const totalBytes = languages.reduce((acc, lang) => acc + lang.bytes, 0)

		const chartData =
			otherBytes > 0
				? [...topLanguages, { language: 'Other', bytes: otherBytes }]
				: topLanguages

		// Helper functions for SVG pie chart
		const polarToCartesian = (
			centerX: number,
			centerY: number,
			radius: number,
			angleInDegrees: number,
		) => {
			const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180)
			return {
				x: centerX + radius * Math.cos(angleInRadians),
				y: centerY + radius * Math.sin(angleInRadians),
			}
		}

		const describeArc = (
			x: number,
			y: number,
			radius: number,
			startAngle: number,
			endAngle: number,
		) => {
			const start = polarToCartesian(x, y, radius, endAngle)
			const end = polarToCartesian(x, y, radius, startAngle)

			const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

			const d = [
				'M',
				start.x,
				start.y,
				'A',
				radius,
				radius,
				0,
				largeArcFlag,
				0,
				end.x,
				end.y,
				'L',
				x,
				y,
				'Z',
			].join(' ')

			return d
		}

		const chartRadius = 75
		const chartCenter = { x: 75, y: 75 } // Center of a 150x150 SVG viewbox

		let currentAngle = 0
		const pieSlices = chartData.map((lang: LanguageData, index: number) => {
			const angle = (lang.bytes / totalBytes) * 360
			const color = getLanguageColor(index)
			const startAngle = currentAngle
			const endAngle = currentAngle + angle
			currentAngle = endAngle

			// Ensure the last slice goes to 360 to close the circle due to potential floating point errors
			const finalEndAngle =
				index === chartData.length - 1 && currentAngle < 360
					? 360
					: endAngle

			const d = describeArc(
				chartCenter.x,
				chartCenter.y,
				chartRadius,
				startAngle,
				finalEndAngle,
			)

			return <path d={d} fill={color} key={lang.language} />
		})

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
						boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
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
							<div
								style={{
									flexDirection: 'row',
									gap: '24px',
									display: 'flex',
								}}
							>
								<svg
									height="150"
									style={{
										borderRadius: '50%',
										boxShadow: '0 0 10px rgba(0,0,0,0.5)',
									}}
									viewBox="0 0 150 150"
									width="150"
								>
									{pieSlices}
								</svg>
								<div
									style={{
										display: 'flex',
										flexDirection: 'column',
										gap: '8px', // Add a gap between languages
									}}
								>
									{chartData.map(
										(lang: LanguageData, index: number) => (
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
															getLanguageColor(
																index,
															),
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
														(lang.bytes /
															totalBytes) *
														100
													).toFixed(2)}
													%
												</span>
											</div>
										),
									)}
								</div>
							</div>
						) : (
							<span
								style={{
									color: textSecondary,
									fontSize: '18px',
								}}
							>
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
