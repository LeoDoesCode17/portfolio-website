// types/post-section.ts

export interface PostSection {
  id: number;
  post_id: number;
  key: string;
  title: string;
  order_index: number;
  content_md: string;
  is_deleted: boolean;
}


export const POST_SECTION_KEYS = [
  "intro",
  "tech_stack",
  "implementation",
  "challenges",
  "conclusion",
] as const;

export type PostSectionKey = (typeof POST_SECTION_KEYS)[number];