"use client";

import { useTranslation } from "react-i18next";

type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

type LegalDocument = {
  title: string;
  updated: string;
  introduction?: string;
  sections: LegalSection[];
};

const documents: Record<
  "es" | "en",
  Record<"legal" | "privacy" | "cookies", LegalDocument>
> = {
  es: {
    legal: {
      title: "⚖️ Aviso Legal",
      updated: "Última actualización: noviembre de 2025",
      introduction:
        "ALMEZ cumple con lo establecido en la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), en el Reglamento (UE) 2016/679 (RGPD) y en la Ley Orgánica 3/2018, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD).",
      sections: [
        {
          title: "1. Datos identificativos del titular del sitio web",
          paragraphs: [
            "Titular: ALMEZ",
            "Domicilio: [Dirección completa], Badajoz, Extremadura, España",
            "Correo electrónico: almez@almezclinic.com",
            "NIF: [indicar NIF o CIF]",
            "Teléfono: [número de contacto]",
            "Registro sanitario: [si aplica]",
          ],
        },
        {
          title: "2. Condiciones de uso",
          paragraphs: [
            "El acceso y uso del presente sitio web atribuye la condición de Usuario e implica la aceptación plena y sin reservas de las condiciones contenidas en este Aviso Legal.",
            "Si el usuario no está de acuerdo con las condiciones establecidas, deberá abstenerse de utilizar el sitio web.",
            "El Usuario se compromete a hacer un uso adecuado de los contenidos y servicios que ALMEZ ofrece y a no emplearlos para actividades ilícitas o contrarias a la buena fe y al orden público.",
          ],
        },
        {
          title: "3. Propiedad intelectual e industrial",
          paragraphs: [
            "Todos los contenidos del sitio web (textos, imágenes, logotipos, iconos, software, etc.) son propiedad de ALMEZ o de sus respectivos autores, y están protegidos por la normativa nacional e internacional sobre propiedad intelectual e industrial. Queda prohibida su reproducción, distribución o modificación sin autorización expresa.",
          ],
        },
        {
          title: "4. Protección de datos personales",
          paragraphs: [
            "ALMEZ garantiza el cumplimiento de la normativa vigente en materia de protección de datos personales. Los datos personales que se recaben a través del sitio web se tratarán conforme a lo establecido en la Política de Privacidad.",
          ],
        },
        {
          title: "5. Exclusión de responsabilidad",
          paragraphs: [
            "ALMEZ no se responsabiliza de los daños o perjuicios que pudieran derivarse del uso indebido del sitio web, ni de los contenidos de los enlaces externos que pudieran incluirse. Tampoco garantiza la disponibilidad continua del sitio o la ausencia de errores técnicos.",
          ],
        },
        {
          title: "6. Legislación aplicable y jurisdicción",
          paragraphs: [
            "La relación entre ALMEZ y el Usuario se regirá por la legislación española vigente, y cualquier controversia se someterá a los Juzgados y Tribunales de Badajoz, salvo disposición legal en contrario.",
          ],
        },
      ],
    },

    privacy: {
      title: "🛡️ Política de Privacidad",
      updated: "Última actualización: noviembre de 2025",
      introduction:
        "Para ALMEZ, la protección de sus datos personales es una prioridad. Tratamos sus datos de manera responsable y conforme a la normativa vigente en materia de protección de datos, en particular el Reglamento (UE) 2016/679 (RGPD), la Ley Orgánica 3/2018 (LOPDGDD) y la Ley 34/2002 (LSSI-CE).",
      sections: [
        {
          title: "1. Información sobre el responsable del tratamiento",
          paragraphs: [
            "Responsable: ALMEZ",
            "Dirección: [Dirección completa], Badajoz, Extremadura, España",
            "Correo electrónico de contacto: almez@almezclinic.com",
            "Delegado de Protección de Datos (DPD): No se ha designado delegado de protección de datos, al no ser obligatorio conforme al artículo 37 del RGPD.",
          ],
        },
        {
          title:
            "2. Información sobre la recogida y finalidad del tratamiento de datos",
          paragraphs: [
            "(a) Uso informativo del sitio web. Si utiliza nuestro sitio web únicamente con fines informativos, sin registrarse ni enviar formularios, solo recopilamos los datos que su navegador transmite de forma automática al acceder a nuestro sitio.",
            "Estos datos se utilizan exclusivamente para garantizar la conexión técnica, la seguridad del sistema y la mejora de nuestros servicios.",
            "(b) Uso de cookies. Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita nuestro sitio web. Algunas son esenciales para el funcionamiento del sitio, mientras que otras nos ayudan a mejorar su experiencia.",
            "Al acceder por primera vez al sitio web, se mostrará un banner de configuración de cookies que le permitirá aceptar todas las cookies, rechazar las no esenciales o configurarlas según sus preferencias. Puede modificar su elección en cualquier momento desde el enlace “Configuración de cookies” disponible en el sitio web.",
            "Tipos de cookies: esenciales, analíticas (por ejemplo, mediante Matomo o Google Analytics) y cookies de terceros establecidas por servicios externos integrados.",
            "(c) Formularios de contacto. Si nos envía consultas a través de un formulario, los datos que nos proporcione se tratarán únicamente para responder a su solicitud o gestionar la relación derivada (arts. 6.1.a y 6.1.b del RGPD). Sus datos no se cederán a terceros salvo obligación legal.",
            "Puede revocar su consentimiento en cualquier momento escribiendo a contact@almez.com.",
            "(d) Boletín informativo (Newsletter). Si se suscribe a nuestro boletín, utilizamos un procedimiento de doble opt-in: tras registrarse, recibirá un correo de confirmación. Si no confirma en un plazo de 3 meses, sus datos serán eliminados.",
            "Conservaremos su dirección de correo electrónico hasta que se dé de baja, junto con la fecha e IP del registro, como prueba de consentimiento. Puede darse de baja en cualquier momento escribiendo a contact@almez.com.",
          ],
          bullets: [
            "Dirección IP anonimizada",
            "Fecha y hora de acceso y duración de la visita",
            "Diferencia horaria con respecto a GMT",
            "Contenido solicitado (página visitada)",
            "Estado de acceso / código HTTP",
            "Cantidad de datos transferidos",
            "Sitio web de origen (referente)",
            "Navegador, sistema operativo e idioma",
          ],
        },
        {
          title: "3. Derechos de los usuarios",
          paragraphs: [
            "Usted tiene derecho a acceder a sus datos personales; solicitar su rectificación, supresión o limitación del tratamiento; ejercer el derecho a la portabilidad; oponerse al tratamiento y retirar el consentimiento otorgado, sin que ello afecte a la licitud del tratamiento previo.",
            "Si considera que sus derechos han sido vulnerados, puede presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD).",
            "C/ Jorge Juan, 6, 28001 Madrid. Teléfono: 900 293 183. Correo: ciudadano@aepd.es. Sitio web: www.aepd.es.",
            "Para ejercer sus derechos, puede escribir a contact@almez.com o por correo postal a la dirección indicada en el punto 1.",
          ],
        },
        {
          title: "4. Seguridad de los datos",
          paragraphs: [
            "Adoptamos medidas técnicas y organizativas adecuadas para proteger sus datos personales frente a pérdida, destrucción, acceso no autorizado, alteración o divulgación indebida.",
          ],
        },
        {
          title: "5. Plazo de conservación",
          paragraphs: [
            "Los datos personales se conservarán durante el tiempo estrictamente necesario para los fines para los que fueron recopilados o mientras sea necesario para cumplir con obligaciones legales. Una vez cumplida la finalidad o revocado el consentimiento, los datos serán eliminados de forma segura.",
          ],
        },
        {
          title: "6. Uso de herramientas de análisis",
          paragraphs: [
            "(a) Matomo. Este sitio utiliza Matomo, un servicio de análisis web proporcionado por InnoCraft Ltd. Matomo se configura de manera que las direcciones IP se almacenan de forma anonimizada. Los datos se procesan exclusivamente en servidores ubicados en la Unión Europea. Más información: https://matomo.org/privacy/.",
            "(b) Google Analytics. También utilizamos Google Analytics (Google Ireland Limited). Su dirección IP se anonimiza dentro de la UE antes de ser transmitida a los servidores de Google en EE. UU. Solo se instalarán cookies de análisis si usted ha dado su consentimiento. Puede revocar dicho consentimiento en cualquier momento a través de la configuración de cookies o mediante el complemento de desactivación de Google Analytics.",
            "Más información: https://policies.google.com/?hl=es y https://marketingplatform.google.com/about/analytics/terms/es/.",
          ],
        },
        {
          title: "7. Complementos de redes sociales",
          paragraphs: [
            "Este sitio web puede incluir complementos de Facebook, Instagram y YouTube (Meta Platforms y Google). Al acceder a una página que contiene estos complementos, su navegador establece una conexión directa con los servidores de dichos proveedores. Si ha iniciado sesión en sus cuentas, la visita a nuestro sitio puede asociarse con su perfil. Para evitarlo, cierre sesión antes de visitar nuestro sitio.",
            "Políticas de privacidad: Facebook: https://es-es.facebook.com/privacy/explanation; Instagram: https://help.instagram.com/519522125107875/?helpref=hc_fnav; YouTube / Google: https://policies.google.com/privacy?hl=es.",
          ],
        },
        {
          title: "8. Enlaces a otros sitios web",
          paragraphs: [
            "Nuestro sitio web puede contener enlaces a páginas externas. No somos responsables de sus contenidos ni de sus políticas de privacidad. Le recomendamos revisar dichas políticas al abandonar nuestro sitio.",
          ],
        },
        {
          title: "9. Modificaciones de esta política",
          paragraphs: [
            "Podemos actualizar esta Política de Privacidad en cualquier momento, por motivos legales o técnicos. Las modificaciones se publicarán en esta página con una nueva fecha de actualización. En caso de cambios sustanciales que afecten al tratamiento de sus datos, le informaremos oportunamente y, cuando proceda, solicitaremos su consentimiento.",
          ],
        },
        {
          title: "10. Aviso sobre cookies esenciales",
          paragraphs: [
            "Para el funcionamiento de este sitio web utilizamos cookies esenciales. Además, empleamos cookies opcionales para optimizar y personalizar la experiencia del usuario. Puede aceptar todas las cookies o solo las necesarias. Más información disponible en nuestra Política de Cookies.",
          ],
        },
      ],
    },

    cookies: {
      title: "🍪 Política de Cookies",
      updated: "Última actualización: noviembre de 2025",
      sections: [
        {
          title: "1. ¿Qué son las cookies?",
          paragraphs: [
            "Una cookie es un pequeño archivo de texto que se almacena en tu navegador cuando visitas casi cualquier sitio web.",
            "Su propósito es permitir que el sitio web recuerde tu visita cuando regreses.",
            "Las cookies pueden almacenar información técnica, preferencias personales, personalización de contenido, estadísticas de uso, enlaces a redes sociales, acceso a cuentas de usuario y más.",
            "El objetivo de las cookies es adaptar el contenido del sitio web a tu perfil y necesidades. Sin cookies, los servicios ofrecidos por cualquier sitio web se reducirían considerablemente.",
          ],
        },
        {
          title: "2. Cookies utilizadas en este sitio web",
          paragraphs: [
            "De acuerdo con las directrices de la Agencia Española de Protección de Datos (AEPD), detallamos a continuación el uso de cookies en este sitio web.",
            "Cookies de primera parte — Cookies de sesión: aseguran que los usuarios que publican comentarios en el blog sean humanos y no aplicaciones automatizadas, ayudando a combatir el spam.",
            "Cookies de terceros — Google Analytics: almacena cookies para generar estadísticas sobre el tráfico del sitio web y el volumen de visitantes. Al usar este sitio web, consientes el procesamiento de tu información por parte de Google. Puedes consultar la Política de privacidad de Google para ejercer tus derechos.",
            "Redes sociales: cada red social (Facebook, Instagram, YouTube, etc.) utiliza sus propias cookies para habilitar acciones como hacer clic en “Me gusta” o compartir contenido.",
          ],
        },
        {
          title: "3. Deshabilitar o eliminar cookies",
          paragraphs: [
            "Puedes deshabilitar o eliminar las cookies en cualquier momento mediante la configuración de tu navegador. Cada navegador tiene un procedimiento distinto.",
            "En algunos casos, es necesario instalar cookies para recordar tu decisión de no aceptarlas.",
          ],
          bullets: [
            "Google Chrome: https://support.google.com/chrome/answer/95647?hl=es",
            "Mozilla Firefox: https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias",
            "Microsoft Edge: https://support.microsoft.com/es-es/windows/eliminar-y-administrar-cookies-b0f50a27-3d94-1f1b-83c6-2de3b9f5e14f",
            "Safari: https://support.apple.com/es-es/guide/safari/sfri11471/mac",
          ],
        },
        {
          title: "4. Cookies de Google Analytics",
          paragraphs: [
            "Google Analytics almacena cookies en servidores ubicados en Estados Unidos y se compromete a no compartir los datos con terceros, salvo cuando sea necesario para el funcionamiento del sistema o por exigencia legal.",
            "Google anonimiza la dirección IP y cumple con el Acuerdo de Puerto Seguro, garantizando un nivel de protección adecuado según la normativa europea.",
          ],
        },
        {
          title: "5. Notas adicionales",
          paragraphs: [
            "Ni este sitio web ni sus representantes legales se responsabilizan del contenido o la precisión de las políticas de privacidad de terceros mencionadas en esta Política de Cookies.",
          ],
        },
      ],
    },
  },

  en: {
    legal: {
      title: "⚖️ Legal Notice",
      updated: "Last updated: November 2025",
      introduction:
        "ALMEZ complies with Spanish Law 34/2002 of 11 July on Information Society Services and Electronic Commerce (LSSI-CE), Regulation (EU) 2016/679 (GDPR), and Organic Law 3/2018 on Personal Data Protection and the guarantee of digital rights (LOPDGDD).",
      sections: [
        {
          title: "1. Website owner identification",
          paragraphs: [
            "Owner: ALMEZ",
            "Address: [Full address], Badajoz, Extremadura, Spain",
            "Email: almez@almezclinic.com",
            "Tax identification number (NIF): [insert NIF or CIF]",
            "Phone: [contact number]",
            "Health registration: [if applicable]",
          ],
        },
        {
          title: "2. Terms of use",
          paragraphs: [
            "Access to and use of this website gives the visitor the status of User and implies full and unconditional acceptance of the terms contained in this Legal Notice.",
            "Users who do not agree with these terms must refrain from using the website.",
            "Users agree to make appropriate use of the content and services offered by ALMEZ and not to use them for unlawful activities or activities contrary to good faith or public order.",
          ],
        },
        {
          title: "3. Intellectual and industrial property",
          paragraphs: [
            "All website content (texts, images, logos, icons, software, etc.) belongs to ALMEZ or its respective authors and is protected by national and international intellectual and industrial property laws. Reproduction, distribution or modification without express permission is prohibited.",
          ],
        },
        {
          title: "4. Personal data protection",
          paragraphs: [
            "ALMEZ undertakes to comply with applicable personal data protection laws. Personal data collected through this website will be processed in accordance with the Privacy Policy.",
          ],
        },
        {
          title: "5. Disclaimer",
          paragraphs: [
            "ALMEZ accepts no responsibility for damage arising from improper use of the website or from the content of external links. It also does not guarantee uninterrupted website availability or the absence of technical errors.",
          ],
        },
        {
          title: "6. Applicable law and jurisdiction",
          paragraphs: [
            "The relationship between ALMEZ and the User is governed by applicable Spanish law. Any dispute shall be submitted to the Courts and Tribunals of Badajoz, unless otherwise required by law.",
          ],
        },
      ],
    },

    privacy: {
      title: "🛡️ Privacy Policy",
      updated: "Last updated: November 2025",
      introduction:
        "Protecting personal data is a priority for ALMEZ. We process personal data responsibly and in accordance with applicable data protection legislation, particularly Regulation (EU) 2016/679 (GDPR), Organic Law 3/2018 (LOPDGDD), and Law 34/2002 (LSSI-CE).",
      sections: [
        {
          title: "1. Data controller information",
          paragraphs: [
            "Controller: ALMEZ",
            "Address: [Full address], Badajoz, Extremadura, Spain",
            "Contact email: almez@almezclinic.com",
            "Data Protection Officer (DPO): No Data Protection Officer has been appointed because one is not considered mandatory under Article 37 of the GDPR.",
          ],
        },
        {
          title: "2. Collection and purposes of data processing",
          paragraphs: [
            "(a) Informational website use. If you use our website for informational purposes only, without registering or submitting forms, we collect the data your browser automatically transmits when accessing the site.",
            "This data is used exclusively to ensure technical connectivity, system security and service improvement.",
            "(b) Cookies. Cookies are small text files stored on your device when you visit our website. Some are essential to website operation, while others help improve your experience.",
            "On your first visit, a cookie settings banner is intended to allow you to accept all cookies, reject non-essential cookies or configure your preferences. You can change your choice through the website’s cookie settings link.",
            "Cookie types include essential cookies, analytics cookies (for example, Matomo or Google Analytics) and third-party cookies set by integrated external services.",
            "(c) Contact forms. If you submit a contact form, the information you provide will be processed only to respond to your request or manage the resulting relationship (GDPR Articles 6(1)(a) and 6(1)(b)). Data will not be disclosed to third parties unless legally required.",
            "You may withdraw consent at any time by emailing contact@almez.com.",
            "(d) Newsletter. If you subscribe to our newsletter, a double opt-in process is used: you receive a confirmation email after registering. If you do not confirm within three months, your data will be deleted.",
            "Your email address will be retained until you unsubscribe, together with the registration date and IP address as evidence of consent. You may unsubscribe at any time by emailing contact@almez.com.",
          ],
          bullets: [
            "Anonymised IP address",
            "Date, time and duration of the visit",
            "Time-zone difference from GMT",
            "Requested content (page visited)",
            "Access status / HTTP code",
            "Amount of data transferred",
            "Referring website",
            "Browser, operating system and language",
          ],
        },
        {
          title: "3. User rights",
          paragraphs: [
            "You have the right to access your personal data; request rectification, erasure or restriction of processing; exercise data portability; object to processing; and withdraw consent without affecting the lawfulness of prior processing.",
            "If you believe your rights have been infringed, you may lodge a complaint with the Spanish Data Protection Agency (AEPD).",
            "C/ Jorge Juan, 6, 28001 Madrid. Phone: 900 293 183. Email: ciudadano@aepd.es. Website: www.aepd.es.",
            "To exercise your rights, email contact@almez.com or write to the address specified in section 1.",
          ],
        },
        {
          title: "4. Data security",
          paragraphs: [
            "We adopt appropriate technical and organisational measures to protect personal data against loss, destruction, unauthorised access, alteration or improper disclosure.",
          ],
        },
        {
          title: "5. Data retention period",
          paragraphs: [
            "Personal data will be retained only for as long as necessary for the purposes for which it was collected or to comply with legal obligations. Once the purpose has been fulfilled or consent withdrawn, data will be securely deleted.",
          ],
        },
        {
          title: "6. Analytics tools",
          paragraphs: [
            "(a) Matomo. This website uses Matomo, a web analytics service provided by InnoCraft Ltd. Matomo is configured to store anonymised IP addresses. Data is processed exclusively on servers located in the European Union. More information: https://matomo.org/privacy/.",
            "(b) Google Analytics. We also use Google Analytics (Google Ireland Limited). Your IP address is anonymised within the EU before being transmitted to Google's servers in the United States. Analytics cookies are intended to be installed only with your consent. You may withdraw consent through cookie settings or the Google Analytics opt-out add-on.",
            "More information: https://policies.google.com/?hl=en and https://marketingplatform.google.com/about/analytics/terms/.",
          ],
        },
        {
          title: "7. Social media plugins",
          paragraphs: [
            "This website may include Facebook, Instagram and YouTube plugins (Meta Platforms and Google). When you visit a page containing these plugins, your browser connects directly to the providers’ servers. If you are signed in to your accounts, your visit may be associated with your profile. To avoid this, sign out before visiting our website.",
            "Privacy policies: Facebook: https://es-es.facebook.com/privacy/explanation; Instagram: https://help.instagram.com/519522125107875/?helpref=hc_fnav; YouTube / Google: https://policies.google.com/privacy?hl=en.",
          ],
        },
        {
          title: "8. Links to other websites",
          paragraphs: [
            "Our website may contain links to external websites. We are not responsible for their content or privacy policies. We recommend reviewing those policies when leaving our website.",
          ],
        },
        {
          title: "9. Changes to this policy",
          paragraphs: [
            "We may update this Privacy Policy at any time for legal or technical reasons. Changes will be published on this page with a new update date. Where substantial changes affect data processing, we will inform you and, where appropriate, request your consent.",
          ],
        },
        {
          title: "10. Essential cookies notice",
          paragraphs: [
            "Essential cookies are used to operate this website. Optional cookies may also be used to optimise and personalise the user experience. You may accept all cookies or only necessary cookies. Further information is available in our Cookie Policy.",
          ],
        },
      ],
    },

    cookies: {
      title: "🍪 Cookie Policy",
      updated: "Last updated: November 2025",
      sections: [
        {
          title: "1. What are cookies?",
          paragraphs: [
            "A cookie is a small text file stored in your browser when you visit almost any website.",
            "Its purpose is to allow the website to remember your visit when you return.",
            "Cookies may store technical information, personal preferences, content customisation, usage statistics, social media links, user account access and more.",
            "Cookies aim to adapt website content to your profile and needs. Without cookies, the services offered by websites would be considerably reduced.",
          ],
        },
        {
          title: "2. Cookies used on this website",
          paragraphs: [
            "In accordance with the guidance of the Spanish Data Protection Agency (AEPD), this section describes the cookies used on this website.",
            "First-party cookies — Session cookies: these are described as helping ensure that users posting blog comments are humans rather than automated applications, helping combat spam.",
            "Third-party cookies — Google Analytics: cookies are used to generate statistics about website traffic and visitor numbers. The original policy states that using the website implies consent to Google's processing of information. See Google's Privacy Policy for information about rights.",
            "Social networks: each social network (Facebook, Instagram, YouTube, etc.) uses its own cookies to enable actions such as liking or sharing content.",
          ],
        },
        {
          title: "3. Disabling or deleting cookies",
          paragraphs: [
            "You can disable or delete cookies at any time through your browser settings. Each browser has a different procedure.",
            "In some cases, cookies may be needed to remember your decision not to accept them.",
          ],
          bullets: [
            "Google Chrome: https://support.google.com/chrome/answer/95647?hl=en",
            "Mozilla Firefox: https://support.mozilla.org/",
            "Microsoft Edge: https://support.microsoft.com/",
            "Safari: https://support.apple.com/guide/safari/",
          ],
        },
        {
          title: "4. Google Analytics cookies",
          paragraphs: [
            "The original policy states that Google Analytics stores cookies on servers located in the United States and undertakes not to share data with third parties except where necessary for system operation or required by law.",
            "The original policy also states that Google anonymises IP addresses and complies with the Safe Harbor Agreement to provide an adequate level of protection under European regulations.",
          ],
        },
        {
          title: "5. Additional notes",
          paragraphs: [
            "Neither this website nor its legal representatives accept responsibility for the content or accuracy of third-party privacy policies mentioned in this Cookie Policy.",
          ],
        },
      ],
    },
  },
};

