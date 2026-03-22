/**
 * Canonical list of model tasks the Jacana mobile app currently supports.
 *
 * Each entry is the task string exactly as it is stored in the database
 * (model.task). Both hyphen and underscore variants of the same task are
 * listed so that models created either way are recognised.
 *
 * To mark a new task as supported, add its slug here and re-deploy.
 */
export const SUPPORTED_TASKS = new Set([
  // Image classification
  'image_classification',
  'image-classification',

  // Object detection
  'object_detection',
  'object-detection',

  // Text generation / LLM
  'text_generation',
  'text-generation',

  // Image-to-text (OCR, captioning)
  'image_to_text',
  'image-to-text',
]);

/**
 * Returns true if the Jacana app has a working inference pipeline for `task`.
 * Comparison is case-insensitive.
 */
export const isTaskSupported = (task) =>
  task ? SUPPORTED_TASKS.has(task.toLowerCase()) : false;
