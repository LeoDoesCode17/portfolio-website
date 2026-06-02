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