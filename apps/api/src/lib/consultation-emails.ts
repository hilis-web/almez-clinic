export type ConsultationEmailData = {
  fullName: string;
  email: string;
  phone?: string | null;
  consultationType: string;
  additionalInfo?: string | null;
  language?: "es" | "en";
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });

const messages = {
  es: {
    clientSubject: "Hemos recibido su solicitud de consulta",
    adminSubject: "Nueva solicitud de consulta — ALMEZ",
    greeting: "Estimado/a",
    thankYou: "Gracias por confiar en ALMEZ.",
    received:
      "Hemos recibido correctamente su solicitud. Nuestro equipo revisará la información y se pondrá en contacto con usted lo antes posible.",
    summary: "Resumen de su solicitud",
    name: "Nombre",
    email: "Correo electrónico",
    phone: "Teléfono",
    type: "Tipo de consulta",
    additional: "Información adicional",
    next: "¿Qué ocurrirá ahora?",
    nextText:
      "Nuestro equipo revisará su solicitud y se pondrá en contacto con usted si necesita más información.",
    important: "Información importante",
    disclaimer:
      "Este correo confirma únicamente la recepción de su solicitud y no constituye una cita médica.",
    regards: "Un cordial saludo,",
    team: "Equipo de ALMEZ",
    newRequest: "Se ha recibido una nueva solicitud de consulta.",
    submittedAt: "Fecha de recepción",
    visit: "Visitar nuestra página web",
    privacy:
      "La información de este correo debe tratarse de forma confidencial y de acuerdo con la normativa aplicable de protección de datos.",
    missing: "No indicado",
  },
  en: {
    clientSubject: "We have received your consultation request",
    adminSubject: "New consultation request — ALMEZ",
    greeting: "Dear",
    thankYou: "Thank you for choosing ALMEZ.",
    received:
      "We have successfully received your request. Our team will review the information and contact you as soon as possible.",
    summary: "Your request summary",
    name: "Name",
    email: "Email address",
    phone: "Phone",
    type: "Consultation type",
    additional: "Additional information",
    next: "What happens next?",
    nextText:
      "Our team will review your request and contact you if further information is needed.",
    important: "Important information",
    disclaimer:
      "This email only confirms receipt of your request and does not constitute a medical appointment.",
    regards: "Kind regards,",
    team: "The ALMEZ Team",
    newRequest: "A new consultation request has been received.",
    submittedAt: "Received at",
    visit: "Visit our website",
    privacy:
      "The information in this email must be handled confidentially and in accordance with applicable data protection law.",
    missing: "Not provided",
  },
};

function getConsultationTypeLabel(type: string, language: "es" | "en") {
  const labels: Record<string, { es: string; en: string }> = {
    newPatient: { es: "Nuevo paciente", en: "New patient" },
    secondOpinion: { es: "Segunda opinión", en: "Second opinion" },
    followUp: { es: "Seguimiento", en: "Follow-up" },
    online: { es: "Consulta online", en: "Online consultation" },
    postSurgery: { es: "Postoperatorio", en: "Post-surgery" },
    other: { es: "Otro", en: "Other" },
  };

  return labels[type]?.[language] ?? type;
}

