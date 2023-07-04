const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const Booking = require('.././models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckOutSession = catchAsync(async (req, res, next) => {
  // 1)Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  //  2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: tour.name,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
            description: tour.summary,
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
  });

  // 2) Create checkout session
  //   const session = await stripe.checkout.sessions.create({
  // payment_method_types: ['card'],
  // success_url: `${req.protocol}://${req.get('host')}/`,
  // cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
  // customer_email: req.user.email,
  // client_reference_id: req.params.tourId,

  // line_items: [
  //   {
  //     name: `${tour.name} Tour`,
  //     description: tour.summary,
  //     images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
  //     amount: tour.price * 100,
  //     currency: 'usd',
  //     quantity: 1,
  //   },
  // ],
  //   });

  // 3)Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // This is only TEMPORARY, because it's USECURE: everyone can make bookings without paying
  const { tour, user, price } = req.query;

  if (!user && !user && !price) return next();

  await Booking.create({ tour, user, price });

  // we redirecting back to http://127.0.0.1:3000
  res.redirect(req.originalUrl.split('?')[0]);
});

exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);

// exports.getAllBookings = catchAsync(async (req, res, next) => {
//   const bookings = await Booking.find();

//   res.status(200).json({
//     status: 'success',
//     results: bookings.length,
//     data: bookings,
//   });
// });

// exports.getBooking = catchAsync(async (req, res, next) => {
//   const bookingId = req.params.id;
//   console.log(bookingId);
//   const booking = await Booking.findById(bookingId);

//   res.status(200).json({
//     status: 'success',
//     data: {
//       booking,
//     },
//   });
// });

// exports.createBooking = catchAsync(async (req, res, next) => {
//   let newBookingData = { ...req.body };
//   const newBooking = await Booking.create(newBookingData);

//   res.status(200).json({
//     status: 'success',
//     data: {
//       newBooking,
//     },
//   });
// });

// exports.updateBooking = catchAsync(async (req, res, next) => {
//   const booking = await Booking.findByIdAndUpdate(req.params.id, req.body);

//   res.status(200).json({
//     status: 'success',
//     data: {
//       booking,
//     },
//   });
// });

// exports.deleteBooking = catchAsync(async (req, res, next) => {
//   const deletedBooking = await Booking.findByIdAndDelete(req.params.id);

//   res.status(200).json({
//     status: 'success',
//     data: {
//       deletedBooking,
//     },
//   });
// });
