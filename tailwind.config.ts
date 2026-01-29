import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme base colors
        background: 'var(--background)',
        'background-secondary': 'var(--background-secondary)',
        'background-tertiary': 'var(--background-tertiary)',
        foreground: 'var(--foreground)',
        // Surface colors
        surface: 'var(--surface)',
        'surface-elevated': 'var(--surface-elevated)',
        'surface-hover': 'var(--surface-hover)',
        // Border colors
        border: 'var(--border)',
        'border-hover': 'var(--border-hover)',
        'border-active': 'var(--border-active)',
        // Primary brand
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          light: 'var(--primary-light)',
          glow: 'var(--primary-glow)',
        },
        // Secondary
        secondary: {
          DEFAULT: 'var(--secondary)',
          light: 'var(--secondary-light)',
        },
        // Accent
        accent: {
          DEFAULT: 'var(--accent)',
          light: 'var(--accent-light)',
        },
        // Telco theme colors (legacy support)
        telco: {
          primary: 'var(--telco-primary)',
          secondary: 'var(--telco-secondary)',
          accent: 'var(--telco-accent)',
          success: 'var(--telco-success)',
          warning: 'var(--telco-warning)',
          error: 'var(--telco-error)',
        },
        // Zone colors
        zone: {
          production: 'var(--zone-production)',
          'production-border': 'var(--zone-production-border)',
          'non-prod': 'var(--zone-non-prod)',
          'non-prod-border': 'var(--zone-non-prod-border)',
          dmz: 'var(--zone-dmz)',
          'dmz-border': 'var(--zone-dmz-border)',
          partner: 'var(--zone-partner)',
          'partner-border': 'var(--zone-partner-border)',
          internet: 'var(--zone-internet)',
          'internet-border': 'var(--zone-internet-border)',
          'secure-core': 'var(--zone-secure-core)',
          'secure-core-border': 'var(--zone-secure-core-border)',
          lab: 'var(--zone-lab)',
          'lab-border': 'var(--zone-lab-border)',
        },
        // Telco layer colors
        layer: {
          channels: 'var(--layer-channels)',
          'channels-border': 'var(--layer-channels-border)',
          bss: 'var(--layer-bss)',
          'bss-border': 'var(--layer-bss-border)',
          oss: 'var(--layer-oss)',
          'oss-border': 'var(--layer-oss-border)',
          network: 'var(--layer-network)',
          'network-border': 'var(--layer-network-border)',
          shared: 'var(--layer-shared)',
          'shared-border': 'var(--layer-shared-border)',
          external: 'var(--layer-external)',
          'external-border': 'var(--layer-external-border)',
        },
        // Runtime layer colors
        runtime: {
          vm: 'var(--runtime-vm)',
          'vm-border': 'var(--runtime-vm-border)',
          container: 'var(--runtime-container)',
          'container-border': 'var(--runtime-container-border)',
          cnf: 'var(--runtime-cnf)',
          'cnf-border': 'var(--runtime-cnf-border)',
          vnf: 'var(--runtime-vnf)',
          'vnf-border': 'var(--runtime-vnf-border)',
          'bare-metal': 'var(--runtime-bare-metal)',
          'bare-metal-border': 'var(--runtime-bare-metal-border)',
        },
        // Hosting domain colors
        hosting: {
          cloud: 'var(--hosting-cloud)',
          'cloud-border': 'var(--hosting-cloud-border)',
          'on-prem': 'var(--hosting-on-prem)',
          'on-prem-border': 'var(--hosting-on-prem-border)',
          hybrid: 'var(--hosting-hybrid)',
          'hybrid-border': 'var(--hosting-hybrid-border)',
          'third-party': 'var(--hosting-third-party)',
          'third-party-border': 'var(--hosting-third-party-border)',
          edge: 'var(--hosting-edge)',
          'edge-border': 'var(--hosting-edge-border)',
        },
        // Classification colors
        classification: {
          pii: 'var(--classification-pii)',
          'pii-border': 'var(--classification-pii-border)',
          pci: 'var(--classification-pci)',
          'pci-border': 'var(--classification-pci-border)',
          confidential: 'var(--classification-confidential)',
          'confidential-border': 'var(--classification-confidential-border)',
          'non-sensitive': 'var(--classification-non-sensitive)',
          'non-sensitive-border': 'var(--classification-non-sensitive-border)',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        mono: ['var(--font-geist-mono)', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'enterprise-sm': '0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 1px var(--border)',
        enterprise: '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--border)',
        'enterprise-lg': '0 16px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--border)',
        'glow-primary': '0 0 20px rgba(91, 95, 239, 0.3)',
        'glow-primary-lg': '0 0 40px rgba(91, 95, 239, 0.4)',
        card: '0 4px 16px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 12px 40px rgba(0, 0, 0, 0.4)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
        'gradient-mesh': 'radial-gradient(ellipse at 20% 0%, rgba(91, 95, 239, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(124, 58, 237, 0.06) 0%, transparent 50%)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'violation-pulse': 'violationPulse 2s ease-in-out infinite',
        'violation-ring': 'violationRing 1.5s ease-in-out infinite',
        'dash-flow': 'dashFlow 1s linear infinite',
        'glow-pulse': 'indigo-glow 2s ease-in-out infinite',
        shimmer: 'shimmer 1.5s infinite',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
        'ping-slow': 'ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        violationPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(239, 68, 68, 0)' },
        },
        violationRing: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '0', transform: 'scale(1.5)' },
        },
        dashFlow: {
          to: { strokeDashoffset: '-12' },
        },
        'indigo-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(91, 95, 239, 0.4)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(91, 95, 239, 0.2)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        'ping-slow': {
          '75%, 100%': { transform: 'scale(1.05)', opacity: '0' },
        },
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
      },
    },
  },
  plugins: [],
};

export default config;
