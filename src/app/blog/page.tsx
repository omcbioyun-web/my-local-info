import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function BlogListPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#4A3E3D] font-sans antialiased selection:bg-orange-100">
      
      {/* 상단 헤더 영역 */}
      <header className="sticky top-0 z-50 bg-[#FFFDF9]/85 backdrop-blur-md border-b border-orange-100/55">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-orange-950 font-bold hover:text-orange-700 transition-colors">
            <span className="text-xl">🏡</span>
            <span className="text-lg sm:text-xl">성남시 생활 정보</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/" className="text-orange-850 hover:text-orange-600 transition-colors">소식 홈</Link>
            <Link href="/blog" className="text-orange-600 font-bold border-b-2 border-orange-600 pb-0.5">블로그</Link>
          </nav>
        </div>
      </header>

      {/* 메인 블로그 목록 영역 */}
      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 space-y-10">
        
        {/* 인트로 정보 */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
            AI 추천 로컬 가이드
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-orange-950 tracking-tight">
            우리 동네 생활 백과
          </h2>
          <p className="text-sm text-orange-800/80 leading-relaxed max-w-xl">
            생활 혜택, 행사 정보부터 유익한 팁까지 AI가 실시간 동네 데이터를 분석하여 재미있고 친절하게 전해드립니다.
          </p>
        </div>

        {/* 게시글 목록 */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-orange-100/60 p-8">
              <span className="text-4xl block mb-4">📭</span>
              <p className="text-stone-500 font-medium text-sm">아직 등록된 블로그 글이 없습니다.</p>
              <p className="text-xs text-stone-400 mt-1">AI가 유용한 글을 작성할 예정이니 잠시만 기다려 주세요!</p>
            </div>
          ) : (
            posts.map((post) => (
              <article
                key={post.slug}
                className="group bg-white rounded-3xl border border-orange-100/60 p-6 sm:p-8 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* 상단 메타정보 */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                      {post.category}
                    </span>
                    <span className="text-stone-400 font-medium">{post.date}</span>
                  </div>

                  {/* 제목 */}
                  <Link href={`/blog/${post.slug}`} className="block">
                    <h3 className="text-xl font-bold text-stone-850 group-hover:text-orange-600 transition-colors leading-snug">
                      {post.title}
                    </h3>
                  </Link>

                  {/* 요약 */}
                  <p className="text-sm text-stone-650 leading-relaxed line-clamp-3">
                    {post.summary}
                  </p>
                </div>

                {/* 하단 태그 및 이동 링크 */}
                <div className="mt-6 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    읽어보기
                    <span className="text-[10px] group-hover:translate-x-0.5 transition-transform">→</span>
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>

      </main>

      {/* 하단 푸터 영역 */}
      <footer className="bg-stone-100 border-t border-stone-200 mt-24 text-stone-500 text-xs sm:text-sm">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 space-y-4">
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
