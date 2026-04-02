"use client";

import { useState, useEffect, useCallback } from "react";

export type Category = "전체" | "할 일" | "아이디어" | "기타";

export interface Note {
  id: string;
  content: string;
  color: string;
  category: Category;
  createdAt: string;
}

const STORAGE_KEY = "postit-notes";

const COLORS = [
  // Yellow
  { bg: "#FEF9C3", dark: "#854D0E", border: "#FDE047", text: "#713F12" },
  // Pink
  { bg: "#FCE7F3", dark: "#9D174D", border: "#F9A8D4", text: "#831843" },
  // Green
  { bg: "#DCFCE7", dark: "#166534", border: "#86EFAC", text: "#14532D" },
  // Blue
  { bg: "#DBEAFE", dark: "#1E40AF", border: "#93C5FD", text: "#1E3A5F" },
];

function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// Background syncing helper
async function syncToGoogleSheets(action: "create" | "update" | "delete", note: Note) {
  try {
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        data: {
          timestamp: note.id,
          datetime: note.createdAt,
          category: note.category,
          content: note.content,
          color: note.color,
        },
      }),
    });
  } catch (error) {
    console.error(`Failed to sync [${action}] to Google Sheets:`, error);
  }
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setNotes(JSON.parse(stored));
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes, mounted]);

  const addNote = useCallback(
    (content: string, category: Category) => {
      const color = JSON.stringify(getRandomColor());
      const newNote: Note = {
        id: generateId(),
        content,
        color,
        category,
        createdAt: new Date().toISOString(),
      };
      setNotes((prev) => [newNote, ...prev]);
      
      // Sync to backend
      syncToGoogleSheets("create", newNote);
    },
    []
  );

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => {
      const targetNote = prev.find((n) => n.id === id);
      if (targetNote) {
        syncToGoogleSheets("delete", targetNote);
      }
      return prev.filter((n) => n.id !== id);
    });
  }, []);

  const editNote = useCallback((id: string, newContent: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const updatedNote = { ...n, content: newContent };
          syncToGoogleSheets("update", updatedNote);
          return updatedNote;
        }
        return n;
      })
    );
  }, []);

  const reorderNotes = useCallback((startIndex: number, endIndex: number) => {
    setNotes((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  return { notes, mounted, addNote, deleteNote, editNote, reorderNotes };
}
