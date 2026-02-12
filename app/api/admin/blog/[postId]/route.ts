import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/access";
import { updatePost, deletePost, getPostForEdit } from "@/lib/admin/blog";
import { withErrorHandler } from "@/app/api/error-handler";
import { AppError } from "@/lib/errors";
import { revalidatePath, revalidateTag } from "next/cache";

export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) => {
  await requireRole("admin");
  const { postId } = await params;
  const post = await getPostForEdit(postId);

  if (!post) {
    throw AppError.notFound("Post not found");
  }

  return NextResponse.json({ post });
});

export const PATCH = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) => {
  await requireRole("admin");
  const { postId } = await params;
  const data = await request.json();

  const post = await updatePost(postId, data);
  revalidateTag("blog_posts");
  revalidatePath("/blog");
  return NextResponse.json({ post });
});

export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) => {
  await requireRole("admin");
  const { postId } = await params;

  await deletePost(postId);
  revalidateTag("blog_posts");
  revalidatePath("/blog");
  return NextResponse.json({ success: true });
});
