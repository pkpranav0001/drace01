[OPEN] Home page load error at `http://localhost:3001/`

## Symptom

- The app renders the root error boundary with "This page didn't load" instead of the homepage.

## Expected

- The homepage should render successfully in the browser preview.

## Scope

- Runtime/browser rendering
- Possible shared provider or route-shell failure

## Hypotheses

- `CartProvider` throws during initial render because cart/auth state or Supabase client access fails before the page mounts.
- `CartDrawer` throws during render because cart items or route links resolve to invalid runtime state.
- The root route shell in `__root.tsx` is missing a wrapper or provider expected by a child component, causing an exception before `Outlet` completes.
- A browser-side data fetch in the homepage or shared providers rejects and surfaces through the route error boundary.
- The dev preview is serving stale code and the current runtime error is different from the editor diagnostics.

## Plan

- Add runtime instrumentation only.
- Reproduce the failure and collect evidence.
- Apply the smallest fix supported by the evidence.
- Verify in preview.
