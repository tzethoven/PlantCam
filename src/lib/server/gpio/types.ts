export interface IGpioController {
	write(value: number): Promise<void>;
	read(): Promise<number>;
	unexport(): void;
}

// Extend the NodeJS global type to include our platform check
declare global {
	namespace NodeJS {
		interface Process {
			platform: string;
		}
	}
	interface Window {
		process: NodeJS.Process;
	}
}
