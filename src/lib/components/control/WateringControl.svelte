<script lang="ts">
	import { onMount } from 'svelte';

	let isWatering = false;
	let schedule = {
		enabled: false,
		frequency: 24, // hours
		duration: 30 // seconds
	};

	async function fetchWateringStatus() {
		try {
			const response = await fetch('/api/water/status');
			if (response.ok) {
				const data = await response.json();
				isWatering = data.isWatering;
			}
		} catch (error) {
			console.error('Failed to fetch watering status:', error);
		}
	}

	async function toggleWatering() {
		try {
			const response = await fetch('/api/water/toggle', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ state: !isWatering })
			});

			if (response.ok) {
				const data = await response.json();
				isWatering = data.state;
			}
		} catch (error) {
			console.error('Failed to toggle watering:', error);
		}
	}

	onMount(() => {
		fetchWateringStatus();
		// Check status every 5 seconds to stay in sync
		const interval = setInterval(fetchWateringStatus, 5000);
		return () => clearInterval(interval);
	});
</script>

<div class="space-y-6">
	<div>
		<h2 class="mb-4 text-xl font-semibold">Watering Control</h2>

		<button
			class="w-full rounded-lg px-6 py-4 text-lg font-medium text-white transition-colors {isWatering
				? 'bg-blue-600 hover:bg-blue-700'
				: 'bg-green-600 hover:bg-green-700'}"
			on:mousedown={toggleWatering}
		>
			{isWatering ? 'Stop Watering' : 'Start Watering'}
		</button>
	</div>

	<div>
		<h3 class="mb-3 text-lg font-medium">Watering Schedule</h3>

		<label class="mb-4 flex items-center space-x-2">
			<input
				type="checkbox"
				bind:checked={schedule.enabled}
				class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
			/>
			<span>Enable automatic watering</span>
		</label>

		{#if schedule.enabled}
			<div class="space-y-4">
				<label class="block">
					<span class="text-sm text-gray-600">Frequency (hours)</span>
					<input
						type="number"
						min="1"
						max="72"
						bind:value={schedule.frequency}
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					/>
				</label>

				<label class="block">
					<span class="text-sm text-gray-600">Duration (seconds)</span>
					<input
						type="number"
						min="5"
						max="300"
						bind:value={schedule.duration}
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					/>
				</label>
			</div>
		{/if}
	</div>
</div>
