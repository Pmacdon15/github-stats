import { type NextRequest, NextResponse } from 'next/server'
import { chromium } from 'playwright'
import { getGithubStats } from '@/lib/github'

function isErrorWithMessage(error: unknown): error is { message: string } {
	return (
		typeof error === 'object' &&
		error !== null &&
		'message' in error &&
		typeof (error as { message: unknown }).message === 'string'
	)
}

export async function GET(
	_request: NextRequest,
	ctx: RouteContext<'/api/stats/[username]/image'>,
) {
	const username = await ctx.params

	if (!username) {
		return new NextResponse('Username is required', { status: 400 })
	}

	try {
		const stats = await getGithubStats(username.username)

		// Generate HTML for the stats card
		const htmlContent = `
      <html style="background: transparent;">
      <head>
          <title>GitHub Stats Card</title>
          <style>
            /* Add your TailwindCSS equivalent styles here or link a CSS file */
            body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; }
            .card {
              width: 320px; /* Equivalent to max-w-sm in Tailwind */
              border-radius: 8px; /* rounded-lg */
              border: 1px solid #e2e8f0; /* border-[var(--border-default)] */
              background-color: #ffffff; /* bg-[var(--card-bg)] */
              padding: 24px; /* p-6 */
              box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
            }
            h1 {
              font-size: 24px; /* text-2xl */
              font-weight: bold; /* font-bold */
              text-align: center; /* text-center */
              margin-bottom: 16px; /* mb-4 */
              color: #1a202c; /* text-[var(--text-primary)] */
            }
            .stat-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 12px; /* space-y-3 equivalent for items */
            }
            .stat-label {
              display: flex;
              align-items: center;
              gap: 8px; /* gap-2 */
              color: #718096; /* text-[var(--text-secondary)] */
            }
            .stat-value {
              font-weight: 500; /* font-medium */
              color: #1a202c; /* text-[var(--text-primary)] */
            }
            .lucide-icon {
              /* Placeholder for lucide-react icons, not directly rendered as SVG here */
              width: 18px;
              height: 18px;
              display: inline-block;
              vertical-align: middle;
            }
          </style>
      </head>
      <body>
          <div class="card">
              <h1>GitHub Stats for ${stats.username}</h1>
              <div class="stat-item">
                  <div class="stat-label">
                      <span class="lucide-icon">👤</span><p>UserName</p>
                  </div>
                  <p class="stat-value">${stats.username}</p>
              </div>
              <div class="stat-item">
                  <div class="stat-label">
                      <span class="lucide-icon">👥</span><p>Followers</p>
                  </div>
                  <p class="stat-value">${stats.followers}</p>
              </div>
              <div class="stat-item">
                  <div class="stat-label">
                      <span class="lucide-icon">👀</span><p>Following</p>
                  </div>
                  <p class="stat-value">${stats.following}</p>
              </div>
              <div class="stat-item">
                  <div class="stat-label">
                      <span class="lucide-icon">🌳</span><p>Public Repos</p>
                  </div>
                  <p class="stat-value">${stats.publicRepos}</p>
              </div>
              <div class="stat-item">
                  <div class="stat-label">
                      <span class="lucide-icon">⭐</span><p>Stars</p>
                  </div>
                  <p class="stat-value">${stats.stars}</p>
              </div>
          </div>
      </body>
      </html>
    `

		const browser = await chromium.launch()
		const page = await browser.newPage()
		await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' }) // Changed to domcontentloaded for faster load

		const cardElement = await page.$('.card')
		if (!cardElement) {
			await browser.close()
			return new NextResponse('Could not find card element', {
				status: 500,
			})
		}

		const imageBuffer = await cardElement.screenshot({ type: 'png' })
		await browser.close()

		return new NextResponse(imageBuffer, {
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
