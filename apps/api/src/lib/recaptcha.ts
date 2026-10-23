const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

const MINIMUM_SCORE = 0.5;
const EXPECTED_ACTION = "consultation_submit";

interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  "error-codes"?: string[];
}

export async function verifyRecaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!secret || !token.trim()) {
    return false;
  }

  try {
    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret,
        response: token,
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return false;
    }

    const result = (await response.json()) as RecaptchaResponse;

    return (
      result.success === true &&
      typeof result.score === "number" &&
      result.score >= MINIMUM_SCORE &&
      result.action === EXPECTED_ACTION
    );
  } catch (error) {
    console.error("reCAPTCHA verification failed:", error);
    return false;
  }
}
