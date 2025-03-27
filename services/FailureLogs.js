class FailureLogs {
  /**
   * Failure Log when database is unable to provide access to information in it
   * @returns A string consisting of the failure message
   */
  static databaseAccessFailure() {
    return 'Fail: Unable to access specified information from database due to server error';
  }
}

module.exports = FailureLogs;
