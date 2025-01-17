"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true); // Ensure this runs only on the client
  }, []);

  if (!mounted) {
    return <div className="opacity-0">{children}</div>; // Prevent mismatched rendering
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
