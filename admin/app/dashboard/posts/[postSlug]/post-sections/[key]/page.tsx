// app/dashboard/posts/[postSlug]/post-sections/[key]/page.tsx

import PostSectionForm from "@/app/dashboard/components/PostSectionForm";
import type { Post } from "@/types/post";
import type { PostSection } from "@/types/post-section";

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

async function getPostSectionByKey(
  key: string,
  post: Post,
): Promise<PostSection | null> {
  if (!post) return null;

  const ROUTE_PATH = `${FASTAPI_URL}/post-sections/by-post/${post.id}`;
  const res = await fetch(ROUTE_PATH, {
    method: "GET",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    next: { revalidate: 0 },
  });

  if (!res.ok) return null;

  const postSections = (await res.json()) as PostSection[];

  const data = postSections.find((postSection) => postSection.key === key);
  return data ?? null;
}

export default async function PostSectionDetailPage({
  params,
}: {
  params: Promise<{ postSlug: string; key: string }>;
}) {
  const { postSlug, key } = await params;

  const post = await getPostBySlug(postSlug);
  if (!post) {
    return (
      <div className="mt-4 rounded-md border border-red-500/40 bg-red-950/60 px-3 py-2 text-xs text-red-100">
        Post with slug <span className="font-mono">{postSlug}</span> not found.
      </div>
    );
  }

  const postSection = await getPostSectionByKey(key, post);
  if (!postSection) {
    return (
      <div className="mt-4 rounded-md border border-red-500/40 bg-red-950/60 px-3 py-2 text-xs text-red-100">
        Post section with key <span className="font-mono">{key}</span> not
        found for post <span className="font-mono">{post.slug}</span>.
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-6">
      {/* Page header */}
      <div className="space-y-1">
        <h1 className="text-base font-semibold text-slate-100">
          Edit post section
        </h1>
        <p className="text-xs text-slate-400">
          <span className="font-medium text-slate-200">Post:</span>{" "}
          <span className="font-mono text-slate-300">{post.slug}</span>
        </p>
        <p className="text-[11px] text-slate-500">
          <span className="font-medium text-slate-200">Section key:</span>{" "}
          <span className="font-mono text-slate-300">{postSection.key}</span>
        </p>
      </div>

      {/* Card: Section form */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Section details
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Update the content and metadata of this section.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800/70 px-2 py-0.5 text-[10px] font-medium text-slate-300">
            Order: {postSection.order_index}
          </span>
        </div>

        <PostSectionForm
          mode="edit"
          postId={post.id}
          initialSection={postSection}
        />
      </div>
    </div>
  );
}