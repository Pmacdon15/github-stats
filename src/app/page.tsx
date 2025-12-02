'use client'

import { Github } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Home() {
	const [username, setUsername] = useState('')
	const router = useRouter()

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (username) {
			router.push(`/stats/${username}`)
		}
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-canvas)] p-4">
			<div className="w-full max-w-md rounded-lg border border-[var(--border-default)] bg-[var(--card-bg)] p-8 text-center shadow-sm">
				<Github
					className="mx-auto mb-4 text-[var(--text-primary)]"
					size={48}
				/>
				<h1 className="mb-6 font-bold text-3xl text-[var(--text-primary)]">
					GitHub Stats
				</h1>

				<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
					<input
						className="rounded-md border border-[var(--border-default)] bg-[var(--bg-canvas)] p-3 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
						onChange={(e) => setUsername(e.target.value)}
						placeholder="Enter GitHub Username"
						type="text"
						value={username}
					/>
					<button
						className="cursor-pointer rounded-md bg-[#238636] p-3 font-bold text-white transition-colors hover:bg-[#2ea043]"
						type="submit"
					>
						Get Stats
					</button>
				</form>

				<div className="mt-8 border-[var(--border-default)] border-t pt-6">
					<p className="mb-2 text-[var(--text-secondary)]">
						Link this project to your GitHub:
					</p>
					<a
						className="flex items-center justify-center gap-2 text-[var(--accent-color)] hover:underline"
						href="https://github.com/Pmacdon15/github-stats"
						rel="noopener noreferrer"
						target="_blank"
					>
						<Github size={16} />
						View Source on GitHub
					</a>
				</div>
			</div>
		</main>
	)
}
