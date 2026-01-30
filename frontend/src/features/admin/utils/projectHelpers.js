/**
 * Helper utilities for project detail pages
 * These functions handle common data transformations and validations
 */

/**
 * Formats a date value into a user-friendly string
 * @param {string|Date} value - The date value to format
 * @returns {string} Formatted date string or fallback message
 * @example
 * formatDate("2024-01-15") // "Jan 15, 2024"
 * formatDate(null) // "Not recorded"
 */
export const formatDate = (value) => {
  if (!value) {
    return "Not recorded";
  }
  const normalized = value.includes("T") ? value : `${value}T00:00:00`;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Checks if a file is an image based on its URL/extension
 * Uses an exclusion list for known non-image formats
 * @param {string|object} file - File URL string or file object with url property
 * @returns {boolean} True if likely an image file
 * @example
 * isImage("photo.jpg") // true
 * isImage("document.pdf") // false
 */
export const isImage = (file) => {
  if (!file) return false;
  const url = typeof file === 'string' ? file : file.url;
  if (!url) return false;
  
  const cleanUrl = url.split("?")[0].toLowerCase();
  // Optimistic check: Assume likely image unless it has a known non-image extension
  const knownNonImageExts = [
    ".zip",
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".csv",
    ".txt",
    ".rar",
    ".7z",
    ".tar",
    ".gz",
  ];
  return !knownNonImageExts.some((ext) => cleanUrl.endsWith(ext));
};

/**
 * Ensures value is a string, returns fallback if empty/null/undefined
 * @param {any} value - Value to convert to text
 * @param {string} fallback - Fallback text if value is empty (default: "Not provided")
 * @returns {string} String value or fallback
 * @example
 * ensureText("hello") // "hello"
 * ensureText(null) // "Not provided"
 * ensureText("", "N/A") // "N/A"
 */
export const ensureText = (value, fallback = "Not provided") =>
  value ? String(value) : fallback;

/**
 * Ensures value is an array, filtering out falsy values
 * @param {any} value - Value to convert to array
 * @returns {Array} Array of truthy values
 * @example
 * ensureArray([1, 2, null, 3]) // [1, 2, 3]
 * ensureArray("single") // ["single"]
 * ensureArray(null) // []
 */
export const ensureArray = (value) =>
  Array.isArray(value) ? value.filter(Boolean) : value ? [value] : [];
