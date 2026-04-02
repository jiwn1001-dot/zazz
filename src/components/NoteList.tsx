"use client";

import { useState, useRef } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import StickyNote from "@/components/StickyNote";
import type { Note, Category } from "@/hooks/useNotes";
import { motion, AnimatePresence } from "framer-motion";

interface NoteListProps {
  notes: Note[];
  filter: Category;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
}

export default function NoteList({
  notes,
  filter,
  onDelete,
  onEdit,
  onReorder,
}: NoteListProps) {
  const [newNoteId, setNewNoteId] = useState<string | null>(null);
  const prevNotesRef = useRef<string[]>([]);

  // Track new notes by comparing IDs
  const currentIds = notes.map((n) => n.id);
  const addedId = currentIds.find((id) => !prevNotesRef.current.includes(id));
  if (addedId && addedId !== newNoteId) {
    setNewNoteId(addedId);
    // Clear new marker after animation
    setTimeout(() => setNewNoteId(null), 600);
  }
  prevNotesRef.current = currentIds;

  const filteredNotes =
    filter === "전체" ? notes : notes.filter((n) => n.category === filter);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (filter !== "전체") return; // Only reorder when showing all
    onReorder(result.source.index, result.destination.index);
  };

  if (filteredNotes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="text-6xl mb-4">📝</div>
        <p className="text-lg text-zinc-400 dark:text-zinc-500">
          {filter === "전체"
            ? "메모가 없습니다. 새로운 메모를 추가해보세요!"
            : `'${filter}' 카테고리에 메모가 없습니다.`}
        </p>
      </motion.div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="notes">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            <AnimatePresence mode="popLayout">
              {filteredNotes.map((note, index) => (
                <Draggable
                  key={note.id}
                  draggableId={note.id}
                  index={index}
                  isDragDisabled={filter !== "전체"}
                >
                  {(dragProvided) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      style={dragProvided.draggableProps.style}
                    >
                      <StickyNote
                        note={note}
                        onDelete={onDelete}
                        onEdit={onEdit}
                        isNew={note.id === newNoteId}
                        dragHandleProps={(dragProvided.dragHandleProps ?? {}) as Record<string, unknown>}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
            </AnimatePresence>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
