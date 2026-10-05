<script lang="ts">
	import { page } from '$app/state';
	import { untrack } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { getCourseById, isMaterialLocked, isModuleLocked } from '$lib/data/courses';
	import { doneMaterials, ensureSeeded, toggleDone } from '$lib/stores/progress.svelte';

	const courseId = $derived(Number(page.params.courseId));
	const course = $derived(getCourseById(courseId));

	let openModules = new SvelteSet<string>();

	// Seed status awal + buka modul pertama yang belum selesai.
	// Hanya bereaksi terhadap ganti kursus (bacaan progres di-untrack).
	$effect(() => {
		if (!course) return;
		ensureSeeded(course);
		const firstOpen = untrack(
			() =>
				course.modules.find((m) => m.materials.some((mat) => !doneMaterials.has(mat.id)))?.id ??
				course.modules[0]?.id
		);
		openModules.clear();
		if (firstOpen) openModules.add(firstOpen);
	});

	const totalMats = $derived(course?.modules.reduce((n, m) => n + m.materials.length, 0) ?? 0);
	const doneCount = $derived(doneMaterials.size);
	const progress = $derived(totalMats === 0 ? 0 : Math.round((doneCount / totalMats) * 100));

	function toggleModule(id: string) {
		if (openModules.has(id)) openModules.delete(id);
		else openModules.add(id);
	}

	function moduleDone(moduleId: string): { done: number; total: number } {
		const mod = course?.modules.find((m) => m.id === moduleId);
		if (!mod) return { done: 0, total: 0 };
		return { done: mod.materials.filter((m) => doneMaterials.has(m.id)).length, total: mod.materials.length };
	}

	function typeIcon(type: string) {
		if (type === 'video') return 'fa-circle-play text-blue-600';
		if (type === 'audio') return 'fa-headphones text-cyan-600';
		if (type === 'foto') return 'fa-image text-slate-500';
		if (type === 'kuis') return 'fa-circle-question text-amber-600';
		if (type === 'tugas') return 'fa-pen-to-square text-violet-600';
		return 'fa-book-open text-emerald-600';
	}

	function typeLabel(type: string) {
		if (type === 'video') return 'Video';
		if (type === 'audio') return 'Audio';
		if (type === 'foto') return 'Foto';
		if (type === 'kuis') return 'Kuis';
		if (type === 'tugas') return 'Tugas';
		return 'Bacaan';
	}
</script>

