import { useEffect, useState } from "react";
import { Loader } from "@/components/ui/Loader";

export function SplashPage() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <Loader
      message="Initializing Payment Dashboard"
      submessage="Please wait..."
    />
  );
}
