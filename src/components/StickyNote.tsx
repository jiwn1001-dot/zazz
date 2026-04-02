"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, Check, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Note } from "@/hooks/useNotes";

interface StickyNoteProps {
  note: Note;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string) => void;
  isNew?: boolean;
  dragHandleProps?: Record<string, unknown>;
}

function formatDate(isoStr: string) {
  const d = new Date(isoStr);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const dayName = days[d.getDay()];
  return `${y}.${m}.${day} ${h}:${min} (${dayName})`;
}

const categoryLabels: Record<string, string> = {
  "할 일": "📋",
  "아이디어": "💡",
  "기타": "📌",
};

export default function StickyNote({
  note,
  onDelete,
  onEdit,
  isNew,
  dragHandleProps,
}: StickyNoteProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(note.content);
  const [isDeleting, setIsDeleting] = useState(false);

  const color = JSON.parse(note.color) as {
    bg: string;
    dark: string;
    border: string;
    text: string;
  };

  const handleSave = () => {
    if (editValue.trim()) {
      onEdit(note.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(note.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => onDelete(note.id), 300);
  };

  return (
    <AnimatePresence>
      {!isDeleting && (
        <motion.div
          layout
          initial={isNew ? { scale: 0.3, opacity: 0, rotate: -10 } : false}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.5, opacity: 0, rotate: 5 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 20,
            mass: 0.8,
          }}
          whileHover={{
            scale: 1.03,
            rotate: Math.random() > 0.5 ? 1.5 : -1.5,
            boxShadow: "0 12px 28px rgba(0,0,0,0.15)",
            transition: { duration: 0.2 },
          }}
          className="relative group cursor-grab active:cursor-grabbing"
          style={{
            backgroundColor: color.bg,
            borderLeft: `4px solid ${color.border}`,
            borderRadius: "4px",
            padding: "20px",
            minHeight: "160px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "2px 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          {/* Top bar: drag handle + category + action buttons */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span
                {...dragHandleProps}
                className="opacity-0 group-hover:opacity-50 transition-opacity cursor-grab active:cursor-grabbing"
              >
                <GripVertical size={16} style={{ color: color.text }} />
              </span>
              {note.category !== "전체" && (
                <span className="text-sm" title={note.category}>
                  {categoryLabels[note.category] || ""}
                </span>
              )}
            </div>

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!isEditing && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-black/10 dark:hover:bg-white/10"
                    onClick={() => setIsEditing(true)}
                    title="편집"
                  >
                    <Pencil size={14} style={{ color: color.text }} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-red-200/60"
                    onClick={handleDelete}
                    title="삭제"
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1">
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                    if (e.key === "Escape") handleCancel();
                  }}
                  className="text-sm border-none shadow-none focus-visible:ring-1 bg-white/50"
                  style={{ color: color.text }}
                  autoFocus
                />
                <div className="flex gap-1 justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handleSave}
                    title="저장"
                  >
                    <Check size={14} style={{ color: color.text }} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handleCancel}
                    title="취소"
                  >
                    <X size={14} style={{ color: color.text }} />
                  </Button>
                </div>
              </div>
            ) : (
              <p
                className="text-sm leading-relaxed whitespace-pre-wrap break-words"
                style={{ color: color.text }}
              >
                {note.content}
              </p>
            )}
          </div>

          {/* Bottom: date */}
          <div className="mt-3 pt-2" style={{ borderTop: `1px solid ${color.border}40` }}>
            <span
              className="text-[11px] leading-none"
              style={{ color: color.text, opacity: 0.45 }}
            >
              {formatDate(note.createdAt)}
            </span>
          </div>

          {/* Pin effect */}
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full shadow-md"
            style={{
              background: `radial-gradient(circle at 35% 35%, ${color.border}, ${color.bg})`,
              border: `1px solid ${color.border}`,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
