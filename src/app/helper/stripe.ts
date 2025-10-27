import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import config from "../../config";

const prisma = new PrismaClient();
export const stripe = new Stripe(config.STRIPE_SECRET_KEY);
