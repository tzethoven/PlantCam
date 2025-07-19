import { writable } from 'svelte/store';

export interface Notification {
	id: string;
	type: 'success' | 'error' | 'warning' | 'info';
	title?: string;
	message: string;
	duration?: number;
	dismissible?: boolean;
	showIcon?: boolean;
	showProgress?: boolean;
}

// Notification store
export const notifications = writable<Notification[]>([]);

// Sound effects for different notification types
const soundEffects = {
	success: () => playTone(800, 100, 'sine'),
	error: () => playTone(300, 200, 'sawtooth'),
	warning: () => playTone(600, 150, 'triangle'),
	info: () => playTone(500, 100, 'sine')
};

// Haptic feedback patterns
const hapticPatterns = {
	success: [100],
	error: [100, 50, 100],
	warning: [150],
	info: [50],
	click: [10],
	longPress: [50, 25, 50]
};

/**
 * Play a simple tone using Web Audio API
 */
function playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
	if (typeof window === 'undefined' || !window.AudioContext) return;

	try {
		// Use AudioContext with fallback for webkit
		const AudioContextClass =
			window.AudioContext ||
			(window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
		const audioContext = new AudioContextClass();
		const oscillator = audioContext.createOscillator();
		const gainNode = audioContext.createGain();

		oscillator.connect(gainNode);
		gainNode.connect(audioContext.destination);

		oscillator.frequency.value = frequency;
		oscillator.type = type;

		gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
		gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

		oscillator.start(audioContext.currentTime);
		oscillator.stop(audioContext.currentTime + duration / 1000);
	} catch (error) {
		console.warn('Audio playback failed:', error);
	}
}

/**
 * Trigger haptic feedback on supported devices
 */
export function triggerHapticFeedback(pattern: keyof typeof hapticPatterns = 'click') {
	if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
		try {
			navigator.vibrate(hapticPatterns[pattern]);
		} catch (error) {
			console.warn('Haptic feedback failed:', error);
		}
	}
}

/**
 * Play notification sound
 */
export function playNotificationSound(type: keyof typeof soundEffects, enabled: boolean = true) {
	if (!enabled) return;

	try {
		soundEffects[type]();
	} catch (error) {
		console.warn('Sound playback failed:', error);
	}
}

/**
 * Add a new notification
 */
export function addNotification(notification: Omit<Notification, 'id'>) {
	const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	const newNotification: Notification = {
		id,
		duration: 4000,
		dismissible: true,
		showIcon: true,
		showProgress: true,
		...notification
	};

	notifications.update((items) => [...items, newNotification]);

	// Play sound and haptic feedback
	playNotificationSound(newNotification.type);
	triggerHapticFeedback(newNotification.type);

	return id;
}

/**
 * Remove a notification by ID
 */
export function removeNotification(id: string) {
	notifications.update((items) => items.filter((item) => item.id !== id));
}

/**
 * Clear all notifications
 */
export function clearNotifications() {
	notifications.update(() => []);
}

/**
 * Show success notification
 */
export function showSuccess(message: string, title?: string, options?: Partial<Notification>) {
	return addNotification({
		type: 'success',
		title,
		message,
		...options
	});
}

/**
 * Show error notification
 */
export function showError(message: string, title?: string, options?: Partial<Notification>) {
	return addNotification({
		type: 'error',
		title,
		message,
		duration: 6000, // Longer duration for errors
		...options
	});
}

/**
 * Show warning notification
 */
export function showWarning(message: string, title?: string, options?: Partial<Notification>) {
	return addNotification({
		type: 'warning',
		title,
		message,
		duration: 5000,
		...options
	});
}

/**
 * Show info notification
 */
export function showInfo(message: string, title?: string, options?: Partial<Notification>) {
	return addNotification({
		type: 'info',
		title,
		message,
		...options
	});
}

/**
 * Enhanced button click feedback
 */
export function buttonClickFeedback(element?: HTMLElement) {
	triggerHapticFeedback('click');

	// Visual feedback
	if (element) {
		element.style.transform = 'scale(0.95)';
		element.style.transition = 'transform 0.1s ease';

		setTimeout(() => {
			element.style.transform = '';
			setTimeout(() => {
				element.style.transition = '';
			}, 100);
		}, 100);
	}
}

/**
 * Long press feedback
 */
export function longPressFeedback() {
	triggerHapticFeedback('longPress');
}

/**
 * Success action feedback (e.g., watering started)
 */
export function successActionFeedback(message: string, title?: string) {
	showSuccess(message, title);

	// Additional celebratory haptic pattern
	setTimeout(() => triggerHapticFeedback('success'), 100);
	setTimeout(() => triggerHapticFeedback('click'), 300);
}

/**
 * Error action feedback (e.g., watering failed)
 */
export function errorActionFeedback(message: string, title?: string) {
	showError(message, title);

	// Additional error haptic pattern
	setTimeout(() => triggerHapticFeedback('error'), 100);
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if device supports haptic feedback
 */
export function supportsHapticFeedback(): boolean {
	return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

/**
 * Check if device supports audio
 */
export function supportsAudio(): boolean {
	return (
		typeof window !== 'undefined' &&
		!!(
			window.AudioContext ||
			(window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
		)
	);
}
