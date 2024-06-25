import { MutableRefObject, useEffect } from 'react';

export const useResizeObserver = ({
  logsRef,
}: {
  logsRef: MutableRefObject<HTMLDivElement | null>;
}) => {
  useEffect(() => {
    if (!logsRef.current?.firstElementChild) return;
    const resizeObserver = new ResizeObserver(() => {
      logsRef.current?.firstElementChild?.lastElementChild?.scrollIntoView({
        behavior: 'instant',
      });
    });
    resizeObserver.observe(logsRef.current.firstElementChild);
    return () => resizeObserver.disconnect(); // clean up
  }, [logsRef]);
};
