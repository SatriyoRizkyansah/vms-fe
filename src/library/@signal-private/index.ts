/**
 * Signal Library - React-compatible signal implementation
 *
 * A complete signal library inspired by Preact signals, designed to work
 * seamlessly with React applications. Provides reactive state management
 * with automatic dependency tracking and optimized re-renders.
 *
 * Internal signal utilities for the application
 * @version 1.0.0
 */

// Core signal implementation
export { Signal, signal, computed, effect, batch, isSignal } from './signal'

// Utility functions
export {
  fromPromise,
  fromObservable,
  map,
  filter,
  combine,
  combineObject,
  debounce,
  throttle,
  distinct,
  withPrevious,
  withCount,
  fromLocalStorage,
  fromSessionStorage,
} from './utils'
