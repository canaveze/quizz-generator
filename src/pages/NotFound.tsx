import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { SplashCursor } from "@/components/ui/splash-cursor";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 relative">
      <SplashCursor />
      <div className="text-center bg-background/80 backdrop-blur-sm border border-border/50 rounded-lg p-8">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/80 transition-colors">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
