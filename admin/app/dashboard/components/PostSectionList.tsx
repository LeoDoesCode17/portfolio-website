// app/dashboard/components/PostSectionList.tsx

"use client";

import { useEffect, useState } from "react";
import type { Post } from "@/types/post";
import type { PostSection } from "@/types/post-section";
import { useRouter } from "next/navigation";
import PostSectionForm from "./PostSectionForm";

type Props = {
  post: Post;
};

export default function PostSectionList({ post }: Props) {
  const [sections, setSections] = useState<PostSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const router = useRouter();

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

  function handleSeeDetails(section: PostSection) {
    const sectionSlug = section.key; // later can be section.slug
    router.push(
      `/dashboard/posts/${post.slug}/post-sections/${encodeURIComponent(
        sectionSlug,
      )}`,
    );
  }

  // when create form succeeds
  function handleCreateSuccess(newSection: PostSection) {
    setSections((prev) =>
      [...prev, newSection].sort((a, b) => a.order_index - b.order_index),
    );
    setShowCreateModal(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
        <div className="space-y-1">
          <div className="h-2 w-24 animate-pulse rounded bg-slate-700" />
          <div className="h-2 w-40 animate-pulse rounded bg-slate-800" />
        </div>
        <div className="h-6 w-12 animate-pulse rounded-full bg-slate-800" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-500/40 bg-red-950/60 px-3 py-2 text-xs text-red-100">
        Failed to load sections: {error}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {/* Header row for count + Add button */}
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>
            Total sections:{" "}
            <span className="font-semibold text-slate-200">
              {sections.length}
            </span>
          </span>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center rounded-full bg-sky-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-sky-400"
          >
            + Add section
          </button>
        </div>

        {sections.length === 0 ? (
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-3 text-xs text-slate-400">
            No sections yet for this post. Use &quot;Add section&quot; to create one.
          </div>
        ) : (
          sections.map((section) => (
            <div
              key={section.id}
              className="rounded-lg border border-slate-800 bg-slate-950/60 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-100">
                    {section.title}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Key:{" "}
                    <span className="font-mono text-slate-300">
                      {section.key}
                    </span>{" "}
                    • Order:{" "}
                    <span className="font-mono text-slate-300">
                      {section.order_index}
                    </span>
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-[10px] text-slate-300">
                    Section #{section.order_index}
                  </span>
                  <button
                    onClick={() => handleSeeDetails(section)}
                    className="text-[10px] text-sky-400 hover:text-sky-300"
                  >
                    See Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create section modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-100">
                Add new section
              </h4>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Close
              </button>
            </div>

            <PostSectionForm
              mode="create"
              postId={post.id}
              onSuccess={handleCreateSuccess}
            />
          </div>
        </div>
      )}
    </>
  );
}