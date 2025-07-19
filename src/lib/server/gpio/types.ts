export interface GPIOConfig {
	pin: number;
	mode: 'in' | 'out';
	pull?: 'up' | 'down' | 'none';
	edge?: 'rising' | 'falling' | 'both' | 'none';
}

export interface WateringConfig {
	relayPin: number;
	duration: number;
	interval: number;
}

export interface SensorConfig {
	dhtPin: number;
	dhtType: 11 | 22;
}
