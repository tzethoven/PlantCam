<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	let videoElement: HTMLVideoElement;
	let websocket: WebSocket;

	onMount(() => {
		// Initialize WebSocket connection for camera stream
		websocket = new WebSocket(`ws://${window.location.host}/api/camera/stream`);

		websocket.onmessage = async (event) => {
			// Handle incoming video stream data
			const blob = new Blob([event.data], { type: 'image/jpeg' });
			const imageUrl = URL.createObjectURL(blob);
			if (videoElement) {
				videoElement.src = imageUrl;
			}
		};
	});

	onDestroy(() => {
		if (websocket) {
			websocket.close();
		}
	});
</script>

<div class="relative aspect-video overflow-hidden rounded-lg bg-gray-900">
	<video bind:this={videoElement} class="h-full w-full object-contain" autoplay playsinline>
		<track kind="captions" />
	</video>

	<div class="absolute right-4 bottom-4 space-x-2">
		<button class="rounded-lg bg-white/10 px-4 py-2 text-white hover:bg-white/20">
			Snapshot
		</button>
	</div>
</div>
