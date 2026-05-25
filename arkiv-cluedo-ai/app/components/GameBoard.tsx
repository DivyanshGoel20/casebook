"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ROOMS, getCellType, getRoomAt } from "../lib/game-engine";
import { useGameStore } from "../lib/game-store";
import { Position } from "../lib/game-types";
import { 
  Laptop, 
  Database, 
  Leaf, 
  Tv, 
  Cpu, 
  Flame, 
  ShieldAlert, 
  Binary, 
  BookOpen, 
  HelpCircle
} from "lucide-react";

const getRoomIcon = (id: string, className: string) => {
  switch (id) {
    case "QUANTUM_LABS": return <Laptop className={className} />;
    case "ARCHIVE_ROOM": return <Database className={className} />;
    case "AETHER_GARDEN": return <Leaf className={className} />;
    case "HOLOGRAM_LOUNGE": return <Tv className={className} />;
    case "MAINFRAME": return <Cpu className={className} />;
    case "REACTOR_CORE": return <Flame className={className} />;
    case "CYPHER_VAULT": return <ShieldAlert className={className} />;
    case "CONTROL_DECK": return <Binary className={className} />;
    case "NEURAL_LIBRARY": return <BookOpen className={className} />;
    default: return <HelpCircle className={className} />;
  }
};

export default function GameBoard() {
  const { players, activePlayerIndex, diceResult, activeAction } = useGameStore();
  const activePlayer = players[activePlayerIndex];

  // Helper to generate coordinates on a 12x12 grid
  const cells: Position[] = [];
  for (let y = 0; y < 12; y++) {
    for (let x = 0; x < 12; x++) {
      cells.push({ x, y });
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-zinc-950 border-2 border-zinc-900 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Background neon grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
      
      <div className="relative w-full max-w-[480px] aspect-square grid grid-cols-12 grid-rows-12 gap-1 p-1 bg-zinc-950 border-2 border-zinc-800/80 rounded-2xl shadow-[inset_0_0_30px_rgba(0,0,0,0.9)] overflow-hidden">
        
        {/* Render grid floor cells */}
        {cells.map((cell) => {
          const cellType = getCellType(cell.x, cell.y);
          const isDoor = cellType === "door";
          const isWall = cellType === "wall";
          const isCenter = cellType === "room_center";
          
          let tileStyle = "border border-zinc-900/40 ";
          
          if (isDoor) {
            tileStyle += "bg-emerald-950/20 border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.3),inset_0_0_6px_rgba(16,185,129,0.2)] animate-pulse z-10";
          } else if (isWall) {
            tileStyle += "bg-transparent border-none pointer-events-none";
          } else if (isCenter) {
            tileStyle += "bg-transparent border-none pointer-events-none";
          } else {
            // hallway cell
            tileStyle += "bg-zinc-900/30 hover:bg-zinc-800/20 transition-colors duration-300";
          }

          return (
            <div
              key={`${cell.x}-${cell.y}`}
              style={{
                gridColumn: cell.x + 1,
                gridRow: cell.y + 1,
              }}
              className={`relative flex items-center justify-center rounded-lg ${tileStyle}`}
            />
          );
        })}

        {/* Render large Room Overlays */}
        {ROOMS.map((room) => {
          const gridColStart = room.minX + 1;
          const gridColEnd = room.maxX + 2;
          const gridRowStart = room.minY + 1;
          const gridRowEnd = room.maxY + 2;

          return (
            <div
              key={room.id}
              style={{
                gridColumnStart: gridColStart,
                gridColumnEnd: gridColEnd,
                gridRowStart: gridRowStart,
                gridRowEnd: gridRowEnd,
              }}
              className={`relative p-3 flex flex-col items-center justify-center border-2 rounded-2xl pointer-events-none select-none z-10 backdrop-blur-md transition-all duration-500 ${room.color} ${room.glowColor}`}
            >
              {/* Central Room Label and Icon */}
              <div className="flex flex-col items-center gap-1.5 text-center">
                <div className="p-1.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 shadow-md">
                  {getRoomIcon(room.id, "w-4 h-4 opacity-90 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]")}
                </div>
                <span className="text-[8px] font-black font-mono tracking-widest uppercase opacity-95 leading-none mt-1">
                  {room.name}
                </span>
              </div>
            </div>
          );
        })}

        {/* Render Player Microchip Tokens */}
        <AnimatePresence>
          {players.map((p) => {
            const isActive = activePlayer?.id === p.id;
            return (
              <motion.div
                key={p.id}
                layout
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 14 }}
                style={{
                  gridColumn: p.position.x + 1,
                  gridRow: p.position.y + 1,
                  zIndex: isActive ? 30 : 20,
                }}
                className="relative flex items-center justify-center p-0.5"
              >
                {/* Active Player Halo effect */}
                {isActive && (
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    style={{ backgroundColor: p.color }}
                    className="absolute w-8 h-8 rounded-full blur-[8px] opacity-60 pointer-events-none"
                  />
                )}

                {/* Microchip Token Pawns */}
                <div
                  style={{
                    backgroundColor: "#09090b",
                    borderColor: p.color,
                    boxShadow: `0 0 14px ${p.color}88, inset 0 0 8px ${p.color}44`,
                    color: p.color,
                  }}
                  className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-[10px] font-black font-mono select-none border-2 transition-all duration-300 ${
                    p.eliminated ? "opacity-35 border-zinc-800 scale-75 shadow-none" : ""
                  }`}
                >
                  {p.name[0]}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Board Status footer */}
      <div className="w-full mt-4 flex items-center justify-between px-4 py-3 bg-zinc-950/80 border border-zinc-850 rounded-2xl">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
          <span className="text-[10px] text-zinc-400 font-mono tracking-tight">
            {activeAction === "idle" ? "Turn pending..." : `MATCH ACTION: ${activeAction.toUpperCase()}`}
          </span>
        </div>
        {diceResult !== null && (
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Velocity:</span>
            <div className="px-2.5 py-0.5 bg-zinc-900 border border-zinc-800 text-cyan-400 rounded-lg text-[10px] font-bold shadow-[0_0_8px_rgba(6,182,212,0.2)]">
              🎲 {diceResult} UNITS
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
