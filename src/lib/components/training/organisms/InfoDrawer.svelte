<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { RoadmapSelection } from '$lib/data/training';
	import CountPill from '../atoms/CountPill.svelte';

	/**
	 * Drawer info modul / sub-modul: meluncur dari kanan menutupi
	 * separuh halaman. Hanya berisi info level modul & sub-modul
	 * (judul, deskripsi, hitungan) — tanpa daftar judul materi.
	 * Pemanggil terotentikasi dapat mengisi `actions` (progres +
	 * tautan lanjut belajar); default-nya ajakan masuk.
	 */
	let {
		selection,
		onclose,
		actions
	}: {
		selection: RoadmapSelection | null;
		onclose: () => void;
		actions?: Snippet<[RoadmapSelection]>;
	} = $props();

	const open = $derived(selection !== null);

	let closeBtn: HTMLButtonElement | undefined = $state();

	$effect(() => {
		if (selection) {
			closeBtn?.focus();
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
	});

	function onWindowKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && selection) onclose();
	}
</script>

<svelte:window onkeydown={onWindowKeydown} />

<div class={`fixed inset-0 z-[60] ${open ? 'visible' : 'invisible'}`}>
	<button
		type="button"
		tabindex={open ? 0 : -1}
		aria-label="Tutup panel informasi"
		onclick={onclose}
		class={`absolute inset-0 bg-slate-900/40 transition-opacity duration-300 ease-smooth ${open ? 'opacity-100' : 'opacity-0'}`}
	></button>
	<div
		role="dialog"
		aria-modal="true"
		aria-labelledby="info-drawer-title"
		inert={!open}
		class={`absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-2xl transition-[transform,visibility] duration-300 ease-smooth md:w-1/2 ${open ? 'translate-x-0 visible' : 'translate-x-full invisible'}`}
	>
		{#if selection}
			<div class="flex items-start justify-between gap-3 border-b border-slate-100 p-5 sm:px-6">
				<div class="min-w-0">
					<p class="text-[11px] font-bold tracking-widest text-blue-600 uppercase">
						{#if selection.kind === 'module'}
							Modul {selection.moduleIndex + 1}
						{:else}
							Modul {selection.moduleIndex + 1} · Sub-modul {selection.subIndex + 1}
						{/if}
					</p>
					<h2 id="info-drawer-title" class="mt-1 text-xl leading-snug font-extrabold text-slate-900">
						{#if selection.kind === 'module'}
							{selection.module.title}
						{:else}
							{selection.sub.title}
						{/if}
					</h2>
				</div>
				<button
					type="button"
					bind:this={closeBtn}
					onclick={onclose}
					aria-label="Tutup panel informasi"
					class="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl p-2 text-slate-500 transition-colors duration-200 ease-smooth hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-blue-600"
				>
					<i class="fa-solid fa-xmark text-lg" aria-hidden="true"></i>
				</button>
			</div>
			<div class="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:px-6">
				<p class="text-sm leading-relaxed text-slate-600">
					{#if selection.kind === 'module'}
						{selection.module.description}
					{:else}
						{selection.sub.description}
					{/if}
				</p>
				<div class="flex flex-wrap gap-2">
					{#if selection.kind === 'module'}
						<CountPill icon="fa-layer-group" text={`${selection.subCount} sub-modul`} tone="violet" />
						<CountPill icon="fa-book-open" text={`${selection.materialCount} materi`} tone="blue" />
					{:else}
						<CountPill icon="fa-book-open" text={`${selection.sub.materials.length} materi`} tone="blue" />
					{/if}
				</div>
				{#if actions}
					{@render actions(selection)}
				{:else}
					<a
						href="/login"
						class="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 ease-smooth hover:bg-blue-700 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-blue-600"
					>
						<i class="fa-solid fa-arrow-right-to-bracket" aria-hidden="true"></i>
						{#if selection.kind === 'module'}
							Masuk untuk mulai belajar
						{:else}
							Masuk untuk membuka materi
						{/if}
					</a>
					<p class="text-center text-[11px] text-slate-500">
						Masuk untuk melacak progres dan membuka seluruh materi.
					</p>
				{/if}
			</div>
		{/if}
	</div>
</div>
