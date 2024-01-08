import Stripe from "stripe";

// @ts-ignore
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
    appInfo: {
        name: 'Ignite Shop'
    }
})