import * as React from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

interface TextCopyProps extends React.ComponentProps<"div"> {
  text: string;
}

function TextCopy({ text, className, ...props }: TextCopyProps) {
  const [copied, setCopied] = React.useState(false);

  const onCopy = async () => {
    if (copied) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div
      className={cn(
        "bg-muted px-1.5 py-0.5 rounded text-xs font-mono flex items-center gap-1.5 group cursor-default",
        className,
      )}
      {...props}
    >
      <span className="truncate">{text}</span>
      <button
        type="button"
        onClick={onCopy}
        className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
      >
        {copied ? (
          <Check className="h-3 w-3 text-emerald-500" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </button>
    </div>
  );
}

export { TextCopy };
export type { TextCopyProps };
