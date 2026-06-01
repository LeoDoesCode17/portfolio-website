// app/dashboard/components/PostListSection.tsx
"use client";

import { useEffect, useState } from "react";
import type { Post } from "@/types/post";
import { useRouter } from "next/navigation";

export default function PostListSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ROUTE_PATH = "/api/posts/get-all";
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(ROUTE_PATH, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          setError((data as { error?: string }).error ?? "Fetch posts data failed");
          setLoading(false);
          return;
        }

        const data = (await response.json()) as Post[];
        setPosts(data);
        setLoading(false);
      } catch (e) {
        setError(`Error: ${e}`);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handlers are placeholders – you’ll add API calls later
  const handleEdit = (post: Post) => {
    const path = `/dashboard/posts/${post.slug}`
    router.push(path)
    // console.log("Path: ", path)
  };

  const handleTogglePublish = (post: Post) => {
    console.log("Toggle publish", post.id, "current:", post.is_published);
    // TODO: call API to publish/unpublish
  };

  const handleDelete = (post: Post) => {
    console.log("Delete post", post.id);
    // TODO: call API to soft-delete and then update state
  };

  if (loading) {
    return (
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-slate-300">Posts</h2>
        <p className="mt-2 text-xs text-slate-500">Loading posts…</p>
      </section>
    );
  }

  return (
    <section className="mt-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-slate-300">Posts</h2>
        {/* You can later add “New Post” button here */}
      </div>

      {error && (
        <div className="mt-2 rounded-md border border-red-500/40 bg-red-950/60 px-3 py-2 text-xs text-red-100">
          {error}
        </div>
      )}

      {!error && posts.length === 0 && (
        <p className="mt-2 text-xs text-slate-500">No posts found.</p>
      )}

      {!error && posts.length > 0 && (
        <ul className="mt-3 space-y-2">
          {posts.map((post) => (
            <li
              key={post.id}
              className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                {/* Left side: title + summary + status (stacked on mobile) */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-medium text-slate-100">
                      {post.title}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        post.is_published
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-300 border border-slate-600"
                      }`}
                    >
                      {post.is_published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">
                    {post.summary}
                  </p>
                </div>

                {/* Right side: actions (stack side-by-side on mobile, right-aligned on larger screens) */}
                <div className="flex items-center justify-end gap-2 sm:ml-4">
                  {/* Edit button */}
                  <button
                    type="button"
                    onClick={() => handleEdit(post)}
                    className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-[11px] font-medium text-slate-100 hover:border-sky-500 hover:text-sky-300"
                  >
                    ✏️
                    <span className="ml-1 hidden sm:inline">Edit</span>
                  </button>

                  {/* Publish / unpublish button with eye icon */}
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(post)}
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                      post.is_published
                        ? "border-slate-700 bg-slate-900/80 text-slate-200 hover:border-amber-500 hover:text-amber-300"
                        : "border-emerald-600 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"
                    }`}
                  >
                    {post.is_published ? "👁️" : "👁️‍🗨️"}
                    <span className="ml-1 hidden sm:inline">
                      {post.is_published ? "Unpublish" : "Publish"}
                    </span>
                  </button>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(post)}
                    className="inline-flex items-center rounded-full border border-red-600/70 bg-red-900/40 px-2.5 py-1 text-[11px] font-medium text-red-100 hover:bg-red-900"
                  >
                    🗑️
                    <span className="ml-1 hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}