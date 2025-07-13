import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock SvelteKit's navigation
vi.mock('$app/navigation', () => ({
    goto: vi.fn(),
    invalidate: vi.fn(),
    beforeNavigate: vi.fn(),
    afterNavigate: vi.fn()
}));

// Mock SvelteKit's environment
vi.mock('$app/environment', () => ({
    browser: true,
    dev: true,
    building: false
}));
