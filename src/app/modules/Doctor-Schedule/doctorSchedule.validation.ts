import z from "zod";

export const createDoctorScheduleZodSchema = z.object({
  body: z.object({
    scheduleids: z.array(z.string()),
  }),
});
