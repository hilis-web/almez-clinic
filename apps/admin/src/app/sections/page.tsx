"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import AdminSidebar from "../../components/admin-sidebar";
import AdminHeader from "../../components/admin-header";

type Language = "es" | "en";
type ContentStatus = "PUBLISHED" | "UNPUBLISHED";
type EntityMode = "existing" | "new";

interface TranslatedText {
  es: string;
  en: string;
}

interface ExistingItem {
  id: string;
  title: TranslatedText;
  description?: TranslatedText;
}

interface ExistingCategory {
  id: string;
  title: TranslatedText;
  items: ExistingItem[];
}

interface ExistingSection {
  id: string;
  title: TranslatedText;
  description: TranslatedText;
  imageUrl: string;
  status: ContentStatus;
  sortOrder: number;
  categories: ExistingCategory[];
}

interface DraftItem {
  id: string;
  title: TranslatedText;
  description: TranslatedText;
  content: TranslatedText;
  imageUrl: string;
  toolTip: TranslatedText;
  status: ContentStatus;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function localizedValue(value: unknown): TranslatedText {
  if (typeof value === "string") return { es: value, en: value };
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return {
      es: typeof record.es === "string" ? record.es : "",
      en: typeof record.en === "string" ? record.en : "",
    };
  }
  return emptyTranslation();
}

function isValidHttpUrl(value: string): boolean {
  if (!value.trim()) return true;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const emptyTranslation = (): TranslatedText => ({ es: "", en: "" });

const createItem = (id = "initial-item"): DraftItem => ({
  id,
  title: emptyTranslation(),
  description: emptyTranslation(),
  content: emptyTranslation(),
  imageUrl: "",
  toolTip: emptyTranslation(),
  status: "UNPUBLISHED",
});

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span
      role="alert"
      className="mt-1.5 block text-xs font-medium leading-5 text-red-700"
    >
      {message}
    </span>
  );
}

function TranslationFields({
  label,
  value,

  onChange,
  multiline = false,
  required = false,
  text,
  inputClass,
  labelClass,
  errors,
  onClearError,
}: {
  label: string;
  value: TranslatedText;
  onChange: (locale: Language, value: string) => void;
  errors?: Partial<Record<Language, string>>;
  onClearError?: (locale: Language) => void;
  multiline?: boolean;
  required?: boolean;
  text: {
    languageEs: string;
    languageEn: string;
  };
  inputClass: string;
  labelClass: string;
}) {
  const Field = multiline ? "textarea" : "input";

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {(["es", "en"] as const).map((locale) => (
        <label className={labelClass} key={`${label}-${locale}`}>
          <span className="flex items-center justify-between gap-2">
            <span>{label}</span>
            <span className="rounded-md bg-[#edf5ee] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#496e5a]">
              {locale === "es" ? text.languageEs : text.languageEn}
            </span>
          </span>
          <Field
            className={`${inputClass} ${multiline ? "min-h-24 resize-y" : ""} ${errors?.[locale] ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : ""}`}
            value={value[locale]}
            aria-invalid={Boolean(errors?.[locale])}
            onChange={(event) => {
              onChange(locale, event.target.value);
              onClearError?.(locale);
            }}
            required={required}
            rows={multiline ? 3 : undefined}
            placeholder={`${label} (${locale.toUpperCase()})`}
          />
          <FieldError message={errors?.[locale]} />
        </label>
      ))}
    </div>
  );
}

function StatusField({
  value,
  onChange,
  text,
  inputClass,
  labelClass,
}: {
  value: ContentStatus;
  onChange: (value: ContentStatus) => void;
  text: {
    status: string;
    unpublished: string;
    published: string;
  };
  inputClass: string;
  labelClass: string;
}) {
  return (
    <label className={labelClass}>
      {text.status}

      <select
        className={inputClass}
        value={value}
        onChange={(event) => onChange(event.target.value as ContentStatus)}
      >
        <option value="UNPUBLISHED">{text.unpublished}</option>
        <option value="PUBLISHED">{text.published}</option>
      </select>
    </label>
  );
}

