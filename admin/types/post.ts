// types/post.ts

export interface Post {
    id: number;
    title: string;
    slug: string;
    summary: string;
    repo_url: string | null;
    created_at: string;
    is_published: boolean;
    is_deleted: boolean;
}