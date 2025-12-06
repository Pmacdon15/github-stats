'use client'
import { startTransition, useState, ViewTransition } from 'react'

interface VideoProps {
	title: string
	description: string
	image: string
}

const video: VideoProps = {
	title: 'Test Video',
	description: 'This is a test video',
	image: 'test-image',
}

export default function Component() {
	const [fullscreen, setFullscreen] = useState(false)
	if (fullscreen) {
		return (
			<FullscreenVideo
				onExit={() => startTransition(() => setFullscreen(false))}
				video={video}
			/>
		)
	}
	return (
		<Video
			onClick={() => startTransition(() => setFullscreen(true))}
			video={video}
		/>
	)
}

const THUMBNAIL_NAME = 'video-thumbnail'

export function Thumbnail({
	video,
	children,
}: {
	video: VideoProps
	children?: React.ReactNode
}) {
	return (
		<ViewTransition name={THUMBNAIL_NAME}>
			<div
				aria-hidden="true"
				className={`thumbnail ${video.image}`}
				style={{
					width: '100px',
					height: '100px',
					backgroundColor: 'lightblue',
					border: '1px solid black',
				}}
				tabIndex={-1}
			/>
		</ViewTransition>
	)
}

export function Video({
	video,
	onClick,
}: {
	video: VideoProps
	onClick: () => void
}) {
	return (
		<div className="video">
			<button className="link" onClick={onClick} type="button">
				<Thumbnail video={video} />
				<div className="info">
					<div className="video-title">{video.title}</div>
					<div className="video-description">{video.description}</div>
				</div>
			</button>
		</div>
	)
}

export function FullscreenVideo({
	video,
	onExit,
}: {
	video: VideoProps
	onExit: () => void
}) {
	return (
		<div
			className="fullscreenLayout"
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				backgroundColor: 'black',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<ViewTransition name={THUMBNAIL_NAME}>
				<div
					aria-hidden="true"
					className={`thumbnail ${video.image} fullscreen`}
					style={{
						width: '80%',
						height: '80%',
						backgroundColor: 'lightblue',
						border: '1px solid black',
					}}
					tabIndex={-1}
				/>
				<button
					className="close-button"
					onClick={onExit}
					style={{
						position: 'absolute',
						top: '20px',
						right: '20px',
						fontSize: '24px',
						color: 'white',
						backgroundColor: 'transparent',
						border: 'none',
						cursor: 'pointer',
					}}
					type="button"
				>
					✖
				</button>
			</ViewTransition>
		</div>
	)
}
