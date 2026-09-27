import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AnalysisResultViewProps {
  content: string;
}

export function AnalysisResultView({ content }: AnalysisResultViewProps) {
  return (
    <div className="prose prose-sm prose-neutral max-w-none overflow-x-auto">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}