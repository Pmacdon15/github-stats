import type { Metadata } from 'next'
import './globals.css'

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
			<body>{children}</body>
		</html>
	)
}
