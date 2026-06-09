const fs = require("fs");
const path = require("path");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DATA_FILE_PATH = path.join(__dirname, "../public/data/local-info.json");
const POSTS_DIR_PATH = path.join(__dirname, "../src/content/posts");

async function run() {
  try {
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY 환경변수가 없습니다.");
      return;
    }

    if (!fs.existsSync(DATA_FILE_PATH)) {
      console.error("데이터 파일이 존재하지 않습니다.");
      return;
    }

    // [1단계] 최신 데이터 확인
    const fileContent = fs.readFileSync(DATA_FILE_PATH, "utf8");
    const dataList = JSON.parse(fileContent);

    if (dataList.length === 0) {
      console.log("데이터가 없습니다.");
      return;
    }

    const lastItem = dataList[dataList.length - 1];

    if (!fs.existsSync(POSTS_DIR_PATH)) {
      fs.mkdirSync(POSTS_DIR_PATH, { recursive: true });
    }

    const files = fs.readdirSync(POSTS_DIR_PATH);
    let alreadyExists = false;

    for (const file of files) {
      if (file.endsWith(".md")) {
        const content = fs.readFileSync(path.join(POSTS_DIR_PATH, file), "utf8");
        if (content.includes(lastItem.name)) {
          alreadyExists = true;
          break;
        }
      }
    }

    if (alreadyExists) {
      console.log("이미 작성된 글입니다");
      return;
    }

    // [2단계] Gemini AI로 블로그 글 생성
    const todayStr = new Date().toISOString().split("T")[0];
    const geminiPrompt = `아래 공공서비스 정보를 바탕으로 블로그 글을 작성해줘.

정보: ${JSON.stringify(lastItem, null, 2)}

아래 형식으로 출력해줘. 반드시 이 형식만 출력하고 다른 텍스트는 없이:
---
title: (친근하고 흥미로운 제목)
date: ${todayStr}
summary: (한 줄 요약)
category: 정보
tags: [태그1, 태그2, 태그3]
---

(본문: 800자 이상, 친근한 블로그 톤, 추천 이유 3가지 포함, 신청 방법 안내)

마지막 줄에 FILENAME: YYYY-MM-DD-keyword 형식으로 파일명도 출력해줘. 키워드는 영문으로.`;

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

    // [3단계] 파일 저장 및 FILENAME 분리 처리
    const filenameRegex = /FILENAME:\s*(.+)/i;
    const match = textResult.match(filenameRegex);
    let targetFileName = "";

    if (match) {
      targetFileName = match[1].trim();
      textResult = textResult.replace(filenameRegex, "").trim();
    } else {
      targetFileName = `${todayStr}-auto-post`;
    }

    if (!targetFileName.endsWith(".md")) {
      targetFileName += ".md";
    }

    // 마크다운 블록 마킹 정소
    if (textResult.startsWith("```markdown")) {
      textResult = textResult.replace(/^```markdown/g, "");
    } else if (textResult.startsWith("```")) {
      textResult = textResult.replace(/^```/g, "");
    }
    if (textResult.endsWith("```")) {
      textResult = textResult.slice(0, -3).trim();
    }
    textResult = textResult.trim();

    const finalPostPath = path.join(POSTS_DIR_PATH, targetFileName);
    fs.writeFileSync(finalPostPath, textResult, "utf8");
    console.log(`블로그 글 생성 완료: ${targetFileName}`);

  } catch (error) {
    console.error("오류 발생:", error);
  }
}

run();
