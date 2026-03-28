/**
 * Convert a string literal to boolean equivalent
 *
 * @param {String} str String value that needs to be checked
 * @returns A boolean value indicating whether the provided string is true or not
 */
export default function convertStringToBoolean(str: string) {
  return str.toLowerCase().trim() === 'true';
}