export default function SectionsPage() {
  const router = useRouter();
  const { i18n } = useTranslation("common");
  const language: Language = i18n.resolvedLanguage?.startsWith("en")
    ? "en"
    : "es";

  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [sectionMode, setSectionMode] = useState<EntityMode>("new");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [sectionTitle, setSectionTitle] =
    useState<TranslatedText>(emptyTranslation);
  const [sectionDescription, setSectionDescription] =
    useState<TranslatedText>(emptyTranslation);
  const [sectionImage, setSectionImage] = useState("");
  const [sectionStatus, setSectionStatus] =
    useState<ContentStatus>("UNPUBLISHED");

  const [categoryMode, setCategoryMode] = useState<EntityMode>("new");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [categoryTitle, setCategoryTitle] =
    useState<TranslatedText>(emptyTranslation);
  const [categoryDescription, setCategoryDescription] =
    useState<TranslatedText>(emptyTranslation);
  const [categoryImage, setCategoryImage] = useState("");
  const [categoryToolTip, setCategoryToolTip] =
    useState<TranslatedText>(emptyTranslation);
  const [categoryStatus, setCategoryStatus] =
    useState<ContentStatus>("UNPUBLISHED");

  const [existingSections, setExistingSections] = useState<ExistingSection[]>(
    [],
  );
  const [loadingSections, setLoadingSections] = useState(true);
  const [items, setItems] = useState<DraftItem[]>([createItem()]);
  const [notice, setNotice] = useState("");
  const [noticeError, setNoticeError] = useState(false);
  const [pageNotice, setPageNotice] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("almez_admin_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    let cancelled = false;
    async function loadSections() {
      setLoadingSections(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/sections/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          sessionStorage.removeItem("almez_admin_token");
          sessionStorage.removeItem("almez_admin_user");
          router.replace("/login");
          return;
        }
        if (!response.ok) throw new Error("Unable to load sections.");

        const result = await response.json();
        const rawSections = Array.isArray(result)
          ? result
          : (result.data ?? result.sections ?? []);
        const normalized: ExistingSection[] = rawSections.map((raw: any) => ({
          id: String(raw.id),
          title: localizedValue(raw.title),
          description: localizedValue(raw.description),
          imageUrl: typeof raw.imageUrl === "string" ? raw.imageUrl : "",
          status: raw.status === "PUBLISHED" ? "PUBLISHED" : "UNPUBLISHED",
          sortOrder: Number(raw.sortOrder ?? 0),
          categories: Array.isArray(raw.categories)
            ? raw.categories.map((category: any) => ({
                id: String(category.id),
                title: localizedValue(category.title),
                items: Array.isArray(category.items)
                  ? category.items.map((item: any) => ({
                      id: String(item.id),
                      title: localizedValue(item.title),
                      description: localizedValue(item.description),
                    }))
                  : [],
              }))
            : [],
        }));
        if (!cancelled) setExistingSections(normalized);
      } catch {
        if (!cancelled) {
          setNotice(
            language === "en"
              ? "Could not load sections from the server."
              : "No se pudieron cargar las secciones del servidor.",
          );
          setNoticeError(true);
        }
      } finally {
        if (!cancelled) setLoadingSections(false);
      }
    }

    void loadSections();
    return () => {
      cancelled = true;
    };
  }, [router, language]);

  const text = {
    eyebrow: language === "en" ? "CONTENT MANAGEMENT" : "GESTIÓN DE CONTENIDO",
    title: language === "en" ? "Sections" : "Secciones",
    subtitle:
      language === "en"
        ? "Organise sections, categories and their content."
        : "Organiza las secciones, categorías y sus contenidos.",
    add: language === "en" ? "Add section" : "Añadir sección",
    total: language === "en" ? "Content structure" : "Estructura de contenido",
    totalDescription:
      language === "en"
        ? "Create a new section or add content to an existing one."
        : "Crea una sección o añade contenido a una ya existente.",
    empty: language === "en" ? "No sections yet" : "Todavía no hay secciones",
    emptyDescription:
      language === "en"
        ? "Start by creating your first section."
        : "Empieza creando tu primera sección.",
    create: language === "en" ? "Create section" : "Crear sección",
    cancel: language === "en" ? "Cancel" : "Cancelar",
    back: language === "en" ? "Back" : "Atrás",
    next: language === "en" ? "Continue" : "Continuar",
    save: language === "en" ? "Save all" : "Guardar todo",
    step: language === "en" ? "Step" : "Paso",
    of: language === "en" ? "of" : "de",
    section: language === "en" ? "Section" : "Sección",
    category: language === "en" ? "Category" : "Categoría",
    items: language === "en" ? "Items" : "Elementos",
    review: language === "en" ? "Review" : "Revisión",
    createNew: language === "en" ? "Create new" : "Crear nueva",
    chooseExisting: language === "en" ? "Choose existing" : "Elegir existente",
    titleLabel: language === "en" ? "Title" : "Título",
    description: language === "en" ? "Description" : "Descripción",
    image: language === "en" ? "Image URL" : "URL de imagen",
    imageHint:
      language === "en"
        ? "Image upload and media library will be connected later."
        : "La carga de imágenes y la biblioteca multimedia se conectarán después.",
    selectSection:
      language === "en" ? "Select a section" : "Selecciona una sección",
    selectCategory:
      language === "en" ? "Select a category" : "Selecciona una categoría",
    status: language === "en" ? "Publication status" : "Estado de publicación",
    published: language === "en" ? "Published" : "Publicado",
    unpublished: language === "en" ? "Unpublished" : "Sin publicar",
    tooltip:
      language === "en" ? "Tooltip (optional)" : "Ayuda emergente (opcional)",
    content: language === "en" ? "Content" : "Contenido",
    addItem: language === "en" ? "Add item" : "Añadir elemento",
    removeItem: language === "en" ? "Remove" : "Eliminar",
    languageEs: "Español",
    languageEn: "English",
    demoNotice:
      language === "en"
        ? "Sections and categories are loaded from the server."
        : "Las secciones y categorías se cargan desde el servidor.",
    validation:
      language === "en"
        ? "Complete the required fields in both Spanish and English."
        : "Completa los campos obligatorios en español e inglés.",
    apiNotice:
      language === "en"
        ? "The form is ready to save."
        : "El formulario está listo para guardarse.",
    invalidUrl:
      language === "en"
        ? "Enter a valid image URL starting with https:// or http://."
        : "Introduce una URL de imagen válida que empiece por https:// o http://.",
    requiredField:
      language === "en"
        ? "This field is required."
        : "Este campo es obligatorio.",
    selectRequired:
      language === "en" ? "Select an option." : "Selecciona una opción.",
    saveSuccess:
      language === "en"
        ? "Content saved successfully."
        : "Contenido guardado correctamente.",
    saveFailure:
      language === "en"
        ? "Could not save the content. Check the fields and try again."
        : "No se pudo guardar el contenido. Revisa los campos e inténtalo de nuevo.",
    loading: language === "en" ? "Loading sections…" : "Cargando secciones…",
    noCategories:
      language === "en"
        ? "This section has no categories in the preview."
        : "Esta sección no tiene categorías en la vista previa.",
    newItem: language === "en" ? "New item" : "Nuevo elemento",
    sectionDetails:
      language === "en" ? "Section details" : "Detalles de la sección",
    categoryDetails:
      language === "en" ? "Category details" : "Detalles de la categoría",
    itemDetails: language === "en" ? "Item details" : "Detalles del elemento",
    summary: language === "en" ? "Summary" : "Resumen",
    selectedExisting:
      language === "en"
        ? "Existing record — it will not be modified."
        : "Registro existente: no se modificará.",
  };

  const selectedSection = existingSections.find(
    (section) => section.id === selectedSectionId,
  );

  const availableCategories =
    sectionMode === "existing" ? (selectedSection?.categories ?? []) : [];

  function resetWizard() {
    setStep(0);
    setSectionMode("new");
    setSelectedSectionId("");
    setSectionTitle(emptyTranslation());
    setSectionDescription(emptyTranslation());
    setSectionImage("");
    setSectionStatus("UNPUBLISHED");
    setCategoryMode("new");
    setSelectedCategoryId("");
    setCategoryTitle(emptyTranslation());
    setCategoryDescription(emptyTranslation());
    setCategoryImage("");
    setCategoryToolTip(emptyTranslation());
    setCategoryStatus("UNPUBLISHED");
    setItems([createItem()]);
    setNotice("");
    setNoticeError(false);
    setFieldErrors({});
    setSaving(false);
  }

  function openWizard() {
    setPageNotice("");
    resetWizard();
    setWizardOpen(true);
  }

  function closeWizard() {
    setWizardOpen(false);
    setNotice("");
  }

  function updateItem(
    id: string,
    field: keyof DraftItem,
    value: string | TranslatedText,
  ) {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  }

  function updateTranslation(
    value: TranslatedText,
    setValue: (next: TranslatedText) => void,
    locale: Language,
    nextText: string,
  ) {
    setValue({ ...value, [locale]: nextText });
  }

  function getStepErrors(targetStep: number): Record<string, string> {
    const errors: Record<string, string> = {};
    const requiredMessage = text.requiredField;
    const addTranslationErrors = (prefix: string, value: TranslatedText) => {
      (["es", "en"] as const).forEach((locale) => {
        if (!value[locale].trim())
          errors[`${prefix}.${locale}`] = requiredMessage;
      });
    };
    const addUrlError = (key: string, value: string) => {
      if (!isValidHttpUrl(value)) errors[key] = text.invalidUrl;
    };

    if (targetStep === 0) {
      if (sectionMode === "existing") {
        if (!selectedSectionId) errors["section.id"] = text.selectRequired;
      } else {
        addTranslationErrors("section.title", sectionTitle);
        addTranslationErrors("section.description", sectionDescription);
        addUrlError("section.imageUrl", sectionImage);
      }
    }

    if (targetStep === 1) {
      if (sectionMode === "existing" && !selectedSectionId) {
        errors["section.id"] = text.selectRequired;
      }
      if (sectionMode === "existing" && categoryMode === "existing") {
        if (!selectedCategoryId) errors["category.id"] = text.selectRequired;
      } else {
        addTranslationErrors("category.title", categoryTitle);
        addTranslationErrors("category.description", categoryDescription);
        addUrlError("category.imageUrl", categoryImage);
      }
    }

    if (targetStep === 2) {
      if (items.length === 0) errors.items = requiredMessage;
      items.forEach((item) => {
        addTranslationErrors(`items.${item.id}.title`, item.title);
        addTranslationErrors(`items.${item.id}.description`, item.description);
        addTranslationErrors(`items.${item.id}.content`, item.content);
        addUrlError(`items.${item.id}.imageUrl`, item.imageUrl);
      });
    }
    return errors;
  }

  function validateStep(targetStep = step): boolean {
    const errors = getStepErrors(targetStep);
    setFieldErrors((current) => {
      const next = { ...current };
      Object.keys(next).forEach((key) => {
        if (
          key === "items" ||
          key.startsWith("section.") ||
          key.startsWith("category.") ||
          key.startsWith("items.")
        ) {
          delete next[key];
        }
      });
      return { ...next, ...errors };
    });
    return Object.keys(errors).length === 0;
  }

  function clearFieldError(key: string) {
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
    setNotice("");
  }

  function clearTranslationError(prefix: string, locale: Language) {
    clearFieldError(`${prefix}.${locale}`);
  }

  function handleNext() {
    setNotice("");
    if (!validateStep(step)) {
      setNotice(text.validation);
      setNoticeError(true);
      return;
    }
    setNoticeError(false);
    setStep((current) => Math.min(current + 1, 3));
  }

  function mapServerPath(path: string): string {
    const itemIndexMatch = path.match(/^items\.(\d+)\.(.+)$/);
    if (itemIndexMatch) {
      const item = items[Number(itemIndexMatch[1])];
      if (item) return `items.${item.id}.${itemIndexMatch[2]}`;
    }
    return path;
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Ignore repeated submissions while the current request is in progress.
    if (saving) return;

    setNotice("");

    const allErrors = {
      ...getStepErrors(0),
      ...getStepErrors(1),
      ...getStepErrors(2),
    };
    setFieldErrors(allErrors);
    if (Object.keys(allErrors).length > 0) {
      const firstInvalidStep =
        [0, 1, 2].find(
          (index) => Object.keys(getStepErrors(index)).length > 0,
        ) ?? 0;
      setStep(firstInvalidStep);
      setNotice(text.validation);
      setNoticeError(true);
      return;
    }

    const token = sessionStorage.getItem("almez_admin_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const payload = {
      ...(sectionMode === "existing"
        ? { sectionId: selectedSectionId }
        : {
            section: {
              title: sectionTitle,
              description: sectionDescription,
              imageUrl: sectionImage.trim() || null,
              status: sectionStatus,
            },
          }),
      ...(sectionMode === "existing" && categoryMode === "existing"
        ? { categoryId: selectedCategoryId }
        : {
            category: {
              title: categoryTitle,
              description: categoryDescription,
              imageUrl: categoryImage.trim() || null,
              toolTip: categoryToolTip,
              status: categoryStatus,
            },
          }),
      items: items.map((item, index) => ({
        title: item.title,
        description: item.description,
        content: item.content,
        imageUrl: item.imageUrl.trim() || null,
        toolTip: item.toolTip,
        status: item.status,
        sortOrder: index,
      })),
    };

    setSaving(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/sections/save-content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json().catch(() => ({}));
      if (response.status === 401) {
        sessionStorage.removeItem("almez_admin_token");
        sessionStorage.removeItem("almez_admin_user");
        router.replace("/login");
        return;
      }

      if (!response.ok || result.success === false) {
        const serverErrors: Record<string, string> = {};
        const details = result.details;
        if (Array.isArray(details)) {
          details.forEach((issue: any) => {
            const path = Array.isArray(issue.path)
              ? issue.path.join(".")
              : String(issue.path ?? "");
            if (path)
              serverErrors[mapServerPath(path)] =
                issue.message || text.saveFailure;
          });
        } else if (
          details?.fieldErrors &&
          typeof details.fieldErrors === "object"
        ) {
          Object.entries(details.fieldErrors).forEach(([key, value]) => {
            if (Array.isArray(value) && value[0])
              serverErrors[mapServerPath(key)] = String(value[0]);
          });
        }
        if (Object.keys(serverErrors).length > 0) {
          setFieldErrors((current) => ({ ...current, ...serverErrors }));
          const path = Object.keys(serverErrors)[0];
          setStep(
            path.startsWith("section.")
              ? 0
              : path.startsWith("category.")
                ? 1
                : 2,
          );
        }
        throw new Error(result.message || result.error || text.saveFailure);
      }

      setPageNotice(text.saveSuccess);
      setNotice("");
      setNoticeError(false);
      setFieldErrors({});
      try {
        const refreshResponse = await fetch(
          `${API_BASE_URL}/api/sections/admin`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (refreshResponse.ok) {
          const refreshed = await refreshResponse.json();
          const rawSections = Array.isArray(refreshed)
            ? refreshed
            : (refreshed.data ?? refreshed.sections ?? []);
          setExistingSections(
            rawSections.map((raw: any) => ({
              id: String(raw.id),
              title: localizedValue(raw.title),
              description: localizedValue(raw.description),
              imageUrl: typeof raw.imageUrl === "string" ? raw.imageUrl : "",
              status: raw.status === "PUBLISHED" ? "PUBLISHED" : "UNPUBLISHED",
              sortOrder: Number(raw.sortOrder ?? 0),
              categories: Array.isArray(raw.categories)
                ? raw.categories.map((category: any) => ({
                    id: String(category.id),
                    title: localizedValue(category.title),
                    items: Array.isArray(category.items)
                      ? category.items.map((item: any) => ({
                          id: String(item.id),
                          title: localizedValue(item.title),
                          description: localizedValue(item.description),
                        }))
                      : [],
                  }))
                : [],
            })),
          );
        }
      } catch {
        // Saving succeeded; refreshing the selector is best-effort.
      }

      // Close the wizard only after the server confirms the save succeeded.
      setWizardOpen(false);
      resetWizard();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : text.saveFailure);
      setNoticeError(true);
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-[#e3e8e3] bg-white px-3.5 py-3 text-sm text-[#1b3b36] outline-none transition placeholder:text-[#a0a9a2] focus:border-[#496e5a] focus:ring-2 focus:ring-[#496e5a]/10";

  const labelClass = "block text-sm font-semibold text-[#1b3b36]";

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
          {pageNotice && (
            <div
              role="status"
              className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
            >
              <p>{pageNotice}</p>
              <button
                type="button"
                onClick={() => setPageNotice("")}
                aria-label={
                  language === "en" ? "Dismiss message" : "Cerrar mensaje"
                }
                className="shrink-0 rounded-md px-2 py-0.5 font-semibold hover:bg-green-100"
              >
                ×
              </button>
            </div>
          )}

          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold tracking-wide text-[#758078]">
                {text.eyebrow}
              </p>
              <h1 className="mt-2 font-heading text-3xl font-semibold text-[#1b3b36]">
                {text.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#758078]">
                {text.subtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={openWizard}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1b3b36] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17312d] focus:outline-none focus:ring-2 focus:ring-[#496e5a] focus:ring-offset-2"
            >
              <span className="text-lg leading-none">+</span>
              {text.add}
            </button>
          </div>

          <section className="rounded-2xl border border-[#e3e8e3] bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#edf5ee] text-xl text-[#496e5a]">
                ◫
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-[#1b3b36]">
                  {text.total}
                </h2>
                <p className="mt-1 text-sm leading-6 text-[#758078]">
                  {text.totalDescription}
                </p>
                <div className="mt-6">
                  {loadingSections ? (
                    <div className="rounded-xl border border-[#e3e8e3] bg-[#fbfcfb] px-5 py-10 text-center">
                      <p className="text-sm text-[#758078]">{text.loading}</p>
                    </div>
                  ) : existingSections.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#cbd8cd] bg-[#fbfcfb] px-5 py-10 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf5ee] text-2xl text-[#496e5a]">
                        +
                      </div>
                      <h3 className="mt-4 text-base font-semibold text-[#1b3b36]">
                        {text.empty}
                      </h3>
                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#758078]">
                        {text.emptyDescription}
                      </p>
                      <button
                        type="button"
                        onClick={openWizard}
                        className="mt-5 rounded-xl border border-[#cbd8cd] px-4 py-2.5 text-sm font-semibold text-[#1b3b36] transition hover:bg-[#edf5ee]"
                      >
                        {text.create}
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                      {existingSections
                        .slice()
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((section) => {
                          const sectionTitle =
                            section.title[language] ||
                            section.title.en ||
                            section.title.es ||
                            (language === "en"
                              ? "Untitled section"
                              : "Sección sin título");
                          const sectionDescription =
                            section.description[language] ||
                            section.description.en ||
                            section.description.es;
                          const published = section.status === "PUBLISHED";
                          return (
                            <article
                              key={section.id}
                              className="overflow-hidden rounded-xl border border-[#e3e8e3] bg-white"
                            >
                              {section.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={section.imageUrl}
                                  alt={sectionTitle}
                                  className="h-40 w-full object-cover"
                                />
                              ) : null}
                              <div className="p-5">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <h3 className="break-words text-base font-semibold text-[#1b3b36]">
                                      {sectionTitle}
                                    </h3>
                                    {sectionDescription ? (
                                      <p className="mt-1 line-clamp-3 text-sm leading-5 text-[#758078]">
                                        {sectionDescription}
                                      </p>
                                    ) : null}
                                  </div>
                                  <span
                                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${published ? "bg-[#e8f5e9] text-[#276749]" : "bg-[#f3f4f6] text-[#626b65]"}`}
                                  >
                                    {published
                                      ? language === "en"
                                        ? "Published"
                                        : "Publicado"
                                      : language === "en"
                                        ? "Unpublished"
                                        : "Sin publicar"}
                                  </span>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#758078]">
                                  <span className="rounded-lg bg-[#f4f7f4] px-2.5 py-1.5">
                                    {section.categories.length}{" "}
                                    {language === "en"
                                      ? "categories"
                                      : "categorías"}
                                  </span>
                                  <span className="rounded-lg bg-[#f4f7f4] px-2.5 py-1.5">
                                    {section.categories.reduce(
                                      (total, category) =>
                                        total + category.items.length,
                                      0,
                                    )}{" "}
                                    {language === "en" ? "items" : "elementos"}
                                  </span>
                                </div>
                                <details className="mt-4 border-t border-[#edf0ed] pt-3">
                                  <summary className="cursor-pointer select-none text-sm font-semibold text-[#496e5a]">
                                    {language === "en"
                                      ? "View categories and items"
                                      : "Ver categorías y elementos"}
                                  </summary>
                                  {section.categories.length === 0 ? (
                                    <p className="mt-3 text-sm text-[#758078]">
                                      {text.noCategories}
                                    </p>
                                  ) : (
                                    <div className="mt-3 space-y-3">
                                      {section.categories.map((category) => (
                                        <div
                                          key={category.id}
                                          className="rounded-lg bg-[#f8faf8] p-3"
                                        >
                                          <p className="text-sm font-semibold text-[#1b3b36]">
                                            {category.title[language] ||
                                              category.title.en ||
                                              category.title.es ||
                                              (language === "en"
                                                ? "Untitled category"
                                                : "Categoría sin título")}
                                          </p>
                                          {category.items.length ? (
                                            <ul className="mt-2 space-y-1 border-l-2 border-[#d7e4d9] pl-3">
                                              {category.items.map((item) => (
                                                <li
                                                  key={item.id}
                                                  className="text-sm text-[#59665d]"
                                                >
                                                  {item.title[language] ||
                                                    item.title.en ||
                                                    item.title.es ||
                                                    (language === "en"
                                                      ? "Untitled item"
                                                      : "Elemento sin título")}
                                                </li>
                                              ))}
                                            </ul>
                                          ) : (
                                            <p className="mt-1 text-xs text-[#758078]">
                                              {language === "en"
                                                ? "No items"
                                                : "Sin elementos"}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </details>
                                <button
                                  type="button"
                                  onClick={openWizard}
                                  className="mt-4 rounded-xl border border-[#cbd8cd] px-3.5 py-2 text-sm font-semibold text-[#1b3b36] transition hover:bg-[#edf5ee]"
                                >
                                  {language === "en"
                                    ? "Add content"
                                    : "Añadir contenido"}
                                </button>
                              </div>
                            </article>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <p className="mt-4 text-xs leading-5 text-[#758078]">
            {text.demoNotice}
          </p>
        </main>
      </div>

      {wizardOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#10221f]/50 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeWizard();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="section-wizard-title"
            className="my-4 w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="border-b border-[#e3e8e3] px-5 py-5 sm:px-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#758078]">
                    {text.step} {step + 1} {text.of} 4
                  </p>
                  <h2
                    id="section-wizard-title"
                    className="mt-2 font-heading text-2xl font-semibold text-[#1b3b36]"
                  >
                    {
                      [text.section, text.category, text.items, text.review][
                        step
                      ]
                    }
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeWizard}
                  aria-label={language === "en" ? "Close" : "Cerrar"}
                  className="rounded-lg px-3 py-1 text-2xl text-[#758078] hover:bg-[#f1f5f0]"
                >
                  ×
                </button>
              </div>

              <div className="mt-5 grid grid-cols-4 gap-2" aria-hidden="true">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full ${index <= step ? "bg-[#496e5a]" : "bg-[#e3e8e3]"}`}
                  />
                ))}
              </div>
            </div>

            <form onSubmit={handleSave}>
              <div className="max-h-[62vh] space-y-6 overflow-y-auto px-5 py-6 sm:px-8">
                {step === 0 && (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(["new", "existing"] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => {
                            setSectionMode(mode);
                            setNotice("");
                          }}
                          className={`rounded-xl border p-4 text-left transition ${sectionMode === mode ? "border-[#496e5a] bg-[#edf5ee] ring-1 ring-[#496e5a]" : "border-[#e3e8e3] hover:border-[#a8bcae]"}`}
                        >
                          <span className="block text-sm font-semibold text-[#1b3b36]">
                            {mode === "new"
                              ? text.createNew
                              : text.chooseExisting}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-[#758078]">
                            {mode === "new"
                              ? language === "en"
                                ? "Enter the details in Spanish and English."
                                : "Introduce los datos en español e inglés."
                              : language === "en"
                                ? "Reuse a section without changing its details."
                                : "Reutiliza una sección sin modificar sus datos."}
                          </span>
                        </button>
                      ))}
                    </div>

                    {sectionMode === "existing" ? (
                      <div>
                        <label className={labelClass}>
                          {text.selectSection}
                          <select
                            className={`${inputClass} ${fieldErrors["section.id"] ? "border-red-500" : ""}`}
                            value={selectedSectionId}
                            aria-invalid={Boolean(fieldErrors["section.id"])}
                            onChange={(event) => {
                              setSelectedSectionId(event.target.value);
                              setSelectedCategoryId("");
                              clearFieldError("section.id");
                            }}
                            required
                          >
                            <option value="">—</option>
                            {existingSections.map((section) => (
                              <option key={section.id} value={section.id}>
                                {section.title[language]}
                              </option>
                            ))}
                          </select>
                          <FieldError message={fieldErrors["section.id"]} />
                        </label>
                        <p className="mt-3 text-xs leading-5 text-[#758078]">
                          {text.selectedExisting}
                        </p>
                      </div>
                    ) : (
                      <>
                        <TranslationFields
                          label={text.titleLabel}
                          value={sectionTitle}
                          text={text}
                          inputClass={inputClass}
                          labelClass={labelClass}
                          errors={{
                            es: fieldErrors["section.title.es"],
                            en: fieldErrors["section.title.en"],
                          }}
                          onClearError={(locale) =>
                            clearTranslationError("section.title", locale)
                          }
                          required
                          onChange={(locale, value) =>
                            updateTranslation(
                              sectionTitle,
                              setSectionTitle,
                              locale,
                              value,
                            )
                          }
                        />
                        <TranslationFields
                          label={text.description}
                          value={sectionDescription}
                          text={text}
                          inputClass={inputClass}
                          labelClass={labelClass}
                          errors={{
                            es: fieldErrors["section.description.es"],
                            en: fieldErrors["section.description.en"],
                          }}
                          onClearError={(locale) =>
                            clearTranslationError("section.description", locale)
                          }
                          multiline
                          required
                          onChange={(locale, value) =>
                            updateTranslation(
                              sectionDescription,
                              setSectionDescription,
                              locale,
                              value,
                            )
                          }
                        />
                        <label className={labelClass}>
                          {text.image}
                          <input
                            className={`${inputClass} ${fieldErrors["section.imageUrl"] ? "border-red-500" : ""}`}
                            type="url"
                            value={sectionImage}
                            aria-invalid={Boolean(
                              fieldErrors["section.imageUrl"],
                            )}
                            onChange={(event) => {
                              setSectionImage(event.target.value);
                              clearFieldError("section.imageUrl");
                            }}
                            placeholder="https://..."
                          />
                          <FieldError
                            message={fieldErrors["section.imageUrl"]}
                          />
                          <span className="mt-2 block text-xs font-normal leading-5 text-[#758078]">
                            {text.imageHint}
                          </span>
                        </label>
                        <StatusField
                          text={text}
                          inputClass={inputClass}
                          labelClass={labelClass}
                          value={sectionStatus}
                          onChange={setSectionStatus}
                        />
                      </>
                    )}
                  </>
                )}

                {step === 1 && (
                  <>
                    {sectionMode === "existing" && (
                      <div>
                        <label className={labelClass}>
                          {text.selectSection}
                          <select
                            className={`${inputClass} ${fieldErrors["section.id"] ? "border-red-500" : ""}`}
                            value={selectedSectionId}
                            aria-invalid={Boolean(fieldErrors["section.id"])}
                            onChange={(event) => {
                              setSelectedSectionId(event.target.value);
                              setSelectedCategoryId("");
                              clearFieldError("section.id");
                            }}
                            required
                          >
                            <option value="">—</option>
                            {existingSections.map((section) => (
                              <option key={section.id} value={section.id}>
                                {section.title[language]}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                      {(["new", "existing"] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          disabled={
                            mode === "existing" && sectionMode === "new"
                          }
                          onClick={() => {
                            setCategoryMode(mode);
                            setNotice("");
                          }}
                          className={`rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${categoryMode === mode ? "border-[#496e5a] bg-[#edf5ee] ring-1 ring-[#496e5a]" : "border-[#e3e8e3] hover:border-[#a8bcae]"}`}
                        >
                          <span className="text-sm font-semibold text-[#1b3b36]">
                            {mode === "new"
                              ? text.createNew
                              : text.chooseExisting}
                          </span>
                        </button>
                      ))}
                    </div>

                    {categoryMode === "existing" &&
                    sectionMode === "existing" ? (
                      <div>
                        <label className={labelClass}>
                          {text.selectCategory}
                          <select
                            className={`${inputClass} ${fieldErrors["category.id"] ? "border-red-500" : ""}`}
                            value={selectedCategoryId}
                            aria-invalid={Boolean(fieldErrors["category.id"])}
                            onChange={(event) => {
                              setSelectedCategoryId(event.target.value);
                              clearFieldError("category.id");
                            }}
                            required
                          >
                            <option value="">—</option>
                            {availableCategories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.title[language]}
                              </option>
                            ))}
                          </select>
                          <FieldError message={fieldErrors["category.id"]} />
                        </label>
                        {availableCategories.length === 0 && (
                          <p className="mt-2 text-sm text-[#758078]">
                            {text.noCategories}
                          </p>
                        )}
                        <p className="mt-3 text-xs leading-5 text-[#758078]">
                          {text.selectedExisting}
                        </p>
                      </div>
                    ) : (
                      <>
                        <TranslationFields
                          label={text.titleLabel}
                          value={categoryTitle}
                          text={text}
                          inputClass={inputClass}
                          labelClass={labelClass}
                          errors={{
                            es: fieldErrors["category.title.es"],
                            en: fieldErrors["category.title.en"],
                          }}
                          onClearError={(locale) =>
                            clearTranslationError("category.title", locale)
                          }
                          required
                          onChange={(locale, value) =>
                            updateTranslation(
                              categoryTitle,
                              setCategoryTitle,
                              locale,
                              value,
                            )
                          }
                        />
                        <TranslationFields
                          label={text.description}
                          value={categoryDescription}
                          text={text}
                          inputClass={inputClass}
                          labelClass={labelClass}
                          errors={{
                            es: fieldErrors["category.description.es"],
                            en: fieldErrors["category.description.en"],
                          }}
                          onClearError={(locale) =>
                            clearTranslationError(
                              "category.description",
                              locale,
                            )
                          }
                          multiline
                          required
                          onChange={(locale, value) =>
                            updateTranslation(
                              categoryDescription,
                              setCategoryDescription,
                              locale,
                              value,
                            )
                          }
                        />
                        <label className={labelClass}>
                          {text.image}
                          <input
                            type="url"
                            className={`${inputClass} ${fieldErrors["category.imageUrl"] ? "border-red-500" : ""}`}
                            value={categoryImage}
                            aria-invalid={Boolean(
                              fieldErrors["category.imageUrl"],
                            )}
                            onChange={(event) => {
                              setCategoryImage(event.target.value);
                              clearFieldError("category.imageUrl");
                            }}
                            placeholder="https://..."
                          />
                          <FieldError
                            message={fieldErrors["category.imageUrl"]}
                          />
                        </label>
                        <TranslationFields
                          label={text.tooltip}
                          value={categoryToolTip}
                          text={text}
                          inputClass={inputClass}
                          labelClass={labelClass}
                          multiline
                          onChange={(locale, value) =>
                            updateTranslation(
                              categoryToolTip,
                              setCategoryToolTip,
                              locale,
                              value,
                            )
                          }
                        />
                        <StatusField
                          text={text}
                          inputClass={inputClass}
                          labelClass={labelClass}
                          value={categoryStatus}
                          onChange={setCategoryStatus}
                        />
                      </>
                    )}
                  </>
                )}

                {step === 2 && (
                  <>
                    <div>
                      {fieldErrors.items && (
                        <FieldError message={fieldErrors.items} />
                      )}
                      <h3 className="text-sm font-semibold text-[#1b3b36]">
                        {text.itemDetails}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-[#758078]">
                        {language === "en"
                          ? "Add one or more items. Titles, descriptions and content are required in both languages."
                          : "Añade uno o varios elementos. El título, la descripción y el contenido son obligatorios en ambos idiomas."}
                      </p>
                    </div>

                    {items.map((item, index) => (
                      <section
                        key={item.id}
                        className="space-y-5 rounded-xl border border-[#e3e8e3] p-4 sm:p-5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-sm font-semibold text-[#1b3b36]">
                            {text.newItem} {index + 1}
                          </h4>
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setItems((current) =>
                                  current.filter(
                                    (currentItem) => currentItem.id !== item.id,
                                  ),
                                )
                              }
                              className="rounded-lg px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                            >
                              {text.removeItem}
                            </button>
                          )}
                        </div>

                        <TranslationFields
                          label={text.titleLabel}
                          value={item.title}
                          text={text}
                          inputClass={inputClass}
                          labelClass={labelClass}
                          errors={{
                            es: fieldErrors[`items.${item.id}.title.es`],
                            en: fieldErrors[`items.${item.id}.title.en`],
                          }}
                          onClearError={(locale) =>
                            clearTranslationError(
                              `items.${item.id}.title`,
                              locale,
                            )
                          }
                          required
                          onChange={(locale, value) =>
                            updateItem(item.id, "title", {
                              ...item.title,
                              [locale]: value,
                            })
                          }
                        />
                        <TranslationFields
                          label={text.description}
                          value={item.description}
                          text={text}
                          inputClass={inputClass}
                          labelClass={labelClass}
                          errors={{
                            es: fieldErrors[`items.${item.id}.description.es`],
                            en: fieldErrors[`items.${item.id}.description.en`],
                          }}
                          onClearError={(locale) =>
                            clearTranslationError(
                              `items.${item.id}.description`,
                              locale,
                            )
                          }
                          multiline
                          required
                          onChange={(locale, value) =>
                            updateItem(item.id, "description", {
                              ...item.description,
                              [locale]: value,
                            })
                          }
                        />
                        <TranslationFields
                          label={text.content}
                          value={item.content}
                          text={text}
                          inputClass={inputClass}
                          labelClass={labelClass}
                          errors={{
                            es: fieldErrors[`items.${item.id}.content.es`],
                            en: fieldErrors[`items.${item.id}.content.en`],
                          }}
                          onClearError={(locale) =>
                            clearTranslationError(
                              `items.${item.id}.content`,
                              locale,
                            )
                          }
                          multiline
                          required
                          onChange={(locale, value) =>
                            updateItem(item.id, "content", {
                              ...item.content,
                              [locale]: value,
                            })
                          }
                        />
                        <label className={labelClass}>
                          {text.image}
                          <input
                            type="url"
                            className={`${inputClass} ${fieldErrors[`items.${item.id}.imageUrl`] ? "border-red-500" : ""}`}
                            value={item.imageUrl}
                            aria-invalid={Boolean(
                              fieldErrors[`items.${item.id}.imageUrl`],
                            )}
                            onChange={(event) => {
                              updateItem(
                                item.id,
                                "imageUrl",
                                event.target.value,
                              );
                              clearFieldError(`items.${item.id}.imageUrl`);
                            }}
                            placeholder="https://..."
                          />
                          <FieldError
                            message={fieldErrors[`items.${item.id}.imageUrl`]}
                          />
                        </label>
                        <TranslationFields
                          label={text.tooltip}
                          value={item.toolTip}
                          text={text}
                          inputClass={inputClass}
                          labelClass={labelClass}
                          multiline
                          onChange={(locale, value) =>
                            updateItem(item.id, "toolTip", {
                              ...item.toolTip,
                              [locale]: value,
                            })
                          }
                        />
                        <StatusField
                          text={text}
                          inputClass={inputClass}
                          labelClass={labelClass}
                          value={item.status}
                          onChange={(value) =>
                            updateItem(item.id, "status", value)
                          }
                        />
                      </section>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        setItems((current) => [
                          ...current,
                          createItem(crypto.randomUUID()),
                        ])
                      }
                      className="w-full rounded-xl border border-dashed border-[#a8bcae] px-4 py-3 text-sm font-semibold text-[#496e5a] transition hover:bg-[#edf5ee]"
                    >
                      + {text.addItem}
                    </button>
                  </>
                )}

                {step === 3 && (
                  <div className="space-y-5">
                    <section className="rounded-xl border border-[#e3e8e3] p-5">
                      <h3 className="text-sm font-semibold text-[#1b3b36]">
                        {text.section}
                      </h3>
                      <p className="mt-2 text-sm text-[#758078]">
                        {sectionMode === "existing"
                          ? selectedSection?.title[language] || "—"
                          : sectionTitle[language] || "—"}
                      </p>
                      <p className="mt-1 text-xs text-[#758078]">
                        {sectionMode === "existing"
                          ? text.selectedExisting
                          : sectionDescription[language] || "—"}
                      </p>
                      <p className="mt-3 text-xs font-semibold text-[#496e5a]">
                        {sectionMode === "existing"
                          ? text.chooseExisting
                          : sectionStatus === "PUBLISHED"
                            ? text.published
                            : text.unpublished}
                      </p>
                    </section>

                    <section className="rounded-xl border border-[#e3e8e3] p-5">
                      <h3 className="text-sm font-semibold text-[#1b3b36]">
                        {text.category}
                      </h3>
                      <p className="mt-2 text-sm text-[#758078]">
                        {categoryMode === "existing"
                          ? availableCategories.find(
                              (category) => category.id === selectedCategoryId,
                            )?.title[language] || "—"
                          : categoryTitle[language] || "—"}
                      </p>
                      <p className="mt-1 text-xs text-[#758078]">
                        {categoryMode === "existing"
                          ? text.selectedExisting
                          : categoryDescription[language] || "—"}
                      </p>
                      <p className="mt-3 text-xs font-semibold text-[#496e5a]">
                        {categoryMode === "existing"
                          ? text.chooseExisting
                          : categoryStatus === "PUBLISHED"
                            ? text.published
                            : text.unpublished}
                      </p>
                    </section>

                    <section className="rounded-xl border border-[#e3e8e3] p-5">
                      <h3 className="text-sm font-semibold text-[#1b3b36]">
                        {text.items} ({items.length})
                      </h3>
                      <div className="mt-3 divide-y divide-[#e3e8e3]">
                        {items.map((item, index) => (
                          <div
                            key={item.id}
                            className="py-3 first:pt-0 last:pb-0"
                          >
                            <p className="text-sm font-semibold text-[#1b3b36]">
                              {index + 1}. {item.title[language] || "—"}
                            </p>
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#758078]">
                              {item.description[language] || "—"}
                            </p>
                            <p className="mt-2 text-xs text-[#496e5a]">
                              {item.status === "PUBLISHED"
                                ? text.published
                                : text.unpublished}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>

                    <p className="rounded-xl bg-[#edf5ee] p-4 text-sm leading-6 text-[#496e5a]">
                      {language === "en"
                        ? "Review the structure before saving. Existing sections and categories will be referenced by ID, not duplicated or edited."
                        : "Revisa la estructura antes de guardar. Las secciones y categorías existentes se referenciarán por ID, sin duplicarlas ni modificarlas."}
                    </p>
                  </div>
                )}

                {notice && (
                  <p
                    role={noticeError ? "alert" : "status"}
                    className={`rounded-xl p-4 text-sm leading-6 ${noticeError ? "bg-red-50 text-red-700" : "bg-[#edf5ee] text-[#496e5a]"}`}
                  >
                    {notice}
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse justify-between gap-3 border-t border-[#e3e8e3] bg-[#fbfcfb] px-5 py-4 sm:flex-row sm:px-8">
                <button
                  type="button"
                  onClick={
                    step === 0
                      ? closeWizard
                      : () => {
                          setStep((current) => Math.max(current - 1, 0));
                          setNotice("");
                        }
                  }
                  className="rounded-xl border border-[#e3e8e3] px-5 py-3 text-sm font-semibold text-[#1b3b36] transition hover:bg-[#f1f5f0]"
                >
                  {step === 0 ? text.cancel : text.back}
                </button>

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="rounded-xl bg-[#1b3b36] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#17312d]"
                  >
                    {text.next}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-[#1b3b36] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#17312d] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving
                      ? language === "en"
                        ? "Saving…"
                        : "Guardando…"
                      : text.save}
                  </button>
                )}
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
