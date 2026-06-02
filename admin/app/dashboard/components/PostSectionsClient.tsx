// app/dashboard/components/PostSectionsClient.tsx

"use client";

import { useEffect, useState } from "react";
import type { Post } from "@/types/post";
import type { PostSection, PostSectionKey } from "@/types/post-section";
import { POST_SECTION_KEYS } from "@/types/post-section";

type Props = {
  post: Post;
};

export default function PostSectionsClient({ post }: Props) {
  const [sections, setSections] = useState<PostSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // form state
  const [sectionKey, setSectionKey] = useState<PostSectionKey | "">("");
  const [sectionTitle, setSectionTitle] = useState("");
  const [orderIndex, setOrderIndex] = useState<number>(1);
  const [contentMd, setContentMd] = useState("");

  useEffect(() => {
    async function fetchSections() {
      try {
        setLoading(true);
        setError(null);
        const ROUTE_PATH = `/api/post-sections/get-by-post?post_id=${post.id}`;
        const res = await fetch(ROUTE_PATH, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch sections");
        const data = (await res.json()) as PostSection[];
        setSections(data);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    }
    fetchSections();
  }, [post.id]);

  function resetForm() {
    setSectionKey("");
    setSectionTitle("");
    setOrderIndex(
      sections.length > 0 ? sections[sections.length - 1].order_index + 1 : 1,
    );
    setContentMd("");
  }

  async function handleCreateSection(e: React.SubmitEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setSuccessMessage(null);

    // guard: ensure key is selected
    if (!sectionKey) {
      setError("Please select a section key");
      setCreating(false);
      return;
    }

    try {
      const payload = {
        post_id: post.id,
        key: sectionKey,
        title: sectionTitle,
        order_index: orderIndex,
        content_md: contentMd,
      };

      const ROUTE = "/api/post-sections/create";
      const res = await fetch(ROUTE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          (data as { error?: string; detail?: string }).error ??
            (data as { detail?: string }).detail ??
            "Create post section failed",
        );
        setCreating(false);
        return;
      }

      const created = (await res.json()) as PostSection;

      setSections((prev) =>
        [...prev, created].sort((a, b) => a.order_index - b.order_index),
      );
      setSuccessMessage("Post section created successfully");
      resetForm();
      setShowModal(false);
    } catch (err) {
      setError(String(err));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Success card */}
      {successMessage && (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-950/60 px-3 py-2 text-xs text-emerald-100">
          <p className="font-semibold">{successMessage}</p>
        </div>
      )}

      {/* Error card */}
      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-950/60 px-3 py-2 text-xs text-red-100">
          {error}
        </div>
      )}

      {/* Post summary */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="text-sm font-semibold text-slate-100">
          Sections for: <span className="font-mono">{post.title}</span>
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Slug: <span className="font-mono">{post.slug}</span>
        </p>
      </div>

      {/* Header + Add button */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Post sections
        </h3>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="inline-flex items-center rounded-full bg-sky-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-sky-400"
        >
          + Add section
        </button>
      </div>

      {/* Sections list */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-xs text-slate-400">Loading sections…</div>
        ) : sections.length === 0 ? (
          <div className="text-xs text-slate-500">
            No sections yet. Use &quot;Add section&quot; to create one.
          </div>
        ) : (
          sections.map((section) => (
            <div
              key={section.id}
              className="rounded-lg border border-slate-800 bg-slate-950/60 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-slate-100">
                    {section.title}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    key: <span className="font-mono">{section.key}</span> •{" "}
                    order: {section.order_index}
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-[10px] text-slate-300">
                  Section #{section.order_index}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-100">
                Add new section
              </h4>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateSection} className="mt-3 space-y-3">
              {/* key */}

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-200">
                  Key
                </label>
                <select
                  required
                  value={sectionKey}
                  onChange={(e) =>
                    setSectionKey(e.target.value as PostSectionKey | "")
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                >
                  <option value="">Select a key…</option>
                  {POST_SECTION_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              {/* title */}
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-200">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* order_index */}
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-200">
                  Order index
                </label>
                <input
                  type="number"
                  required
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* content_md */}
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-200">
                  Content (Markdown)
                </label>
                <textarea
                  required
                  rows={4}
                  value={contentMd}
                  onChange={(e) => setContentMd(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-full border border-slate-600 px-3 py-1.5 text-[11px] text-slate-200 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-full bg-sky-500 px-4 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700"
                >
                  {creating ? "Creating…" : "Create section"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
