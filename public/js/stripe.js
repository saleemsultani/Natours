import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51NOsgjSEVOIyeaWSxrU4tbTgHsx42TjwgaAYtOlbgRKZ8pdjVyIdyJG7OyFKttY4eZgDU4ilh0ecEdtrqc4Qnz2D00AKqZ3dLj'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get the session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // console.log(session);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
