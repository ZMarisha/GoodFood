("use strict");
const stripe = require("stripe")(process.env.STRIPE_KEY);
/**
 * order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async create(ctx) {
    const { cartItems,promo, mail, firstName, secondName, phone, deliveryAddress, payByCreditCard,firebaseId,orderStatus  } = ctx.request.body;
    try {
      const lineItems = await Promise.all(
          cartItems.map(async (product) => {
          const item = await strapi
            .service("api::product.product")
            .findOne(product.id);
          return {
            price_data: {
              currency: "usd",
              product_data: {
                name: item.title,
                images: [item.img],
              },
              unit_amount: Math.round(item.price * 100),
            },
            quantity: product.quantity,
          };
        })
      );

      const session = await stripe.checkout.sessions.create({
        shipping_address_collection: {allowed_countries: ['US', 'CA']},
        payment_method_types: ["card"],
        mode: "payment",
        discounts: [{
          coupon: promo[0],
        }],
        success_url: process.env.CLIENT_URL+"/success",
        cancel_url: process.env.CLIENT_URL+"?success=false",
        line_items: lineItems,
      });

      await strapi
        .service("api::order.order")
        .create({ data: {  cartItems, stripeId: session.id, mail, firstName, secondName, phone, deliveryAddress, payByCreditCard,firebaseId,orderStatus } });

      return { stripeSession: session };
    } catch (error) {
      ctx.response.status = 500;
      return { error };
    }
  },
}));
