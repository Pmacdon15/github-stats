import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'
export const metadata: Metadata = {
	title: 'GitHub Stats Viewer',
	description: 'View your Stats or embed them in your GitHub profile',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<body>
				{children}
				<Analytics />
			</body>
		</html>
	)
}
