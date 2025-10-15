import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useEffect } from "react";

export default function GlobalLoader() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  const loading = isFetching + isMutating > 0;

  useEffect(() => {
    if (loading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [loading]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500 border-solid"></div>
    </div>
  );
}
