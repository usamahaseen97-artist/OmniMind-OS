"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { proxiedImageUrl, isLikelyImageUrl } from "../../lib/live-render-pipeline";

interface MarkdownMessageBodyProps {
  content: string;
  isUser?: boolean;
}

function MarkdownImage({
  src,
  alt,
}: {
  src?: string;
  alt?: string;
}) {
  const resolved = src && isLikelyImageUrl(src) ? proxiedImageUrl(src) : "";
  if (!resolved) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt={alt ?? "Generated image"}
      className="my-3 max-h-[420px] w-full rounded-xl border border-neon-green/25 bg-black/60 object-contain"
      loading="lazy"
    />
  );
}

export function MarkdownMessageBody({ content, isUser }: MarkdownMessageBodyProps) {
  return (
    <div
      className={`prose prose-invert max-w-none text-sm leading-relaxed ${
        isUser ? "prose-p:text-zinc-100" : "prose-p:text-zinc-300 prose-headings:text-neon-green"
      } prose-pre:bg-black/60 prose-pre:border prose-pre:border-neon-green/20 prose-code:text-neon-green prose-code:before:content-none prose-code:after:content-none prose-a:text-neon-green`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img({ src, alt }) {
            const href = typeof src === "string" ? src : undefined;
            return <MarkdownImage src={href} alt={alt} />;
          },
          pre({ children }) {
            return (
              <pre className="my-3 overflow-x-auto rounded-lg border border-[#00ff8833] bg-black/50 p-4 font-mono text-xs">
                {children}
              </pre>
            );
          },
          code({ className, children, ...props }) {
            const inline = !className;
            if (inline) {
              return (
                <code className="rounded bg-neon-green/10 px-1.5 py-0.5 font-mono text-neon-green" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
