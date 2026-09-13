import { z } from "zod";

export const choiceSchema = z.object({
  text: z.string().min(1, "Choice text is required"),
  isCorrect: z.boolean(),
});

export const questionSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  categoryId: z.string().optional(),
  yearId: z.string().optional(),
  imageUrl: z.string().optional(),
  choices: z
    .array(choiceSchema)
    .length(4, "Exactly 4 choices are required")
    .refine((c) => c.filter((x) => x.isCorrect).length === 1, {
      message: "Exactly one choice must be marked correct",
    }),
});