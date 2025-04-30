/**
 * Custom App Error for logging during development
 */
class AppException extends Error {
  constructor(
    message,
    status = 500,
    type = 'fail',
    success = false,
    route = '/',
    method = '',
    name = '',
  ) {
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
