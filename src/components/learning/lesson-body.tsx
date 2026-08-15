import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import { sanitizeLessonMdx } from "@/lib/learning/lesson-format";
import { extractLessonToc, type TocEntry } from "@/lib/learning/lesson-toc";
import { createLessonMdxComponents } from "./mdx-components";

/**
 * Renders lesson MDX with allowlisted components.
 * Falls back to GFM markdown if MDX compile fails.
 * H2 ids align with extractLessonToc when toc is passed (or derived).
 */
export async function LessonBody({
  source,
  toc,
}: {
  source: string;
  toc?: TocEntry[];
}) {
  const clean = sanitizeLessonMdx(source);
  if (!clean) {
    return <p className="text-sm text-muted">No lesson content yet.</p>;
  }

  const entries = toc ?? extractLessonToc(clean);
  const components = createLessonMdxComponents(entries);

  try {
    const { content } = await compileMDX({
      source: clean,
      components,
      options: {
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          development: process.env.NODE_ENV === "development",
        },
      },
    });
    return <article className="lesson-mdx max-w-none">{content}</article>;
  } catch (e) {
    console.warn("[lesson-body] MDX compile failed, markdown fallback", e);
    return (
      <article className="lesson-mdx max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {clean}
        </ReactMarkdown>
      </article>
    );
  }
}
