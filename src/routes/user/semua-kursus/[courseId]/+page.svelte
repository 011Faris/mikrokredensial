<script lang="ts">
	import { page } from '$app/state';
	import { SvelteSet } from 'svelte/reactivity';
	import { getCourseById } from '$lib/data/courses';
	import { getCourseMeta, periodBadgeClass, periodIcon, periodLabel } from '$lib/data/course-meta';

	const courseId = $derived(Number(page.params.courseId));
	const course = $derived(getCourseById(courseId));
	const meta = $derived(course ? getCourseMeta(course.id) : undefined);

	const enrolled = $derived(course ? course.status !== 'not-started' : false);
	const totalMats = $derived(course?.modules.reduce((n, m) => n + m.materials.length, 0) ?? 0);

	let openModules = $state(new SvelteSet<string>());

	$effect(() => {
		if (!course) return;
		openModules.clear();
		if (course.modules[0]) openModules.add(course.modules[0].id);
	});

	function toggleModule(id: string) {
		if (openModules.has(id)) openModules.delete(id);
		else openModules.add(id);
	}

	function typeIcon(type: string): string {
		if (type === 'video') return 'fa-circle-play text-blue-600';
		if (type === 'audio') return 'fa-headphones text-cyan-600';
		if (type === 'foto') return 'fa-image text-slate-500';
		if (type === 'kuis') return 'fa-circle-question text-amber-600';
		if (type === 'tugas') return 'fa-pen-to-square text-violet-600';
		return 'fa-book-open text-emerald-600';
	}

	function typeLabel(type: string): string {
		if (type === 'video') return 'Video';
		if (type === 'audio') return 'Audio';
		if (type === 'foto') return 'Foto';
		if (type === 'kuis') return 'Kuis';
		if (type === 'tugas') return 'Tugas';
		return 'Bacaan';
	}
</script>

