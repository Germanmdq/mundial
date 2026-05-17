"use client";

import React, {
  useEffect,
  useRef,
  useState,
  createContext,
} from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

interface Card {
  src: string;
  title: string;
  category: string;
  content: React.ReactNode;
}

export const CarouselContext = createContext<{
  onCardClose: (index: number) => void;
  currentIndex: number;
}>({
  onCardClose: () => {},
  currentIndex: 0,
});

export const Carousel = ({
  items,
  initialScroll = 0,
}: {
  items: React.ReactNode[];
  initialScroll?: number;
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft: currentScrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(currentScrollLeft > 0);
      setCanScrollRight(currentScrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScrollability();
    }
  }, [initialScroll]);

  return (
    <div className="relative w-full">
      <div
        className="flex w-full overflow-x-auto overscroll-x-contain py-4 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        ref={carouselRef}
        onScroll={checkScrollability}
      >
        <div className="flex flex-row justify-start gap-5 pl-4 md:pl-16 max-w-7xl mx-auto">
          {items.map((item, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
              key={"card" + index}
              className="last:pr-[5%] md:last:pr-[33%] rounded-3xl"
            >
              {item}
            </motion.div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2 mr-4 md:mr-16 mt-4">
        <button
          className="relative z-40 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-50 hover:bg-gray-200 transition"
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          aria-label="Anterior"
        >
          <ArrowLeft className="h-6 w-6 text-gray-500" />
        </button>
        <button
          className="relative z-40 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-50 hover:bg-gray-200 transition"
          onClick={scrollRight}
          disabled={!canScrollRight}
          aria-label="Siguiente"
        >
          <ArrowRight className="h-6 w-6 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

export const Card = ({
  card,
  index: _index,
  layout = false,
}: {
  card: Card;
  index: number;
  layout?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 h-screen z-50 overflow-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-black/80 backdrop-blur-lg h-full w-full fixed inset-0"
              onClick={handleClose}
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              ref={containerRef}
              layoutId={layout ? `card-${card.title}` : undefined}
              className="max-w-5xl mx-auto bg-white dark:bg-neutral-900 h-fit z-[60] my-10 p-4 md:p-10 rounded-3xl font-sans relative"
            >
              <button
                className="sticky top-4 right-4 ml-auto h-8 w-8 rounded-full bg-black dark:bg-white flex items-center justify-center cursor-pointer"
                onClick={handleClose}
                aria-label="Cerrar"
              >
                <X className="h-5 w-5 text-white dark:text-black" />
              </button>
              <motion.p
                layoutId={layout ? `category-${card.category}` : undefined}
                className="text-xs md:text-sm font-semibold text-emerald-600 dark:text-emerald-400"
              >
                {card.category}
              </motion.p>
              <motion.h3
                layoutId={layout ? `title-${card.title}` : undefined}
                className="text-2xl md:text-5xl font-bold text-neutral-700 dark:text-white mt-2"
              >
                {card.title}
              </motion.h3>
              <div className="py-10">{card.content}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.button
        layoutId={layout ? `card-${card.title}` : undefined}
        onClick={handleOpen}
        className="rounded-3xl bg-gray-100 dark:bg-neutral-900 h-80 w-56 md:h-[400px] md:w-80 overflow-hidden flex flex-col items-start justify-end relative z-10 cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300 border-0"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-30 pointer-events-none" />

        <Image
          src={card.src}
          alt={card.title}
          fill
          sizes="(max-width: 768px) 224px, 320px"
          className="object-cover absolute inset-0 z-10"
        />

        <div className="relative z-40 p-6 flex flex-col items-start justify-end h-full w-full">
          <motion.p
            layoutId={layout ? `category-${card.category}` : undefined}
            className="text-emerald-400 text-xs md:text-sm font-semibold text-left"
          >
            {card.category}
          </motion.p>
          <motion.h3
            layoutId={layout ? `title-${card.title}` : undefined}
            className="text-white text-lg md:text-2xl font-bold text-left mt-1"
          >
            {card.title}
          </motion.h3>
        </div>
      </motion.button>
    </>
  );
};
