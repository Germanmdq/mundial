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
  const sectionRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isInView, setIsInView] = useState(false);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft: currentScrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(currentScrollLeft > 0);
      setCanScrollRight(currentScrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollToCard = (index: number) => {
    const container = carouselRef.current;
    if (!container) return;
    const card = container.querySelector<HTMLElement>(`[data-card-index="${index}"]`);
    if (card) {
      const left =
        card.offsetLeft -
        container.offsetLeft -
        Math.max(0, (container.clientWidth - card.clientWidth) / 2);
      
      container.scrollTo({
        left,
        behavior: "smooth",
      });
    }
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
      setActive((current) => (current - 1 < 0 ? items.length - 1 : current - 1));
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
      setActive((current) => (current + 1 >= items.length ? 0 : current + 1));
    }
  };

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScrollability();
    }
  }, [initialScroll]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0.25,
      }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Autoplay Effect
  useEffect(() => {
    if (!isInView || isPaused || items.length <= 1) return;

    const interval = window.setInterval(() => {
      setActive((current) => {
        const next = current + 1 >= items.length ? 0 : current + 1;
        scrollToCard(next);
        return next;
      });
    }, 3500);

    return () => window.clearInterval(interval);
  }, [isInView, isPaused, items.length]);

  return (
    <div
      ref={sectionRef}
      className="relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div
        className="flex w-full overflow-x-auto overscroll-x-contain py-4 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "x mandatory", overscrollBehaviorY: "none" }}
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
              data-card-index={index}
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
          <div
            className="fixed inset-0 z-50 overflow-y-auto"
            style={{ padding: "16px" }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-black/80 backdrop-blur-lg fixed inset-0"
              onClick={handleClose}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              ref={containerRef}
              className="relative z-[60] mx-auto font-sans"
              style={{ width: "min(920px, 100%)", maxHeight: "none", borderRadius: "24px", overflow: "hidden", background: "#fff" }}
            >
              <button
                className="absolute top-4 right-4 z-[70] h-9 w-9 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center cursor-pointer"
                onClick={handleClose}
                aria-label="Cerrar"
              >
                <X className="h-5 w-5 text-white" />
              </button>
              <div>{card.content}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.button
        layoutId={layout ? `card-${card.title}` : undefined}
        onClick={handleOpen}
        className="rounded-3xl h-80 w-56 md:h-[400px] md:w-80 overflow-hidden flex flex-col items-start justify-end relative z-10 cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300 border-0"
        style={{
          background: "radial-gradient(circle at 50% 30%, rgba(0,113,227,0.28), transparent 38%), linear-gradient(135deg, #08111f 0%, #111111 100%)"
        }}
      >
        <div className="absolute inset-0 z-30 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.78) 100%)" }} />

        <Image
          src={card.src}
          alt={card.title}
          fill
          sizes="(max-width: 768px) 224px, 320px"
          className="object-cover object-[center_top] absolute inset-0 z-10"
        />

        <div className="relative z-40 p-6 flex flex-col items-start justify-end h-full w-full">
          <motion.p
            layoutId={layout ? `category-${card.category}` : undefined}
            className="text-blue-300 text-xs md:text-sm font-semibold text-left"
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
