import { useCallback, useState } from "react";

// Cycles through `length` items with a fade-out/fade-in between switches.
// `visible` is false during the fade so consumers can drive opacity from it.
export default function useCarousel(length, fadeMs = 200) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const goTo = useCallback(
    (index) => {
      setVisible(false);
      setTimeout(() => {
        setActiveIndex(index);
        setVisible(true);
      }, fadeMs);
    },
    [fadeMs],
  );

  const next = useCallback(() => goTo((activeIndex + 1) % length), [activeIndex, goTo, length]);
  const prev = useCallback(
    () => goTo((activeIndex - 1 + length) % length),
    [activeIndex, goTo, length],
  );

  return { activeIndex, setActiveIndex, visible, goTo, next, prev };
}
