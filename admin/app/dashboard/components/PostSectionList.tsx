// app/dashboard/components/PostSectionList.tsx

"use client";

import { useEffect, useState } from "react";
import type { Post } from "@/types/post";
import type { PostSection } from "@/types/post-section";
import { useRouter } from "next/navigation";

type Props = {
  post: Post;
};

export default function PostSectionList({ post }: Props) {
  const [sections, setSections] = useState<PostSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter()

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

  if (sections.length === 0) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-3 text-xs text-slate-400">
        No sections yet for this post. Create a section from the sections
        management UI to start structuring the content.
      </div>
    );
  }

  //TODO: add handle see details function that receives postSectionSlug to navigate using useRouter to path: /dashboard/posts/{post.id}/post-sections/{postSectionSlug}
    function handleSeeDetails(section: PostSection) {
    // if you later have section.slug, use that instead of key
    const sectionSlug = section.key;
    router.push(
      `/dashboard/posts/${post.slug}/post-sections/${encodeURIComponent(
        sectionSlug,
      )}`,
    );
  }

  return (
    <div className="space-y-2">
      {/* Header row for count */}
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>
          Total sections:{" "}
          <span className="font-semibold text-slate-200">
            {sections.length}
          </span>
        </span>
      </div>

      {sections.map((section) => (
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
              {/* Placeholder for future actions */}
              <button onClick={() => handleSeeDetails(section)} className="text-[10px] text-sky-400 hover:text-sky-300">
                See Details
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}