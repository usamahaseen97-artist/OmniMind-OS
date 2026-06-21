"use client";

import dynamic from "next/dynamic";

const MarkdownMessageBody = dynamic(
  () => import("./MarkdownMessageBody").then((m) => ({ default: m.MarkdownMessageBody })),
  {
    ssr: false,
    loading: () => <p className="text-sm text-zinc-500">Rendering message…</p>,
  },
);

interface MarkdownMessageProps {
  content: string;
  isUser?: boolean;
}

export function MarkdownMessage({ content, isUser }: MarkdownMessageProps) {
  return <MarkdownMessageBody content={content} isUser={isUser} />;
}
