/**
 * Class for consistent failure message logging for various controller functions
 */
class FailureLogs {
  /**
   * Failure Log when database is unable to provide access to information in it
   * @returns A string consisting of the failure message
   */
  static databaseAccessFailure() {
    return 'Fail: Unable to access specified information from database due to an internal server error';
  }

  /**
   * Failure log when the user requests for an entity that is absent in the database
   * @returns A string consisting of the failure message
   */
  static entityNotFound() {
    return 'Fail: Unable to find the entity under the specified identifier parameter';
  }
}

module.exports = FailureLogs;
