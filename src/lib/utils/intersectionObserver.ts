/**
 * Intersection Observer utility for scroll-triggered animations
 * Optimized for performance with proper cleanup and reduced motion support
 */

interface IntersectionObserverOptions {
	threshold?: number;
	rootMargin?: string;
	triggerOnce?: boolean;
}

interface AnimatedElement {
	element: Element;
	observer: IntersectionObserver;
}

// Store active observers for cleanup
const activeObservers = new Set<AnimatedElement>();

/**
 * Creates an optimized intersection observer for scroll-triggered animations
 */
export function createScrollAnimationObserver(
	elements: NodeListOf<Element> | Element[],
	options: IntersectionObserverOptions = {}
): void {
	// Check for reduced motion preference
	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	// If reduced motion is preferred, immediately show all elements
	if (prefersReducedMotion) {
		Array.from(elements).forEach((element) => {
			element.classList.add('is-visible');
		});
		return;
	}

	const { threshold = 0.1, rootMargin = '0px 0px -50px 0px', triggerOnce = true } = options;

	// Create intersection observer with performance optimizations
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					// Add visible class to trigger animation
					entry.target.classList.add('is-visible');

					// Optimize performance by removing will-change after animation
					const element = entry.target as HTMLElement;
					const animationDuration = parseFloat(getComputedStyle(element).transitionDuration) * 1000;

					setTimeout(() => {
						element.style.willChange = 'auto';
					}, animationDuration);

					// Unobserve if triggerOnce is true
					if (triggerOnce) {
						observer.unobserve(entry.target);
					}
				} else if (!triggerOnce) {
					// Remove visible class if element is out of view and triggerOnce is false
					entry.target.classList.remove('is-visible');
				}
			});
		},
		{
			threshold,
			rootMargin
		}
	);

	// Observe all elements
	Array.from(elements).forEach((element) => {
		observer.observe(element);
		activeObservers.add({ element, observer });
	});
}

/**
 * Cleanup function to disconnect all active observers
 */
export function cleanupScrollAnimationObservers(): void {
	activeObservers.forEach(({ observer }) => {
		observer.disconnect();
	});
	activeObservers.clear();
}

/**
 * Initialize scroll animations for common elements
 */
export function initializeScrollAnimations(): void {
	// Animate elements on scroll
	const scrollElements = document.querySelectorAll('.animate-on-scroll');
	if (scrollElements.length > 0) {
		createScrollAnimationObserver(scrollElements);
	}

	// Animate fade elements on scroll
	const fadeElements = document.querySelectorAll('.animate-on-scroll-fade');
	if (fadeElements.length > 0) {
		createScrollAnimationObserver(fadeElements, { threshold: 0.2 });
	}

	// Animate slide left elements on scroll
	const slideLeftElements = document.querySelectorAll('.animate-on-scroll-slide-left');
	if (slideLeftElements.length > 0) {
		createScrollAnimationObserver(slideLeftElements, { threshold: 0.15 });
	}

	// Animate slide right elements on scroll
	const slideRightElements = document.querySelectorAll('.animate-on-scroll-slide-right');
	if (slideRightElements.length > 0) {
		createScrollAnimationObserver(slideRightElements, { threshold: 0.15 });
	}
}

/**
 * Debounced resize handler for responsive animation adjustments
 */
let resizeTimeout: NodeJS.Timeout;

export function handleResponsiveAnimations(): void {
	clearTimeout(resizeTimeout);
	resizeTimeout = setTimeout(() => {
		// Re-initialize animations after resize
		cleanupScrollAnimationObservers();
		initializeScrollAnimations();
	}, 250);
}

/**
 * Setup intersection observer with automatic cleanup
 */
export function setupIntersectionObserver(): () => void {
	// Initialize on DOM content loaded
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initializeScrollAnimations);
	} else {
		initializeScrollAnimations();
	}

	// Handle responsive changes
	window.addEventListener('resize', handleResponsiveAnimations);

	// Listen for reduced motion preference changes
	const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
	const handleMotionChange = () => {
		cleanupScrollAnimationObservers();
		initializeScrollAnimations();
	};

	mediaQuery.addEventListener('change', handleMotionChange);

	// Return cleanup function
	return () => {
		cleanupScrollAnimationObservers();
		window.removeEventListener('resize', handleResponsiveAnimations);
		mediaQuery.removeEventListener('change', handleMotionChange);
		document.removeEventListener('DOMContentLoaded', initializeScrollAnimations);
	};
}
