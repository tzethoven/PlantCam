import { Gpio } from 'onoff';

// Initialize GPIO pin for water pump
const WATER_PIN = 18; // GPIO18
const waterPump = new Gpio(WATER_PIN, 'out');

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
process.on('SIGINT', () => {
	waterPump.unexport();
});
