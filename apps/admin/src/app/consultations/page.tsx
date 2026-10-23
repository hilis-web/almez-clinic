"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import AdminSidebar from "../../components/admin-sidebar";
import AdminHeader from "../../components/admin-header";

interface Consultation {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  subject: string | null;
  consultationType: string;
  status: "NEW" | "IN_PROGRESS" | "CONTACTED" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  message: string | null;
  additionalInfo: string | null;
  updatedAt: string;
  assignedToId: string | null;
}

export default function ConsultationsPage() {
  const router = useRouter();
  const { t, i18n } = useTranslation("common");

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedConsultation, setSelectedConsultation] =
    useState<Consultation | null>(null);
  const language = i18n.resolvedLanguage?.startsWith("en") ? "en" : "es";

  useEffect(() => {
    const token = sessionStorage.getItem("almez_admin_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    async function loadConsultations() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/consultations`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.status === 401) {
          sessionStorage.removeItem("almez_admin_token");
          sessionStorage.removeItem("almez_admin_user");
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load consultations.");
        }

        const data = await response.json();
        setConsultations(data.consultations ?? []);
      } catch {
        setError(
          language === "en"
            ? "Unable to load consultations. Please try again."
            : "No se pudieron cargar las consultas. Inténtalo de nuevo.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadConsultations();
  }, [router, language]);

  const statusLabels: Record<Consultation["status"], string> = {
    NEW: language === "en" ? "New" : "Nueva",
    IN_PROGRESS: language === "en" ? "In progress" : "En curso",
    CONTACTED: language === "en" ? "Contacted" : "Contactado",
    COMPLETED: language === "en" ? "Completed" : "Completada",
    CANCELLED: language === "en" ? "Cancelled" : "Cancelada",
  };

  return (
    <div
      lang={language}
      dir="ltr"
      className="min-h-screen bg-[#f8f9fa] md:flex"
    >
      <AdminSidebar />

      <div className="min-w-0 flex-1">
        <AdminHeader />

        <main className="p-6 md:p-8">
          <div className="mb-8">
            <p className="text-sm text-[#758078]">
              {language === "en"
                ? "Patient requests"
                : "Solicitudes de pacientes"}
            </p>

            <h2 className="mt-2 font-heading text-3xl font-semibold text-[#1b3b36]">
              {language === "en" ? "Consultations" : "Consultas"}
            </h2>

            <p className="mt-2 text-sm text-[#758078]">
              {language === "en"
                ? "View and manage incoming consultation requests."
                : "Consulta y gestiona las solicitudes de consulta recibidas."}
            </p>
          </div>

          <section className="overflow-hidden rounded-2xl border border-[#e3e8e3] bg-white shadow-sm">
            {loading ? (
              <p className="p-8 text-sm text-[#758078]" role="status">
                {language === "en"
                  ? "Loading consultations..."
                  : "Cargando consultas..."}
              </p>
            ) : error ? (
              <div className="p-8">
                <p role="alert" className="text-sm text-red-700">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded-xl bg-[#1b3b36] px-4 py-2 text-sm font-semibold text-white hover:bg-[#17312d]"
                >
                  {language === "en" ? "Try again" : "Reintentar"}
                </button>
              </div>
            ) : consultations.length === 0 ? (
              <p className="p-8 text-sm text-[#758078]">
                {language === "en"
                  ? "No consultation requests yet."
                  : "Todavía no hay solicitudes de consulta."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-[#e3e8e3] bg-[#f8f9fa] text-[#758078]">
                    <tr>
                      <th className="px-6 py-4 font-semibold">
                        {language === "en" ? "Patient" : "Paciente"}
                      </th>
                      <th className="px-6 py-4 font-semibold">Email</th>
                      <th className="px-6 py-4 font-semibold">
                        {language === "en" ? "Type" : "Tipo"}
                      </th>
                      <th className="px-6 py-4 font-semibold">
                        {language === "en" ? "Status" : "Estado"}
                      </th>
                      <th className="px-6 py-4 font-semibold">
                        {language === "en" ? "Date" : "Fecha"}
                      </th>
                      <th className="px-6 py-4 text-right font-semibold">
                        {language === "en" ? "Actions" : "Acciones"}
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#e3e8e3]">
                    {consultations.map((consultation) => (
                      <tr
                        key={consultation.id}
                        onClick={() => setSelectedConsultation(consultation)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            setSelectedConsultation(consultation);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={
                          language === "en"
                            ? `View details for ${consultation.fullName}`
                            : `Ver detalles de ${consultation.fullName}`
                        }
                        className="cursor-pointer transition hover:bg-[#f1f5f0] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#496e5a]"
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-[#1b3b36]">
                            {consultation.fullName}
                          </p>
                          <p className="mt-1 text-xs text-[#758078]">
                            {consultation.phone || "—"}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-[#496e5a]">
                          {consultation.email}
                        </td>
                        <td className="px-6 py-4 text-[#1b3b36]">
                          {consultation.consultationType}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full bg-[#edf5ee] px-3 py-1 text-xs font-semibold text-[#496e5a]">
                            {statusLabels[consultation.status] ??
                              consultation.status}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-[#758078]">
                          {new Date(consultation.createdAt).toLocaleDateString(
                            language === "en" ? "en-GB" : "es-ES",
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedConsultation(consultation);
                            }}
                            className="whitespace-nowrap rounded-lg border border-[#e3e8e3] px-3 py-2 text-xs font-semibold text-[#1b3b36] transition hover:border-[#496e5a] hover:bg-[#edf5ee]"
                          >
                            {language === "en"
                              ? "View details"
                              : "Ver detalles"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <p className="mt-4 text-sm text-[#758078]">
            {language === "en"
              ? `Total requests: ${consultations.length}`
              : `Total de solicitudes: ${consultations.length}`}
          </p>
        </main>
      </div>

      {selectedConsultation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedConsultation(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="consultation-details-title"
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl md:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-[#758078]">
                  {language === "en"
                    ? "Consultation details"
                    : "Detalles de la consulta"}
                </p>
                <h2
                  id="consultation-details-title"
                  className="mt-2 font-heading text-2xl font-semibold text-[#1b3b36]"
                >
                  {selectedConsultation.fullName}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedConsultation(null)}
                aria-label={
                  language === "en" ? "Close details" : "Cerrar detalles"
                }
                className="rounded-lg px-3 py-2 text-xl text-[#758078] hover:bg-[#f1f5f0]"
              >
                ×
              </button>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#758078]">
                  Email
                </p>
                <p className="mt-1 break-words text-sm text-[#1b3b36]">
                  {selectedConsultation.email}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#758078]">
                  {language === "en" ? "Phone" : "Teléfono"}
                </p>
                <p className="mt-1 text-sm text-[#1b3b36]">
                  {selectedConsultation.phone || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#758078]">
                  {language === "en" ? "Consultation type" : "Tipo de consulta"}
                </p>
                <p className="mt-1 text-sm text-[#1b3b36]">
                  {selectedConsultation.consultationType}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#758078]">
                  {language === "en" ? "Subject" : "Asunto"}
                </p>
                <p className="mt-1 text-sm text-[#1b3b36]">
                  {selectedConsultation.subject || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#758078]">
                  {language === "en" ? "Status" : "Estado"}
                </p>
                <p className="mt-1 text-sm text-[#1b3b36]">
                  {statusLabels[selectedConsultation.status] ??
                    selectedConsultation.status}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#758078]">
                  {language === "en" ? "Created at" : "Fecha de creación"}
                </p>
                <p className="mt-1 text-sm text-[#1b3b36]">
                  {new Date(selectedConsultation.createdAt).toLocaleString(
                    language === "en" ? "en-GB" : "es-ES",
                  )}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-[#e3e8e3] pt-5">
              <h3 className="text-sm font-semibold text-[#1b3b36]">
                {language === "en" ? "Message" : "Mensaje"}
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#758078]">
                {selectedConsultation.message ||
                  (language === "en"
                    ? "No message provided."
                    : "No se proporcionó ningún mensaje.")}
              </p>
            </div>

            <div className="mt-5">
              <h3 className="text-sm font-semibold text-[#1b3b36]">
                {language === "en"
                  ? "Additional information"
                  : "Información adicional"}
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#758078]">
                {selectedConsultation.additionalInfo || "—"}
              </p>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedConsultation(null)}
                className="rounded-xl bg-[#1b3b36] px-5 py-3 text-sm font-semibold text-white hover:bg-[#17312d]"
              >
                {language === "en" ? "Close" : "Cerrar"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
