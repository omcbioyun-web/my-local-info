const fs = require("fs");
const path = require("path");

const PUBLIC_DATA_API_KEY = process.env.PUBLIC_DATA_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DATA_FILE_PATH = path.join(__dirname, "../public/data/local-info.json");

// Helper: 문자열 내에 특정 키워드가 포함되어 있는지 검사 (대소문자 무시)
function itemContains(item, keyword) {
  for (const key in item) {
    if (Object.prototype.hasOwnProperty.call(item, key) && item[key]) {
      const valStr = String(item[key]);
      if (valStr.includes(keyword)) {
        return true;
      }
    }
  }
  return false;
}

async function run() {
  try {
    // 0. 필수 환경변수 확인
    if (!PUBLIC_DATA_API_KEY) {
      console.error("에러: PUBLIC_DATA_API_KEY 환경변수가 설정되지 않았습니다.");
      process.exit(1);
    }
    if (!GEMINI_API_KEY) {
      console.error("에러: GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");
      process.exit(1);
    }

    // 1단계: 공공데이터포털 API에서 데이터 가져오기
    console.log("공공데이터 API로부터 데이터를 가져옵니다...");
    // 공공데이터포털은 보통 서비스 키를 쿼리 매개변수로 전달해야 올바르게 동작합니다.
    const url = `https://api.odcloud.kr/api/gov24/v3/serviceList?page=1&perPage=20&returnType=JSON&serviceKey=${encodeURIComponent(PUBLIC_DATA_API_KEY)}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "accept": "*/*",
        // Authorization 헤더 방식을 병행 요구하는 경우를 대비해 추가
        "Authorization": `Infuser ${PUBLIC_DATA_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`공공데이터 API 응답 실패: ${response.status} ${response.statusText}`);
    }

    const resJson = await response.json();
    const dataList = resJson.data || [];

    if (dataList.length === 0) {
      console.log("수집된 공공데이터가 없습니다.");
      return;
    }

    // 필터링 규칙 적용
    let filteredList = dataList.filter(item => itemContains(item, "성남"));
    if (filteredList.length > 0) {
      console.log(`'성남' 키워드 매칭 항목 발견: ${filteredList.length}건`);
    } else {
      filteredList = dataList.filter(item => itemContains(item, "경기"));
      if (filteredList.length > 0) {
        console.log(`'성남'이 없어 '경기' 키워드 매칭 항목 적용: ${filteredList.length}건`);
      } else {
        filteredList = dataList;
        console.log(`매칭 키워드가 없어 전체 데이터 사용: ${filteredList.length}건`);
      }
    }

    // 2단계: 기존 데이터와 비교
    let existingData = [];
    if (fs.existsSync(DATA_FILE_PATH)) {
      try {
        const fileContent = fs.readFileSync(DATA_FILE_PATH, "utf8");
        existingData = JSON.parse(fileContent);
      } catch (err) {
        console.error("기존 데이터 파일을 읽는 데 실패했습니다. 새 리스트로 대체합니다.", err);
      }
    }

    // 이름(name 또는 서비스명으로 추정되는 기존 데이터 이름) 기준으로 중복 제거
    const existingNames = new Set(existingData.map(item => item.name));
    
    // API 데이터 중 서비스명에 해당하는 필드 찾기 (보통 serviceNm 또는 서비스명)
    const newItems = filteredList.filter(item => {
      const name = item.serviceNm || item["서비스명"] || "";
      return name && !existingNames.has(name);
    });

    if (newItems.length === 0) {
      console.log("새로운 데이터가 없습니다");
      return;
    }

    // 새로운 항목 1개만 처리
    const targetItem = newItems[0];
    console.log(`새로운 항목 가공 시작: ${targetItem.serviceNm || targetItem["서비스명"]}`);

    // 3단계: Gemini AI로 새 항목 가공
    const todayStr = new Date().toISOString().split("T")[0];
    const geminiPrompt = `아래 공공데이터 1건을 분석해서 JSON 객체로 변환해줘. 형식:
{id: 숫자, name: 서비스명, category: '행사' 또는 '혜택', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD', location: 장소 또는 기관명, target: 지원대상, summary: 한줄요약, link: 상세URL}
category는 내용을 보고 행사/축제면 '행사', 지원금/서비스면 '혜택'으로 판단해.
startDate가 없으면 오늘 날짜('${todayStr}'), endDate가 없으면 '상시'로 넣어.
반드시 JSON 객체만 출력해. 다른 텍스트 없이.

[공공데이터 내용]
${JSON.stringify(targetItem, null, 2)}`;

    console.log("Gemini API에 변환 요청을 전송합니다...");
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: geminiPrompt
              }
            ]
          }
        ]
      })
    });

    if (!geminiRes.ok) {
      throw new Error(`Gemini API 호출 실패: ${geminiRes.status} ${geminiRes.statusText}`);
    }

    const geminiJson = await geminiRes.json();
    let textResult = "";
    try {
      textResult = geminiJson.candidates[0].content.parts[0].text;
    } catch (e) {
      throw new Error("Gemini 응답 구조 파싱 실패");
    }

    // 마크다운 코드블록 제거
    let cleanJsonText = textResult
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    // 혹시라도 앞뒤에 불필요한 텍스트가 묻어있을 경우 중괄호 범위만 추출
    const firstBraceIndex = cleanJsonText.indexOf("{");
    const lastBraceIndex = cleanJsonText.lastIndexOf("}");
    if (firstBraceIndex !== -1 && lastBraceIndex !== -1) {
      cleanJsonText = cleanJsonText.substring(firstBraceIndex, lastBraceIndex + 1);
    }

    const processedItem = JSON.parse(cleanJsonText);

    // 기존 UI의 스키마에 맞추기 위해 category 값을 event / welfare 로 변경합니다.
    if (processedItem.category === "행사" || processedItem.category === "event") {
      processedItem.category = "event";
    } else {
      processedItem.category = "welfare";
    }

    // 고유 ID 부여 (기존 리스트 개수 기반 또는 랜덤 고유 스트링)
    processedItem.id = `${processedItem.category}-${Date.now()}`;

    // 4단계: 기존 데이터에 추가
    existingData.push(processedItem);
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(existingData, null, 2), "utf8");
    console.log(`성공적으로 새로운 정보가 추가되었습니다! 추가된 항목: ${processedItem.name}`);

  } catch (error) {
    console.error("실행 중 에러가 발생했습니다. 기존 데이터 파일을 보존합니다.", error);
  }
}

run();
