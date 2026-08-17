# Color Login/Logout buttons with hover states

## Goal
Style the header Login ("Prijava") and Logout ("Odjava") buttons with distinct colors and a hybrid outline-to-filled hover effect.

## Design decisions
- **Login**: green accent to match the Auth submit button.
- **Logout**: red accent to signal a destructive/exit action.
- **Fill style**: hybrid — transparent outline by default, solid fill on hover.

## Changes
1. Update `src/components/Header.tsx`:
   - **Login button** (Prijava):
     - Default: transparent background, `border-green-500/50`, `text-green-400`, green icon.
     - Hover: `bg-green-600`, `text-white`, border `border-green-600`, icon white.
   - **Logout button** (Odjava):
     - Default: transparent background, `border-red-500/50`, `text-red-400`, red icon.
     - Hover: `bg-red-600`, `text-white`, border `border-red-600`, icon white.
   - Keep `size="sm"` and `variant="outline"` as the base shadcn variant.
   - Preserve focus rings and transition classes for accessibility.
2. Ensure the button classes do not conflict with the existing `text-white` / `border-white/30` overrides.
3. Run a production build to confirm no type or class errors.
4. Optionally capture a preview screenshot to verify contrast against the dark zinc header.

## Verification
- Header shows green "Prijava" when signed out and red "Odjava" when signed in.
- Hovering each button fills it with the corresponding solid color and white text/icon.
- Build passes without errors.
