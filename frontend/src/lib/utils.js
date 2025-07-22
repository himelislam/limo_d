import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Helper function for colors
export const colors = {
  background: 'bg-background',
  foreground: 'text-foreground',
  card: 'bg-card',
  cardForeground: 'text-card-foreground',
  popover: 'bg-popover',
  popoverForeground: 'text-popover-foreground',
  primary: 'bg-primary',
  primaryForeground: 'text-primary-foreground',
  secondary: 'bg-secondary',
  secondaryForeground: 'text-secondary-foreground',
  muted: 'bg-muted',
  mutedForeground: 'text-muted-foreground',
  accent: 'bg-accent',
  accentForeground: 'text-accent-foreground',
  destructive: 'bg-destructive',
  destructiveForeground: 'text-destructive-foreground',
  border: 'border-border',
  input: 'border-input',
  ring: 'ring-ring',
}
