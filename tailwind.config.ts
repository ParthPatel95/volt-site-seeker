import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		screens: {
			'xs': '475px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1536px',
		},
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '1.5rem',
				lg: '2rem',
				xl: '2.5rem',
				'2xl': '3rem',
			},
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
				mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', 'monospace'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
					elevated: 'hsl(var(--card-elevated, var(--card)))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))',
					muted: 'hsl(var(--sidebar-muted))'
				},
				// Data visualization semantic colors
				data: {
					positive: 'hsl(var(--data-positive))',
					negative: 'hsl(var(--data-negative))',
					warning: 'hsl(var(--data-warning))',
					neutral: 'hsl(var(--data-neutral))',
					info: 'hsl(var(--data-info))'
				},
				// Status colors
				status: {
					online: 'hsl(var(--status-online))',
					offline: 'hsl(var(--status-offline))',
					warning: 'hsl(var(--status-warning))',
					idle: 'hsl(var(--status-idle))'
				},
				// Chart colors
				chart: {
					primary: 'hsl(var(--chart-primary))',
					secondary: 'hsl(var(--chart-secondary))',
					tertiary: 'hsl(var(--chart-tertiary))',
					quaternary: 'hsl(var(--chart-quaternary))',
					grid: 'hsl(var(--chart-grid))'
				},
				// Legacy brand colors (backward compatibility)
				'watt-bitcoin': 'hsl(36 94% 53%)',
				'watt-success': 'hsl(var(--data-positive))',
				'watt-warning': 'hsl(var(--data-warning))',
				'watt-primary': 'hsl(var(--primary))',
				'watt-secondary': 'hsl(var(--chart-secondary))'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					from: { opacity: '0', transform: 'translateY(4px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-out': {
					from: { opacity: '1' },
					to: { opacity: '0' }
				},
				'slide-in-right': {
					from: { transform: 'translateX(100%)' },
					to: { transform: 'translateX(0)' }
				},
				'slide-out-right': {
					from: { transform: 'translateX(0)' },
					to: { transform: 'translateX(100%)' }
				},
				'pulse-subtle': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.7' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.2s ease-out forwards',
				'fade-out': 'fade-out 0.15s ease-out forwards',
				'slide-in-right': 'slide-in-right 0.2s ease-out',
				'slide-out-right': 'slide-out-right 0.2s ease-out',
				'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite'
			},
			boxShadow: {
				'subtle': '0 1px 2px 0 rgb(0 0 0 / 0.03), 0 1px 3px 0 rgb(0 0 0 / 0.05)',
				'card': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 2px 6px 0 rgb(0 0 0 / 0.03)',
				'elevated': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
				'glow': '0 0 20px -8px hsl(var(--primary) / 0.3)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