<svelte:head>
	<title>{course ? `${course.title} — Modul` : 'Kursus tidak ditemukan'} — Aristoteles</title>
	<meta name="description" content={course ? `Modul pembelajaran ${course.title}` : 'Detail kursus'} />
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8">
	{#if !course}
		<div class="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center">
			<i class="fa-solid fa-triangle-exclamation mb-3 text-3xl text-amber-500" aria-hidden="true"></i>
			<h1 class="text-xl font-bold text-slate-900">Kursus tidak ditemukan</h1>
			<p class="mt-1 text-sm text-slate-500">ID kursus “{page.params.courseId}” tidak terdaftar di Kursusku.</p>
			<a href="/user/kursusku" class="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700">
				<i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Kembali ke Kursusku
			</a>
		</div>
	{:else}
		<nav aria-label="Breadcrumb" class="mb-4 flex items-center gap-2 text-xs text-slate-500">
			<a href="/user/kursusku" class="rounded font-semibold text-blue-600 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600">
				Kursusku
			</a>
			<i class="fa-solid fa-chevron-right text-[10px] text-slate-300" aria-hidden="true"></i>
			<span aria-current="page" class="truncate font-medium text-slate-700">{course.title}</span>
		</nav>

		<!-- Header kursus -->
		<header class="mb-6 overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
			<div class="relative flex min-h-48 flex-col justify-end overflow-hidden sm:min-h-56">
				<img
					src={course.image}
					alt={`Sampul kursus ${course.title}`}
					class="absolute inset-0 h-full w-full object-cover"
					loading="eager"
				/>
				<div
					class="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/40 to-slate-900/10"
					aria-hidden="true"
				></div>
				<div class="relative p-4 pt-14 sm:p-6 sm:pt-16">
					<p class="text-[11px] font-bold tracking-widest text-blue-300 uppercase">
						{course.category} · {course.level}
					</p>
					<h1 class="mt-1.5 text-xl leading-snug font-extrabold text-white sm:text-2xl">
						{course.title}
					</h1>
					<p
						class="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-200 sm:text-sm"
					>
						<span>Oleh {course.instructor}</span>
						<span aria-hidden="true" class="text-slate-400">·</span>
						<span>{course.duration}</span>
						<span aria-hidden="true" class="text-slate-400">·</span>
						<span>{course.modules.length} modul</span>
						<span aria-hidden="true" class="text-slate-400">·</span>
						<span>{totalMats} materi</span>
					</p>
				</div>
			</div>
			<div class="flex flex-col gap-4 p-4 sm:p-6 lg:flex-row lg:items-center">
				<p class="max-w-2xl flex-1 text-sm text-slate-600">{course.description}</p>
				<div class="w-full lg:max-w-xs">
					<div class="mb-1.5 flex justify-between text-xs">
						<span class="font-medium text-slate-500">Progres kamu: {doneCount}/{totalMats} materi</span>
						<span class="font-bold text-slate-800">{progress}%</span>
					</div>
					<div class="h-2.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Progres ${course.title}`}>
						<div class="h-full rounded-full bg-blue-600 transition-all duration-500" style="width: {progress}%"></div>
					</div>
					<p class="mt-2 text-[11px] text-slate-500" role="status" aria-live="polite">
						{#if progress === 100}
							🎉 Semua modul selesai! Sertifikatmu siap diunduh.
						{:else}
							Lanjutkan modul berikutnya untuk menaikkan progres.
						{/if}
					</p>
				</div>
			</div>
		</header>

		<!-- Daftar modul -->
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-lg font-bold text-slate-900">Semua Modul ({course.modules.length})</h2>
			<p class="text-xs text-slate-500">{doneCount}/{totalMats} materi selesai</p>
		</div>

		<div class="space-y-4">
			{#each course.modules as mod, i (mod.id)}
				{@const stat = moduleDone(mod.id)}
				{@const open = openModules.has(mod.id)}
				{@const complete = stat.done === stat.total}
				{@const modLocked = isModuleLocked(course.modules, i, (id) => doneMaterials.has(id))}
				<section aria-labelledby={`mod-title-${mod.id}`} class={`overflow-hidden rounded-2xl border bg-white transition-shadow ${complete ? 'border-emerald-200' : modLocked ? 'border-slate-200 bg-slate-50/50' : 'border-slate-200/70'} ${open && !modLocked ? 'shadow-lg' : ''}`}>
					{#if modLocked}
						<div
							class="flex w-full cursor-not-allowed items-center gap-4 p-4 opacity-70 sm:p-5"
							title={`Selesaikan Modul ${i} terlebih dahulu untuk membuka modul ini`}
							aria-label={`Terkunci: Modul ${i + 1}: ${mod.title}. Selesaikan modul sebelumnya terlebih dahulu.`}
						>
							<span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-sm font-extrabold text-slate-400" aria-hidden="true">
								<i class="fa-solid fa-lock"></i>
							</span>
							<span class="min-w-0 flex-1">
								<span id={`mod-title-${mod.id}`} class="block truncate text-sm font-bold text-slate-400 sm:text-base">
									Modul {i + 1}: {mod.title}
								</span>
								<span class="mt-0.5 block truncate text-xs text-slate-400">{mod.description}</span>
								<span class="mt-1.5 block text-[11px] font-semibold text-slate-400">
									Terkunci · Selesaikan Modul {i} terlebih dahulu
								</span>
							</span>
						</div>
					{:else}
					<button
						type="button"
						onclick={() => toggleModule(mod.id)}
						aria-expanded={open}
						aria-controls={`mod-panel-${mod.id}`}
						class="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600 sm:p-5"
					>
						<span class={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${complete ? 'bg-emerald-600 text-white' : 'bg-blue-50 text-blue-700'}`} aria-hidden="true">
							{#if complete}
								<i class="fa-solid fa-check"></i>
							{:else}
								{i + 1}
							{/if}
						</span>
						<span class="min-w-0 flex-1">
							<span id={`mod-title-${mod.id}`} class="block truncate text-sm font-bold text-slate-900 sm:text-base">
								Modul {i + 1}: {mod.title}
							</span>
							<span class="mt-0.5 block truncate text-xs text-slate-500">{mod.description}</span>
							<span class="mt-1.5 block text-[11px] font-semibold {complete ? 'text-emerald-600' : 'text-slate-500'}">
								{stat.done}/{stat.total} materi selesai
							</span>
						</span>
						<i class={`fa-solid fa-chevron-down shrink-0 text-sm text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} aria-hidden="true"></i>
					</button>
					{/if}

					{#if open && !modLocked}
						<div id={`mod-panel-${mod.id}`} class="border-t border-slate-100">
							<ol class="divide-y divide-slate-100">
								{#each mod.materials as mat, mati (mat.id)}
									{@const done = doneMaterials.has(mat.id)}
									{@const locked = isMaterialLocked(mod.materials, mati, (id) => doneMaterials.has(id))}
									<li>
										<div class={`flex items-center gap-3 px-4 py-3 transition-colors sm:px-5 ${done ? 'bg-emerald-50/40' : locked ? 'bg-slate-50/60' : 'hover:bg-slate-50/70'}`}>
											<button
												type="button"
												onclick={() => toggleDone(mat.id)}
												aria-pressed={done}
												aria-label={done ? `Tandai belum selesai: ${mat.title}` : `Tandai selesai: ${mat.title}`}
												class={`flex min-h-9 min-w-9 items-center justify-center rounded-full border-2 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white text-transparent hover:border-blue-500'}`}
											>
												<i class="fa-solid fa-check text-xs" aria-hidden="true"></i>
											</button>
											{#if locked}
												<span
													class="flex min-w-0 flex-1 cursor-not-allowed items-center gap-3 rounded-lg py-1 opacity-70"
													title="Selesaikan materi sebelumnya untuk membuka"
													aria-label={`Terkunci: ${mat.title}. Selesaikan materi sebelumnya untuk membuka.`}
												>
													<span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-200">
														<i class="fa-solid fa-lock text-xs text-slate-500" aria-hidden="true"></i>
													</span>
													<span class="min-w-0 flex-1">
														<span class="block truncate text-sm font-semibold text-slate-400">{mat.title}</span>
														<span class="mt-0.5 block text-[11px] text-slate-400">{typeLabel(mat.type)} · {mat.duration}</span>
													</span>
													<span class="hidden shrink-0 items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-500 sm:inline-flex">
														<i class="fa-solid fa-lock text-[10px]" aria-hidden="true"></i> Terkunci
													</span>
												</span>
											{:else}
											<a
												href={`/user/kursusku/${course.id}/${mod.id}/${mat.id}`}
												class="flex min-w-0 flex-1 items-center gap-3 rounded-lg py-1 focus-visible:outline-2 focus-visible:outline-blue-600"
												aria-label={`Buka materi ${typeLabel(mat.type)}: ${mat.title}`}
											>
												<span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
													<i class={`fa-solid ${typeIcon(mat.type)}`} aria-hidden="true"></i>
												</span>
												<span class="min-w-0 flex-1">
													<span class={`block truncate text-sm font-semibold ${done ? 'text-slate-500' : 'text-slate-800 hover:text-blue-700 hover:underline'}`}>{mat.title}</span>
													<span class="mt-0.5 block text-[11px] text-slate-500">{typeLabel(mat.type)} · {mat.duration}</span>
												</span>
												{#if mat.type === 'video'}
													<span class="hidden shrink-0 items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white sm:inline-flex">
														<i class="fa-solid fa-play text-[10px]" aria-hidden="true"></i> Putar
													</span>
												{:else if mat.type === 'audio'}
													<span class="hidden shrink-0 items-center gap-1.5 rounded-full bg-cyan-600 px-3 py-1.5 text-[11px] font-bold text-white sm:inline-flex">
														<i class="fa-solid fa-headphones text-[10px]" aria-hidden="true"></i> Dengar
													</span>
												{:else if mat.type === 'foto'}
													<span class="hidden shrink-0 rounded-full bg-slate-700 px-3 py-1.5 text-[11px] font-bold text-white sm:inline-block">Lihat</span>
												{:else if mat.type === 'kuis'}
													<span class="hidden shrink-0 rounded-full bg-amber-100 px-3 py-1.5 text-[11px] font-bold text-amber-700 sm:inline-block">Kerjakan</span>
												{:else if mat.type === 'tugas'}
													<span class="hidden shrink-0 rounded-full bg-violet-100 px-3 py-1.5 text-[11px] font-bold text-violet-700 sm:inline-block">Kumpulkan</span>
												{:else}
													<span class="hidden shrink-0 rounded-full bg-emerald-100 px-3 py-1.5 text-[11px] font-bold text-emerald-700 sm:inline-block">Baca</span>
												{/if}
											</a>
											{/if}
										</div>
									</li>
								{/each}
							</ol>
						</div>
					{/if}
				</section>
			{/each}
		</div>

		<!-- CTA bawah -->
		<div class="mt-6 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<p class="text-sm font-bold text-slate-900">Selesaikan semua modul untuk membuka sertifikat</p>
				<p class="text-xs text-slate-500">Progres tersimpan otomatis setiap kamu menandai materi selesai.</p>
			</div>
			<div class="flex gap-2">
				<a href="/user/kursusku" class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-slate-500">
					<i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Kursusku
				</a>
				<a href="/user/sertifikat" class="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-emerald-600">
					<i class="fa-solid fa-award" aria-hidden="true"></i> Sertifikat
				</a>
			</div>
		</div>
	{/if}
</div>
