import { BlogPostDetail } from '@/components/BlogPostDetail';

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BlogPostDetail slug={slug} />;
}
