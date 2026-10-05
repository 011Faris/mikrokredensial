<script lang="ts">
	import { page } from '$app/state';
	import { getCourseById, isMaterialLocked, isModuleLocked } from '$lib/data/courses';
	import { doneMaterials, ensureSeeded, markDone } from '$lib/stores/progress.svelte';
	import MaterialRenderer from '$lib/components/materials/MaterialRenderer.svelte';

	const courseId = $derived(Number(page.params.courseId));
	const course = $derived(getCourseById(courseId));
	const module = $derived(course?.modules.find((m) => m.id === page.params.moduleId));
	const matIndex = $derived(module?.materials.findIndex((m) => m.id === page.params.materialId) ?? -1);
	const material = $derived(matIndex >= 0 ? module?.materials[matIndex] : undefined);

	const moduleIndex = $derived(course?.modules.findIndex((m) => m.id === page.params.moduleId) ?? -1);
	const prev = $derived(
		module && matIndex > 0 ? module.materials[matIndex - 1] : undefined
	);
	const next = $derived(
		module && matIndex >= 0 && matIndex < module.materials.length - 1
			? module.materials[matIndex + 1]
			: undefined
	);

	/** Modul saat ini terkunci bila ada materi di modul sebelumnya yang belum selesai */
	const moduleLocked = $derived(
		!course || moduleIndex < 0
			? false
			: isModuleLocked(course.modules, moduleIndex, (id) => doneMaterials.has(id))
	);

	/** Materi saat ini terkunci bila modulnya terkunci atau ada materi sebelumnya yang belum selesai */
	const locked = $derived(
		!module || matIndex < 0
			? false
			: moduleLocked ||
				isMaterialLocked(module.materials, matIndex, (id) => doneMaterials.has(id))
	);

	/** Materi berikutnya terkunci? (untuk tombol navigasi) */
	const nextLocked = $derived(
		!module || !next
			? false
			: isMaterialLocked(module.materials, matIndex + 1, (id) => doneMaterials.has(id))
	);

	/** Modul setelah modul saat ini (untuk tombol lanjut di akhir modul) */
	const nextModule = $derived(
		course && moduleIndex >= 0 && moduleIndex < course.modules.length - 1
			? course.modules[moduleIndex + 1]
			: undefined
	);
	const nextModuleFirst = $derived(nextModule?.materials[0]);

	/** Materi pertama yang belum selesai (tujuan tombol "Kerjakan sekarang") */
	const firstUnfinished = $derived(module?.materials.find((m) => !doneMaterials.has(m.id)));

	// Sinkron status awal dari data (sekali per kursus)
	$effect(() => {
		if (course) ensureSeeded(course);
	});

	/** Panel daftar modul di sidebar (khusus layar kecil) */
	let showModules = $state(false);

	/** Sidebar modul diciutkan (layar besar) agar materi tampil penuh */
	let modulesCollapsed = $state(false);

	function closeModuleNav() {
		if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
			modulesCollapsed = true;
		} else {
			showModules = false;
		}
	}

	function openModuleNav() {
		modulesCollapsed = false;
	}

	const totalMats = $derived(course?.modules.reduce((n, m) => n + m.materials.length, 0) ?? 0);

	function typeBadge(type: string): string {
		if (type === 'video') return 'bg-blue-600 text-white';
		if (type === 'audio') return 'bg-cyan-600 text-white';
		if (type === 'foto') return 'bg-slate-700 text-white';
		if (type === 'kuis') return 'bg-amber-500 text-white';
		if (type === 'tugas') return 'bg-violet-600 text-white';
		return 'bg-emerald-600 text-white';
	}

	function typeIcon(type: string): string {
		if (type === 'video') return 'fa-circle-play';
		if (type === 'audio') return 'fa-headphones';
		if (type === 'foto') return 'fa-image';
		if (type === 'kuis') return 'fa-circle-question';
		if (type === 'tugas') return 'fa-pen-to-square';
		return 'fa-book-open';
	}

	function typeLabel(type: string): string {
		if (type === 'video') return 'Video';
		if (type === 'audio') return 'Audio';
		if (type === 'foto') return 'Foto';
		if (type === 'kuis') return 'Kuis';
		if (type === 'tugas') return 'Penugasan';
		return 'Bacaan';
	}
</script>

<svelte:head>
	<title>
		{material && course ? `${material.title} — ${course.title}` : 'Materi tidak ditemukan'} — Aretê
	</title>
	<meta
		name="description"
		content={material ? `Materi pembelajaran: ${material.title}` : 'Detail materi kursus'}
	/>
</svelte:head>

