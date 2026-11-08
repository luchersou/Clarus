import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AnalysisResultViewProps {
  content: string;
}

export function AnalysisResultView({ content }: AnalysisResultViewProps) {
  return (
    <div className="prose prose-sm prose-theme max-w-none overflow-x-auto prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-relaxed prose-li:my-0.5 prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-table:my-3 prose-th:text-left first:prose-headings:mt-0 first:prose-p:mt-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
