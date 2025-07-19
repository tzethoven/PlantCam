import { spawn } from 'child_process';
import type { WateringConfig } from './types';

let isWatering = false;
let wateringTimeout: NodeJS.Timeout | null = null;

const DEFAULT_CONFIG: WateringConfig = {
	relayPin: 17,
	duration: 30,
	interval: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
};

export function getWateringStatus(): boolean {
	return isWatering;
}

export function startWatering(config: Partial<WateringConfig> = {}): boolean {
	if (isWatering) {
		console.log('Watering already in progress');
		return false;
	}

	const finalConfig = { ...DEFAULT_CONFIG, ...config };

	try {
		// Use gpio command to control relay
		spawn('gpio', ['-g', 'mode', finalConfig.relayPin.toString(), 'out']);
		spawn('gpio', ['-g', 'write', finalConfig.relayPin.toString(), '1']);

		isWatering = true;
		console.log(`Watering started for ${finalConfig.duration} seconds`);

		// Set timeout to stop watering
		wateringTimeout = setTimeout(() => {
			stopWatering();
		}, finalConfig.duration * 1000);

		return true;
	} catch (error) {
		console.error('Failed to start watering:', error);
		return false;
	}
}

export function stopWatering(): boolean {
	if (!isWatering) {
		console.log('No watering in progress');
		return false;
	}

	try {
		// Turn off relay
		spawn('gpio', ['-g', 'write', DEFAULT_CONFIG.relayPin.toString(), '0']);

		isWatering = false;
		console.log('Watering stopped');

		// Clear timeout if it exists
		if (wateringTimeout) {
			clearTimeout(wateringTimeout);
			wateringTimeout = null;
		}

		return true;
	} catch (error) {
		console.error('Failed to stop watering:', error);
		return false;
	}
}

export async function toggleWatering(state: boolean): Promise<boolean> {
	if (state) {
		return startWatering();
	} else {
		return stopWatering();
	}
}
