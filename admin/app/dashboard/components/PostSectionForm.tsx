// app/dashboard/components/PostSectionForm.tsx
"use client";

import { useState } from "react";
import type { PostSection, PostSectionKey } from "@/types/post-section";
import { POST_SECTION_KEYS } from "@/types/post-section";

type PostSectionFormProps = {
  mode?: "create" | "edit";
  postId: number;
  initialSection?: PostSection;
  onSuccess?: (section: PostSection) => void;
};

export default function PostSectionForm({
  mode = "create",
  postId,
  initialSection,
  onSuccess,
}: PostSectionFormProps) {
  const [sectionKey, setSectionKey] = useState<PostSectionKey | "">(
    (initialSection?.key as PostSectionKey) ?? "",
  );
  const [title, setTitle] = useState(initialSection?.title ?? "");
  const [orderIndex, setOrderIndex] = useState<number>(
    initialSection?.order_index ?? 1,
  );
  const [contentMd, setContentMd] = useState(initialSection?.content_md ?? "");

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [savedSection, setSavedSection] = useState<PostSection | null>(null);

  function resetForm() {
    setSectionKey((initialSection?.key as PostSectionKey) ?? "");
    setTitle(initialSection?.title ?? "");
    setOrderIndex(initialSection?.order_index ?? 1);
    setContentMd(initialSection?.content_md ?? "");
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setIsSubmitted(true);
    setError(null);
    setSuccessMessage(null);
    setSavedSection(null);

    // guard: ensure key is selected
    if (!sectionKey) {
      setError("Please select a section key");
      setIsSubmitted(false);
      return;
    }

    try {
      if (mode === "create") {
        const ROUTE = "/api/post-sections/create"; // adjust to your actual route
        const res = await fetch(ROUTE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            post_id: postId,
            key: sectionKey,
            title,
            order_index: orderIndex,
            content_md: contentMd,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(
            (data as { error?: string; detail?: string }).error ??
              (data as { detail?: string }).detail ??
              "Create post section failed",
          );
          resetForm();
          setIsSubmitted(false);
          return;
        }

        const section = (await res.json()) as PostSection;
        setSavedSection(section);
        setSuccessMessage("Post section created successfully");
        onSuccess?.(section);
        resetForm();
      } else {
        // edit mode
        if (!initialSection) {
          setError("Post section doesn't exist");
        } else {
          const ROUTE = `/api/post-sections/update?id=${initialSection.id}`; // or `/api/post-sections/${initialSection.id}`
          const res = await fetch(ROUTE, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              key: sectionKey,
              title,
              order_index: orderIndex,
              content_md: contentMd,
            }),
          });

          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(
              (data as { error?: string; detail?: string }).error ??
                (data as { detail?: string }).detail ??
                "Update post section failed",
            );
            setIsSubmitted(false);
            return;
          }

          const section = (await res.json()) as PostSection;
          setSavedSection(section);
          setSuccessMessage("Post section updated successfully");
          onSuccess?.(section);

          // sync fields with latest section
          setSectionKey(section.key as PostSectionKey);
          setTitle(section.title);
          setOrderIndex(section.order_index);
          setContentMd(section.content_md);
        }
      }

      setIsSubmitted(false);
    } catch (err) {
      setError(`Unexpected error: ${err}`);
      resetForm();
      setIsSubmitted(false);
    }
  }

  return (
    <div className="mt-2 space-y-4">
      {/* Messages above the form */}
      {successMessage && savedSection && (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-950/60 px-3 py-2 text-xs text-emerald-100">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-semibold">{successMessage}</p>
              <p className="mt-1 text-[11px] text-emerald-200">
                {savedSection.title} ({savedSection.key})
              </p>
            </div>
            <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold">
              Section #{savedSection.order_index}
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-950/60 px-3 py-2 text-xs text-red-100">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4"
      >
        {/* Key */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-200">
            Key
          </label>
          <select
            required
            value={sectionKey}
            onChange={(e) =>
              setSectionKey(e.target.value as PostSectionKey | "")
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-100 outline-none ring-0 transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          >
            <option value="">Select a key…</option>
            {POST_SECTION_KEYS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-200">
            Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-100 outline-none ring-0 transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* Order index */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-200">
            Order index
          </label>
          <input
            type="number"
            required
            value={orderIndex}
            onChange={(e) => setOrderIndex(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-100 outline-none ring-0 transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* Content markdown */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-200">
            Content (Markdown)
          </label>
          <textarea
            required
            rows={6}
            value={contentMd}
            onChange={(e) => setContentMd(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-100 outline-none ring-0 transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitted}
            className="inline-flex items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700"
          >
            {isSubmitted
              ? mode === "create"
                ? "Creating..."
                : "Saving..."
              : mode === "create"
              ? "Create section"
              : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}