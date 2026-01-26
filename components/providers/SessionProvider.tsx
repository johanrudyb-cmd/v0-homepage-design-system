'use client';

export function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Plus besoin de NextAuth SessionProvider, on utilise notre système custom
  return <>{children}</>;
}
