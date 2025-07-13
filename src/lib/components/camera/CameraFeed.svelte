<script lang="ts"></script>
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

<div class="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
  <video
    bind:this={videoElement}
    class="w-full h-full object-contain"
    autoplay
    playsinline
  >
    <track kind="captions" />
  </video>
  
  <div class="absolute bottom-4 right-4 space-x-2">
    <button class="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg">
      Snapshot
    </button>
  </div>
</div>
