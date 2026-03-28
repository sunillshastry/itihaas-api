import { Request, Response } from 'express';

export default async function apiRecovery(
  _request: Request,
  response: Response,
) {
  return response.status(200).json({
    success: true,
    message: 'All good!',
  });
}
