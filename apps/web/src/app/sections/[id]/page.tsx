import { Suspense } from "react";
import SectionPageClient from "./SectionPageClient";

export default function SectionPage() {
  return (
    <Suspense
      fallback={
        <main className="almez-section-page">
          <div className="almez-section-page__container">
            <p role="status">Loading section...</p>
          </div>
        </main>
      }
    >
      <SectionPageClient />
    </Suspense>
  );
}
