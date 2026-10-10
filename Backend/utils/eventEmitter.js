// src/utils/eventEmitter.js
import { EventEmitter } from 'events';

// Custom class extend kar rahe hain taake future mein error logging handle ho sake
class AppEventEmitter extends EventEmitter {}

// Pure application ke liye ek single/global instance (Singleton Pattern) create kar rahe hain
const appEventEmitter = new AppEventEmitter();

console.log('[Event Hub] Central Application EventEmitter initialized successfully.');

export default appEventEmitter;
