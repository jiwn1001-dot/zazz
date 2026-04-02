"use client";

import { useState } from "react";
import { useNotes, type Category } from "@/hooks/useNotes";
import { useTheme } from "@/components/ThemeProvider";
import NoteForm from "@/components/NoteForm";
import NoteList from "@/components/NoteList";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, Filter, StickyNote } from "lucide-react";
import { motion } from "framer-motion";

const filterCategories: Category[] = ["전체", "할 일", "아이디어", "기타"];
const filterIcons: Record<Category, string> = {
  전체: "🗂️",
  "할 일": "📋",
  아이디어: "💡",
  기타: "📌",
};

export default function Home() {
  const { notes, mounted, addNote, deleteNote, editNote, reorderNotes } =
    useNotes();
  const { theme, toggleTheme } = useTheme();
  const [filter, setFilter] = useState<Category>("전체");

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="animate-pulse text-4xl">📝</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 transition-colors duration-500">
      {/* Decorative background dots */}
      <div
        className="fixed inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-400/30">
                <StickyNote size={24} className="text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm flex items-center justify-center">
                <span className="text-[8px] text-white font-bold">
                  {notes.length}
                </span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                Sticky Notes
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                할 일을 포스트잇으로 관리하세요
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Category Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex shrink-0 items-center justify-center rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm hover:border-amber-400 transition-all h-10 px-4 text-sm font-medium whitespace-nowrap outline-none cursor-pointer">
                <Filter size={16} className="mr-2 opacity-50" />
                <span className="mr-1">{filterIcons[filter]}</span>
                {filter}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {filterCategories.map((cat) => (
                  <DropdownMenuItem
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className="cursor-pointer"
                  >
                    <span className="mr-2">{filterIcons[cat]}</span>
                    {cat}
                    {cat === "전체" && (
                      <span className="ml-auto text-xs text-zinc-400">
                        {notes.length}
                      </span>
                    )}
                    {cat !== "전체" && (
                      <span className="ml-auto text-xs text-zinc-400">
                        {notes.filter((n) => n.category === cat).length}
                      </span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="h-10 w-10 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm hover:border-amber-400 transition-all"
              title={theme === "dark" ? "라이트 모드" : "다크 모드"}
            >
              <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {theme === "dark" ? (
                  <Sun size={18} className="text-amber-400" />
                ) : (
                  <Moon size={18} className="text-zinc-600" />
                )}
              </motion.div>
            </Button>
          </div>
        </motion.header>

        {/* Note Input Form */}
        <div className="mb-10">
          <NoteForm onAdd={addNote} />
        </div>

        {/* Notes Grid */}
        <NoteList
          notes={notes}
          filter={filter}
          onDelete={deleteNote}
          onEdit={editNote}
          onReorder={reorderNotes}
        />
      </div>
    </div>
  );
}
