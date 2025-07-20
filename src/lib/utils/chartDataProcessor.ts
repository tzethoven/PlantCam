import type { SensorReading } from '$lib/server/sensorData';

export interface DownsampledPoint {
	timestamp: number;
	value: number;
	min: number;
	max: number;
	avg: number;
	count: number;
}

/**
 * Smart downsampling algorithm that preserves trends and anomalies
 * Uses a combination of averaging and peak detection to maintain data integrity
 */
export function downsampleData(
	data: SensorReading[],
	targetPoints: number = 50,
	field: 'temperature' | 'humidity' = 'humidity'
): DownsampledPoint[] {
	if (data.length <= targetPoints) {
		// If we have fewer points than target, return original data
		return data.map((d) => ({
			timestamp: d.timestamp,
			value: d[field],
			min: d[field],
			max: d[field],
			avg: d[field],
			count: 1
		}));
	}

	const result: DownsampledPoint[] = [];
	const bucketSize = Math.ceil(data.length / targetPoints);

	// Group data into buckets
	for (let i = 0; i < data.length; i += bucketSize) {
		const bucket = data.slice(i, i + bucketSize);
		const values = bucket.map((d) => d[field]);

		// Calculate statistics for the bucket
		const min = Math.min(...values);
		const max = Math.max(...values);
		const avg = values.reduce((sum, val) => sum + val, 0) / values.length;

		// Use the middle timestamp of the bucket
		const middleIndex = Math.floor(bucket.length / 2);
		const timestamp = bucket[middleIndex].timestamp;

		// Detect if this bucket contains significant variation (potential anomaly)
		const range = max - min;
		const threshold = avg * 0.1; // 10% of average as threshold for significant variation

		// If there's significant variation, use the most extreme value to preserve the anomaly
		// Otherwise, use the average for smooth representation
		const value = range > threshold ? (Math.abs(max - avg) > Math.abs(min - avg) ? max : min) : avg;

		result.push({
			timestamp,
			value,
			min,
			max,
			avg,
			count: bucket.length
		});
	}

	return result.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Enhanced downsampling that preserves both trends and local anomalies
 * Uses a sliding window approach with peak detection
 */
export function smartDownsample(
	data: SensorReading[],
	targetPoints: number = 50,
	field: 'temperature' | 'humidity' = 'humidity'
): DownsampledPoint[] {
	if (data.length <= targetPoints) {
		return data.map((d) => ({
			timestamp: d.timestamp,
			value: d[field],
			min: d[field],
			max: d[field],
			avg: d[field],
			count: 1
		}));
	}

	const result: DownsampledPoint[] = [];
	const windowSize = Math.ceil(data.length / targetPoints);

	// Use a sliding window approach
	for (let i = 0; i < data.length - windowSize + 1; i += Math.max(1, Math.floor(windowSize / 2))) {
		const window = data.slice(i, i + windowSize);
		const values = window.map((d) => d[field]);
		const timestamps = window.map((d) => d.timestamp);

		const min = Math.min(...values);
		const max = Math.max(...values);
		const avg = values.reduce((sum, val) => sum + val, 0) / values.length;

		// Find the most representative value in this window
		let bestValue = avg;
		let bestScore = Infinity;

		// Score each point based on how well it represents the window
		// Lower score = better representation
		for (let j = 0; j < values.length; j++) {
			const val = values[j];
			const deviation = Math.abs(val - avg);
			const position = Math.abs(j - windowSize / 2) / (windowSize / 2); // Distance from center

			// Score combines deviation from average and position in window
			const score = deviation + position * 0.5;

			if (score < bestScore) {
				bestScore = score;
				bestValue = val;
			}
		}

		// Use the center timestamp
		const centerIndex = Math.floor(windowSize / 2);
		const timestamp = timestamps[centerIndex];

		result.push({
			timestamp,
			value: bestValue,
			min,
			max,
			avg,
			count: window.length
		});
	}

	// Ensure we don't exceed target points
	if (result.length > targetPoints) {
		const step = Math.ceil(result.length / targetPoints);
		return result.filter((_, index) => index % step === 0);
	}

	return result.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Time-based downsampling that groups data by time intervals
 * Useful for consistent time-based visualization
 */
export function timeBasedDownsample(
	data: SensorReading[],
	intervalMinutes: number = 15,
	field: 'temperature' | 'humidity' = 'humidity'
): DownsampledPoint[] {
	if (data.length === 0) return [];

	const result: DownsampledPoint[] = [];
	const intervalMs = intervalMinutes * 60 * 1000;

	// Group data by time intervals
	const groups = new Map<number, SensorReading[]>();

	for (const reading of data) {
		const intervalStart = Math.floor(reading.timestamp / intervalMs) * intervalMs;
		if (!groups.has(intervalStart)) {
			groups.set(intervalStart, []);
		}
		groups.get(intervalStart)!.push(reading);
	}

	// Process each time group
	for (const [timestamp, readings] of groups) {
		const values = readings.map((r) => r[field]);
		const min = Math.min(...values);
		const max = Math.max(...values);
		const avg = values.reduce((sum, val) => sum + val, 0) / values.length;

		// Use the most representative value (closest to average, but preserve extremes)
		const range = max - min;
		const threshold = avg * 0.05; // 5% threshold

		let value = avg;
		if (range > threshold) {
			// If there's significant variation, check if we should use an extreme value
			const maxDeviation = Math.max(Math.abs(max - avg), Math.abs(min - avg));
			if (maxDeviation > threshold * 2) {
				value = Math.abs(max - avg) > Math.abs(min - avg) ? max : min;
			}
		}

		result.push({
			timestamp,
			value,
			min,
			max,
			avg,
			count: readings.length
		});
	}

	// Sort by timestamp
	return result.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Get optimal target points based on screen size and data characteristics
 */
export function getOptimalTargetPoints(dataLength: number, isMobile: boolean = false): number {
	if (isMobile) {
		// Fewer points on mobile for better performance
		return Math.min(15, Math.max(5, Math.floor(dataLength / 10)));
	}

	// Desktop can handle more points
	return Math.min(80, Math.max(40, Math.floor(dataLength / 5)));
}
