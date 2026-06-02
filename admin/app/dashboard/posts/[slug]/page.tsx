// app/dashboard/posts/[slug]/page.tsx
import PostForm from "@/app/dashboard/components/PostForm";
import type { Post } from "@/types/post";

const LOCAL_DEV_URL = "http://127.0.0.1:8000";
const FASTAPI_URL = process.env.API_URL ?? LOCAL_DEV_URL;

async function getPostBySlug(slug: string): Promise<Post | null> {
  const res = await fetch(`${FASTAPI_URL}/posts/slug/${slug}`, {
    // Server component fetch; cookies not needed because backend route
    // may or may not require auth. If it does, you can add Authorization later.
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
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const post = await getPostBySlug(slug);

  if (!post) {
    return (
      <div className="mt-4 rounded-md border border-red-500/40 bg-red-950/60 px-3 py-2 text-xs text-red-100">
        Post with slug <span className="font-mono">{slug}</span> not found.
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-300">
        Edit post: <span className="font-mono text-slate-100">{post.slug}</span>
      </h2>
      <PostForm mode="edit" initialPost={post} />
    </div>
  );
}
