/** @type {import("tailwindcss").Config} */
export const tailwindConfig = {
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))"
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        sm: "var(--radius)",
        md: "var(--radius)",
        lg: "var(--radius)",
        xl: "var(--radius)"
      }
    }
  }
};
