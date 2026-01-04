/**
 * Custom App Error for logging during development
 */
class AppException extends Error {
  /**
   * Creates an AppException instance with the provided information about the error
   * @extends Error
   *
   * @param {string} message A custom error message indicating some useful information about the error itself
   * @param {number} status A status code number implying the HTTP status code
   * @param {string} type The type of error
   * @param {boolean} success A boolean flag value indicating whether it was a success or not
   * @param {string} route The API endpoint route that created the error in question
   * @param {string} method The HTTP method (GET,POST,PUT,DELETE) that created the error
   * @param {string} name Name of the controller method that resulted in the error
   */
  constructor(message, status, type, success, route, method, name) {
    super(message);
    this.status = status;
    this.type = type;
    this.success = success;
    this.route = route;
    this.method = method;
    this.name = name;
  }

  /**
   * Creates an error log for debugging
   *
   * @returns An error log consisting of helpful fields for debugging
   */
  log() {
    return {
      message: this.message,
      status: this.status,
      type: this.type,
      success: this.success,
      route: this.route,
      method: this.method,
      name: this.name,
    };
  }
}

module.exports = AppException;