<svelte:head>
	<title>{course ? `${course.title} — Pratinjau` : 'Kursus tidak ditemukan'} — Aretê</title>
	<meta
		name="description"
		content={course ? `Pratinjau kursus ${course.title}: info, modul, dan materi.` : 'Pratinjau kursus'}
	/>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8">
	{#if !course || !meta}
		<div class="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center">
			<i class="fa-solid fa-triangle-exclamation mb-3 text-3xl text-amber-500" aria-hidden="true"></i>
			<h1 class="text-xl font-bold text-slate-900">Kursus tidak ditemukan</h1>
			<a
				href="/user/semua-kursus"
				class="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700"
			>
				<i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Kembali ke Semua Kursus
			</a>
		</div>
	{:else}
		<nav aria-label="Breadcrumb" class="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
			<a href="/user/semua-kursus" class="rounded font-semibold text-blue-600 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600">
				Semua Kursus
			</a>
			<i class="fa-solid fa-chevron-right text-[10px] text-slate-300" aria-hidden="true"></i>
			<span aria-current="page" class="max-w-64 truncate font-medium text-slate-700">{course.title}</span>
		</nav>

		<!-- Hero pratinjau -->
		<header class="mb-6 overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
			<div class="relative flex min-h-56 flex-col justify-end overflow-hidden sm:min-h-64">
				<img src={course.image} alt={`Sampul kursus ${course.title}`} class="absolute inset-0 h-full w-full object-cover" />
				<div class="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/40 to-slate-900/10" aria-hidden="true"></div>
				<div class="relative flex flex-wrap gap-2 p-4 pb-2 sm:px-6">
					<span class="rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold text-white uppercase">{course.category}</span>
					<span class="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white uppercase backdrop-blur">{course.level}</span>
					<span class={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase ${periodBadgeClass(meta.period)}`}>
						<i class={`fa-solid ${periodIcon(meta.period)}`} aria-hidden="true"></i>
						{periodLabel(meta)}
					</span>
					{#if enrolled}
						<span class="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-bold text-white uppercase">
							<i class="fa-solid fa-check" aria-hidden="true"></i> Sudah Diikuti
						</span>
					{/if}
				</div>
				<div class="relative p-4 pt-1 sm:px-6 sm:pb-5">
					<h1 class="text-xl leading-snug font-extrabold text-white sm:text-3xl">{course.title}</h1>
					<p class="mt-1 text-xs text-slate-200 sm:text-sm">Oleh {course.instructor} · {course.duration}</p>
				</div>
			</div>
			<dl class="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 sm:px-6 sm:py-5">
				<div class="rounded-xl bg-slate-50 p-3 text-center">
					<dt class="sr-only">Rating</dt>
					<dd class="text-base font-extrabold text-slate-900">★ {meta.rating} <span class="text-xs font-medium text-slate-500">({meta.reviews})</span></dd>
					<dd class="text-[10px] font-medium text-slate-500 uppercase">Rating</dd>
				</div>
				<div class="rounded-xl bg-slate-50 p-3 text-center">
					<dt class="sr-only">Peserta</dt>
					<dd class="text-base font-extrabold text-slate-900">{meta.students.toLocaleString('id-ID')}</dd>
					<dd class="text-[10px] font-medium text-slate-500 uppercase">Peserta</dd>
				</div>
				<div class="rounded-xl bg-slate-50 p-3 text-center">
					<dt class="sr-only">Jumlah modul dan materi</dt>
					<dd class="text-base font-extrabold text-slate-900">{course.modules.length} modul · {totalMats} materi</dd>
					<dd class="text-[10px] font-medium text-slate-500 uppercase">Konten</dd>
				</div>
				<div class="rounded-xl bg-slate-50 p-3 text-center">
					<dt class="sr-only">Harga</dt>
					<dd class="text-base font-extrabold text-blue-700">{meta.price}</dd>
					<dd class="text-[10px] font-medium text-slate-500 uppercase">Harga</dd>
				</div>
			</dl>
		</header>

		<div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
			<div class="min-w-0 space-y-6">
				<!-- Tentang -->
				<section aria-labelledby="pv-tentang" class="rounded-2xl border border-slate-200/70 bg-white p-5 sm:p-6">
					<h2 id="pv-tentang" class="mb-2 text-lg font-bold text-slate-900">Tentang Kursus Ini</h2>
					<p class="text-sm leading-relaxed text-slate-600">{course.description}</p>
				</section>

				<!-- Yang dipelajari -->
				<section aria-labelledby="pv-outcome" class="rounded-2xl border border-slate-200/70 bg-white p-5 sm:p-6">
					<h2 id="pv-outcome" class="mb-4 text-lg font-bold text-slate-900">Yang Akan Kamu Pelajari</h2>
					<ul class="grid gap-2.5 sm:grid-cols-2">
						{#each meta.outcomes as out (out)}
							<li class="flex items-start gap-2.5 text-sm text-slate-700">
								<i class="fa-solid fa-circle-check mt-0.5 shrink-0 text-emerald-500" aria-hidden="true"></i>
								<span>{out}</span>
							</li>
						{/each}
					</ul>
				</section>

				<!-- Kurikulum -->
				<section aria-labelledby="pv-kurikulum" class="overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
					<div class="p-5 pb-3 sm:px-6">
						<h2 id="pv-kurikulum" class="text-lg font-bold text-slate-900">Kurikulum</h2>
						<p class="mt-0.5 text-xs text-slate-500">
							{course.modules.length} modul · {totalMats} materi (video, bacaan, audio, foto, kuis, penugasan)
						</p>
					</div>
					<div class="space-y-3 p-5 pt-1 sm:px-6 sm:pb-6">
						{#each course.modules as mod, i (mod.id)}
							{@const open = openModules.has(mod.id)}
							<div class="overflow-hidden rounded-xl border border-slate-200">
								<button
									type="button"
									onclick={() => toggleModule(mod.id)}
									aria-expanded={open}
									class="flex w-full items-center gap-3 bg-slate-50 p-4 text-left transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600"
								>
									<span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-extrabold text-white" aria-hidden="true">
										{i + 1}
									</span>
									<span class="min-w-0 flex-1">
										<span class="block truncate text-sm font-bold text-slate-900">{mod.title}</span>
										<span class="block text-[11px] text-slate-500">{mod.materials.length} materi</span>
									</span>
									<i class={`fa-solid fa-chevron-down text-xs text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true"></i>
								</button>
								{#if open}
									<ol class="divide-y divide-slate-100 border-t border-slate-100">
										{#each mod.materials as mat (mat.id)}
											<li class="flex items-center gap-3 px-4 py-2.5">
												<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100" aria-hidden="true">
													<i class={`fa-solid ${typeIcon(mat.type)} text-xs`}></i>
												</span>
												<span class="min-w-0 flex-1">
													<span class="block truncate text-[13px] font-semibold text-slate-800">{mat.title}</span>
													<span class="block text-[11px] text-slate-500">{typeLabel(mat.type)} · {mat.duration}</span>
												</span>
												{#if i === 0 && mat === mod.materials[0]}
													<span class="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">Pratinjau</span>
												{/if}
											</li>
										{/each}
									</ol>
								{/if}
							</div>
						{/each}
					</div>
				</section>

				<!-- Syarat -->
				<section aria-labelledby="pv-syarat" class="rounded-2xl border border-slate-200/70 bg-white p-5 sm:p-6">
					<h2 id="pv-syarat" class="mb-3 text-lg font-bold text-slate-900">Syarat Mengikuti</h2>
					<ul class="space-y-2">
						{#each meta.requirements as req (req)}
							<li class="flex items-start gap-2.5 text-sm text-slate-600">
								<i class="fa-solid fa-circle-info mt-0.5 shrink-0 text-blue-400" aria-hidden="true"></i>
								<span>{req}</span>
							</li>
						{/each}
					</ul>
				</section>
			</div>

			<!-- Kartu aksi sticky -->
			<aside aria-label="Ringkasan dan pendaftaran kursus" class="overflow-hidden rounded-2xl border border-slate-200/70 bg-white lg:sticky lg:top-24">
				<div class="relative">
					<img src={course.image} alt="" aria-hidden="true" class="h-36 w-full object-cover" loading="lazy" />
					<span class="absolute bottom-3 left-4 rounded-lg bg-slate-900/80 px-3 py-1.5 text-lg font-extrabold text-white backdrop-blur">
						{meta.price}
					</span>
				</div>
				<div class="space-y-3 p-5">
					{#if meta.period === 'ended'}
						<span
							class="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 py-3 text-sm font-bold text-slate-500"
							title="Batch pelatihan ini sudah lewat"
							aria-label="Periode pelatihan sudah lewat"
						>
							<i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i> Periode Berakhir
						</span>
						<p class="text-center text-[11px] text-slate-500">
							Batch kursus ini sudah lewat. Pantau katalog untuk batch berikutnya.
						</p>
					{:else if enrolled}
						<a
							href={`/user/kursusku/${course.id}`}
							class="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
						>
							<i class="fa-solid fa-play" aria-hidden="true"></i> Lanjut Belajar
						</a>
					{:else}
						<a
							href={`/user/kursusku/${course.id}`}
							class="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
						>
							<i class="fa-solid fa-plus" aria-hidden="true"></i>
							{meta.period === 'upcoming' ? `Daftar Batch ${meta.startMonth ?? ''}`.trim() : 'Ikuti Kursus Gratis'}
						</a>
					{/if}
					<ul class="space-y-2 border-t border-slate-100 pt-3 text-[13px] text-slate-600">
						<li class="flex items-center gap-2.5">
							<i class="fa-solid fa-infinity w-4 text-center text-slate-400" aria-hidden="true"></i> Akses selamanya
						</li>
						<li class="flex items-center gap-2.5">
							<i class="fa-solid fa-award w-4 text-center text-slate-400" aria-hidden="true"></i> Sertifikat kelulusan
						</li>
						<li class="flex items-center gap-2.5">
							<i class="fa-solid fa-mobile-screen w-4 text-center text-slate-400" aria-hidden="true"></i> Belajar via HP & laptop
						</li>
						<li class="flex items-center gap-2.5">
							<i class="fa-solid fa-users w-4 text-center text-slate-400" aria-hidden="true"></i> Komunitas diskusi
						</li>
					</ul>
				</div>
			</aside>
		</div>
	{/if}
</div>
