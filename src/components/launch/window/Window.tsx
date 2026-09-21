import React from 'react';
import { motion, useDragControls } from 'motion/react';
import { X, Minus, Square } from 'lucide-react';

interface WindowProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  isActive: boolean;
  zIndex: number;
  onClose: () => void;
  onFocus: () => void;
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
}

export function Window({
  title,
  icon,
  isActive,
  zIndex,
  onClose,
  onFocus,
  children,
  defaultPosition = { x: 50, y: 50 },
  defaultSize = { width: 600, height: 400 },
}: WindowProps) {
  const dragControls = useDragControls();

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.95, x: defaultPosition.x, y: defaultPosition.y }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      onMouseDown={onFocus}
      style={{
        width: defaultSize.width,
        height: defaultSize.height,
        position: 'absolute',
        zIndex,
      }}
      className={`bg-[#111111] rounded-xl shadow-2xl border flex flex-col overflow-hidden ring-1 ring-black/50 ${
        isActive ? 'border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.5)]' : 'border-white/5'
      }`}
    >
      <div
        className={`h-12 border-b flex items-center justify-between px-4 select-none cursor-move ${
          isActive ? 'bg-neutral-800/90 border-white/10' : 'bg-neutral-800/50 border-white/5'
        }`}
        style={{ touchAction: 'none' }}
        onPointerDown={(e) => {
          dragControls.start(e);
        }}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span
            className={`text-sm font-medium ${isActive ? 'text-neutral-200' : 'text-neutral-400'}`}
          >
            {title}
          </span>
        </div>
        <div className="flex items-center gap-4 text-neutral-500">
          <Minus size={16} className="hover:text-neutral-300 transition-colors cursor-pointer" />
          <Square size={14} className="hover:text-neutral-300 transition-colors cursor-pointer" />
          <X
            size={16}
            className="hover:text-red-400 transition-colors cursor-pointer"
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          />
        </div>
      </div>
      <div className="flex-1 overflow-hidden relative">{children}</div>
    </motion.div>
  );
}
