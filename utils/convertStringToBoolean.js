/**
 * Convert provided string value to boolean
 *
 * @param {String} str String value that must be converted to the resulting boolean value
 * @returns A boolean value indicating whether the provided string was 'true' or not
 */
function convertStringToBoolean(str) {
  return str.toLowerCase() === 'true';
}

module.exports = convertStringToBoolean;
