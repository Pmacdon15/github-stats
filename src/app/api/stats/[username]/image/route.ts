import { type NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { getGithubStats } from '@/lib/github'

function isErrorWithMessage(error: unknown): error is { message: string } {
	return (
		typeof error === 'object' &&
		error !== null &&
		'message' in error &&
		typeof (error as { message: unknown }).message === 'string'
	)
}

// Define the RouteContext for type safety, as it was implicitly used before
interface RouteContext<T extends string> {
	params: {
		[K in GetRouteParameter<T>]: string
	}
}

// Helper type to extract route parameters from a route string
type GetRouteParameter<T extends string> = string extends T
	? string
	: T extends `${infer _Start}/[${infer Param}]/${infer Rest}`
		? Param | GetRouteParameter<`/${Rest}`>
		: T extends `${infer _Start}/[${infer Param}]`
			? Param
			: never

export async function GET(
	_request: NextRequest,
	ctx: RouteContext<'/api/stats/[username]/image'>,
) {
	const username = ctx.params.username

	if (!username) {
		return new NextResponse('Username is required', { status: 400 })
	}

	try {
		const stats = await getGithubStats(username)

		// SVG dimensions
		const width = 360 // Adjusted for a slightly wider card to accommodate text
		const height = 240

		// Colors (corresponding to your Tailwind/CSS variables)
		const bgColor = '#ffffff' // var(--card-bg)
		const borderColor = '#e2e8f0' // var(--border-default)
		const primaryTextColor = '#1a202c' // var(--text-primary)
		const secondaryTextColor = '#718096' // var(--text-secondary)

		// SVG generation
		const svgContent = `
            <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" y="0.5" rx="8" width="${width - 1}" height="${height - 1}" fill="${bgColor}" stroke="${borderColor}"/>

                <style>
                    .text-primary { fill: ${primaryTextColor}; }
                    .text-secondary { fill: ${secondaryTextColor}; }
                    .font-bold { font-weight: bold; }
                    .font-medium { font-weight: 500; }
                    .text-2xl { font-size: 24px; }
                    .text-base { font-size: 16px; }
                    .text-sm { font-size: 14px; }
                    .text-center { text-anchor: middle; }
                    .icon { font-family: 'Segoe UI Symbol', 'Apple Color Emoji', sans-serif; font-size: 18px; }
                </style>

                <text x="${width / 2}" y="36" class="text-2xl font-bold text-primary text-center">GitHub Stats for ${stats.username}</text>

                <!-- Stats Items -->
                ${[
					{ label: 'UserName', value: stats.username, icon: '👤' },
					{ label: 'Followers', value: stats.followers, icon: '👥' },
					{ label: 'Following', value: stats.following, icon: '👀' },
					{
						label: 'Public Repos',
						value: stats.publicRepos,
						icon: '🌳',
					},
					{ label: 'Stars', value: stats.stars, icon: '⭐' },
				]
					.map((item, index) => {
						const yOffset = 70 + index * 30 // Adjust spacing
						return `
                        <g>
                            <text x="24" y="${yOffset}" class="text-sm icon">${item.icon}</text>
                            <text x="48" y="${yOffset}" class="text-sm text-secondary">${item.label}</text>
                            <text x="${width - 24}" y="${yOffset}" text-anchor="end" class="text-sm font-medium text-primary">${item.value}</text>
                        </g>
                    `
					})
					.join('')}
            </svg>
        `

		const pngBuffer = await sharp(Buffer.from(svgContent))
			.resize(width * 2, height * 2)
			.png()
			.toBuffer()

		return new NextResponse(Buffer.from(pngBuffer), {
			headers: {
				'Content-Type': 'image/png',
				'Cache-Control':
					'public, immutable, no-transform, s-maxage=31536000, max-age=31536000',
			},
		})
	} catch (error: unknown) {
		console.error('Error generating image:', error)
		let errorMessage = 'An unknown error occurred.'
		if (isErrorWithMessage(error)) {
			errorMessage = error.message
		}
		return new NextResponse(`Error generating image: ${errorMessage}`, {
			status: 500,
		})
	}
}
