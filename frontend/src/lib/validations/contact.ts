import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  company: z.string().optional(),
  subject: z.string().min(2, "Please enter a subject"),
  message: z.string().min(10, "Message should be at least 10 characters"),
  company_website: z.string().max(0).optional(), // honeypot
});
export type ContactFormValues = z.infer<typeof contactSchema>;

export const quoteSchema = z.object({
  projectType: z.enum(["Web", "Mobile", "AI/ML", "Software", "UI/UX", "Other"], {
    error: "Please select a project type",
  }),
  budget: z.string().min(1, "Please select a budget range"),
  timeline: z.string().min(1, "Please select a timeline"),
  description: z.string().min(20, "Please describe your project (min 20 characters)"),
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  phone: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\+?[0-9\s\-()]{7,20}$/.test(v), "Please enter a valid mobile number")
    .optional(),
  company_website: z.string().max(0).optional(), // honeypot
});
export type QuoteFormValues = z.infer<typeof quoteSchema>;