<div class="min-h-screen">
	{#if !course || !module || !material}
		<div class="mx-auto max-w-lg p-4 sm:p-6">
			<div class="rounded-2xl border border-slate-200 bg-white p-10 text-center">
			<i class="fa-solid fa-triangle-exclamation mb-3 text-3xl text-amber-500" aria-hidden="true"></i>
			<h1 class="text-xl font-bold text-slate-900">Materi tidak ditemukan</h1>
			<p class="mt-1 text-sm text-slate-500">Tautan materi ini tidak valid atau sudah dipindahkan.</p>
			<a
				href="/user/kursusku"
				class="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700"
			>
				<i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Kembali ke Kursusku
			</a>
			</div>
		</div>
	{:else}
		<!-- Top bar ramping pengganti header utama -->
		<div class="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
			<div class="flex h-14 items-center gap-3 px-4 sm:px-6">
				<a
					href={`/user/kursusku/${course.id}`}
					class="flex min-h-10 min-w-10 items-center justify-center rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600"
					aria-label={`Kembali ke modul ${course.title}`}
				>
					<i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
				</a>
				<span class="h-6 w-px bg-slate-200" aria-hidden="true"></span>
				<div class="min-w-0 flex-1">
					<p class="truncate text-sm font-bold text-slate-900">{course.title}</p>
					<p class="truncate text-[11px] text-slate-500">
						Modul {(moduleIndex ?? 0) + 1} · Materi {matIndex + 1} dari {module.materials.length}
					</p>
				</div>
				<a
					href="/user"
					class="hidden items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600 sm:inline-flex"
				>
					<i class="fa-solid fa-house" aria-hidden="true"></i> Dashboard
				</a>
			</div>
		</div>

		<div class="p-4 sm:p-6">
		<nav aria-label="Breadcrumb" class="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
			<a href="/user/kursusku" class="rounded font-semibold text-blue-600 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600">
				Kursusku
			</a>
			<i class="fa-solid fa-chevron-right text-[10px] text-slate-300" aria-hidden="true"></i>
			<a
				href={`/user/kursusku/${course.id}`}
				class="max-w-40 truncate rounded font-semibold text-blue-600 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
			>
				{course.title}
			</a>
			<i class="fa-solid fa-chevron-right text-[10px] text-slate-300" aria-hidden="true"></i>
			<a
				href={`/user/kursusku/${course.id}`}
				class="rounded font-medium text-slate-600 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600"
			>
				Modul {(moduleIndex ?? 0) + 1}
			</a>
			<i class="fa-solid fa-chevron-right text-[10px] text-slate-300" aria-hidden="true"></i>
			<span aria-current="page" class="max-w-48 truncate font-medium text-slate-700">{material.title}</span>
		</nav>

		<button
			type="button"
			onclick={() => (showModules = !showModules)}
			aria-expanded={showModules}
			aria-controls="modul-nav"
			class="mt-4 flex min-h-11 w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600 lg:hidden"
		>
			<span class="flex items-center gap-2.5">
				<i class="fa-solid fa-list-ul text-blue-600" aria-hidden="true"></i>
				Daftar Modul ({course.modules.length})
			</span>
			<i class={`fa-solid fa-chevron-down text-xs text-slate-400 transition-transform ${showModules ? 'rotate-180' : ''}`} aria-hidden="true"></i>
		</button>

		<div
			class="mt-4 grid grid-cols-1 items-start gap-6 transition-[grid-template-columns] duration-300 ease-in-out motion-reduce:transition-none lg:grid-cols-[var(--nav-w)_minmax(0,1fr)]"
			style:--nav-w={modulesCollapsed ? '3.5rem' : '20rem'}
		>
			<aside
				id="modul-nav"
				aria-label="Daftar modul kursus"
				class={`${showModules ? 'block' : 'hidden'} relative overflow-hidden rounded-2xl ${modulesCollapsed ? 'border-transparent bg-transparent' : 'border border-slate-200/70 bg-white'} lg:sticky lg:top-[72px] lg:block lg:max-h-[calc(100vh-6rem)]`}
			>
				<!-- Satu kotak panah saat sidebar diciutkan -->
				<div
					class={`flex justify-center transition-all delay-100 duration-300 motion-reduce:transition-none ${modulesCollapsed ? 'visible opacity-100' : 'pointer-events-none invisible h-0 opacity-0'}`}
				>
					<button
						type="button"
						onclick={openModuleNav}
						aria-expanded={!modulesCollapsed}
						aria-controls="modul-nav"
						aria-label="Tampilkan daftar modul"
						title="Tampilkan daftar modul"
						tabindex={modulesCollapsed ? undefined : -1}
						class="flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
					>
						<i class="fa-solid fa-angles-right text-base" aria-hidden="true"></i>
					</button>
				</div>
				<!-- Panel penuh -->
				<div
					class={`w-80 max-lg:max-w-full transition-all duration-300 ease-in-out motion-reduce:transition-none ${modulesCollapsed ? 'pointer-events-none invisible -translate-x-4 opacity-0' : 'visible translate-x-0 opacity-100'} lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto`}
				>
				<div class="flex items-center justify-between gap-2 border-b border-slate-100 p-4">
					<div class="min-w-0">
						<p class="mt-1 line-clamp-2 text-sm font-bold text-slate-900">{course.title}</p>
						<p class="mt-0.5 text-[11px] text-slate-500">
							{course.modules.length} modul · {totalMats} materi
						</p>
					</div>
					<button
						type="button"
						onclick={closeModuleNav}
						aria-controls="modul-nav"
						aria-label="Sembunyikan daftar modul"
						title="Sembunyikan daftar modul"
						class="flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-blue-600"
					>
						<i class="fa-solid fa-angles-left text-base" aria-hidden="true"></i>
					</button>
				</div>
				<nav aria-label="Modul dan materi" class="max-h-[60vh] overflow-y-auto p-2 lg:max-h-none lg:overflow-visible">
					{#each course.modules as mod, mi (mod.id)}
						{@const isCurrentModule = mod.id === module.id}
						{@const modLocked = !isCurrentModule && isModuleLocked(course.modules, mi, (id) => doneMaterials.has(id))}
						<section aria-label={`Modul ${mi + 1}: ${mod.title}`} class="mb-1">
							<p class={`flex items-center gap-1.5 px-3 pt-3 pb-1 text-[11px] font-extrabold tracking-wide uppercase ${isCurrentModule ? 'text-blue-700' : 'text-slate-400'}`}>
								{#if modLocked}<i class="fa-solid fa-lock text-[9px]" aria-hidden="true"></i>{/if}
								<span class="truncate">Modul {mi + 1}: {mod.title}</span>
							</p>
							<ol class="space-y-0.5">
								{#each mod.materials as mat, mati (mat.id)}
									{@const isCurrent = mat.id === material.id}
									{@const matDone = doneMaterials.has(mat.id)}
									{@const locked = modLocked || (!isCurrent && isMaterialLocked(mod.materials, mati, (id) => doneMaterials.has(id)))}
									<li>
										{#if locked}
											<span
												class="flex cursor-not-allowed items-center gap-2.5 rounded-xl px-3 py-2 opacity-60"
												title="Selesaikan materi sebelumnya untuk membuka"
												aria-label={`Terkunci: ${mat.title}`}
											>
												<span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-400" aria-hidden="true">
													<i class="fa-solid fa-lock text-[8px]"></i>
												</span>
												<span class="min-w-0 flex-1 truncate text-[13px] text-slate-400">{mat.title}</span>
											</span>
										{:else}
										<a
											href={`/user/kursusku/${course.id}/${mod.id}/${mat.id}`}
											aria-current={isCurrent ? 'page' : undefined}
											class={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${
												isCurrent
													? 'bg-blue-600 font-bold text-white shadow-md shadow-blue-600/25'
													: 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
											}`}
										>
											<span
												class={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-extrabold ${
													isCurrent
														? 'bg-white/20 text-white'
														: matDone
															? 'bg-emerald-100 text-emerald-700'
															: 'bg-slate-100 text-slate-500'
												}`}
												aria-hidden="true"
											>
												{#if isCurrent}
													<i class="fa-solid fa-play text-[8px]"></i>
												{:else if matDone}
													<i class="fa-solid fa-check text-[8px]"></i>
												{:else}
													{mati + 1}
												{/if}
											</span>
											<span class="min-w-0 flex-1 truncate text-[13px]">{mat.title}</span>
										</a>
										{/if}
									</li>
								{/each}
							</ol>
						</section>
					{/each}
				</nav>
				</div>
			</aside>

			<div class={`mx-auto w-full min-w-0 ${modulesCollapsed ? 'max-w-5xl' : 'max-w-4xl'}`}>
		<header class="mb-5 rounded-2xl border border-slate-200/70 bg-white p-5 sm:p-6">
			<div class="flex flex-wrap items-center gap-2">
				<span
					class={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${typeBadge(material.type)}`}
				>
					<i class={`fa-solid ${typeIcon(material.type)}`} aria-hidden="true"></i>
					{typeLabel(material.type)}
				</span>
				<span class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
					<i class="fa-regular fa-clock" aria-hidden="true"></i> {material.duration}
				</span>
				<span class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
					Materi {matIndex + 1} dari {module.materials.length}
				</span>
			</div>
			<h1 class="mt-3 text-xl leading-snug font-extrabold text-slate-900 sm:text-2xl">
				{material.title}
			</h1>
			<p class="mt-1 text-xs text-slate-500 sm:text-sm">
				{course.title} · Modul {(moduleIndex ?? 0) + 1}: {module.title}
			</p>
		</header>

		<article aria-label={`Isi materi: ${material.title}`} class="rounded-2xl border border-slate-200/70 bg-white p-5 sm:p-6">
			{#if locked}
				<div class="py-6 text-center">
					<span class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100" aria-hidden="true">
						<i class="fa-solid fa-lock text-2xl text-slate-400"></i>
					</span>
					<h2 class="text-lg font-extrabold text-slate-900">Materi Terkunci</h2>
					{#if moduleLocked}
						<p class="mx-auto mt-1 max-w-md text-sm text-slate-500">
							Selesaikan <strong class="text-slate-700">Modul {moduleIndex}</strong> terlebih dahulu
							untuk membuka modul ini.
						</p>
						<a
							href={`/user/kursusku/${course.id}`}
							class="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/25 transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
						>
							<i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
							Kembali ke Daftar Modul
						</a>
					{:else}
					<p class="mx-auto mt-1 max-w-md text-sm text-slate-500">
						Selesaikan materi sebelumnya dalam modul ini untuk membuka
						<strong class="text-slate-700">“{material.title}”</strong>.
					</p>
					{#if firstUnfinished}
						<a
							href={`/user/kursusku/${course.id}/${module.id}/${firstUnfinished.id}`}
							class="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/25 transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
						>
							<i class="fa-solid fa-play" aria-hidden="true"></i>
							Kerjakan: {firstUnfinished.title}
						</a>
					{/if}
					{/if}
				</div>
			{:else}
			{#key material.id}
				<MaterialRenderer {material} {course} moduleTitle={module.title} onComplete={markDone} />
			{/key}
			{/if}
		</article>

		<nav aria-label="Navigasi materi" class="mt-5 grid grid-cols-2 gap-3">
			{#if prev}
				<a
					href={`/user/kursusku/${course.id}/${module.id}/${prev.id}`}
					class="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-blue-600"
				>
					<i class="fa-solid fa-arrow-left shrink-0 text-slate-400 transition-transform group-hover:-translate-x-0.5" aria-hidden="true"></i>
					<span class="min-w-0">
						<span class="block text-[10px] font-bold tracking-wide text-slate-400 uppercase">Sebelumnya</span>
						<span class="block truncate text-sm font-bold text-slate-800">{prev.title}</span>
					</span>
				</a>
			{:else}
				<span></span>
			{/if}
			{#if next}
				<a
					href={`/user/kursusku/${course.id}/${module.id}/${next.id}`}
					onclick={() => markDone(material.id)}
					class="group flex items-center justify-end gap-3 rounded-2xl bg-blue-600 p-4 text-right text-white shadow-lg shadow-blue-600/25 transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
					aria-label={nextLocked ? `Lanjutkan dan buka: ${next.title}` : `Lanjut ke: ${next.title}`}
				>
					<span class="min-w-0">
						<span class="block text-[10px] font-bold tracking-wide text-blue-200 uppercase">
							{nextLocked ? 'Buka materi' : 'Berikutnya'}
						</span>
						<span class="block truncate text-sm font-bold">{next.title}</span>
					</span>
					<i class={`fa-solid ${nextLocked ? 'fa-lock-open' : 'fa-arrow-right'} shrink-0 transition-transform group-hover:translate-x-0.5`} aria-hidden="true"></i>
				</a>
			{:else if nextModule && nextModuleFirst}
				<a
					href={`/user/kursusku/${course.id}/${nextModule.id}/${nextModuleFirst.id}`}
					onclick={() => markDone(material.id)}
					class="group flex items-center justify-end gap-3 rounded-2xl bg-indigo-600 p-4 text-right text-white shadow-lg shadow-indigo-600/25 transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-600"
					aria-label={`Lanjut ke Modul ${(moduleIndex ?? 0) + 2}: ${nextModuleFirst.title}`}
				>
					<span class="min-w-0">
						<span class="block text-[10px] font-bold tracking-wide text-indigo-200 uppercase">Lanjut Modul {(moduleIndex ?? 0) + 2}</span>
						<span class="block truncate text-sm font-bold">{nextModuleFirst.title}</span>
					</span>
					<i class="fa-solid fa-forward shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true"></i>
				</a>
			{:else}
				<a
					href={`/user/kursusku/${course.id}`}
					class="flex items-center justify-end gap-3 rounded-2xl bg-emerald-600 p-4 text-right text-white shadow-lg shadow-emerald-600/25 transition-colors hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-emerald-600"
				>
					<span class="min-w-0">
						<span class="block text-[10px] font-bold tracking-wide text-emerald-200 uppercase">Selesai</span>
						<span class="block truncate text-sm font-bold">Kembali ke Modul</span>
					</span>
					<i class="fa-solid fa-check shrink-0" aria-hidden="true"></i>
				</a>
			{/if}
		</nav>
			</div>
		</div>
		</div>
	{/if}
</div>
