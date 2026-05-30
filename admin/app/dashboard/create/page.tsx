// app/dashboard/create/page.tsx
import PostForm from "../components/PostForm";

export default function CreatePostPage() {

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-300">
        Create new post
      </h2>
      <PostForm mode="create"/>
    </div>
  );
}