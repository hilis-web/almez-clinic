"use client";

import { useTranslation } from "react-i18next";

const sponsors = [
  { name: "Sponsor 1", logo: "/images/sponsors/sponsor-1.png" },
  { name: "Sponsor 2", logo: "/images/sponsors/sponsor-2.png" },
  { name: "Sponsor 3", logo: "/images/sponsors/sponsor-3.png" },
  { name: "Sponsor 4", logo: "/images/sponsors/sponsor-4.png" },
];

export default function SponsorsBanner() {
  const { t } = useTranslation("common");

  return (
    <section className="almez-sponsors" aria-label={t("sponsors.ariaLabel")}>
      <div className="almez-sponsors__track">
        {[...sponsors, ...sponsors].map((sponsor, index) => (
          <div
            className="almez-sponsors__item"
            key={`${sponsor.name}-${index}`}
          >
            <img src={sponsor.logo} alt={sponsor.name} loading="lazy" />
          </div>
        ))}
      </div>
    </section>
  );
}
