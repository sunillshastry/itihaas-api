import Users from '@/models/Users';
import AppException from '@/services/AppException';
import FailureLogs from '@/services/FailureLogs';
import verifyTokenValidation from '@/utils/verifyTokenValidation';
import { Request, Response } from 'express';

interface RequestBody {
  token: string;
}

export default async function apiKeyVerification(
  request: Request,
  response: Response,
) {
  try {
    const { token }: RequestBody = request.body;

    if (!token) {
      return response.status(400).json({
        success: false,
        message: 'Required fields: token',
      });
    }

    // Check if the provided token is still valid (not expired)
    const decoded = await verifyTokenValidation(token);
    if (decoded === null || !decoded?.id) {
      return response.status(401).json({
        success: false,
        expired: true,
        message: `Provided token has expired. Please use the API Resend service for new verification link`,
      });
    }

    // If the provided token value is correct and valid (not expired), then update the 'verified' status to true
    const user = await Users.findByIdAndUpdate(decoded?.id, { verified: true });

    // On successful verification, retrieve the user's ID attribute and send it securely via email
    const apiKey = user?.apiKey;

    // TODO: Implement the functionality to send the user's API key via email

    return response.status(200).json({
      success: true,
      message: 'Successfully verified user account and API key',
      apiKey,
    });
  } catch (e) {
    // Custom app error log
    const appException = new AppException(
      'Failed to fetch all rulers from database',
      500,
      'fail',
      false,
      `${request.host}:${request.originalUrl}`,
      request.method,
      'controllers.rulers.getAllRulers',
    );

    // Failure response for 'development' mode
    if (process.env?.['NODE_ENV'] === 'development') {
      return response.status(500).json({
        success: false,
        errorLog: e,
        log: appException.log(),
      });
    }

    // Default failure response
    return response.status(500).json({
      success: false,
      message: FailureLogs.databaseAccessFailure(),
    });
  }
}
