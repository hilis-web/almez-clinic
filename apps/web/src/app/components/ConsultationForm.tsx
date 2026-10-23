"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

interface FormValues {
  fullName: string;
  email: string;
  phone: string;
  consultationType: string;
  additionalInfo: string;
}

type ConsultationFormProps = {
  variant?: "inline" | "floating";
};

const initialValues: FormValues = {
  fullName: "",
  email: "",
  phone: "",
  consultationType: "",
  additionalInfo: "",
};

const consultationTypes = [
  { value: "new_patient", label: "consultation.types.newPatient" },
  { value: "second_opinion", label: "consultation.types.secondOpinion" },
  { value: "follow_up", label: "consultation.types.followUp" },
  { value: "online", label: "consultation.types.online" },
  { value: "post_surgery", label: "consultation.types.postSurgery" },
  { value: "other", label: "consultation.types.other" },
];

export default function ConsultationForm({
  variant = "floating",
}: ConsultationFormProps) {
  const { t, i18n } = useTranslation();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [values, setValues] = useState<FormValues>(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);

  const isFloating = variant === "floating";
  const formPrefix = isFloating ? "floating" : "inline";

  const [isInlineVisible, setIsInlineVisible] = useState(false);

  useEffect(() => {
    if (!isFloating) return;

    const inlineForm = document.getElementById("inline-consultation-form");

    if (!inlineForm) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInlineVisible(entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "-80px 0px -10% 0px",
      },
    );

    observer.observe(inlineForm);

    return () => observer.disconnect();
  }, [isFloating]);

  function updateField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!executeRecaptcha) {
      setError(t("consultation.captchaUnavailable"));
      return;
    }

    setLoading(true);

    try {
      const recaptchaToken = await executeRecaptcha("consultation_submit");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const response = await fetch(`${apiUrl}/api/consultations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          language: i18n.resolvedLanguage?.startsWith("en") ? "en" : "es",
          recaptchaToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t("consultation.error"));
      }

      setSuccess(t("consultation.success"));
      setValues(initialValues);
    } catch (error) {
      console.error("Consultation form submission failed:", error);

      setError(
        error instanceof Error ? error.message : t("consultation.error"),
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "almez-consultation__input";

  const contentId = `${formPrefix}-consultation-form-content`;
  if (isFloating && isInlineVisible) {
    return null;
  }
  return (
    <section
      id={
        isFloating ? "floating-consultation-form" : "inline-consultation-form"
      }
      className={
        isFloating
          ? `almez-consultation almez-consultation--floating ${
              isMinimized ? "is-minimized" : ""
            }`
          : "almez-consultation almez-consultation--inline"
      }
      dir="ltr"
    >
      {isFloating && (
        <button
          id="floating-toggle-form"
          type="button"
          onClick={() => setIsMinimized((current) => !current)}
          aria-expanded={!isMinimized}
          aria-controls={contentId}
          className="almez-consultation__toggle"
        >
          <span className="font-semibold">{t("consultation.title")}</span>

          <span aria-hidden="true" className="text-xl leading-none">
            {isMinimized ? "+" : "−"}
          </span>

          <span className="sr-only">
            {isMinimized
              ? t("consultation.expand")
              : t("consultation.minimize")}
          </span>
        </button>
      )}

      {(!isFloating || !isMinimized) && (
        <div
          id={contentId}
          className={
            isFloating
              ? "almez-consultation__content almez-consultation__content--floating"
              : "almez-consultation__content almez-consultation__content--inline"
          }
        >
          {!isFloating && (
            <h2 className="mb-3 text-2xl font-bold text-gray-900 sm:text-3xl">
              {t("consultation.title")}
            </h2>
          )}

          <p className="mb-5 text-sm leading-6 text-gray-600">
            {t("consultation.description")}
          </p>

          <form
            id={`${formPrefix}-consultationForm`}
            method="post"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor={`${formPrefix}-fullName`}
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                {t("consultation.fullName")}
              </label>

              <input
                id={`${formPrefix}-fullName`}
                name="fullName"
                type="text"
                autoComplete="name"
                required
                minLength={2}
                maxLength={200}
                value={values.fullName}
                onChange={(event) =>
                  updateField("fullName", event.target.value)
                }
                placeholder={t("consultation.namePlaceholder")}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor={`${formPrefix}-email`}
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                {t("consultation.email")}
              </label>

              <input
                id={`${formPrefix}-email`}
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={values.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder={t("consultation.emailPlaceholder")}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor={`${formPrefix}-phone`}
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                {t("consultation.phone")}
              </label>

              <input
                id={`${formPrefix}-phone`}
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                maxLength={30}
                value={values.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder={t("consultation.phonePlaceholder")}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor={`${formPrefix}-consultationType`}
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                {t("consultation.type")}
              </label>

              <select
                id={`${formPrefix}-consultationType`}
                name="consultationType"
                required
                value={values.consultationType}
                onChange={(event) =>
                  updateField("consultationType", event.target.value)
                }
                className={inputClass}
              >
                <option value="" disabled>
                  {t("consultation.typePlaceholder")}
                </option>

                {consultationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {t(type.label)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={`${formPrefix}-additionalInfo`}
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                {t("consultation.additionalInfo")}
              </label>

              <textarea
                id={`${formPrefix}-additionalInfo`}
                name="additionalInfo"
                rows={4}
                maxLength={5000}
                value={values.additionalInfo}
                onChange={(event) =>
                  updateField("additionalInfo", event.target.value)
                }
                placeholder={t("consultation.additionalInfoPlaceholder")}
                className={inputClass}
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            {success && (
              <p
                role="status"
                className="rounded-lg bg-green-50 p-3 text-sm text-green-700"
              >
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="almez-consultation__submit"
            >
              {loading
                ? t("consultation.submitting")
                : t("consultation.submit")}
            </button>

            <p className="text-xs leading-5 text-gray-500">
              {t("consultation.recaptchaNotice")}
            </p>
          </form>
        </div>
      )}
    </section>
  );
}
