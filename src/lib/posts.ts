import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface Post {
  slug: string;
  title: string;
  date: string;
  summary: string;
  category: string;
  tags: string[];
  content: string;
}

const postsDirectory = path.join(process.cwd(), "src/content/posts");

// YYYY-MM-DD 형식의 문자열로 날짜를 변환하는 헬퍼 함수
function formatDate(dateValue: any): string {
  if (!dateValue) return "";
  if (dateValue instanceof Date) {
    // UTC 시간차로 인해 날짜가 하루 밀리는 현상을 방지하기 위해 로컬 날짜 기준으로 포맷팅합니다.
    const year = dateValue.getFullYear();
    const month = String(dateValue.getMonth() + 1).padStart(2, "0");
    const day = String(dateValue.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return String(dateValue);
}

// 모든 블로그 포스트를 읽어옵니다.
export function getAllPosts(): Post[] {
  // 폴더가 존재하지 않는 경우를 대비해 예외 처리를 합니다.
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");

      // gray-matter로 frontmatter와 content를 분리합니다.
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title || "",
        date: formatDate(data.date),
        summary: data.summary || "",
        category: data.category || "일반",
        tags: Array.isArray(data.tags) ? data.tags : [],
        content,
      };
    });

  // 최근 날짜 순으로 정렬합니다.
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else if (a.date > b.date) {
      return -1;
    } else {
      return 0;
    }
  });
}

// 슬러그(slug)명을 기준으로 단일 포스트를 읽어옵니다.
export function getPostBySlug(slug: string): Post | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || "",
      date: formatDate(data.date),
      summary: data.summary || "",
      category: data.category || "일반",
      tags: Array.isArray(data.tags) ? data.tags : [],
      content,
    };
  } catch (error) {
    console.error(`포스트를 읽어오는 중 에러 발생 (${slug}):`, error);
    return null;
  }
}
