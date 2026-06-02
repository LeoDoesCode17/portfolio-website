// app/dashboard/posts/post-sections/[slug]/page.tsx

import { Post } from "@/types/post";
import PostSectionsClient from "@/app/dashboard/components/PostSectionsClient";

const LOCAL_DEV_URL = "http://127.0.0.1:8000";
const FASTAPI_URL = process.env.API_URL ?? LOCAL_DEV_URL;

/*
TODO:
- display post data that is fetched from get post by slug
- display all post sections from this post
- provide button to add new section
- modal form to add new section
- card status to display created status
*/

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

export default async function PostSectionsPage({
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

  return <PostSectionsClient post={post} />;
}