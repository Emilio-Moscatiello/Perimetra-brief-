import React from "react";

export function LoadingCard({ height = 120 }: { height?: number }) {
  return <div className="skeleton" style={{ height, width: "100%", borderRadius: 12 }} />;
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="empty-state" role="alert">
      Impossibile caricare i dati: {message}
    </div>
  );
}