const externalLinks: Record<string, string> = {
  "https://matomo.org/privacy/": "https://matomo.org/privacy/",
  "https://policies.google.com/?hl=es": "https://policies.google.com/?hl=es",
  "https://marketingplatform.google.com/about/analytics/terms/es/":
    "https://marketingplatform.google.com/about/analytics/terms/es/",
  "https://es-es.facebook.com/privacy/explanation":
    "https://es-es.facebook.com/privacy/explanation",
  "https://help.instagram.com/519522125107875/?helpref=hc_fnav":
    "https://help.instagram.com/519522125107875/?helpref=hc_fnav",
  "https://policies.google.com/privacy?hl=es":
    "https://policies.google.com/privacy?hl=es",
  "https://support.google.com/chrome/answer/95647?hl=es":
    "https://support.google.com/chrome/answer/95647?hl=es",
  "https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias":
    "https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias",
  "https://support.microsoft.com/es-es/windows/eliminar-y-administrar-cookies-b0f50a27-3d94-1f1b-83c6-2de3b9f5e14f":
    "https://support.microsoft.com/es-es/windows/eliminar-y-administrar-cookies-b0f50a27-3d94-1f1b-83c6-2de3b9f5e14f",
  "https://support.apple.com/es-es/guide/safari/sfri11471/mac":
    "https://support.apple.com/es-es/guide/safari/sfri11471/mac",
};

