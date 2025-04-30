/**
 * Convert a string literal to boolean equivalent
 *
 * @param {String} str String value that needs to be checked
 * @returns A boolean value indicating whether the provided string is true or not
 */
function convertStringToBoolean(str) {
  return str.toLowerCase().trim() === 'true';
}

module.exports = convertStringToBoolean;
