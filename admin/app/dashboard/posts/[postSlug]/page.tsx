// app/dashboard/posts/[postSlug]/page.tsx
import PostForm from "@/app/dashboard/components/PostForm";
import type { Post } from "@/types/post";
import PostSectionList from "../../components/PostSectionList";

const LOCAL_DEV_URL = "http://127.0.0.1:8000";
const FASTAPI_URL = process.env.API_URL ?? LOCAL_DEV_URL;

async function getPostBySlug(slug: string): Promise<Post | null> {
  const res = await fetch(`${FASTAPI_URL}/posts/slug/${slug}`, {
    next: { revalidate: 0 }, // always fresh in admin
  });

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as Post;
  return data;
}

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ postSlug: string }>;
}) {
  const slug = (await params).postSlug;
  const post = await getPostBySlug(slug);

  if (!post) {
    return (
      <div className="mt-4 rounded-md border border-red-500/40 bg-red-950/60 px-3 py-2 text-xs text-red-100">
        Post with slug <span className="font-mono">{slug}</span> not found.
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-6">
      {/* Page header */}
      <div className="space-y-1">
        <h1 className="text-base font-semibold text-slate-100">Edit post</h1>
        <p className="text-xs text-slate-400">
          <span className="font-medium text-slate-200">Slug:</span>{" "}
          <span className="font-mono text-slate-300">{post.slug}</span>
        </p>
      </div>

      {/* Card: Post form */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Post details
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Update the core metadata of this post.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800/70 px-2 py-0.5 text-[10px] font-medium text-slate-300">
            ID: {post.id}
          </span>
        </div>

        <PostForm mode="edit" initialPost={post} />
      </div>

      {/* Card: Sections list */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-slate-100">
            Post sections
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-400">
            View and manage the sections that make up this post.
          </p>
        </div>

        <PostSectionList post={post} />
      </div>
    </div>
  );
}