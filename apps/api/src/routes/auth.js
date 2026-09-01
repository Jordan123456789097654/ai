import { sendSignupConfirmationEmail, sendMagicLinkEmail } from "../services/authEmailService.js";

/**
 * Public, unauthenticated auth routes. These replace the web app's direct
 * calls to supabase.auth.signUp() / signInWithOtp() — instead we create the
 * link server-side via the Supabase admin API and deliver it ourselves
 * through Resend, so Supabase's built-in (rate-limited) mailer is never used.
 */
export default async function authRoutes(fastify) {
  fastify.post(
    "/auth/signup",
    {
      schema: {
        tags: ["auth"],
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
          },
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;
      try {
        await sendSignupConfirmationEmail({ email, password });
        return reply.code(200).send({ ok: true });
      } catch (err) {
        request.log.error(err, "signup email failed");
        const message = err?.message?.includes("already registered")
          ? "An account with this email already exists."
          : "Could not create account. Please try again.";
        return reply.code(400).send({ error: { message } });
      }
    }
  );

  fastify.post(
    "/auth/magic-link",
    {
      schema: {
        tags: ["auth"],
        body: {
          type: "object",
          required: ["email"],
          properties: { email: { type: "string", format: "email" } },
        },
      },
    },
    async (request, reply) => {
      const { email } = request.body;
      try {
        await sendMagicLinkEmail({ email });
        return reply.code(200).send({ ok: true });
      } catch (err) {
        request.log.error(err, "magic link email failed");
        return reply.code(400).send({ error: { message: "Could not send sign-in link. Please try again." } });
      }
    }
  );
}
