<script lang="ts">
	import { goto } from '$app/navigation';
	import type { CourseModule } from '$lib/data/courses';
	import CurriculumEditor from '$lib/components/training/organisms/CurriculumEditor.svelte';

	type Period = 'upcoming' | 'ongoing';
	type PublishState = 'draft' | 'published';

	const CATEGORIES = [
		'Pengembangan Web',
		'Basis Data',
		'Jaringan',
		'Keamanan',
		'AI & Data',
		'Infrastruktur',
		'Desain',
		'Bisnis'
	];
	const LEVELS = ['Pemula', 'Menengah', 'Lanjutan'];

	const uid = (prefix: string) =>
		`${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`;

	// ---- Langkah ----
	let step = $state<1 | 2 | 3>(1);
	let submitted = $state(false);
	let submittedStatus = $state<PublishState>('draft');
	let errorSummaryEl = $state<HTMLElement | null>(null);

	// ---- Step 1: info dasar ----
	let title = $state('');
	let category = $state('');
	let level = $state('Pemula');
	let duration = $state('');
	let description = $state('');
	let coverUrl = $state('');
	let coverPreview = $state('');
	let period = $state<Period>('upcoming');
	let startMonth = $state('');
	let priceKind = $state<'GRATIS' | 'Berbayar'>('GRATIS');
	let priceNominal = $state('');

	// ---- Step 2: hasil + kurikulum (hierarki Modul → Sub-modul → Materi) ----
	let outcomes = $state<string[]>(['', '']);
	let requirements = $state<string[]>(['']);
	let modules = $state<CourseModule[]>([
		{
			id: uid('mod'),
			title: '',
			description: '',
			materials: [],
			subModules: [
				{
					id: uid('sub'),
					title: '',
					description: '',
					materials: [{ id: uid('mat'), title: '', type: 'video', duration: '', completed: false }]
				}
			]
		}
	]);

	// ---- Step 3 ----
	let publishState = $state<PublishState>('draft');
	let agree = $state(false);

	let errors = $state<Record<string, string>>({});

	const coverSrc = $derived(
		coverPreview ||
			coverUrl.trim() ||
			'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
	);
	const totalMaterials = $derived(
		modules.reduce(
			(n, m) => n + (m.subModules ?? []).reduce((k, s) => k + s.materials.length, 0),
			0
		)
	);
	const totalSubs = $derived(modules.reduce((n, m) => n + (m.subModules ?? []).length, 0));
	const descCount = $derived(description.trim().length);

	const startMonthLabel = $derived.by(() => {
		if (!startMonth) return '';
		const [y, m] = startMonth.split('-').map(Number);
		if (!y || !m) return startMonth;
		const names = [
			'Januari',
			'Februari',
			'Maret',
			'April',
			'Mei',
			'Juni',
			'Juli',
			'Agustus',
			'September',
			'Oktober',
			'November',
			'Desember'
		];
		return `${names[m - 1] ?? ''} ${y}`.trim();
	});

	const checklist = $derived([
		{ label: 'Judul ≥ 10 karakter', done: title.trim().length >= 10 },
		{ label: 'Kategori dipilih', done: category !== '' },
		{ label: 'Deskripsi ≥ 30 karakter', done: descCount >= 30 },
		{ label: 'Durasi diisi', done: duration.trim().length >= 3 },
		{
			label: period === 'upcoming' ? 'Bulan mulai batch diisi' : 'Periode batch dipilih',
			done: period === 'ongoing' || startMonth !== ''
		},
		{
			label: 'Minimal 2 hasil belajar',
			done: outcomes.filter((o) => o.trim().length >= 10).length >= 2
		},
		{ label: 'Minimal 1 syarat', done: requirements.some((r) => r.trim().length >= 5) },
		{
			label: 'Minimal 1 modul + 1 materi valid',
			done:
				modules.length > 0 &&
				modules.every((m) => {
					const subs = m.subModules ?? [];
					const mats = subs.flatMap((s) => s.materials);
					return (
						m.title.trim().length >= 5 &&
						subs.length > 0 &&
						subs.every((s) => s.title.trim().length >= 3) &&
						mats.length > 0 &&
						mats.every((mat) => mat.title.trim().length >= 3 && mat.duration.trim() !== '')
					);
				})
		}
	]);
	const doneCount = $derived(checklist.filter((c) => c.done).length);
	const progressPct = $derived(Math.round((doneCount / checklist.length) * 100));

	function setError(key: string, msg: string) {
		if (msg) errors[key] = msg;
		else delete errors[key];
	}

	function validateStep1(): boolean {
		const next: Record<string, string> = {};
		if (title.trim().length < 10)
			next['title'] = 'Judul minimal 10 karakter agar jelas di katalog.';
		if (title.trim().length > 120) next['title'] = 'Judul maksimal 120 karakter.';
		if (!category) next['category'] = 'Pilih kategori pelatihan.';
		if (duration.trim().length < 3)
			next['duration'] = 'Isi durasi, contoh: “6 Minggu” atau “20 Jam”.';
		if (descCount < 30)
			next['description'] = `Deskripsi masih ${descCount} karakter, minimal 30 karakter.`;
		if (description.trim().length > 1000) next['description'] = 'Deskripsi maksimal 1000 karakter.';
		if (coverUrl.trim() && !/^https?:\/\/.+\..+/.test(coverUrl.trim()))
			next['coverUrl'] = 'URL sampul harus diawali http(s):// dan valid.';
		if (period === 'upcoming' && !startMonth)
			next['startMonth'] = 'Batch akan datang wajib punya bulan mulai.';
		if (priceKind === 'Berbayar' && priceNominal.trim().length < 3)
			next['priceNominal'] = 'Isi nominal harga, contoh: “Rp 149.000”.';
		errors = { ...errors, ...next };
		for (const k of [
			'title',
			'category',
			'duration',
			'description',
			'coverUrl',
			'startMonth',
			'priceNominal'
		]) {
			if (!(k in next)) delete errors[k];
		}
		return Object.keys(next).length === 0;
	}

	function validateStep2(): boolean {
		const next: Record<string, string> = {};
		const validOutcomes = outcomes.filter((o) => o.trim().length >= 10);
		if (validOutcomes.length < 2)
			next['outcomes'] = 'Isi minimal 2 hasil belajar, masing-masing ≥ 10 karakter.';
		const validReqs = requirements.filter((r) => r.trim().length >= 5);
		if (validReqs.length < 1) next['requirements'] = 'Isi minimal 1 syarat mengikuti.';
		if (modules.length < 1) next['modules'] = 'Tambahkan minimal 1 modul.';
		modules.forEach((m, i) => {
			if (m.title.trim().length < 5)
				next[`mod-${m.id}`] = `Judul Modul ${i + 1} minimal 5 karakter.`;
			const subs = m.subModules ?? [];
			const mats = subs.flatMap((s) => s.materials);
			if (mats.length < 1)
				next[`mod-${m.id}-mats`] = `Modul ${i + 1} wajib punya minimal 1 materi.`;
			subs.forEach((s, j) => {
				if (s.title.trim().length < 3)
					next[`sub-${s.id}`] = `Judul Sub-modul ${j + 1} pada Modul ${i + 1} minimal 3 karakter.`;
				s.materials.forEach((mat) => {
					if (mat.title.trim().length < 3) next[`mat-${mat.id}`] = 'Judul materi minimal 3 karakter.';
					if (!mat.duration.trim())
						next[`matdur-${mat.id}`] = 'Durasi materi wajib diisi (cth: “15 mnt”).';
				});
			});
		});
		// hapus error step2 lama
		for (const k of Object.keys(errors)) {
			if (
				k.startsWith('mod-') ||
				k.startsWith('sub-') ||
				k.startsWith('mat') ||
				k === 'outcomes' ||
				k === 'requirements' ||
				k === 'modules'
			)
				delete errors[k];
		}
		errors = { ...errors, ...next };
		return Object.keys(next).length === 0;
	}

	function focusSummary() {
		requestAnimationFrame(() => errorSummaryEl?.focus());
	}

	function goNext() {
		if (step === 1) {
			if (!validateStep1()) {
				focusSummary();
				return;
			}
			step = 2;
		} else if (step === 2) {
			if (!validateStep2()) {
				focusSummary();
				return;
			}
			step = 3;
		}
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function goBack() {
		if (step > 1) step = (step - 1) as 1 | 2 | 3;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function onCoverFile(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		setError('coverUrl', '');
		if (!file) return;
		if (!file.type.startsWith('image/')) {
			errors['coverUrl'] = 'Berkas sampul harus berupa gambar (JPG/PNG/WebP).';
			return;
		}
		if (file.size > 2 * 1024 * 1024) {
			errors['coverUrl'] = 'Ukuran gambar maksimal 2 MB.';
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			coverPreview = String(reader.result ?? '');
		};
		reader.readAsDataURL(file);
	}

	function addOutcome() {
		outcomes = [...outcomes, ''];
	}
	function removeOutcome(i: number) {
		outcomes = outcomes.filter((_, x) => x !== i);
	}

	function addRequirement() {
		requirements = [...requirements, ''];
	}
	function removeRequirement(i: number) {
		requirements = requirements.filter((_, x) => x !== i);
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		const ok1 = validateStep1();
		const ok2 = validateStep2();
		const next: Record<string, string> = {};
		if (publishState === 'published' && !agree)
			next['agree'] = 'Centang pernyataan kebenaran konten sebelum menerbitkan.';
		errors = { ...errors, ...next };
		if (!next['agree']) delete errors['agree'];
		if (!ok1 || !ok2 || Object.keys(next).length > 0) {
			if (!ok1) step = 1;
			else if (!ok2) step = 2;
			focusSummary();
			return;
		}
		const payload = {
			title: title.trim(),
			category,
			level,
			duration: duration.trim(),
			description: description.trim(),
			cover: coverPreview || coverUrl.trim(),
			period,
			startMonth: startMonthLabel,
			price: priceKind === 'GRATIS' ? 'GRATIS' : priceNominal.trim(),
			outcomes: outcomes.map((o) => o.trim()).filter(Boolean),
			requirements: requirements.map((r) => r.trim()).filter(Boolean),
			modules: modules.map((m) => ({
				title: m.title.trim(),
				description: m.description.trim(),
				materials: (m.subModules ?? []).flatMap((s) => s.materials).map((x) => ({
					title: x.title.trim(),
					type: x.type,
					duration: x.duration.trim()
				})),
				subModules: (m.subModules ?? []).map((s) => ({
					title: s.title.trim(),
					description: s.description.trim(),
					materials: s.materials.map((x) => ({
						title: x.title.trim(),
						type: x.type,
						duration: x.duration.trim()
					}))
				}))
			})),
			status: publishState,
			createdAt: new Date().toISOString()
		};
		try {
			const key = 'instruktur-draft-course';
			const prev = JSON.parse(localStorage.getItem(key) ?? '[]');
			localStorage.setItem(key, JSON.stringify([...prev, payload]));
		} catch {
			/* abaikan gagal storage */
		}
		submittedStatus = publishState;
		submitted = true;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	const errorList = $derived(Object.entries(errors));
	const inputCls = (bad: boolean) =>
		`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:outline-none ${bad ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'}`;
</script>

<svelte:head>
	<title>Tambah Pelatihan — Instruktur Aristoteles</title>
	<meta
		name="description"
		content="Buat pelatihan baru: isi info dasar, susun kurikulum awal, lalu terbitkan atau simpan sebagai draft."
	/>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8">
	{#if submitted}
		<div
			class="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-slate-200/70 bg-white text-center shadow-sm"
		>
			<div
				class="bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 px-6 py-10 text-white"
			>
				<span
					class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur"
					aria-hidden="true"
				>
					<i class="fa-solid fa-circle-check text-2xl"></i>
				</span>
				<h1 class="mt-4 text-xl font-extrabold sm:text-2xl">
					{submittedStatus === 'published' ? 'Pelatihan diterbitkan!' : 'Draft tersimpan!'}
				</h1>
				<p class="mx-auto mt-1.5 max-w-md text-sm text-emerald-50">
					“{title.trim()}” {submittedStatus === 'published'
						? 'sudah live dan bisa dikelola kurikulumnya.'
						: 'tersimpan sebagai draft. Lengkapi lagi kapan pun dari Kursusku.'}
				</p>
			</div>
			<dl class="grid grid-cols-2 gap-3 p-5 text-left sm:grid-cols-4">
				<div class="rounded-xl bg-slate-50 p-3 text-center">
					<dt class="sr-only">Kategori</dt>
					<dd class="truncate text-sm font-bold text-slate-900">{category}</dd>
					<dd class="text-[10px] font-bold tracking-wide text-slate-500 uppercase">Kategori</dd>
				</div>
				<div class="rounded-xl bg-slate-50 p-3 text-center">
					<dt class="sr-only">Durasi</dt>
					<dd class="text-sm font-bold text-slate-900">{duration}</dd>
					<dd class="text-[10px] font-bold tracking-wide text-slate-500 uppercase">Durasi</dd>
				</div>
				<div class="rounded-xl bg-slate-50 p-3 text-center">
					<dt class="sr-only">Modul</dt>
					<dd class="text-sm font-bold text-slate-900">{modules.length} modul</dd>
					<dd class="text-[10px] font-bold tracking-wide text-slate-500 uppercase">Modul</dd>
				</div>
				<div class="rounded-xl bg-slate-50 p-3 text-center">
					<dt class="sr-only">Materi</dt>
					<dd class="text-sm font-bold text-slate-900">{totalMaterials} materi</dd>
					<dd class="text-[10px] font-bold tracking-wide text-slate-500 uppercase">Materi</dd>
				</div>
			</dl>
			<div class="flex flex-col gap-2 border-t border-slate-100 p-5 sm:flex-row sm:justify-center">
				<a
					href="/instruktur/kursusku"
					class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
				>
					<i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Kembali ke Kursusku
				</a>
				<button
					type="button"
					onclick={() => goto('/instruktur/kursusku/tambah')}
					class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-slate-500"
				>
					<i class="fa-solid fa-plus" aria-hidden="true"></i> Buat Pelatihan Lain
				</button>
			</div>
		</div>
	{:else}
		<nav aria-label="Breadcrumb" class="mb-4 flex items-center gap-2 text-xs text-slate-500">
			<a
				href="/instruktur/kursusku"
				class="rounded font-semibold text-blue-600 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
				>Kursusku</a
			>
			<i class="fa-solid fa-chevron-right text-[10px] text-slate-300" aria-hidden="true"></i>
			<span aria-current="page" class="font-medium text-slate-700">Tambah Pelatihan</span>
		</nav>

		<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<p class="text-xs font-bold tracking-widest text-blue-600 uppercase">
					Instruktur · Pelatihan Baru
				</p>
				<h1 class="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
					Tambah Pelatihan
				</h1>
				<p class="mt-1 max-w-xl text-sm text-slate-500">
					Tiga langkah cepat: info dasar, kurikulum awal, lalu review. Bisa disimpan sebagai draft
					di langkah terakhir.
				</p>
			</div>
			<a
				href="/instruktur/kursusku"
				class="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-slate-500"
			>
				<i class="fa-solid fa-xmark" aria-hidden="true"></i> Batal
			</a>
		</div>

		<!-- Stepper -->
		<ol aria-label="Langkah pembuatan pelatihan" class="mb-6 grid gap-2 sm:grid-cols-3">
			{#each [{ n: 1, t: 'Info Dasar', d: 'Judul, kategori & batch' }, { n: 2, t: 'Kurikulum Awal', d: 'Hasil & modul' }, { n: 3, t: 'Review', d: 'Terbitkan / draft' }] as s (s.n)}
				{@const active = step === s.n}
				{@const done = step > s.n}
				<li
					aria-current={active ? 'step' : undefined}
					class={`flex items-center gap-3 rounded-2xl border p-3.5 ${active ? 'border-blue-200 bg-blue-50/70' : done ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 bg-white'}`}
				>
					<span
						class={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${active ? 'bg-blue-600 text-white' : done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}
						aria-hidden="true"
					>
						{#if done}<i class="fa-solid fa-check"></i>{:else}{s.n}{/if}
					</span>
					<span>
						<span class="block text-xs font-extrabold {active ? 'text-blue-900' : 'text-slate-800'}"
							>Langkah {s.n}: {s.t}</span
						>
						<span class="block text-[11px] text-slate-500">{s.d}</span>
					</span>
				</li>
			{/each}
		</ol>

		{#if errorList.length > 0}
			<div
				bind:this={errorSummaryEl}
				tabindex="-1"
				role="alert"
				aria-labelledby="err-title"
				class="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 focus:outline-2 focus:outline-red-500 sm:p-5"
			>
				<h2 id="err-title" class="flex items-center gap-2 text-sm font-bold text-red-800">
					<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
					Ada {errorList.length} hal yang perlu diperbaiki
				</h2>
				<ul class="mt-2 list-disc space-y-1 pl-5 text-xs text-red-700">
					{#each errorList as [k, msg] (k)}<li>{msg}</li>{/each}
				</ul>
			</div>
		{/if}

		<div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
			<form novalidate onsubmit={handleSubmit} class="min-w-0 space-y-5">
				{#if step === 1}
					<section
						aria-labelledby="h-info"
						class="rounded-2xl border border-slate-200/70 bg-white p-5 sm:p-6"
					>
						<h2 id="h-info" class="text-base font-bold text-slate-900">
							Informasi dasar pelatihan
						</h2>
						<p class="mt-0.5 text-xs text-slate-500">Ditampilkan di katalog dan kartu Kursusku.</p>

						<div class="mt-4 space-y-4">
							<div>
								<label for="f-title" class="mb-1.5 block text-xs font-bold text-slate-700"
									>Judul pelatihan <span class="text-red-500" aria-hidden="true">*</span></label
								>
								<input
									id="f-title"
									type="text"
									bind:value={title}
									placeholder="cth: Machine Learning untuk Pemula"
									maxlength={120}
									aria-invalid={!!errors['title']}
									aria-describedby={errors['title'] ? 'e-title' : 'h-title'}
									class={inputCls(!!errors['title'])}
								/>
								<p id="h-title" class="mt-1 text-[11px] text-slate-500">
									{title.trim().length}/120 · minimal 10 karakter, spesifik dan tanpa clickbait.
								</p>
								{#if errors['title']}<p
										id="e-title"
										class="mt-1 flex items-center gap-1.5 text-xs font-semibold text-red-600"
									>
										<i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>{errors[
											'title'
										]}
									</p>{/if}
							</div>

							<div class="grid gap-4 sm:grid-cols-2">
								<div>
									<label for="f-cat" class="mb-1.5 block text-xs font-bold text-slate-700"
										>Kategori <span class="text-red-500" aria-hidden="true">*</span></label
									>
									<select
										id="f-cat"
										bind:value={category}
										aria-invalid={!!errors['category']}
										aria-describedby={errors['category'] ? 'e-cat' : undefined}
										class={inputCls(!!errors['category'])}
									>
										<option value="">— Pilih kategori —</option>
										{#each CATEGORIES as c (c)}<option value={c}>{c}</option>{/each}
									</select>
									{#if errors['category']}<p
											id="e-cat"
											class="mt-1 flex items-center gap-1.5 text-xs font-semibold text-red-600"
										>
											<i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>{errors[
												'category'
											]}
										</p>{/if}
								</div>
								<div>
									<label for="f-dur" class="mb-1.5 block text-xs font-bold text-slate-700"
										>Durasi <span class="text-red-500" aria-hidden="true">*</span></label
									>
									<input
										id="f-dur"
										type="text"
										bind:value={duration}
										placeholder="cth: 6 Minggu"
										aria-invalid={!!errors['duration']}
										aria-describedby={errors['duration'] ? 'e-dur' : undefined}
										class={inputCls(!!errors['duration'])}
									/>
									{#if errors['duration']}<p
											id="e-dur"
											class="mt-1 flex items-center gap-1.5 text-xs font-semibold text-red-600"
										>
											<i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>{errors[
												'duration'
											]}
										</p>{/if}
								</div>
							</div>

							<fieldset>
								<legend class="mb-1.5 text-xs font-bold text-slate-700">Level peserta</legend>
								<div class="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Level peserta">
									{#each LEVELS as lv (lv)}
										<label
											class={`flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-blue-600 ${level === lv ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
										>
											<input
												type="radio"
												name="level"
												value={lv}
												bind:group={level}
												class="sr-only"
											/>
											{lv}
										</label>
									{/each}
								</div>
							</fieldset>

							<div>
								<label for="f-desc" class="mb-1.5 block text-xs font-bold text-slate-700"
									>Deskripsi singkat <span class="text-red-500" aria-hidden="true">*</span></label
								>
								<textarea
									id="f-desc"
									bind:value={description}
									rows={4}
									maxlength={1000}
									placeholder="Untuk siapa pelatihan ini, apa yang dipelajari, dan proyek akhirnya apa?"
									aria-invalid={!!errors['description']}
									aria-describedby="h-desc"
									class={`${inputCls(!!errors['description'])} resize-y`}></textarea>
								<p
									id="h-desc"
									class="mt-1 text-[11px] {descCount < 30
										? 'text-amber-600 font-semibold'
										: 'text-slate-500'}"
								>
									{descCount}/1000 · minimal 30 karakter.
								</p>
								{#if errors['description']}<p
										class="mt-1 flex items-center gap-1.5 text-xs font-semibold text-red-600"
									>
										<i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>{errors[
											'description'
										]}
									</p>{/if}
							</div>

							<div class="grid gap-4 sm:grid-cols-2">
								<div>
									<span id="lg-cover" class="mb-1.5 block text-xs font-bold text-slate-700"
										>Sampul pelatihan</span
									>
									<div class="overflow-hidden rounded-xl border border-slate-200">
										<img
											src={coverSrc}
											alt="Pratinjau sampul pelatihan"
											class="h-32 w-full object-cover"
											loading="lazy"
										/>
									</div>
									<label
										for="f-cover-url"
										class="mt-2.5 mb-1 block text-[11px] font-bold text-slate-600"
										>URL gambar (opsional)</label
									>
									<input
										id="f-cover-url"
										type="url"
										bind:value={coverUrl}
										inputmode="url"
										placeholder="https://…"
										aria-invalid={!!errors['coverUrl']}
										class={inputCls(!!errors['coverUrl'])}
									/>
									<label for="f-cover-file" class="mt-2 block text-[11px] font-bold text-slate-600"
										>atau unggah dari perangkat (maks 2 MB)</label
									>
									<input
										id="f-cover-file"
										type="file"
										accept="image/*"
										onchange={onCoverFile}
										aria-describedby="h-cover"
										class="block w-full cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
									/>
									<p id="h-cover" class="mt-1 text-[11px] text-slate-500">
										Rasio 16:9 paling bagus. Kosongkan untuk memakai gambar bawaan.
									</p>
									{#if errors['coverUrl']}<p
											class="mt-1 flex items-center gap-1.5 text-xs font-semibold text-red-600"
										>
											<i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>{errors[
												'coverUrl'
											]}
										</p>{/if}
								</div>
								<div class="space-y-4">
									<fieldset>
										<legend class="mb-1.5 text-xs font-bold text-slate-700">Periode batch</legend>
										<div class="space-y-2">
											<label
												class={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-blue-600 ${period === 'upcoming' ? 'border-blue-300 bg-blue-50/60' : 'border-slate-200 hover:bg-slate-50'}`}
											>
												<input
													type="radio"
													name="period"
													value="upcoming"
													bind:group={period}
													class="mt-1 accent-blue-600"
												/>
												<span
													><span class="block text-xs font-bold text-slate-800">Akan datang</span
													><span class="block text-[11px] text-slate-500"
														>Buka pendaftaran untuk batch berikutnya.</span
													></span
												>
											</label>
											<label
												class={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-blue-600 ${period === 'ongoing' ? 'border-blue-300 bg-blue-50/60' : 'border-slate-200 hover:bg-slate-50'}`}
											>
												<input
													type="radio"
													name="period"
													value="ongoing"
													class="mt-1 accent-blue-600"
													bind:group={period}
												/>
												<span
													><span class="block text-xs font-bold text-slate-800"
														>Sedang berjalan</span
													><span class="block text-[11px] text-slate-500"
														>Peserta bisa langsung belajar.</span
													></span
												>
											</label>
										</div>
									</fieldset>
									{#if period === 'upcoming'}
										<div>
											<label for="f-start" class="mb-1.5 block text-xs font-bold text-slate-700"
												>Bulan mulai <span class="text-red-500" aria-hidden="true">*</span></label
											>
											<input
												id="f-start"
												type="month"
												bind:value={startMonth}
												aria-invalid={!!errors['startMonth']}
												class={inputCls(!!errors['startMonth'])}
											/>
											{#if startMonthLabel}<p class="mt-1 text-[11px] text-slate-500">
													Ditampilkan sebagai “Mulai {startMonthLabel}”.
												</p>{/if}
											{#if errors['startMonth']}<p
													class="mt-1 flex items-center gap-1.5 text-xs font-semibold text-red-600"
												>
													<i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>{errors[
														'startMonth'
													]}
												</p>{/if}
										</div>
									{/if}
									<fieldset>
										<legend class="mb-1.5 text-xs font-bold text-slate-700">Harga</legend>
										<div class="grid grid-cols-2 gap-2">
											{#each ['GRATIS', 'Berbayar'] as p (p)}
												<label
													class={`flex min-h-11 cursor-pointer items-center justify-center rounded-xl border px-3 py-2.5 text-xs font-bold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-blue-600 ${priceKind === p ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
												>
													<input
														type="radio"
														name="price"
														value={p}
														bind:group={priceKind}
														class="sr-only"
													/>{p}
												</label>
											{/each}
										</div>
										{#if priceKind === 'Berbayar'}
											<label
												for="f-price"
												class="mt-2 mb-1 block text-[11px] font-bold text-slate-600"
												>Nominal harga</label
											>
											<input
												id="f-price"
												type="text"
												bind:value={priceNominal}
												placeholder="Rp 149.000"
												class={inputCls(!!errors['priceNominal'])}
											/>
											{#if errors['priceNominal']}<p
													class="mt-1 text-xs font-semibold text-red-600"
												>
													{errors['priceNominal']}
												</p>{/if}
										{/if}
									</fieldset>
								</div>
							</div>
						</div>
					</section>
				{/if}

				{#if step === 2}
					<section
						aria-labelledby="h-out"
						class="rounded-2xl border border-slate-200/70 bg-white p-5 sm:p-6"
					>
						<div class="flex items-start justify-between gap-3">
							<div>
								<h2 id="h-out" class="text-base font-bold text-slate-900">
									Hasil belajar & syarat
								</h2>
								<p class="mt-0.5 text-xs text-slate-500">Minimal 2 hasil belajar dan 1 syarat.</p>
							</div>
							<span
								class="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700"
								>{outcomes.filter((o) => o.trim()).length} hasil · {requirements.filter((r) =>
									r.trim()
								).length} syarat</span
							>
						</div>
						{#if errors['outcomes'] || errors['requirements']}
							<p
								role="alert"
								class="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
							>
								{errors['outcomes'] ?? errors['requirements']}
							</p>
						{/if}
						<div class="mt-4 grid gap-5 lg:grid-cols-2">
							<div>
								<span id="lg-out" class="mb-2 block text-xs font-bold text-slate-700"
									>Yang akan dipelajari</span
								>
								<ol class="space-y-2" aria-labelledby="lg-out">
									{#each outcomes as out, i (i)}
										<li class="flex gap-2">
											<label for={`out-${i}`} class="sr-only">Hasil belajar {i + 1}</label>
											<input
												id={`out-${i}`}
												type="text"
												bind:value={outcomes[i]}
												placeholder={`Hasil ${i + 1}: cth “Membuat layout responsif…”`}
												class={inputCls(false)}
											/>
											<button
												type="button"
												onclick={() => removeOutcome(i)}
												disabled={outcomes.length <= 1}
												aria-label={`Hapus hasil belajar ${i + 1}`}
												class="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
											>
												<i class="fa-solid fa-trash text-xs" aria-hidden="true"></i>
											</button>
										</li>
									{/each}
								</ol>
								<button
									type="button"
									onclick={addOutcome}
									class="mt-2 inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-dashed border-blue-300 bg-blue-50/60 px-3.5 py-2 text-[11px] font-bold text-blue-700 hover:bg-blue-50"
								>
									<i class="fa-solid fa-plus" aria-hidden="true"></i> Tambah hasil belajar
								</button>
							</div>
							<div>
								<span id="lg-req" class="mb-2 block text-xs font-bold text-slate-700"
									>Syarat mengikuti</span
								>
								<ol class="space-y-2" aria-labelledby="lg-req">
									{#each requirements as req, i (i)}
										<li class="flex gap-2">
											<label for={`req-${i}`} class="sr-only">Syarat {i + 1}</label>
											<input
												id={`req-${i}`}
												type="text"
												bind:value={requirements[i]}
												placeholder={`Syarat ${i + 1}: cth “Laptop & internet”`}
												class={inputCls(false)}
											/>
											<button
												type="button"
												onclick={() => removeRequirement(i)}
												disabled={requirements.length <= 1}
												aria-label={`Hapus syarat ${i + 1}`}
												class="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
											>
												<i class="fa-solid fa-trash text-xs" aria-hidden="true"></i>
											</button>
										</li>
									{/each}
								</ol>
								<button
									type="button"
									onclick={addRequirement}
									class="mt-2 inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-dashed border-blue-300 bg-blue-50/60 px-3.5 py-2 text-[11px] font-bold text-blue-700 hover:bg-blue-50"
								>
									<i class="fa-solid fa-plus" aria-hidden="true"></i> Tambah syarat
								</button>
							</div>
						</div>
					</section>

					<section
						aria-labelledby="h-kur"
						class="rounded-2xl border border-slate-200/70 bg-white p-5 sm:p-6"
					>
						<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<h2 id="h-kur" class="text-base font-bold text-slate-900">
									Kurikulum awal ({modules.length} modul · {totalSubs} sub-modul · {totalMaterials} materi)
								</h2>
								<p class="mt-0.5 text-xs text-slate-500">
									Susun modul, sub-modul, lalu materi — detail bisa dilengkapi di halaman Kelola Kurikulum.
								</p>
							</div>
						</div>
						{#if errors['modules']}<p
								role="alert"
								class="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
							>
								{errors['modules']}
							</p>{/if}
						<div class="mt-4">
							<!-- ORGANISM: editor kurikulum hierarkis bersama -->
							<CurriculumEditor
								bind:modules
								errors={errors}
								blankMaterial={{ title: '', duration: '' }}
								minMaterialsPerModule={1}
							/>
						</div>
					</section>
				{/if}

				{#if step === 3}
					<section
						aria-labelledby="h-rev"
						class="overflow-hidden rounded-2xl border border-slate-200/70 bg-white"
					>
						<div class="relative">
							<img
								src={coverSrc}
								alt=""
								aria-hidden="true"
								class="h-44 w-full object-cover"
								loading="lazy"
							/>
							<div
								class="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/35 to-transparent"
								aria-hidden="true"
							></div>
							<div class="absolute inset-x-0 bottom-0 p-5">
								<p class="text-[11px] font-bold tracking-widest text-blue-300 uppercase">
									{category || 'Kategori'} · {level}
								</p>
								<h2
									id="h-rev"
									class="mt-1 text-lg leading-snug font-extrabold text-white sm:text-xl"
								>
									{title.trim() || 'Judul pelatihan…'}
								</h2>
								<p class="mt-1 text-xs text-slate-200">
									{duration || '—'} · {modules.length} modul · {totalSubs} sub-modul · {totalMaterials} materi · {period ===
									'upcoming'
										? `Mulai ${startMonthLabel || '…'}`
										: 'Berjalan'} · {priceKind === 'GRATIS' ? 'GRATIS' : priceNominal || 'Berbayar'}
								</p>
							</div>
						</div>
						<div class="space-y-4 p-5 sm:p-6">
							<div>
								<h3 class="text-xs font-bold tracking-wide text-slate-500 uppercase">Deskripsi</h3>
								<p class="mt-1 text-sm leading-relaxed text-slate-700">
									{description.trim() || '—'}
								</p>
							</div>
							<div class="grid gap-4 sm:grid-cols-2">
								<div class="rounded-xl bg-slate-50 p-4">
									<h3 class="text-xs font-bold text-slate-800">
										Hasil belajar ({outcomes.filter((o) => o.trim()).length})
									</h3>
									<ul class="mt-2 space-y-1.5 text-xs text-slate-600">
										{#each outcomes.filter((o) => o.trim()) as o, i (i)}<li class="flex gap-2">
												<i
													class="fa-solid fa-circle-check mt-0.5 text-emerald-500"
													aria-hidden="true"
												></i><span>{o.trim()}</span>
											</li>{/each}
									</ul>
								</div>
								<div class="rounded-xl bg-slate-50 p-4">
									<h3 class="text-xs font-bold text-slate-800">
										Syarat ({requirements.filter((r) => r.trim()).length})
									</h3>
									<ul class="mt-2 space-y-1.5 text-xs text-slate-600">
										{#each requirements.filter((r) => r.trim()) as r, i (i)}<li class="flex gap-2">
												<i class="fa-solid fa-circle-info mt-0.5 text-blue-400" aria-hidden="true"
												></i><span>{r.trim()}</span>
											</li>{/each}
									</ul>
								</div>
							</div>
							<ol class="space-y-2">
								{#each modules as m, i (m.id)}
									<li class="rounded-xl border border-slate-100 p-3">
										<span class="flex items-start gap-3">
											<span
												class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-[11px] font-extrabold text-white"
												aria-hidden="true">{i + 1}</span
											>
											<span class="block min-w-0 truncate text-xs font-bold text-slate-800"
												>{m.title.trim() || `Modul ${i + 1} (belum berjudul)`}</span
											>
										</span>
										<ul class="mt-2 space-y-1 pl-11">
											{#each (m.subModules ?? []) as s, j (s.id)}
												<li class="truncate text-[11px] text-slate-500">
													Sub-modul {j + 1}: {s.title.trim() || '(belum berjudul)'} ({s.materials
														.length} materi)
												</li>
											{/each}
										</ul>
									</li>
								{/each}
							</ol>

							<fieldset class="rounded-xl border border-slate-200 p-4">
								<legend class="px-1 text-xs font-bold text-slate-700">Status publikasi</legend>
								<div class="grid gap-2 sm:grid-cols-2">
									<label
										class={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 has-focus-visible:outline-2 has-focus-visible:outline-blue-600 ${publishState === 'draft' ? 'border-slate-400 bg-slate-50' : 'border-slate-200 hover:bg-slate-50'}`}
									>
										<input
											type="radio"
											name="pub"
											value="draft"
											bind:group={publishState}
											class="mt-1 accent-slate-600"
										/>
										<span
											><span class="block text-xs font-bold text-slate-800"
												>Simpan sebagai Draft</span
											><span class="block text-[11px] text-slate-500"
												>Belum tampil di katalog, bisa dilanjutkan nanti.</span
											></span
										>
									</label>
									<label
										class={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 has-focus-visible:outline-2 has-focus-visible:outline-blue-600 ${publishState === 'published' ? 'border-emerald-300 bg-emerald-50/70' : 'border-slate-200 hover:bg-slate-50'}`}
									>
										<input
											type="radio"
											name="pub"
											value="published"
											bind:group={publishState}
											class="mt-1 accent-emerald-600"
										/>
										<span
											><span class="block text-xs font-bold text-slate-800">Langsung Terbitkan</span
											><span class="block text-[11px] text-slate-500"
												>Tampil di katalog sesuai periode batch.</span
											></span
										>
									</label>
								</div>
							</fieldset>

							{#if publishState === 'published'}
								<div
									class="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5"
								>
									<input
										id="f-agree"
										type="checkbox"
										bind:checked={agree}
										aria-invalid={!!errors['agree']}
										aria-describedby={errors['agree'] ? 'e-agree' : undefined}
										class="mt-0.5 h-5 w-5 shrink-0 accent-blue-600"
									/>
									<label for="f-agree" class="text-xs leading-relaxed text-slate-700"
										>Saya menyatakan konten ini orisinal / berhak saya publikasikan dan siap dinilai
										tim kurasi. Saya paham materi dapat dikembalikan ke draft bila belum memenuhi
										standar.</label
									>
								</div>
								{#if errors['agree']}<p
										id="e-agree"
										role="alert"
										class="text-xs font-semibold text-red-600"
									>
										{errors['agree']}
									</p>{/if}
							{/if}
						</div>
					</section>
				{/if}

				<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<button
						type="button"
						onclick={goBack}
						disabled={step === 1}
						class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
					>
						<i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Kembali
					</button>
					<div class="flex flex-col gap-2 sm:flex-row">
						{#if step < 3}
							<button
								type="button"
								onclick={goNext}
								class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
							>
								Lanjut ke Langkah {step + 1}
								<i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
							</button>
						{:else}
							<button
								type="submit"
								class={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold text-white focus-visible:outline-2 ${publishState === 'published' ? 'bg-emerald-600 hover:bg-emerald-700 focus-visible:outline-emerald-600' : 'bg-blue-600 hover:bg-blue-700 focus-visible:outline-blue-600'}`}
							>
								<i
									class="fa-solid {publishState === 'published' ? 'fa-rocket' : 'fa-floppy-disk'} "
									aria-hidden="true"
								></i>
								{publishState === 'published' ? 'Terbitkan Pelatihan' : 'Simpan Draft'}
							</button>
						{/if}
					</div>
				</div>
			</form>

			<!-- Panel samping: pratinjau + checklist -->
			<aside aria-label="Pratinjau dan kelengkapan" class="space-y-4 lg:sticky lg:top-24">
				<div class="overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
					<div class="relative">
						<img
							src={coverSrc}
							alt=""
							aria-hidden="true"
							class="h-36 w-full object-cover"
							loading="lazy"
						/>
						<span
							class="absolute top-3 left-3 rounded-md border border-white/40 bg-slate-900/70 px-2.5 py-1 text-[10px] font-extrabold text-white uppercase backdrop-blur"
							>{level}</span
						>
						<span
							class="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-extrabold uppercase {period ===
							'upcoming'
								? 'bg-amber-500 text-white'
								: 'bg-emerald-600 text-white'}"
						>
							<i
								class={`fa-solid ${period === 'upcoming' ? 'fa-calendar-plus' : 'fa-circle-play'}`}
								aria-hidden="true"
							></i>
							{period === 'upcoming'
								? startMonthLabel
									? `Mulai ${startMonthLabel}`
									: 'Akan Datang'
								: 'Berjalan'}
						</span>
					</div>
					<div class="p-4">
						<p class="text-[11px] font-bold tracking-wide text-blue-600 uppercase">
							{category || 'Kategori belum dipilih'}
						</p>
						<p class="mt-0.5 line-clamp-2 text-sm font-bold text-slate-900">
							{title.trim() || 'Judul pelatihan akan tampil di sini…'}
						</p>
						<p class="mt-1 text-[11px] text-slate-500">
							{modules.length} modul · {totalMaterials} materi · {duration || 'durasi …'} · {priceKind ===
							'GRATIS'
								? 'GRATIS'
								: priceNominal || '…'}
						</p>
						<div
							class="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"
							role="progressbar"
							aria-valuenow={progressPct}
							aria-valuemin={0}
							aria-valuemax={100}
							aria-label="Kelengkapan pelatihan"
						>
							<div
								class="h-full rounded-full bg-blue-600 transition-all"
								style="width: {progressPct}%"
							></div>
						</div>
						<p class="mt-1.5 text-[11px] font-semibold text-slate-600">
							{doneCount}/{checklist.length} lengkap · {progressPct}%
						</p>
					</div>
				</div>

				<div class="rounded-2xl border border-slate-200/70 bg-white p-4">
					<h2 class="text-xs font-bold tracking-wide text-slate-500 uppercase">
						Checklist kelengkapan
					</h2>
					<ul class="mt-2.5 space-y-2">
						{#each checklist as c (c.label)}
							<li
								class="flex items-start gap-2.5 text-xs {c.done
									? 'text-emerald-700'
									: 'text-slate-500'}"
							>
								<i
									class={`fa-solid ${c.done ? 'fa-circle-check text-emerald-500' : 'fa-circle text-slate-300'} mt-0.5`}
									aria-hidden="true"
								></i>
								<span class={c.done ? 'font-semibold' : ''}>{c.label}</span>
								<span class="sr-only">{c.done ? '(selesai)' : '(belum)'}</span>
							</li>
						{/each}
					</ul>
				</div>

				<div
					class="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs leading-relaxed text-slate-600"
				>
					<p class="flex items-start gap-2">
						<i class="fa-solid fa-lightbulb mt-0.5 text-amber-500" aria-hidden="true"></i><span
							><strong class="text-slate-800">Tips lolos kurasi:</strong> judul spesifik, ≥2 hasil terukur,
							dan tiap modul punya ≥1 materi berdurasijelas.</span
						>
					</p>
				</div>
			</aside>
		</div>
	{/if}
</div>
