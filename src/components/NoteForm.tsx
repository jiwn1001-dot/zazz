"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, ChevronDown } from "lucide-react";
import type { Category } from "@/hooks/useNotes";
import { motion } from "framer-motion";

const categories: Exclude<Category, "전체">[] = ["할 일", "아이디어", "기타"];
const categoryIcons: Record<string, string> = {
  "할 일": "📋",
  아이디어: "💡",
  기타: "📌",
};

interface NoteFormProps {
  onAdd: (content: string, category: Category) => void;
}

export default function NoteForm({ onAdd }: NoteFormProps) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Exclude<Category, "전체">>("할 일");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAdd(content.trim(), category);
    setContent("");
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-2xl mx-auto"
    >
      <div className="relative flex-1">
        <Input
          id="note-input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="새로운 메모를 입력하세요..."
          className="h-12 pl-4 pr-4 text-base rounded-xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border-2 border-zinc-200 dark:border-zinc-700 focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:border-amber-400 transition-all placeholder:text-zinc-400"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex shrink-0 items-center justify-center h-12 px-4 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm hover:border-amber-400 transition-all text-sm font-medium whitespace-nowrap outline-none cursor-pointer">
          <span className="mr-1">{categoryIcons[category]}</span>
          {category}
          <ChevronDown size={16} className="ml-1 opacity-50" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {categories.map((cat) => (
            <DropdownMenuItem
              key={cat}
              onClick={() => setCategory(cat)}
              className="cursor-pointer"
            >
              <span className="mr-2">{categoryIcons[cat]}</span>
              {cat}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        type="submit"
        className="h-12 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-semibold shadow-lg shadow-amber-400/25 hover:shadow-amber-500/30 transition-all active:scale-95"
        disabled={!content.trim()}
      >
        <Plus size={20} className="mr-1" />
        추가
      </Button>
    </motion.form>
  );
}
