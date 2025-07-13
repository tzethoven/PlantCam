import { WebSocket, WebSocketServer } from 'ws';
import { Readable } from 'stream';
import { spawn } from 'child_process';

let wss: WebSocketServer;
let streamProcess: ReturnType<typeof spawn> | null = null;

export function startCameraStream(server: any) {
	wss = new WebSocketServer({ server });

	wss.on('connection', (ws: WebSocket) => {
		console.log('Client connected to camera stream');

		// Start raspivid process if not already running
		if (!streamProcess) {
			streamProcess = spawn('raspivid', [
				'-t',
				'0', // No timeout
				'-o',
				'-', // Output to pipe
				'-w',
				'1280', // Width
				'-h',
				'720', // Height
				'-fps',
				'30', // Frames per second
				'-b',
				'2000000' // Bitrate
			]);

			// Handle stream data
			streamProcess.stdout.on('data', (data: Buffer) => {
				// Broadcast to all connected clients
				wss.clients.forEach((client) => {
					if (client.readyState === WebSocket.OPEN) {
						client.send(data);
					}
				});
			});

			streamProcess.stderr.on('data', (data: Buffer) => {
				console.error(`Camera Error: ${data}`);
			});
		}

		ws.on('close', () => {
			console.log('Client disconnected from camera stream');

			// If no more clients, stop the stream
			if (wss.clients.size === 0 && streamProcess) {
				streamProcess.kill();
				streamProcess = null;
			}
		});
	});
}

// Clean up on process exit
process.on('SIGINT', () => {
	if (streamProcess) {
		streamProcess.kill();
	}
	if (wss) {
		wss.close();
	}
});
