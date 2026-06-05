import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAllPosts, getPostBySlug } from "@/lib/posts";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#4A3E3D] font-sans antialiased selection:bg-orange-100">
      
      {/* 상단 헤더 영역 */}
      <header className="sticky top-0 z-50 bg-[#FFFDF9]/85 backdrop-blur-md border-b border-orange-100/55">
        <div className="max-w-3xl mx-auto px-4 py-4 sm:px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-orange-950 font-bold hover:text-orange-700 transition-colors">
            <span className="text-xl">🏡</span>
            <span>성남시 생활 정보</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/" className="text-orange-850 hover:text-orange-600 transition-colors">소식 홈</Link>
            <Link href="/blog" className="text-orange-600 font-bold border-b-2 border-orange-600 pb-0.5">블로그</Link>
          </nav>
        </div>
      </header>

      {/* 메인 상세 내용 영역 */}
      <main className="max-w-3xl mx-auto px-4 py-12 sm:px-6">
        
        {/* 뒤로가기 링크 */}
        <div className="mb-6">
          <Link href="/blog" className="text-sm font-semibold text-orange-700 hover:text-orange-600 transition-colors inline-flex items-center gap-1">
            <span>←</span> 블로그 목록으로 돌아가기
          </Link>
        </div>

        {/* 본문 카드 */}
        <article className="bg-white rounded-3xl border border-orange-100/70 shadow-sm p-6 sm:p-10 space-y-8">
          
          {/* 상단 포스트 헤더 */}
          <div className="space-y-4 border-b border-stone-100 pb-6">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-orange-700 bg-orange-50 px-2.5 py-1 rounded border border-orange-100">
                {post.category}
              </span>
              <span className="text-stone-400 font-medium">{post.date}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-850 tracking-tight leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* 블로그 포스트 본문 렌더링 (Markdown) */}
          {/* Tailwind Typography(prose)가 활성화되어 마크다운 형식을 매우 아름답게 그려줍니다 */}
          <div className="prose prose-orange max-w-none text-stone-700 leading-relaxed text-sm sm:text-base">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>

          {/* 광고 / 쿠팡 파트너스 배너 영역 예시 (나중에 적용 가능하게 뼈대 구성) */}
          <div className="mt-12 p-6 bg-amber-50/50 rounded-2xl border border-orange-100/60 text-center space-y-2">
            <p className="text-xs text-orange-800/60 font-semibold">📢 우리 동네 추천 상품 및 정보</p>
            <div className="h-24 bg-orange-100/30 rounded-xl flex items-center justify-center border border-orange-200/40 border-dashed">
              <span className="text-xs text-orange-800/70">이곳에 쿠팡 파트너스 배너 또는 광고가 삽입될 공간입니다.</span>
            </div>
          </div>

        </article>

      </main>

      {/* 하단 푸터 영역 */}
      <footer className="bg-stone-100 border-t border-stone-200 mt-20 text-stone-500 text-xs sm:text-sm">
        <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="font-semibold text-stone-700">우리 동네 생활 정보 서비스</p>
              <p className="mt-1">AI 자동 작성 기능과 공공데이터포털 정보를 기반으로 한 블로그입니다.</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[10px] text-stone-400">© 2026 우리 동네 생활 정보. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
