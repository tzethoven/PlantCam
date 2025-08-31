import { spawn } from 'child_process';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	const ffmpeg = spawn('ffmpeg', [
		'-f',
		'v4l2',
		'-video_size',
		'640x480',
		'-i',
		'/dev/video0',
		'-f',
		'mpegts',
		'-codec:v',
		'mpeg1video',
		'-s',
		'640x480',
		'-b:v',
		'1000k',
		'-bf',
		'0',
		'-muxdelay',
		'0.001',
		'http://localhost:8081/stream'
	]);

	return new Response(ffmpeg.stdout as unknown as ReadableStream, {
		headers: {
			'Content-Type': 'video/mp2t',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};
