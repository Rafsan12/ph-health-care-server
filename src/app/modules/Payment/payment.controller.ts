import { Request, Response } from "express";
import { stripe } from "../../helper/stripe";

import { catchAsync } from "../../../utlis/catchAsync";
import sendResponse from "../../../utlis/sendResponse";
import { PaymentService } from "./payment.service";

const handleStripeWebhookEvent = catchAsync(
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret =
      "whsec_145da060c643eba3ba21179b1b6f28962085f1049fe9fd2f0f8ad7999e701aed";

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error("⚠️ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    const result = await PaymentService.handleStripeWebhookEvent(event);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Webhook req send successfully",
      data: result,
    });
  }
);

export const PaymentController = {
  handleStripeWebhookEvent,
};
