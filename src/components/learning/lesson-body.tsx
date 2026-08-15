import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import { sanitizeLessonMdx } from "@/lib/learning/lesson-format";
import { lessonMdxComponents } from "./mdx-components";

/**
 * Renders lesson MDX with allowlisted components.
 * Falls back to GFM markdown if MDX compile fails.
 */
export async function LessonBody({ source }: { source: string }) {
  const clean = sanitizeLessonMdx(source);
  if (!clean) {
    return <p className="text-sm text-zinc-500">No lesson content yet.</p>;
  }

  try {
    const { content } = await compileMDX({
      source: clean,
      components: lessonMdxComponents,
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
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={lessonMdxComponents}
        >
          {clean}
        </ReactMarkdown>
      </article>
    );
  }
}
