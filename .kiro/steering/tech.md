# Technology Stack

## Framework & Build System

- **SvelteKit** with TypeScript - Full-stack web framework
- **Vite** - Build tool and dev server
- **Node.js adapter** - Server-side rendering and API routes
- **Tailwind CSS** - Utility-first CSS framework

## Hardware Libraries

- **node-libgpiod** - GPIO control for relay operations
- **node-dht-sensor** - Temperature/humidity sensor readings
- **chart.js** - Data visualization for sensor charts

## Development Tools

- **TypeScript** - Type safety with strict mode enabled
- **ESLint** - Code linting with Svelte plugin
- **Prettier** - Code formatting with Svelte and Tailwind plugins
- **Vitest** - Unit testing framework
- **Playwright** - End-to-end testing

## Common Commands

### Development

```bash
npm run dev          # Start development server
npm run dev -- --open  # Start dev server and open browser
```

### Building & Deployment

```bash
npm run build        # Build for production
npm run preview      # Preview production build locally
npm start           # Start production server
```

### Testing & Quality

```bash
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run test:full    # Run all tests
npm run lint         # Check code style and lint
npm run format       # Format code with Prettier
npm run check        # Type check with svelte-check
```

### Raspberry Pi Setup

```bash
./pi-setup.sh       # Install dependencies and build on Pi
./start.sh          # Start production server on Pi
```

## Environment Handling

- Development mode automatically simulates GPIO operations
- Production mode requires actual Raspberry Pi hardware
- Build process sets `BUILDING=true` to skip hardware initialization
- Environment variables loaded from `.env` file if present
