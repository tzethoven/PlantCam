# Project Structure

## Root Level

- `src/` - Source code directory
- `build/` - Production build output (generated)
- `static/` - Static assets served directly
- `e2e/` - End-to-end test files
- `pi-setup.sh` - Raspberry Pi deployment script
- `start.sh` - Production server startup script

## Source Organization (`src/`)

### Application Core

- `app.html` - HTML template
- `app.css` - Global styles
- `app.d.ts` - Global type definitions

### Library Code (`src/lib/`)

- `components/` - Reusable Svelte components organized by feature
  - `camera/` - Camera feed components
  - `control/` - Watering control UI
  - `sensors/` - Sensor display and chart components
- `server/` - Server-side modules (Node.js only)
  - `camera/` - Camera streaming logic
  - `gpio/` - GPIO hardware interfaces
  - `websocket/` - Real-time communication
  - `relayControl.ts` - Water pump relay control
  - `sensorData.ts` - Sensor data collection

### Routes (`src/routes/`)

- `+page.svelte` - Main dashboard page
- `+layout.svelte` - Application layout
- `api/` - API endpoints
  - `water/toggle/+server.ts` - Water control endpoint
  - `water/status/+server.ts` - Water status endpoint

## Key Patterns

### Server-Side Code

- All hardware interaction code lives in `src/lib/server/`
- GPIO operations gracefully degrade in development mode
- Environment checks prevent hardware calls during build

### Component Organization

- Components grouped by functional area (camera, control, sensors)
- Each component directory contains related Svelte files
- Shared utilities in `src/lib/index.ts`

### API Routes

- RESTful endpoints under `src/routes/api/`
- Use SvelteKit's `+server.ts` convention
- Return JSON responses with consistent error handling

### Hardware Abstraction

- GPIO operations abstracted into dedicated modules
- Development mode simulation for non-Pi environments
- Cleanup handlers for graceful shutdown
