import type { EasingFunction } from 'chart.js';

export function getResponsiveConfig() {
	const isMobile = window.innerWidth <= 480;
	const isTablet = window.innerWidth <= 768 && window.innerWidth > 480;
	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	return {
		pointRadius: isMobile ? 1 : 2,
		pointHoverRadius: isMobile ? 2 : 3,
		borderWidth: isMobile ? 1 : 2,
		legendFontSize: isMobile ? 10 : isTablet ? 11 : 12,
		legendPadding: isMobile ? 12 : isTablet ? 16 : 20,
		tooltipFontSize: isMobile ? 12 : 14,
		tooltipBodySize: isMobile ? 11 : 13,
		tooltipPadding: isMobile ? 8 : 12,
		axisTitleSize: isMobile ? 10 : isTablet ? 11 : 12,
		axisTickSize: isMobile ? 9 : isTablet ? 10 : 11,
		animationDuration: prefersReducedMotion ? 0 : isMobile ? 600 : 1000,
		animationEasing: (prefersReducedMotion ? 'linear' : 'easeInOutCubic') as EasingFunction
	};
}
