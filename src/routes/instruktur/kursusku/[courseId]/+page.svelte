<script lang="ts">
	import { page } from '$app/state';
	import { SvelteSet } from 'svelte/reactivity';
	import { getCourseById, type CourseModule, type MaterialType } from '$lib/data/courses';
	import { getCourseMeta } from '$lib/data/course-meta';

	const courseId = $derived(Number(page.params.courseId));
	const course = $derived(getCourseById(courseId));
	const meta = $derived(course ? getCourseMeta(course.id) : undefined);

	let editableModules = $state<CourseModule[]>([]);
	let openModules = new SvelteSet<string>();
	let isPublished = $state(true);
	let savedMessage = $state('');

	const materialTypes: MaterialType[] = ['video', 'bacaan', 'audio', 'foto', 'kuis', 'tugas'];

	$effect(() => {
		if (!course) return;
		// Deep copy agar edit lokal tidak mengubah data global sebelum disimpan.
		editableModules = structuredClone(course.modules);
		isPublished = course.id !== 4;
		openModules.clear();
		const first = editableModules[0]?.id;
		if (first) openModules.add(first);
		savedMessage = '';
	});

	const totalMats = $derived(editableModules.reduce((n, m) => n + m.materials.length, 0));

	function toggleModule(id: string) {
		if (openModules.has(id)) openModules.delete(id);
		else openModules.add(id);
	}

	function markSaved(msg: string) {
		savedMessage = msg;
	}

	function addModule() {
		const idx = editableModules.length + 1;
		const id = `m${courseId}-local-${Date.now()}`;
		editableModules = [
			...editableModules,
			{ id, title: `Modul Baru ${idx}`, description: 'Deskripsi singkat modul baru.', materials: [] }
		];
		openModules.add(id);
		markSaved(`Modul ${idx} ditambahkan. Klik Simpan Kurikulum untuk menyimpan.`);
	}

	function removeModule(id: string) {
		editableModules = editableModules.filter((m) => m.id !== id);
		openModules.delete(id);
		markSaved('Modul dihapus dari draf lokal.');
	}

	function addMaterial(moduleId: string) {
		editableModules = editableModules.map((m) => {
			if (m.id !== moduleId) return m;
			return {
				...m,
				materials: [
					...m.materials,
					{
						id: `${moduleId}-mat-${Date.now()}`,
						title: 'Materi baru',
						type: 'video' as MaterialType,
						duration: '10 mnt',
						completed: false
					}
				]
			};
		});
		markSaved('Materi baru ditambahkan ke draf.');
	}

	function removeMaterial(moduleId: string, matId: string) {
		editableModules = editableModules.map((m) => {
			if (m.id !== moduleId) return m;
			return { ...m, materials: m.materials.filter((mat) => mat.id !== matId) };
		});
		markSaved('Materi dihapus dari draf.');
	}

	function typeIcon(type: string) {
		if (type === 'video') return 'fa-circle-play text-blue-600';
		if (type === 'audio') return 'fa-headphones text-cyan-600';
		if (type === 'foto') return 'fa-image text-slate-500';
		if (type === 'kuis') return 'fa-circle-question text-amber-600';
		if (type === 'tugas') return 'fa-pen-to-square text-violet-600';
		return 'fa-book-open text-emerald-600';
	}
</script>

