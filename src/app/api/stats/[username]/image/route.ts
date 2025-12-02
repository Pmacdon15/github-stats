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

// Lucide icon SVG paths
const ICON_USER = `<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`
const ICON_USER_CHECK = `<path d="m16 11 2 2 4-4"/><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>`
const ICON_USER_PLUS = `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>`
const ICON_GIT_BRANCH = `<path d="M6 3v12"/><path d="M18 6V3"/><path d="M6 18c-2.2 0-4 1.8-4 4c0 0.7.2 1.4.6 2h6.8c.4-.6.6-1.3.6-2c0-2.2-1.8-4-4-4Z"/><path d="M18 18c-2.2 0-4 1.8-4 4c0 0.7.2 1.4.6 2h6.8c.4-.6.6-1.3.6-2c0-2.2-1.8-4-4-4Z"/><path d="M8 15c4.4 0 6 2 6 6"/>`
const ICON_STAR = `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`

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

		// SVG dimensions (matching the card on the page)
		const cardWidth = 320
		const cardHeight = 240
		const padding = 24
		const iconSize = 18

		// Colors (matching CSS variables)
		const cardBg = '#ffffff' // Assuming --card-bg is white for the screenshot context
		const borderDefault = '#e2e8f0' // Assuming --border-default
		const textPrimary = '#1a202c' // Assuming --text-primary
		const textSecondary = '#718096' // Assuming --text-secondary

		// Font definitions (attempting to match Tailwind's defaults or common sans-serif)
		const fontFamily =
			'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'

		const svgContent = `
            <svg width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" y="0.5" rx="8" width="${cardWidth - 1}" height="${
					cardHeight - 1
				}" fill="${cardBg}" stroke="${borderDefault}" stroke-width="1"/>

                <style>
                    /* Basic reset and font application */
                    * {
                        font-family: ${fontFamily};
                    }
                    .text-primary { fill: ${textPrimary}; }
                    .text-secondary { fill: ${textSecondary}; }
                    .font-bold { font-weight: 700; } /* Tailwind 'bold' */
                    .font-medium { font-weight: 500; } /* Tailwind 'medium' */
                    .text-2xl { font-size: 24px; }
                    .text-sm { font-size: 14px; }
                    .text-center { text-anchor: middle; }
                </style>

                <text x="${
					cardWidth / 2
				}" y="${padding + 12}" class="text-2xl font-bold text-primary text-center">GitHub Stats for ${
					stats.username
				}</text>

                <!-- Stats Items -->
                ${[
					{
						label: 'UserName',
						value: stats.username,
						icon: ICON_USER,
					},
					{
						label: 'Followers',
						value: stats.followers,
						icon: ICON_USER_CHECK,
					},
					{
						label: 'Following',
						value: stats.following,
						icon: ICON_USER_PLUS,
					},
					{
						label: 'Public Repos',
						value: stats.publicRepos,
						icon: ICON_GIT_BRANCH,
					},
					{ label: 'Stars', value: stats.stars, icon: ICON_STAR },
				]
					.map((item, index) => {
						const startY = padding + 16 + 24 + 12 // H1 bottom + spacing + initial Y for first item
						const yOffset = startY + index * (iconSize + 12) // iconSize + margin-bottom from page.tsx (space-y-3 is 12px)
						const iconX = padding
						const labelX = iconX + iconSize + 8 // icon + gap-2 (8px)
						const valueX = cardWidth - padding

						return `
                        <g>
                            <svg x="${iconX}" y="${
								yOffset - iconSize / 2
							}" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${textSecondary}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                ${item.icon}
                            </svg>
                            <text x="${labelX}" y="${yOffset}" dominant-baseline="middle" class="text-sm text-secondary">${
								item.label
							}</text>
                            <text x="${valueX}" y="${yOffset}" text-anchor="end" dominant-baseline="middle" class="text-sm font-medium text-primary">${
								item.value
							}</text>
                        </g>
                    `
					})
					.join('')}
            </svg>
        `

		const pngBuffer = await sharp(Buffer.from(svgContent))
			.resize(cardWidth * 2, cardHeight * 2, {
				fit: 'contain',
				background: { r: 0, g: 0, b: 0, alpha: 0 },
			}) // Scale up for anti-aliasing, then down, transparent background
			.png()
			.toBuffer()

		return new NextResponse(pngBuffer as unknown as BodyInit, {
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
