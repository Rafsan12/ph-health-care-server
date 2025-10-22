import { z } from "zod";

export const SpecialtiesValidtaion = z.object({
  title: z.string({
    error: "Title is required!",
  }),
});
