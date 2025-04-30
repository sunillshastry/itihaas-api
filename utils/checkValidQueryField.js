/**
 * Check if a field is valid
 *
 * @param {Array} fieldsList List of permitted field values
 * @param {String} field Field value to be checked
 * @returns A boolean indicating whether the provided field was part of the fields list
 */
function checkValidQueryField(fieldsList, field) {
  return fieldsList.includes(field);
}

module.exports = checkValidQueryField;