function layout(title: string, body: string, language: "es" | "en") {
  const websiteUrl = process.env.PUBLIC_WEBSITE_URL;

  const websiteButton = websiteUrl
    ? `<p style="text-align:center;margin:32px 0">
        <a href="${escapeHtml(websiteUrl)}"
           style="display:inline-block;padding:14px 26px;background:#496e5a;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold">
          ${messages[language].visit}
        </a>
      </p>`
    : "";

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:24px 10px;background:#f4f7f4;font-family:Arial,Helvetica,sans-serif;color:#34433b">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
<tr><td align="center">
<table role="presentation" width="640" cellspacing="0" cellpadding="0"
style="width:100%;max-width:640px;background:#fff;border:1px solid #e3e8e3">
<tr><td align="center" style="padding:30px;background:#1b3b36;color:#fff">
<div style="font-size:30px;font-weight:bold;letter-spacing:3px">ALMEZ</div>
<p style="margin:10px 0 0;color:#e1eee5">Cirugía de Columna · Traumatología</p>
</td></tr>
<tr><td style="padding:32px 26px">
<h1 style="font-size:24px;color:#496e5a">${title}</h1>
${body}
${websiteButton}
<p style="margin-top:30px;line-height:1.7">${messages[language].privacy}</p>
</td></tr>
<tr><td align="center" style="padding:20px;background:#f4f7f4;color:#758078;font-size:12px">
© ${new Date().getFullYear()} ALMEZ
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

export function createClientConsultationEmail(data: ConsultationEmailData) {
  const language = data.language === "en" ? "en" : "es";
  const text = messages[language];

  const name = escapeHtml(data.fullName);
  const email = escapeHtml(data.email);
  const phone = escapeHtml(data.phone?.trim() || text.missing);
  const type = escapeHtml(
    getConsultationTypeLabel(data.consultationType, language),
  );
  const additionalInfo = escapeHtml(
    data.additionalInfo?.trim() || text.missing,
  );
  const websiteUrl = process.env.PUBLIC_WEBSITE_URL?.replace(/\/+$/, "");

  const websiteButton = websiteUrl
    ? `
    <div style="text-align:center;margin:28px 0">
      <a
        href="${escapeHtml(websiteUrl)}"
        target="_blank"
        style="
          display:inline-block;
          background:#496e5a;
          color:#ffffff;
          text-decoration:none;
          padding:14px 26px;
          border-radius:8px;
          font-size:15px;
          font-weight:bold;
        "
      >
        ${language === "en" ? "Visit our clinic" : "Visita nuestra clínica"}
      </a>
    </div>
  `
    : "";
  const body = `
    <p style="line-height:1.8">${text.greeting} ${name},</p>
    <p style="line-height:1.8">${text.thankYou}</p>
    <p style="line-height:1.8">${text.received}</p>
    <h2 style="font-size:18px;color:#496e5a;margin-top:28px">${text.summary}</h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="10"
      style="border-collapse:collapse;background:#f8faf8">
      <tr><td><strong>${text.name}</strong></td><td>${name}</td></tr>
      <tr><td><strong>${text.email}</strong></td><td>${email}</td></tr>
      <tr><td><strong>${text.phone}</strong></td><td>${phone}</td></tr>
      <tr><td><strong>${text.type}</strong></td><td>${type}</td></tr>
      <tr><td><strong>${text.additional}</strong></td><td>${additionalInfo}</td></tr>
    </table>
    <h2 style="font-size:18px;color:#496e5a;margin-top:28px">${text.next}</h2>
    <p style="line-height:1.8">${text.nextText}</p>
    ${websiteButton}
    <div style="margin-top:24px;padding:18px;background:#fff9e8;border-left:4px solid #d8b44c">
    
      <strong>${text.important}</strong>
      <p style="line-height:1.7;margin-bottom:0">${text.disclaimer}</p>
    </div>
    <p style="margin-top:28px;line-height:1.8">${text.regards}<br><strong>${text.team}</strong></p>
  `;

  return {
    subject: text.clientSubject,
    html: layout(text.clientSubject, body, language),
  };
}

export function createAdminConsultationEmail(data: ConsultationEmailData) {
  const language = data.language === "en" ? "en" : "es";
  const text = messages[language];

  const name = escapeHtml(data.fullName);
  const email = escapeHtml(data.email);
  const phone = escapeHtml(data.phone?.trim() || text.missing);
  const type = escapeHtml(
    getConsultationTypeLabel(data.consultationType, language),
  );
  const additionalInfo = escapeHtml(
    data.additionalInfo?.trim() || text.missing,
  );
  const receivedAt = escapeHtml(new Date().toISOString());
  const websiteUrl = process.env.PUBLIC_WEBSITE_URL?.replace(/\/+$/, "");

  const websiteButton = websiteUrl
    ? `
    <div style="text-align:center;margin:28px 0">
      <a
        href="${escapeHtml(websiteUrl)}"
        target="_blank"
        style="
          display:inline-block;
          background:#496e5a;
          color:#ffffff;
          text-decoration:none;
          padding:14px 26px;
          border-radius:8px;
          font-size:15px;
          font-weight:bold;
        "
      >
        ${language === "en" ? "Visit our clinic" : "Visita nuestra clínica"}
      </a>
    </div>
  `
    : "";
  const body = `
    <p>${text.newRequest}</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="10"
      style="border-collapse:collapse;background:#f8faf8">
      <tr><td><strong>${text.name}</strong></td><td>${name}</td></tr>
      <tr><td><strong>${text.email}</strong></td><td>${email}</td></tr>
      <tr><td><strong>${text.phone}</strong></td><td>${phone}</td></tr>
      <tr><td><strong>${text.type}</strong></td><td>${type}</td></tr>
      <tr><td><strong>${text.additional}</strong></td><td>${additionalInfo}</td></tr>
      <tr><td><strong>${text.submittedAt}</strong></td><td>${receivedAt}</td></tr>
    </table>
    ${websiteButton}
  `;

  return {
    subject: text.adminSubject,
    html: layout(text.adminSubject, body, language),
  };
}
