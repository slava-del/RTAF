import React from "react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  // STUB: pretend we’re never loading and always have a user
  const isLoading = false;
  const user = { id: "dev", username: "dev" };

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          {/* Your spinner */}
        </div>
      </Route>
    );
  }

  // always have user → never redirect
  return <Route path={path} component={Component} />;
}
