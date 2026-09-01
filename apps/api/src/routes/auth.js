import {
  sendSignupConfirmationEmail,
  sendMagicLinkEmail,
  createUsernameAccount,
} from "../services/authEmailService.js";

// 3-24 chars, lowercase letters/numbers/underscore/hyphen — kept simple and
// URL/email-local-part safe since it becomes part of a synthetic email.
const USERNAME_PATTERN = "^[a-zA-Z0-9_-]{3,24}$";

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

  /**
   * Sign up with just a username + password — no email involved at all.
   * For people who can't receive mail from us (school accounts that block
   * outside senders, or no email address at all). Account is created
   * already-confirmed since there's no inbox to verify.
   */
  fastify.post(
    "/auth/signup-username",
    {
      schema: {
        tags: ["auth"],
        body: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: { type: "string", pattern: USERNAME_PATTERN },
            password: { type: "string", minLength: 6 },
          },
        },
      },
    },
    async (request, reply) => {
      const { username, password } = request.body;
      try {
        const { email } = await createUsernameAccount({ username, password });
        // Handed back so the client can immediately call
        // supabase.auth.signInWithPassword({ email, password }) itself —
        // this route never issues a session.
        return reply.code(200).send({ ok: true, email });
      } catch (err) {
        request.log.error(err, "username signup failed");
        const message =
          err?.message?.includes("already registered") || err?.code === "email_exists"
            ? "That username is already taken."
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
