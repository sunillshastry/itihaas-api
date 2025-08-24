async function apiRecovery(request, response) {
  return response.status(200).json({
    success: true,
    message: 'All good!',
  });
}

module.exports = apiRecovery;
