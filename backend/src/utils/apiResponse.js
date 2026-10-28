const successResponse = (res, data = {}, message = undefined, statusCode = 200) => {
  let status = 200;
  let msg = undefined;

  if (typeof message === 'number') {
    status = message;
    msg = typeof statusCode === 'string' ? statusCode : undefined;
  } else {
    msg = message;
    if (typeof statusCode === 'number') {
      status = statusCode;
    }
  }

  const payload = {
    success: true,
    data,
  };

  if (msg) {
    payload.message = msg;
  }

  return res.status(status).json(payload);
};

const sendSuccess = (res, data = {}, statusCode = 200, message = undefined) => {
  return successResponse(res, data, message, statusCode);
};

const sendError = (res, message = 'Something went wrong', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      message,
    },
  });
};

const errorResponse = sendError;

module.exports = {
  successResponse,
  sendSuccess,
  errorResponse,
  sendError,
};