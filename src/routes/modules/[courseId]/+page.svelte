<script lang="ts">
	import { page } from '$app/state';
	import '../../../app.css';
	import Logo from '$lib/components/Logo.svelte';
	import CoursePreview from '$lib/components/CoursePreview.svelte';

	const courseId = $derived(Number(page.params.courseId));

	let menuOpen = $state(false);

	const mobileLinks = [
		{ href: '/', label: 'Beranda' },
		{ href: '/modules', label: 'Pelatihan' },
		{ href: '/#peringkat', label: 'Peringkat' },
		{ href: '/#tentang', label: 'Tentang' },
		{ href: '/#verifikasi', label: 'Verifikasi' }
	];
</script>

<svelte:head>
	<title>Pratinjau Pelatihan — Aretê Platform</title>
	<meta name="description" content="Informasi singkat pelatihan: deskripsi, modul, dan materi yang didapat." />
</svelte:head>

<header class="sticky top-0 z-50 bg-white shadow-sm">
	<div class="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
		<a href="/" class="flex shrink-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-blue-600" aria-label="Aretê - Beranda">
			<Logo size="md" showText={true} textSize="xl" />
		</a>
		<nav aria-label="Navigasi utama" class="hidden min-w-0 flex-1 items-center justify-center gap-5 font-semibold text-[13px] text-slate-700 lg:flex xl:gap-7">
			<a href="/#beranda" class="whitespace-nowrap transition hover:text-blue-600">BERANDA</a>
			<a href="/modules" aria-current="page" class="whitespace-nowrap text-blue-600 transition hover:text-blue-700">PELATIHAN</a>
			<a href="/#peringkat" class="whitespace-nowrap transition hover:text-blue-600">PERINGKAT</a>
			<a href="/#tentang" class="whitespace-nowrap transition hover:text-blue-600">TENTANG</a>
			<a href="/#verifikasi" class="whitespace-nowrap transition hover:text-blue-600">VERIFIKASI</a>
		</nav>
		<div class="hidden shrink-0 items-center gap-2.5 sm:flex">
			<a
				href="/login"
				class="inline-flex min-h-[44px] items-center justify-center rounded-full border border-blue-600 px-5 text-xs font-bold whitespace-nowrap text-blue-700 uppercase transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
			>
				Masuk
			</a>
			<a
				href="/register"
				class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-xs font-bold whitespace-nowrap text-white uppercase shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
			>
				Mulai Belajar
				<i class="fa-solid fa-arrow-right text-[11px]" aria-hidden="true"></i>
			</a>
		</div>
		<button
			type="button"
			onclick={() => (menuOpen = !menuOpen)}
			aria-expanded={menuOpen}
			aria-controls="mobile-nav"
			aria-label={menuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
			class="flex min-h-11 min-w-11 items-center justify-center rounded-xl p-2 text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600 lg:hidden"
		>
			<i class={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`} aria-hidden="true"></i>
		</button>
	</div>
	{#if menuOpen}
		<nav id="mobile-nav" aria-label="Navigasi seluler" class="border-t border-slate-100 bg-white px-4 pt-2 pb-5 sm:px-6 lg:hidden">
			<ul class="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
				{#each mobileLinks as link (link.href)}
					<li>
						<a
							href={link.href}
							onclick={() => (menuOpen = false)}
							class="block rounded-lg px-2 py-3 uppercase tracking-wide transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
						>
							{link.label}
						</a>
					</li>
				{/each}
			</ul>
			<div class="mt-3 grid grid-cols-2 gap-2.5 sm:hidden">
				<a href="/login" class="inline-flex min-h-[44px] items-center justify-center rounded-full border border-blue-600 px-4 text-xs font-bold text-blue-700 uppercase transition hover:bg-blue-50">
					Masuk
				</a>
				<a href="/register" class="inline-flex min-h-[44px] items-center justify-center rounded-full bg-blue-600 px-4 text-xs font-bold text-white uppercase shadow-lg shadow-blue-500/25 transition hover:bg-blue-700">
					Mulai Belajar
				</a>
			</div>
		</nav>
	{/if}
</header>

<main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
	<CoursePreview {courseId} mode="public" backHref="/modules" backLabel="Semua Pelatihan" />
</main>

<footer class="border-t border-slate-800 bg-slate-900 py-8 text-center text-xs text-slate-500">
	&copy; 2026 Arete Platform Mikrokredensial. Semua hak dilindungi.
</footer>
