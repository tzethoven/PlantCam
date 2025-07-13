import { MockGpio } from './mock-gpio';

// GPIO pin number for the water pump
const WATER_PIN = 18;

// Determine if we're running on a Raspberry Pi by checking for GPIO directory
const isRaspberryPi = () => {
	try {
		// Check if running on Raspberry Pi by looking for GPIO directory
		return process.platform === 'linux' && require('fs').existsSync('/sys/class/gpio');
	} catch {
		return false;
	}
};

// Initialize GPIO or MockGpio based on platform
const initializeGpio = async () => {
	if (isRaspberryPi()) {
		try {
			const { Gpio } = await import('onoff');
			return new Gpio(WATER_PIN, 'out');
		} catch (error) {
			console.error('Failed to initialize GPIO:', error);
			return new MockGpio(WATER_PIN, 'out');
		}
	}
	return new MockGpio(WATER_PIN, 'out');
};

// Initialize the pump controller
let waterPump = new MockGpio(WATER_PIN, 'out');
initializeGpio().then((gpio) => {
	waterPump = gpio;
});

export async function toggleWatering(state: boolean) {
	try {
		await waterPump.write(state ? 1 : 0);
		return true;
	} catch (error) {
		console.error('Failed to control water pump:', error);
		return false;
	}
}

// Clean up GPIO on process exit
if (typeof process !== 'undefined') {
	process.on('SIGINT', () => {
		waterPump.unexport();
	});
}
