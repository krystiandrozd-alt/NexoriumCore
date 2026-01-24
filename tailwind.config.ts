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
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Telco theme colors
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
        'enterprise-sm': 'var(--shadow-enterprise-sm)',
        enterprise: 'var(--shadow-enterprise)',
        'enterprise-lg': 'var(--shadow-enterprise-lg)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'violation-pulse': 'violationPulse 2s ease-in-out infinite',
        'violation-ring': 'violationRing 1.5s ease-in-out infinite',
        'dash-flow': 'dashFlow 1s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
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
      },
    },
  },
  plugins: [],
};

export default config;