function renderParagraph(text: string) {
  const urlPattern =
    /(https?:\/\/[^\s;]+|contact@almez\.com|almez@almezclinic\.com|ciudadano@aepd\.es|www\.aepd\.es)/g;
  const parts = text.split(urlPattern);

  return parts.map((part, index) => {
    if (part.startsWith("http://") || part.startsWith("https://")) {
      const href = externalLinks[part] ?? part;
      return (
        <a
          key={`${part}-${index}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {part}
        </a>
      );
    }

    if (
      part === "contact@almez.com" ||
      part === "almez@almezclinic.com" ||
      part === "ciudadano@aepd.es"
    ) {
      return (
        <a key={`${part}-${index}`} href={`mailto:${part}`}>
          {part}
        </a>
      );
    }

    if (part === "www.aepd.es") {
      return (
        <a
          key={`${part}-${index}`}
          href="https://www.aepd.es"
          target="_blank"
          rel="noopener noreferrer"
        >
          {part}
        </a>
      );
    }

    return part;
  });
}

export default function LegalModalContent({
  type,
}: {
  type: "legal" | "privacy" | "cookies";
}) {
  const { i18n } = useTranslation("common");
  const language = i18n.resolvedLanguage?.startsWith("en") ? "en" : "es";
  const document = documents[language][type];

  return (
    <article className="almez-legal-document">
      <h3>{document.title}</h3>
      <p>
        <strong>{document.updated}</strong>
      </p>

      {document.introduction && <p>{renderParagraph(document.introduction)}</p>}

      {document.sections.map((section) => (
        <section key={section.title}>
          <h3>{section.title}</h3>

          {section.paragraphs?.map((paragraph, index) => (
            <p key={`${section.title}-p-${index}`}>
              {renderParagraph(paragraph)}
            </p>
          ))}

          {section.bullets && (
            <ul>
              {section.bullets.map((bullet) => (
                <li key={bullet}>{renderParagraph(bullet)}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </article>
  );
}
