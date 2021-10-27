const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};
const handleDuplicateFieldDB = (err) => {
    // const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const value = err.keyValue.name;
    const message = `Duplicate field value: ${value}`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors.map((val) => val.message));
    console.log('errors', errors);

    const message = `Invalid input data: ${errors.join(`. `)}`;
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
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendDevError(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };

        console.log(`1`, error.errors.name);

        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldDB(error);
        if (error.name === 'ValidatorError')
            // condition is always false
            error = handleValidationErrorDB(error);

        sendProdError(error, res);
    }
};
