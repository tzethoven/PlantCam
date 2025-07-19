import { Chip, type Line, getChipNames } from 'node-libgpiod';
import { storeWateringEvent } from './database.js';

// GPIO pin for relay control (BCM numbering)
const RELAY_PIN = 18; // GPIO 18 (BCM numbering)
const GPIO_CHIP = 0; // Default GPIO chip on Raspberry Pi

let relayLine: Line | null = null;
let gpioChip: Chip | null = null;
let isWateringActive = false;
let wateringStartTime: number | null = null;

// Initialize GPIO
function initializeRelay() {
	try {
		// Don't initialize GPIO during build process or development
		if (
			process.env.NODE_ENV === 'development' ||
			process.env.BUILDING ||
			typeof window !== 'undefined'
		) {
			console.log(
				`Build/Development mode: GPIO relay control simulated (BUILDING=${process.env.BUILDING}, NODE_ENV=${process.env.NODE_ENV})`
			);
			return;
		}

		const chipNames = getChipNames();
		console.log({ chipNames });

		// Open GPIO chip
		gpioChip = new Chip(GPIO_CHIP);
		console.log({ lineNames: gpioChip.lineNames });

		// Get the GPIO line
		relayLine = gpioChip.getLine(RELAY_PIN);

		// Request the line as output with initial low state
		relayLine.requestOutputMode();

		// Start with relay OFF (low)
		relayLine.setValue(0);
		console.log(`Relay initialized on GPIO ${RELAY_PIN}`);
	} catch (error) {
		console.error('Failed to initialize relay GPIO:', error);
		// Clean up on error
		if (relayLine) {
			relayLine.release();
			relayLine = null;
		}
		if (gpioChip) {
			gpioChip = null;
		}
	}
}

// Start watering (turn relay ON)
export function startWatering(triggeredBy: string = 'manual'): boolean {
	try {
		if (process.env.NODE_ENV === 'development') {
			console.log('Development: Starting watering (simulated)');
			isWateringActive = true;
			wateringStartTime = Date.now();
			return true;
		}

		if (!relayLine) {
			initializeRelay();
		}

		if (relayLine) {
			// Turn relay ON (high)
			relayLine.setValue(1);
			isWateringActive = true;
			wateringStartTime = Date.now();
			console.log(`Watering started - Relay ON (triggered by: ${triggeredBy})`);
			return true;
		}
		return false;
	} catch (error) {
		console.error('Failed to start watering:', error);
		return false;
	}
}

// Stop watering (turn relay OFF)
export function stopWatering(): boolean {
	try {
		if (process.env.NODE_ENV === 'development') {
			console.log('Development: Stopping watering (simulated)');

			// Log watering event to database
			if (wateringStartTime) {
				const duration = Math.floor((Date.now() - wateringStartTime) / 1000);
				storeWateringEvent(wateringStartTime, duration, 'manual');
				console.log(`Watering event logged: ${duration} seconds`);
			}

			isWateringActive = false;
			wateringStartTime = null;
			return true;
		}

		if (relayLine) {
			// Turn relay OFF (low)
			relayLine.setValue(0);

			// Log watering event to database
			if (wateringStartTime) {
				const duration = Math.floor((Date.now() - wateringStartTime) / 1000);
				storeWateringEvent(wateringStartTime, duration, 'manual');
				console.log(`Watering event logged: ${duration} seconds`);
			}

			isWateringActive = false;
			wateringStartTime = null;
			console.log('Watering stopped - Relay OFF');
			return true;
		}
		return false;
	} catch (error) {
		console.error('Failed to stop watering:', error);
		return false;
	}
}

// Get current watering status
export function getWateringStatus(): boolean {
	return isWateringActive;
}

// Cleanup GPIO on process exit
export function cleanupRelay() {
	try {
		if (relayLine) {
			// Ensure relay is OFF before cleanup
			relayLine.setValue(0);
			relayLine.release();
			relayLine = null;
		}
		if (gpioChip) {
			gpioChip = null;
		}
		isWateringActive = false;
		wateringStartTime = null;
		console.log('Relay GPIO cleaned up');
	} catch (error) {
		console.error('Error during GPIO cleanup:', error);
	}
}

// Initialize on module load (only in production runtime)
if (process.env.NODE_ENV === 'production' && !process.env.BUILDING) {
	initializeRelay();
}

// Cleanup on process exit
process.on('SIGINT', cleanupRelay);
process.on('SIGTERM', cleanupRelay);
