import { describe, expect, it } from 'vitest';
import AppException from '@/services/AppException';
import FailureLogs from '@/services/FailureLogs';

describe('AppException', () => {
  it('stores every constructor argument on the instance', () => {
    const exception = new AppException(
      'Something failed',
      500,
      'fail',
      false,
      'localhost:3000/api/v1/rulers',
      'GET',
      'controllers.rulers.getAllRulers',
    );

    expect(exception.message).toBe('Something failed');
    expect(exception.status).toBe(500);
    expect(exception.type).toBe('fail');
    expect(exception.success).toBe(false);
    expect(exception.route).toBe('localhost:3000/api/v1/rulers');
    expect(exception.method).toBe('GET');
    expect(exception.name).toBe('controllers.rulers.getAllRulers');
    expect(exception).toBeInstanceOf(Error);
  });

  it('produces a structured debug log', () => {
    const exception = new AppException(
      'Database failure',
      503,
      'error',
      false,
      'localhost:3000/api/health',
      'POST',
      'controllers.healthcheck.getHealthCheck',
    );

    expect(exception.log()).toEqual({
      message: 'Database failure',
      status: 503,
      type: 'error',
      success: false,
      route: 'localhost:3000/api/health',
      method: 'POST',
      name: 'controllers.healthcheck.getHealthCheck',
    });
  });

  it('supports the success exception type', () => {
    const exception = new AppException('OK', 200, 'error', true, '/', 'GET', 'x');

    expect(exception.type).toBe('error');
    expect(exception.log().success).toBe(true);
  });
});

describe('FailureLogs', () => {
  it('returns the database access failure message', () => {
    expect(FailureLogs.databaseAccessFailure()).toBe(
      'Fail: Unable to access specified information from database due to an internal server error',
    );
  });

  it('returns the entity not found message', () => {
    expect(FailureLogs.entityNotFound()).toBe(
      'Fail: Unable to find the entity under the specified identifier parameter',
    );
  });

  it('returns stable strings across calls', () => {
    expect(FailureLogs.databaseAccessFailure()).toBe(
      FailureLogs.databaseAccessFailure(),
    );
    expect(FailureLogs.entityNotFound()).toBe(FailureLogs.entityNotFound());
  });
});
