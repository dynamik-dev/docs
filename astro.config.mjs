// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'DynamikDev Docs',
			logo: {
				dark: './public/dynamik-dev-logo.svg',
				light: './public/dynamik-dev-logo.svg',
			},
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/dynamik-dev' }
			],
			sidebar: [
				{
					label: 'Start Here',
					items: [
						{ label: 'Welcome', slug: 'index' },
					],
				},
				{
					label: 'Cloak PHP',
					items: [
						{ label: 'Overview', slug: 'cloak-php' },
						{ label: 'Quick Start', slug: 'cloak-php/quick-start' },
						{ label: 'Detectors', slug: 'cloak-php/detectors' },
						{ label: 'API Reference', slug: 'cloak-php/api-reference' },
						{
							label: 'Laravel Adapter',
							items: [
								{ label: 'Getting Started', slug: 'cloak-php/laravel' },
								{ label: 'Configuration', slug: 'cloak-php/configuration' },
							],
						},
					],
				},
				{
					label: 'Listmonk PHP',
					items: [
						{ label: 'Overview', slug: 'listmonk-php' },
						{ label: 'Quick Start', slug: 'listmonk-php/quick-start' },
						{ label: 'Subscribers', slug: 'listmonk-php/subscribers' },
						{ label: 'Campaigns', slug: 'listmonk-php/campaigns' },
						{ label: 'API Reference', slug: 'listmonk-php/api-reference' },
					],
				},
			],
		}),
	],
});
