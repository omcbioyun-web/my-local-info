const fs = require("fs");
const path = require("path");

const PUBLIC_DATA_API_KEY = process.env.PUBLIC_DATA_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DATA_FILE_PATH = path.join(__dirname, "../public/data/local-info.json");

function containsKeyword(item, keyword) {
  const fields = [
    item.serviceNm,
    item["서비스명"],
    item.svcPurpSmr,
    item["서비스목적요약"],
    item.trgtSeNm,
    item["지원대상"],
    item.jurOrgNm,
    item["소관기관명"]
  ];
  return fields.some(val => val && String(val).includes(keyword));
}

async function run() {
  try {
    if (!PUBLIC_DATA_API_KEY) {
      console.error("PUBLIC_DATA_API_KEY 환경변수가 없습니다.");
      return;
    }
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY 환경변수가 없습니다.");
      return;
    }

    // [1단계] 공공데이터포털 API에서 데이터 가져오기
    const url = "https://api.odcloud.kr/api/gov24/v3/serviceList?page=1&perPage=20&returnType=JSON";
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Infuser ${PUBLIC_DATA_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`공공데이터 API 호출 실패: ${response.status}`);
    }

    const resJson = await response.json();
    const dataList = resJson.data || [];

    if (dataList.length === 0) {
      console.log("새로운 데이터가 없습니다");
      return;
    }

    // 필터링 적용
    let filteredList = dataList.filter(item => containsKeyword(item, "성남"));
    if (filteredList.length === 0) {
      filteredList = dataList.filter(item => containsKeyword(item, "경기"));
    }
    if (filteredList.length === 0) {
      filteredList = dataList;
    }

    // [2단계] 기존 데이터와 비교
    let existingData = [];
    if (fs.existsSync(DATA_FILE_PATH)) {
      try {
        existingData = JSON.parse(fs.readFileSync(DATA_FILE_PATH, "utf8"));
      } catch (err) {
        existingData = [];
      }
    }

    const existingNames = new Set(existingData.map(item => item.name).filter(Boolean));
    const newItems = filteredList.filter(item => {
      const name = item.serviceNm || item["서비스명"] || "";
      return name && !existingNames.has(name);
    });

    if (newItems.length === 0) {
      console.log("새로운 데이터가 없습니다");
      return;
    }

    const targetItem = newItems[0];

    // [3단계] Gemini AI로 새 항목 1개만 가공
    const geminiPrompt = `아래 공공데이터 1건을 분석해서 JSON 객체로 변환해줘. 형식:
{id: 숫자, name: 서비스명, category: '행사' 또는 '혜택', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD', location: 장소 또는 기관명, target: 지원대상, summary: 한줄요약, link: 상세URL}
category는 내용을 보고 행사/축제면 '행사', 지원금/서비스면 '혜택'으로 판단해.
startDate가 없으면 오늘 날짜, endDate가 없으면 '상시'로 넣어.
반드시 JSON 객체만 출력해. 다른 텍스트 없이.

공공데이터:
${JSON.stringify(targetItem, null, 2)}`;

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
      throw new Error(`Gemini API 호출 실패: ${geminiRes.status}`);
    }

    const geminiJson = await geminiRes.json();
    let textResult = "";
    if (geminiJson.candidates && geminiJson.candidates[0] && geminiJson.candidates[0].content && geminiJson.candidates[0].content.parts && geminiJson.candidates[0].content.parts[0]) {
      textResult = geminiJson.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Gemini 응답 형식이 올바르지 않습니다.");
    }

    // 마크다운 코드블록 제거
    let cleanJsonText = textResult
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const firstBraceIndex = cleanJsonText.indexOf("{");
    const lastBraceIndex = cleanJsonText.lastIndexOf("}");
    if (firstBraceIndex !== -1 && lastBraceIndex !== -1) {
      cleanJsonText = cleanJsonText.substring(firstBraceIndex, lastBraceIndex + 1);
    }

    const processedItem = JSON.parse(cleanJsonText);

    // [4단계] 기존 데이터에 추가
    let finalData = [];
    if (fs.existsSync(DATA_FILE_PATH)) {
      finalData = JSON.parse(fs.readFileSync(DATA_FILE_PATH, "utf8"));
    }
    finalData.push(processedItem);
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(finalData, null, 2), "utf8");

  } catch (error) {
    console.error("에러 발생:", error);
  }
}

run();
