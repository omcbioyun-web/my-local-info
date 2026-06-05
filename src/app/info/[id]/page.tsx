import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";

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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InfoDetailPage({ params }: PageProps) {
  // 1. Next.js 15+ 규격에 맞게 params를 await로 풀어냅니다.
  const { id } = await params;

  // 2. JSON 파일로부터 전체 데이터를 읽어옵니다.
  const filePath = path.join(process.cwd(), "public", "data", "local-info.json");
  let items: InfoItem[] = [];

  try {
    const fileData = fs.readFileSync(filePath, "utf8");
    items = JSON.parse(fileData);
  } catch (error) {
    console.error("데이터를 불러오는 중 에러가 발생했습니다:", error);
  }

  // 3. 해당하는 id를 가진 항목을 찾습니다.
  const item = items.find((x) => x.id === id);

  // 데이터가 없을 경우 Next.js의 404 페이지로 안내합니다.
  if (!item) {
    notFound();
  }

  // 카테고리에 맞는 뱃지 텍스트와 스타일을 설정합니다.
  const isEvent = item.category === "event";
  const categoryLabel = isEvent ? "🎉 행사/축제" : "💰 지원금/혜택";
  const categoryStyle = isEvent
    ? "text-amber-700 bg-amber-50 border-amber-100"
    : "text-emerald-700 bg-emerald-50 border-emerald-100";

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#4A3E3D] font-sans antialiased selection:bg-orange-100">
      
      {/* 상단 헤더 영역 */}
      <header className="sticky top-0 z-50 bg-[#FFFDF9]/85 backdrop-blur-md border-b border-orange-100/55">
        <div className="max-w-3xl mx-auto px-4 py-4 sm:px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-orange-950 font-bold hover:text-orange-700 transition-colors">
            <span className="text-xl">🏡</span>
            <span>성남시 생활 정보</span>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-orange-800 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100 hover:bg-orange-100 transition-colors"
          >
            ← 전체 목록
          </Link>
        </div>
      </header>

      {/* 메인 상세 내용 영역 */}
      <main className="max-w-3xl mx-auto px-4 py-12 sm:px-6">
        
        {/* 뒤로가기 링크 */}
        <div className="mb-6">
          <Link href="/" className="text-sm font-semibold text-orange-700 hover:text-orange-600 transition-colors inline-flex items-center gap-1">
            <span>←</span> 목록으로 돌아가기
          </Link>
        </div>

        {/* 메인 카드 박스 */}
        <article className="bg-white rounded-3xl border border-orange-100/70 shadow-sm p-6 sm:p-10 space-y-8">
          
          {/* 상단 타이틀 부 */}
          <div className="space-y-4">
            <div>
              <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-md border ${categoryStyle}`}>
                {categoryLabel}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-850 tracking-tight leading-tight">
              {item.name}
            </h2>
          </div>

          {/* 핵심 요약 정보 그리드 */}
          <div className="grid gap-4 sm:grid-cols-2 p-6 bg-stone-50 rounded-2xl border border-stone-100 text-sm">
            <div className="space-y-1">
              <span className="text-stone-400 block text-xs font-semibold">📍 장소 / 신청처</span>
              <span className="font-semibold text-stone-700">{item.location}</span>
            </div>
            <div className="space-y-1">
              <span className="text-stone-400 block text-xs font-semibold">👥 대상자 조건</span>
              <span className="font-semibold text-stone-700">{item.target}</span>
            </div>
            <div className="space-y-1 sm:col-span-2 border-t border-stone-200/60 pt-3 mt-1">
              <span className="text-stone-400 block text-xs font-semibold">📅 {isEvent ? "행사 기간" : "접수/이용 기간"}</span>
              <span className="font-semibold text-stone-700">
                {item.startDate === item.endDate
                  ? item.startDate
                  : `${item.startDate} ~ ${item.endDate}`}
              </span>
            </div>
          </div>

          {/* 상세 설명 전문 */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-stone-800 border-b border-orange-100 pb-2">
              상세 설명
            </h3>
            <p className="text-base text-stone-600 leading-relaxed whitespace-pre-wrap">
              {item.summary}
            </p>
          </div>

          {/* 원본 사이트 안내 및 버튼 */}
          <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-xs text-stone-400">
              * 본 정보는 공공기관 사이트의 공고 내용을 요약한 것입니다. <br />
              정확한 정보 및 변동 사항은 원본 링크를 통해 공식 안내를 확인해 주세요.
            </div>
            <a
              href={item.link}
              className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-sm hover:shadow transition-all text-center"
            >
              공식 홈페이지 보기
              <span className="text-xs">→</span>
            </a>
          </div>

        </article>

      </main>

      {/* 하단 푸터 영역 */}
      <footer className="bg-stone-100 border-t border-stone-200 mt-20 text-stone-500 text-xs sm:text-sm">
        <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="font-semibold text-stone-700">우리 동네 생활 정보 서비스</p>
              <p className="mt-1">공공데이터포털 데이터를 기반으로 제공되는 생활 정보입니다.</p>
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
