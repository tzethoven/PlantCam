import { Gpio } from 'onoff';

// GPIO pin for relay control (BCM numbering)
const RELAY_PIN = 530; // GPIO 18 (Physical pin gpi-530)

let relayGpio: Gpio | null = null;
let isWateringActive = false;

// Initialize GPIO
function initializeRelay() {
	try {
		// Don't initialize GPIO during build process or development
		if (
			process.env.NODE_ENV === 'development' ||
			process.env.BUILDING ||
			typeof window !== 'undefined'
		) {
			console.log('Build/Development mode: GPIO relay control simulated');
			return;
		}

		relayGpio = new Gpio(RELAY_PIN, 'out');
		// Start with relay OFF
		relayGpio.writeSync(0);
		console.log(`Relay initialized on GPIO ${RELAY_PIN}`);
	} catch (error) {
		console.error('Failed to initialize relay GPIO:', error);
	}
}

// Start watering (turn relay ON)
export function startWatering(): boolean {
	try {
		if (process.env.NODE_ENV === 'development') {
			console.log('Development: Starting watering (simulated)');
			isWateringActive = true;
			return true;
		}

		if (!relayGpio) {
			initializeRelay();
		}

		if (relayGpio) {
			// Turn relay ON
			relayGpio.writeSync(1);
			isWateringActive = true;
			console.log('Watering started - Relay ON');
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
			isWateringActive = false;
			return true;
		}

		if (relayGpio) {
			// Turn relay OFF
			relayGpio.writeSync(0);
			isWateringActive = false;
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
	if (relayGpio) {
		relayGpio.writeSync(0); // Ensure relay is OFF
		relayGpio.unexport();
		console.log('Relay GPIO cleaned up');
	}
}

// Initialize on module load (only in production runtime)
if (process.env.NODE_ENV === 'production' && !process.env.BUILDING) {
	initializeRelay();
}

// Cleanup on process exit
process.on('SIGINT', cleanupRelay);
process.on('SIGTERM', cleanupRelay);
