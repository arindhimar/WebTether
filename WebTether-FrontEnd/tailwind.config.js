/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "*.{js,ts,jsx,tsx,mdx}"],
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px",
			},
		},
		extend: {
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				sidebar: {
					DEFAULT: "hsl(var(--sidebar))",
					foreground: "hsl(var(--sidebar-foreground))",
					border: "hsl(var(--sidebar-border))",
					accent: "hsl(var(--sidebar-accent))",
					"accent-foreground": "hsl(var(--sidebar-accent-foreground))",
					ring: "hsl(var(--sidebar-ring))",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			keyframes: {
				"accordion-down": {
					from: { height: 0 },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: 0 },
				},
				"fade-in": {
					from: { opacity: 0 },
					to: { opacity: 1 },
				},
				"fade-out": {
					from: { opacity: 1 },
					to: { opacity: 0 },
				},
				"slide-in": {
					from: { transform: "translateY(20px)", opacity: 0 },
					to: { transform: "translateY(0)", opacity: 1 },
				},
				"slide-out": {
					from: { transform: "translateY(0)", opacity: 1 },
					to: { transform: "translateY(20px)", opacity: 0 },
				},
				"pulse-glow": {
					"0%, 100%": { opacity: 1 },
					"50%": { opacity: 0.7 },
				},
				"bounce-subtle": {
					"0%, 100%": { transform: "translateY(0)" },
					"50%": { transform: "translateY(-5px)" },
				},
				"spin-slow": {
					from: { transform: "rotate(0deg)" },
					to: { transform: "rotate(360deg)" },
				},
				"scale-up": {
					from: { transform: "scale(1)" },
					to: { transform: "scale(1.05)" },
				},
				float: {
					"0%, 100%": { transform: "translateY(0)" },
					"50%": { transform: "translateY(-10px)" },
				},
				shimmer: {
					"0%": { backgroundPosition: "-200% 0" },
					"100%": { backgroundPosition: "200% 0" },
				},
				ripple: {
					"0%": { transform: "scale(0)", opacity: 1 },
					"100%": { transform: "scale(4)", opacity: 0 },
				},
				wave: {
					"0%": { transform: "translateX(0)" },
					"50%": { transform: "translateX(-10px)" },
					"100%": { transform: "translateX(0)" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"fade-in": "fade-in 0.5s ease-out",
				"fade-out": "fade-out 0.5s ease-out",
				"slide-in": "slide-in 0.5s ease-out",
				"slide-out": "slide-out 0.5s ease-out",
				"pulse-glow": "pulse-glow 2s infinite",
				"bounce-subtle": "bounce-subtle 2s infinite",
				"spin-slow": "spin-slow 3s linear infinite",
				"scale-up": "scale-up 0.2s ease-out",
				float: "float 3s ease-in-out infinite",
				shimmer: "shimmer 2s linear infinite",
				ripple: "ripple 1s linear forwards",
				wave: "wave 2s ease-in-out infinite",
			},
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
				"gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
				"gradient-mesh": "linear-gradient(to right bottom, rgba(49, 84, 169, 0.05), rgba(72, 101, 240, 0.1))",
				"gradient-shine": "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
			},
			boxShadow: {
				glow: "0 0 15px rgba(59, 130, 246, 0.5)",
				"glow-lg": "0 0 25px rgba(59, 130, 246, 0.7)",
				"inner-glow": "inset 0 0 15px rgba(59, 130, 246, 0.3)",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
}

