'use client'

import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from 'recharts'

interface LanguagePieChartProps {
	data: { language: string; bytes: number }[]
}

interface CustomLabelProps {
	cx: number
	cy: number
	midAngle?: number
	innerRadius: number
	outerRadius: number
	percent?: number
	index: number
	name?: string
	value?: number
}

const COLORS = [
	'#0088FE',
	'#00C49F',
	'#FFBB28',
	'#FF8042',
	'#AF19FF',
	'#FF197D',
	'#19FFFF',
	'#FF9919',
	'#82CA9D',
] // More colors can be added

const LanguagePieChart: React.FC<LanguagePieChartProps> = ({ data }) => {
	// Calculate total bytes to determine percentage for labels
	// const totalBytes = data.reduce((sum, entry) => sum + entry.bytes, 0);

	const renderCustomizedLabel = ({
		cx,
		cy,
		midAngle,
		innerRadius,
		outerRadius,
		percent,
		index,
	}: CustomLabelProps) => {
		if (midAngle === undefined || percent === undefined) {
			return null
		}

		const radius = innerRadius + (outerRadius - innerRadius) * 0.5
		const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180)
		const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180)

		// Only show label if percentage is significant enough
		if (percent * 100 > 5) {
			return (
				<text
					className="text-sm"
					dominantBaseline="central"
					fill="white"
					textAnchor={x > cx ? 'start' : 'end'}
					x={x}
					y={y}
				>
					{`${data[index].language} ${(percent * 100).toFixed(0)}%`}
				</text>
			)
		}
		return null
	}

	return (
		<ResponsiveContainer height={300} width="100%">
			<PieChart>
				<Pie
					cx="50%"
					cy="50%"
					data={data}
					dataKey="bytes"
					label={renderCustomizedLabel}
					labelLine={false} // Increased outerRadius for better label positioning
					nameKey="language"
					outerRadius={100}
				>
					{data.map((entry, index) => (
						<Cell
							fill={COLORS[index % COLORS.length]}
							key={entry.language}
						/>
					))}
				</Pie>
				<Tooltip
					contentStyle={{
						backgroundColor: 'var(--card-bg)',
						borderColor: 'var(--border-default)',
						color: 'var(--text-primary)',
					}}
					formatter={(value, name) => [`${value} bytes`, name]}
					itemStyle={{ color: 'var(--text-primary)' }}
				/>
				<Legend />
			</PieChart>
		</ResponsiveContainer>
	)
}

export default LanguagePieChart
