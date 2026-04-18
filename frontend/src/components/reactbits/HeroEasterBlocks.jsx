import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

const NUM_BLOCKS = [2,3];
const FRAGMENTS = 13;
const COLORS = ["rgb(255, 255, 255)"];
const HOVER_COLOR =  ["#f0faff"];
const SIZE_MIN = 20, SIZE_MAX = 36;

const random = (min, max) => Math.random() * (max - min) + min;
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function genBlock() {
  const fromLeft = Math.random() < 0.5;
  return {
    id: `block_${Math.random().toString(36).slice(2)}`,
    color: COLORS[randomInt(0, COLORS.length - 1)],
    size: random(SIZE_MIN, SIZE_MAX),
    duration: random(24, 48),
    delay: random(0, 2),
    top: random(10, 83),
    direction: fromLeft ? 1 : -1,
    driftAmount: random(90, 120),
  };
}

export default function EasterEggs() {
  const [targetCount] = useState(() => NUM_BLOCKS[randomInt(0, NUM_BLOCKS.length-1)]);
  const [blocks, setBlocks] = useState(() => Array.from({ length: targetCount }, genBlock));
  const [debris, setDebris] = useState([]);

  const respawnQueue = useRef([]);

  const [hoveredBlockId, setHoveredBlockId] = useState(null);

  const [winWidth, setWinWidth] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setWinWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const removeBlock = (id, respawnDelay = true) => {
    setBlocks((bls) => bls.filter((b) => b.id !== id));
    if (respawnDelay) {
      const readyAt = Date.now() + randomInt(30000, 60000);
      respawnQueue.current.push(readyAt);
    }
  };

  function handleBroken(block, evt) {
    removeBlock(block.id, true);
    const rect = evt.target.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const now = Date.now();
    const thisDebris = Array.from({ length: FRAGMENTS }, (_, idx) => {
      const angle = (2 * Math.PI * idx) / FRAGMENTS + random(-0.1, 0.1);
      return {
        id: `${block.id}_debris_${now}_${idx}`,
        color: block.color,
        x0: cx,
        y0: cy,
        size: random(block.size / 2.8, block.size / 1.7),
        angle,
        distance: random(46, 125),
      };
    });
    setDebris((old) => [...old, ...thisDebris]);
    setTimeout(() => {
      setDebris((old) => old.filter((f) => !thisDebris.includes(f)));
    }, 950);
  }

  useEffect(() => {
    const tick = setInterval(() => {
      if (blocks.length < targetCount && respawnQueue.current.length) {
        const now = Date.now();
        let added = 0;
        while (blocks.length + added < targetCount && respawnQueue.current.length) {
          if (respawnQueue.current[0] <= now) {
            respawnQueue.current.shift();
            setBlocks(old => [...old, genBlock()]);
            added++;
          } else {
            break;
          }
        }
      }
      if ((blocks.length < targetCount) && !respawnQueue.current.length) {
        setBlocks(old => [...old, ...Array.from({ length: targetCount - old.length }, genBlock)]);
      }
      if (blocks.length > targetCount) {
        setBlocks(old => old.slice(0, targetCount));
      }
    }, 980);
    return () => clearInterval(tick);
  }, [blocks.length, targetCount]);

  function handleUpdate(latest, block) {
    if (
      (block.direction === 1 && latest.x > winWidth - block.size - 40) ||
      (block.direction === -1 && latest.x < -winWidth + block.size + 40)
    ) {
      removeBlock(block.id, true);
    }
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-40 select-none">
      <AnimatePresence>
        {blocks.map((block) => (
          <motion.div
            className="cursor-target"
            key={block.id}
            style={{
              position: "absolute",
              top: `${block.top}%`,
              left: block.direction === 1 ? 0 : undefined,
              right: block.direction === -1 ? 0 : undefined,
              width: block.size,
              height: block.size,
              borderRadius: 8,
              background: block.id === hoveredBlockId ? HOVER_COLOR : block.color,
              boxShadow:
                block.id === hoveredBlockId
                  ? `0 0 0 10px ${HOVER_COLOR}48, 0 2px 16px #0002`
                  : "0 2px 16px #0002",
              pointerEvents: "auto",
              zIndex: 42,
              transition: "background 0.22s, box-shadow 0.22s"
            }}
            initial={{
              opacity: 0,
              x: 0,
              y: 0,
              scale: 0.8,
            }}
            animate={{
              opacity: 0.92,
              scale: 1,
              x:
                block.direction === 1
                  ? winWidth - block.size - 24
                  : -winWidth + block.size + 24,
              y: [
                0,
                block.driftAmount * 0.5,
                -block.driftAmount * 0.4,
                block.driftAmount * 0.18,
                0
              ],
              transition: {
                duration: block.duration,
                delay: block.delay,
                ease: "linear"
              }
            }}
            exit={{
              opacity: 0,
              scale: 1.14,
              pointerEvents: "none",
              transition: { duration: 0.23 },
            }}
            whileHover={{
              scale: 1.18,
              opacity: 1,
            }}
            onMouseEnter={() => setHoveredBlockId(block.id)}
            onMouseLeave={() => setHoveredBlockId(null)}
            onUpdate={(latest) => handleUpdate(latest, block)}
            onClick={(e) => {
              e.currentTarget.style.pointerEvents = "none";
              handleBroken(block, e);
            }}
            title="Shoot me!"
          />
        ))}
      </AnimatePresence>
      {debris.map((frag) => (
        <motion.div
          key={frag.id}
          style={{
            position: "fixed",
            left: frag.x0 - frag.size / 2,
            top: frag.y0 - frag.size / 2,
            width: frag.size,
            height: frag.size,
            background: frag.color,
            borderRadius: 4,
            zIndex: 99,
            pointerEvents: "none"
          }}
          initial={{ opacity: 0.91, scale: 1, x: 0, y: 0, rotate: 0 }}
          animate={{
            x: Math.cos(frag.angle) * frag.distance,
            y: Math.sin(frag.angle) * frag.distance + random(-10, 14),
            opacity: 0,
            scale: 0.9,
            rotate: random(-260, 260)
          }}
          transition={{ duration: 0.78, ease: "circOut" }}
        />
      ))}
    </div>
  );
}