<svelte:head>
	<title>{course ? `Kelola ${course.title}` : 'Kursus tidak ditemukan'} — Instruktur Aristoteles</title>
	<meta name="description" content={course ? `Kelola kurikulum, modul, dan materi ${course.title}` : 'Kelola kurikulum kursus'} />
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8">
	{#if !course}
		<div class="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center">
			<i class="fa-solid fa-triangle-exclamation mb-3 text-3xl text-amber-500" aria-hidden="true"></i>
			<h1 class="text-xl font-bold text-slate-900">Kursus tidak ditemukan</h1>
			<p class="mt-1 text-sm text-slate-500">ID kursus “{page.params.courseId}” tidak terdaftar di Kursusku.</p>
			<a href="/instruktur/kursusku" class="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700">
				<i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Kembali ke Kursusku
			</a>
		</div>
	{:else}
		<nav aria-label="Breadcrumb" class="mb-4 flex items-center gap-2 text-xs text-slate-500">
			<a href="/instruktur/kursusku" class="rounded font-semibold text-blue-600 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600">
				Kursusku
			</a>
			<i class="fa-solid fa-chevron-right text-[10px] text-slate-300" aria-hidden="true"></i>
			<span aria-current="page" class="truncate font-medium text-slate-700">{course.title}</span>
		</nav>

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
				<div class="relative flex flex-col gap-3 p-4 pt-14 sm:p-6 sm:pt-16 lg:flex-row lg:items-end lg:justify-between">
					<div class="min-w-0">
						<p class="text-[11px] font-bold tracking-widest text-blue-300 uppercase">
							{course.category} · {course.level}
						</p>
						<h1 class="mt-1.5 text-xl leading-snug font-extrabold text-white sm:text-2xl">
							{course.title}
						</h1>
						<p class="mt-1.5 text-xs text-slate-200 sm:text-sm">
							{editableModules.length} modul · {totalMats} materi · {meta?.students.toLocaleString('id-ID') ?? '-'} peserta · ★ {meta?.rating ?? '-'}
						</p>
					</div>
					<div class="flex shrink-0 items-center gap-2">
						<span
							class="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold {isPublished ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-600'}"
						>
							<i class="fa-solid {isPublished ? 'fa-eye' : 'fa-pen'} mr-1.5" aria-hidden="true"></i>
							{isPublished ? 'Terbit' : 'Draft'}
						</span>
						<button
							type="button"
							onclick={() => {
								isPublished = !isPublished;
								markSaved(isPublished ? 'Kursus diterbitkan.' : 'Kursus dikembalikan ke draft.');
							}}
							aria-pressed={isPublished}
							class="rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-800 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-white"
						>
							{isPublished ? 'Jadikan Draft' : 'Terbitkan'}
						</button>
					</div>
				</div>
			</div>
			<div class="flex flex-col gap-3 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
				<p class="max-w-2xl flex-1 text-sm text-slate-600">{course.description}</p>
				<div class="flex shrink-0 gap-2">
					<a href="/instruktur/penilaian" class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-slate-500">
						<i class="fa-solid fa-clipboard-check" aria-hidden="true"></i> Penilaian
					</a>
					<button
						type="button"
						onclick={() => markSaved('Draf kurikulum tersimpan (simulasi sisi klien).')}
						class="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
					>
						<i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Simpan Kurikulum
					</button>
				</div>
			</div>
			{#if savedMessage}
				<p role="status" class="flex items-center gap-2 border-t border-slate-100 bg-emerald-50/60 px-4 py-2.5 text-xs font-semibold text-emerald-700 sm:px-6">
					<i class="fa-solid fa-circle-check" aria-hidden="true"></i> {savedMessage}
				</p>
			{/if}
		</header>

		<div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h2 class="text-lg font-bold text-slate-900">Kurikulum ({editableModules.length} Modul)</h2>
				<p class="text-xs text-slate-500">Klik modul untuk membuka, edit judul, tambah/hapus materi langsung.</p>
			</div>
			<button
				type="button"
				onclick={addModule}
				class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-blue-300 bg-blue-50/60 px-4 py-2.5 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600"
			>
				<i class="fa-solid fa-plus" aria-hidden="true"></i> Tambah Modul
			</button>
		</div>

		<div class="space-y-4">
			{#each editableModules as mod, i (mod.id)}
				{@const open = openModules.has(mod.id)}
				<section aria-labelledby={`mod-title-${mod.id}`} class="overflow-hidden rounded-2xl border border-slate-200/70 bg-white transition-shadow {open ? 'shadow-lg' : ''}">
					<button
						type="button"
						onclick={() => toggleModule(mod.id)}
						aria-expanded={open}
						aria-controls={`mod-panel-${mod.id}`}
						class="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600 sm:p-5"
					>
						<span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-extrabold text-white" aria-hidden="true">
							{i + 1}
						</span>
						<span class="min-w-0 flex-1">
							<span id={`mod-title-${mod.id}`} class="block truncate text-sm font-bold text-slate-900 sm:text-base">
								Modul {i + 1}: {mod.title}
							</span>
							<span class="mt-0.5 block truncate text-xs text-slate-500">{mod.materials.length} materi</span>
						</span>
						<span class="hidden shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600 sm:inline-block">
							{mod.materials.length} materi
						</span>
						<i class={`fa-solid fa-chevron-down shrink-0 text-sm text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} aria-hidden="true"></i>
					</button>

					{#if open}
						<div id={`mod-panel-${mod.id}`} class="space-y-4 border-t border-slate-100 bg-slate-50/40 p-4 sm:p-5">
							<div class="grid gap-3 rounded-xl border border-slate-200 bg-white p-4">
								<div>
									<label for={`mod-title-input-${mod.id}`} class="mb-1 block text-xs font-bold text-slate-700">Judul modul</label>
									<input
										id={`mod-title-input-${mod.id}`}
										type="text"
										bind:value={mod.title}
										class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
									/>
								</div>
								<div>
									<label for={`mod-desc-input-${mod.id}`} class="mb-1 block text-xs font-bold text-slate-700">Deskripsi modul</label>
									<input
										id={`mod-desc-input-${mod.id}`}
										type="text"
										bind:value={mod.description}
										class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
									/>
								</div>
								<div class="flex flex-wrap gap-2">
									<button
										type="button"
										onclick={() => addMaterial(mod.id)}
										class="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-[11px] font-bold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
									>
										<i class="fa-solid fa-plus" aria-hidden="true"></i> Tambah Materi
									</button>
									<button
										type="button"
										onclick={() => removeModule(mod.id)}
										class="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-[11px] font-bold text-red-600 hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-red-500"
									>
										<i class="fa-solid fa-trash" aria-hidden="true"></i> Hapus Modul
									</button>
								</div>
							</div>

							{#if mod.materials.length === 0}
								<p class="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center text-xs text-slate-500">
									Belum ada materi di modul ini. Klik “Tambah Materi” untuk mulai menyusun kurikulum.
								</p>
							{:else}
								<ol class="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
									{#each mod.materials as mat (mat.id)}
										<li class="flex flex-col gap-3 p-3 sm:p-4 lg:flex-row lg:items-center">
											<span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
												<i class={`fa-solid ${typeIcon(mat.type)}`} aria-hidden="true"></i>
											</span>
											<div class="grid min-w-0 flex-1 gap-2 sm:grid-cols-[1fr_140px_110px]">
												<div>
													<label for={`mat-title-${mat.id}`} class="sr-only">Judul materi</label>
													<input
														id={`mat-title-${mat.id}`}
														type="text"
														bind:value={mat.title}
														class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
													/>
												</div>
												<div>
													<label for={`mat-type-${mat.id}`} class="sr-only">Tipe materi</label>
													<select
														id={`mat-type-${mat.id}`}
														bind:value={mat.type}
														class="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 focus:border-blue-500 focus:outline-none"
													>
														{#each materialTypes as t (t)}
															<option value={t}>{t}</option>
														{/each}
													</select>
												</div>
												<div>
													<label for={`mat-dur-${mat.id}`} class="sr-only">Durasi materi</label>
													<input
														id={`mat-dur-${mat.id}`}
														type="text"
														bind:value={mat.duration}
														placeholder="10 mnt"
														class="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 focus:border-blue-500 focus:outline-none"
													/>
												</div>
											</div>
											<button
												type="button"
												onclick={() => removeMaterial(mod.id, mat.id)}
												aria-label={`Hapus materi ${mat.title}`}
												class="flex min-h-10 min-w-10 items-center justify-center self-end rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-red-500 lg:self-auto"
											>
												<i class="fa-solid fa-trash text-xs" aria-hidden="true"></i>
											</button>
										</li>
									{/each}
								</ol>
							{/if}
						</div>
					{/if}
				</section>
			{/each}
		</div>

		<div class="mt-6 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<p class="text-sm font-bold text-slate-900">Kurikulum tersimpan sebagai draf lokal</p>
				<p class="text-xs text-slate-500">Total {editableModules.length} modul · {totalMats} materi. Klik Simpan untuk menerbitkan perubahan.</p>
			</div>
			<div class="flex gap-2">
				<a href="/instruktur/kursusku" class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-slate-500">
					<i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Kursusku
				</a>
				<button
					type="button"
					onclick={() => markSaved('Draf kurikulum tersimpan (simulasi sisi klien).')}
					class="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
				>
					<i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Simpan Kurikulum
				</button>
			</div>
		</div>
	{/if}
</div>
