const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// GLOBAL MIDDLEWARES
// set security http headers
app.use(helmet());

app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; font-src 'self' https://fonts.googleapis.com/ https://fonts.gstatic.com/; img-src 'self'; script-src 'self' https://*.stripe.com/ https://*.mapbox.com/; style-src 'self' https://fonts.googleapis.com/; frame-src 'self'"
    );
    next();
});

// development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// limit request from api
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(
    express.json({
        limit: '10kb',
    })
);
// To get the cookie data
app.use(cookieParser());
// To get the form data
app.use(
    express.urlencoded({
        extended: true,
        limit: '10kb',
    })
);

// Data sanitization against NoSQL Query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsQuantity',
            'ratingsAverage',
            'maxGroupSize',
            'difficulty',
            'price',
        ],
    })
);

// serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// Test middleware
app.use((req, res, next) => {
    // console.log(req.cookies);
    next();
});

// Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'failure',
    //     message: `Cannot find ${req.originalUrl} on this server!`,
    // });

    // const error = new Error(`Cannot find ${req.originalUrl} on this server!`);
    // error.status = 'failure';
    // error.statusCode = 404;

    next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

// error handling middleware
app.use(globalErrorHandler);

module.exports = app;
