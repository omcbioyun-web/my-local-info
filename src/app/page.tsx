import fs from "fs";
import path from "path";
import Link from "next/link";

interface InfoItem {
  id: string;
  name: string;
  category: "event" | "welfare";
  startDate: string;
  endDate: string;
  location: string;
  target: string;
  summary: string;
  link: string;
}

export default function Home() {
  // 1. JSON 파일로부터 샘플 데이터를 동기식으로 읽어옵니다.
  // Next.js App Router의 기본 페이지 컴포넌트는 서버 컴포넌트이므로, 서버 사이드에서 직접 파일을 읽을 수 있습니다.
  const filePath = path.join(process.cwd(), "public", "data", "local-info.json");
  let data: InfoItem[] = [];

  try {
    const fileData = fs.readFileSync(filePath, "utf8");
    data = JSON.parse(fileData);
  } catch (error) {
    console.error("데이터 파일을 읽어오는 중 에러가 발생했습니다:", error);
  }

  // 2. 행사/축제 데이터와 지원금/혜택 데이터를 카테고리별로 나눕니다.
  const events = data.filter((item) => item.category === "event");
  const welfares = data.filter((item) => item.category === "welfare");

  // 현재 날짜 기준 마지막 업데이트 표시용
  const today = new Date();
  const lastUpdated = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#4A3E3D] font-sans antialiased selection:bg-orange-100">
      
      {/* 상단 헤더 영역 */}
      <header className="sticky top-0 z-50 bg-[#FFFDF9]/85 backdrop-blur-md border-b border-orange-100/55 transition-all">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏡</span>
            <h1 className="text-xl font-bold tracking-tight text-orange-950 sm:text-2xl">
              성남시 생활 정보
            </h1>
          </div>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <a href="#events" className="text-orange-800 hover:text-orange-600 transition-colors">행사·축제</a>
            <a href="#welfares" className="text-orange-800 hover:text-orange-600 transition-colors">지원금·혜택</a>
            <Link href="/blog" className="text-orange-850 hover:text-orange-600 transition-colors font-semibold">블로그</Link>
            <span className="text-orange-200">|</span>
            <span className="text-xs text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
              실시간 동네 소식
            </span>
          </nav>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-16">
        
        {/* 인트로 배너 */}
        <section className="bg-gradient-to-br from-amber-50 to-orange-100/60 rounded-3xl p-6 sm:p-10 border border-orange-100/50 shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block text-xs font-semibold text-orange-600 bg-white px-3 py-1.5 rounded-full border border-orange-200/50 shadow-sm mb-4">
              오늘의 우리 동네 소식
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-orange-950 tracking-tight leading-tight">
              성남시의 알짜배기 행사와 <br className="sm:hidden" />
              혜택 정보를 한눈에!
            </h2>
            <p className="mt-3 text-sm sm:text-base text-orange-800/80 leading-relaxed">
              공공데이터를 기반으로 실시간 수집된 성남시의 소식들을 모았습니다. 매일 아침 업데이트되는 생생한 동네 정보를 지금 확인해 보세요.
            </p>
          </div>
          {/* 장식용 배경 도형 */}
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-orange-200/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-12 top-4 w-32 h-32 bg-amber-200/20 rounded-full blur-xl pointer-events-none" />
        </section>

        {/* 1. 이번 달 행사/축제 목록 */}
        <section id="events" className="scroll-mt-24">
          <div className="flex items-center gap-2 mb-6 border-b border-orange-100 pb-3">
            <span className="text-2xl">✨</span>
            <h3 className="text-xl sm:text-2xl font-bold text-orange-950">이번 달 행사 / 축제</h3>
            <span className="ml-2 text-xs font-medium text-orange-600 bg-orange-100/70 px-2 py-0.5 rounded">
              {events.length}건
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <article
                key={event.id}
                className="group flex flex-col bg-white rounded-2xl border border-orange-100/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
              >
                <div className="p-6 flex-1 flex flex-col">
                  {/* 카테고리 태그 */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100">
                      🎉 행사/축제
                    </span>
                    <span className="text-xs text-stone-400 font-medium">성남시</span>
                  </div>

                  {/* 제목 */}
                  <h4 className="text-lg font-bold text-stone-800 mb-2 group-hover:text-orange-600 transition-colors">
                    {event.name}
                  </h4>

                  {/* 설명 */}
                  <p className="text-sm text-stone-600 leading-relaxed mb-6 flex-1">
                    {event.summary}
                  </p>

                  {/* 상세 스펙 */}
                  <div className="space-y-2 border-t border-stone-100 pt-4 text-xs text-stone-500">
                    <div className="flex items-center gap-2">
                      <span className="text-stone-400">📅 기간:</span>
                      <span className="font-medium text-stone-700">
                        {event.startDate === event.endDate
                          ? event.startDate
                          : `${event.startDate} ~ ${event.endDate}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-stone-400">📍 장소:</span>
                      <span className="font-medium text-stone-700">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-stone-400">👥 대상:</span>
                      <span className="font-medium text-stone-700 truncate">{event.target}</span>
                    </div>
                  </div>
                </div>

                {/* 링크 버튼 */}
                <div className="px-6 py-4 bg-stone-50/50 border-t border-stone-100 flex justify-end">
                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    자세히 보기
                    <span className="text-[10px] group-hover:translate-x-0.5 transition-transform">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 2. 지원금/혜택 정보 목록 */}
        <section id="welfares" className="scroll-mt-24">
          <div className="flex items-center gap-2 mb-6 border-b border-orange-100 pb-3">
            <span className="text-2xl">🎁</span>
            <h3 className="text-xl sm:text-2xl font-bold text-orange-950">지원금 / 혜택</h3>
            <span className="ml-2 text-xs font-medium text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded">
              {welfares.length}건
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {welfares.map((welfare) => (
              <article
                key={welfare.id}
                className="group flex flex-col bg-white rounded-2xl border border-orange-100/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
              >
                <div className="p-6 flex-1 flex flex-col">
                  {/* 카테고리 태그 */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                      💰 지원금/혜택
                    </span>
                    <span className="text-xs text-stone-400 font-medium">정부/지자체</span>
                  </div>

                  {/* 제목 */}
                  <h4 className="text-lg font-bold text-stone-800 mb-2 group-hover:text-orange-600 transition-colors">
                    {welfare.name}
                  </h4>

                  {/* 설명 */}
                  <p className="text-sm text-stone-600 leading-relaxed mb-6 flex-1">
                    {welfare.summary}
                  </p>

                  {/* 상세 스펙 */}
                  <div className="space-y-2 border-t border-stone-100 pt-4 text-xs text-stone-500">
                    <div className="flex items-center gap-2">
                      <span className="text-stone-400">👥 대상자:</span>
                      <span className="font-medium text-stone-700">{welfare.target}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-stone-400">📍 신청처:</span>
                      <span className="font-medium text-stone-700">{welfare.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-stone-400">📅 접수일:</span>
                      <span className="font-medium text-stone-700">상시 및 공고 참조</span>
                    </div>
                  </div>
                </div>

                {/* 링크 버튼 */}
                <div className="px-6 py-4 bg-stone-50/50 border-t border-stone-100 flex justify-end">
                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    신청방법 확인하기
                    <span className="text-[10px] group-hover:translate-x-0.5 transition-transform">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

      </main>

      {/* 하단 푸터 영역 */}
      <footer className="bg-stone-100 border-t border-stone-200 mt-20 text-stone-500 text-xs sm:text-sm">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="font-semibold text-stone-700">우리 동네 생활 정보 서비스</p>
              <p className="mt-1">공공데이터포털(data.go.kr)의 오픈 API 데이터를 기반으로 제공됩니다.</p>
            </div>
            <div className="text-left sm:text-right">
              <p>최근 업데이트: <span className="font-medium text-stone-700">{lastUpdated}</span></p>
              <p className="mt-1 text-[10px] text-stone-400">© 2026 우리 동네 생활 정보. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
