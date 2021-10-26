const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const sendDevError = (error, res) => {
    res.status(error.statusCode).json({
        status: error.status,
        error: error,
        message: error.message,
        stack: error.stack,
    });
};

const sendProdError = (error, res) => {
    // Operational, trusted error send back to client
    if (error.isOperational) {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
        });
    } else {
        // Programming or other unknown error: dont leak error details
        console.error(error);

        res.status(500).json({
            status: 'error',
            message: 'Something went wrong',
        });
    }
};

module.exports = (err, req, res, next) => {
    console.log(err.stack);

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendDevError(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        console.log(err.name);
        if (err.name === 'CastError') error = handleCastErrorDB(error);

        sendProdError(error, res);
    }
};
