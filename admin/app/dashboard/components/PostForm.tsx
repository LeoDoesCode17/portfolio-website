// app/dashboard/components/PostForm.tsx
"use client";

import { useState } from "react";
import type { Post } from "@/types/post";

type PostFormProps = {
  mode?: "create" | "edit";
  initialPost?: Post;
  onSuccess?: (post: Post) => void;
};

export default function PostForm({
  mode = "create",
  initialPost,
  onSuccess,
}: PostFormProps) {
  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [slug, setSlug] = useState(initialPost?.slug ?? "");
  const [summary, setSummary] = useState(initialPost?.summary ?? "");
  const [repoUrl, setRepoUrl] = useState(initialPost?.repo_url ?? "");
  const [demoUrl, setDemoUrl] = useState(initialPost?.demo_url ?? "");
  const [isPublished, setIsPublished] = useState(
    initialPost?.is_published ?? false
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createdPost, setCreatedPost] = useState<Post | null>(null);

  function resetForm() {
    setTitle(initialPost?.title ?? "");
    setSlug(initialPost?.slug ?? "");
    setSummary(initialPost?.summary ?? "");
    setRepoUrl(initialPost?.repo_url ?? "");
    setDemoUrl(initialPost?.demo_url ?? "");
    setIsPublished(initialPost?.is_published ?? false);
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setIsSubmitted(true);
    setError(null);
    setSuccessMessage(null);
    setCreatedPost(null);

    try {
      if (mode === "create") {
        const ROUTE = "/api/posts/create"
        const res = await fetch(ROUTE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            slug,
            summary,
            repo_url: repoUrl,
            demo_url: demoUrl || null,
            is_published: isPublished,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError((data as { error?: string }).error ?? "Create post failed");
          resetForm();
          setIsSubmitted(false);
          return;
        }

        const post = (await res.json()) as Post;
        setCreatedPost(post);
        setSuccessMessage("Post created successfully");
        onSuccess?.(post);
        resetForm();
      } else {
        if (!initialPost) {
          setError("Post doesn't exist")
        } else {
          // TODO: implement update via PATCH /api/posts/{id}
          const ROUTE = `/api/posts/update?id=${initialPost.id}` // /api/posts/update/route.ts
          const res = await fetch(ROUTE, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title,
              slug,
              summary,
              repo_url: repoUrl,
              demo_url: demoUrl || null,
              is_published: isPublished,
            }),
          })

          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError((data as { error?: string }).error ?? "Update post failed");
            setIsSubmitted(false);
            return;
          }

          const post = (await res.json()) as Post;
          setCreatedPost(post);
          setSuccessMessage("Post updated successfully");
          onSuccess?.(post);     
          
          // update form fields with latest post
          setTitle(post.title);
          setSlug(post.slug);
          setSummary(post.summary);
          setRepoUrl(post.repo_url ?? "");
          setDemoUrl(post.demo_url ?? "");
          setIsPublished(post.is_published ?? false);
        }
      }
        setIsSubmitted(false);
    } catch (e) {
      setError(`Unexpected error: ${e}`);
      resetForm();
      setIsSubmitted(false);
    }
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Messages above the form */}
      {successMessage && createdPost && (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-950/60 px-3 py-2 text-xs text-emerald-100">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-semibold">{successMessage}</p>
              <p className="mt-1 text-[11px] text-emerald-200">
                {createdPost.title} ({createdPost.slug})
              </p>
            </div>
            <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold">
              {createdPost.is_published ? "Published" : "Draft"}
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

        {/* Slug */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-200">
            Slug
          </label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-100 outline-none ring-0 transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
          <p className="text-[10px] text-slate-500">
            Used in URLs, e.g.{" "}
            <span className="text-slate-300">/posts/{slug}</span>
          </p>
        </div>

        {/* Summary */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-200">
            Summary
          </label>
          <textarea
            required
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-100 outline-none ring-0 transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* Repo URL */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-200">
            Repository URL
          </label>
          <input
            type="url"
            required
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-100 outline-none ring-0 transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* Demo URL */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-200">
            Demo URL (optional)
          </label>
          <input
            type="url"
            value={demoUrl}
            onChange={(e) => setDemoUrl(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-100 outline-none ring-0 transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* Published toggle */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-slate-200">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-3 w-3 rounded border-slate-600 bg-slate-900 text-sky-500 focus:ring-sky-500"
            />
            <span>Published</span>
          </label>
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
              ? "Create post"
              : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}