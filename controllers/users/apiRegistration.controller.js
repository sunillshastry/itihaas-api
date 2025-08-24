async function apiRegistration(request, response) {
  return response.status(200).json({
    success: true,
  });
}

module.exports = apiRegistration;
