/**
 * View Transition Types for Tanstack Router
 * 
 * These types define the available view transition configurations
 * used throughout the application for page navigation animations.
 */

/**
 * Available view transition animation types
 * - 'forward': Slide animation for forward navigation (e.g., list → detail)
 * - 'back': Slide animation for back navigation (e.g., detail → list)
 * - 'tab-switch': Quick fade animation for tab switching
 */
export type ViewTransitionType = 'forward' | 'back' | 'tab-switch';

/**
 * View transition configuration object that matches Tanstack Router's expected type
 */
export interface ViewTransitionConfig {
    /** 
     * Array of view transition types to apply
     */
    types: string[];
}

/**
 * Helper to create a typed view transition config
 */
export const createViewTransition = (
    type: ViewTransitionType
): ViewTransitionConfig => ({
    types: [type],
});

/**
 * Common view transition configurations
 */
export const ViewTransitions = {
    forward: createViewTransition('forward'),
    back: createViewTransition('back'),
    tabSwitch: createViewTransition('tab-switch'),
} as const;
