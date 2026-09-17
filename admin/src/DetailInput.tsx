import { useRef } from "react";
import { X, Bold } from "lucide-react";

interface DetailInputProps {
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  placeholder?: string;
}

export function DetailInput({ value, onChange, onRemove, placeholder }: DetailInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function wrapInBold() {
    if (!inputRef.current) return;
    const start = inputRef.current.selectionStart || 0;
    const end = inputRef.current.selectionEnd || 0;
    const beforeText = value.substring(0, start);
    const selectedText = value.substring(start, end) || "bold text";
    const afterText = value.substring(end);
    const newValue = `${beforeText}**${selectedText}**${afterText}`;
    onChange(newValue);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newStart = start + 2;
        const newEnd = newStart + selectedText.length;
        inputRef.current.setSelectionRange(newStart, newEnd);
      }
    }, 0);
  }

  return (
    <div className="flex gap-2 items-stretch">
      <div className="flex-1 relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Detail text"}
          className="w-full bg-[#0f0f0f] border border-neutral-700 px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#b08d57] transition-colors"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-neutral-600">
          Use **text** for bold
        </span>
      </div>
      <button
        type="button"
        onClick={wrapInBold}
        title="Wrap selection in bold"
        className="bg-[#0f0f0f] border border-neutral-700 px-2.5 py-2.5 text-[#b08d57] hover:bg-[#b08d57]/20 transition-colors flex items-center justify-center"
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="text-neutral-600 hover:text-red-400 transition-colors shrink-0 px-2.5 py-2.5 flex items-center justify-center border border-neutral-700 bg-[#0f0f0f]"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function parseDetailMarkdown(text: string) {
  // Replace **text** with <strong>text</strong>
  return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}
