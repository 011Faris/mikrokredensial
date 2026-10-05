<script lang="ts">
	interface ReviewItem {
		id: number;
		student: string;
		nim: string;
		course: string;
		task: string;
		type: 'Tugas' | 'Kuis';
		date: string;
		status: 'Menunggu' | 'Dinilai';
		score: number | null;
	}

	let reviews = $state<ReviewItem[]>([
		{ id: 1, student: 'Ahmad Farizi', nim: '2101020045', course: 'Pengembangan Web Frontend', task: 'Proyek: Galeri Interaktif', type: 'Tugas', date: '2 jam lalu', status: 'Menunggu', score: null },
		{ id: 2, student: 'Dewi Anggraini', nim: '2101020031', course: 'Machine Learning Dasar', task: 'Proyek: Prediksi Churn', type: 'Tugas', date: '5 jam lalu', status: 'Menunggu', score: null },
		{ id: 3, student: 'Rian Pratama', nim: '2101020018', course: 'Jaringan Komputer Dasar', task: 'Latihan Subnetting VLSM', type: 'Tugas', date: 'Kemarin', status: 'Menunggu', score: null },
		{ id: 4, student: 'Sarah Johnson', nim: '2101020027', course: 'Machine Learning Dasar', task: 'Kuis Evaluasi Model', type: 'Kuis', date: 'Kemarin', status: 'Menunggu', score: null },
		{ id: 5, student: 'Budi Santoso', nim: '2101020052', course: 'Pengembangan Web Frontend', task: 'Kuis CSS Layout', type: 'Kuis', date: '2 hari lalu', status: 'Dinilai', score: 85 },
		{ id: 6, student: 'Max Alexix', nim: '2101020009', course: 'Jaringan Komputer Dasar', task: 'Kuis Konsep Dasar', type: 'Kuis', date: '3 hari lalu', status: 'Dinilai', score: 92 }
	]);

	type Filter = 'all' | 'Menunggu' | 'Dinilai';
	let activeFilter = $state<Filter>('all');
	let search = $state('');
	let draftScores: Record<number, string> = $state({});
	let message = $state('');

	const pendingCount = $derived(reviews.filter((r) => r.status === 'Menunggu').length);
	const gradedCount = $derived(reviews.filter((r) => r.status === 'Dinilai').length);
	const avgScore = $derived(() => {
		const graded = reviews.filter((r) => r.score !== null) as { score: number }[];
		if (graded.length === 0) return '-';
		return Math.round(graded.reduce((n, r) => n + (r as unknown as ReviewItem).score!, 0) / graded.length).toString();
	});

	const filtered = $derived(
		reviews.filter((r) => {
			const matchStatus = activeFilter === 'all' || r.status === activeFilter;
			const q = search.trim().toLowerCase();
			const matchSearch =
				!q ||
				r.student.toLowerCase().includes(q) ||
				r.task.toLowerCase().includes(q) ||
				r.course.toLowerCase().includes(q);
			return matchStatus && matchSearch;
		})
	);

	function submitScore(id: number) {
		const raw = (draftScores[id] ?? '').trim();
		const val = Number(raw);
		if (!raw || Number.isNaN(val) || val < 0 || val > 100) {
			message = 'Masukkan nilai 0–100 terlebih dahulu.';
			return;
		}
		reviews = reviews.map((r) => (r.id === id ? { ...r, score: val, status: 'Dinilai' } : r));
		delete draftScores[id];
		message = `Nilai ${val} tersimpan untuk ${reviews.find((r) => r.id === id)?.student ?? 'peserta'}.`;
	}
</script>

<svelte:head>
	<title>Penilaian — Instruktur Aristoteles</title>
	<meta name="description" content="Antrean penilaian tugas dan kuis peserta untuk instruktur Aristoteles." />
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8">
	<div class="mb-6">
		<p class="text-xs font-bold tracking-widest text-blue-600 uppercase">Menu Utama · Penilaian</p>
		<h1 class="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Penilaian</h1>
		<p class="mt-1 text-sm text-slate-500">
			{pendingCount} menunggu dinilai · {gradedCount} sudah dinilai · rata-rata nilai {avgScore()}.
		</p>
	</div>

	<div class="mb-6 grid grid-cols-3 gap-4">
		<div class="rounded-2xl border border-amber-200/70 bg-amber-50 p-4 sm:p-5">
			<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white">
				<i class="fa-solid fa-hourglass-half text-sm" aria-hidden="true"></i>
			</div>
			<div class="mt-3 text-2xl font-bold text-slate-900">{pendingCount}</div>
			<div class="text-xs font-semibold text-slate-600">Menunggu</div>
		</div>
		<div class="rounded-2xl border border-emerald-200/70 bg-emerald-50 p-4 sm:p-5">
			<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
				<i class="fa-solid fa-circle-check text-sm" aria-hidden="true"></i>
			</div>
			<div class="mt-3 text-2xl font-bold text-slate-900">{gradedCount}</div>
			<div class="text-xs font-semibold text-slate-600">Dinilai</div>
		</div>
		<div class="rounded-2xl border border-blue-200/70 bg-blue-50 p-4 sm:p-5">
			<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
				<i class="fa-solid fa-star text-sm" aria-hidden="true"></i>
			</div>
			<div class="mt-3 text-2xl font-bold text-slate-900">{avgScore()}</div>
			<div class="text-xs font-semibold text-slate-600">Rata-rata</div>
		</div>
	</div>

	{#if message}
		<p role="status" class="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
			<i class="fa-solid fa-circle-check mt-0.5 shrink-0" aria-hidden="true"></i>
			<span>{message}</span>
		</p>
	{/if}

	<div class="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
		<div class="max-w-md flex-1">
			<label for="search-penilaian" class="sr-only">Cari peserta, tugas, atau kursus</label>
			<div class="relative">
				<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
					<i class="fa-solid fa-magnifying-glass text-sm" aria-hidden="true"></i>
				</div>
				<input
					id="search-penilaian"
					type="search"
					bind:value={search}
					placeholder="Cari peserta, tugas, kursus..."
					autocomplete="off"
					class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
				/>
			</div>
		</div>
		<div class="flex flex-wrap gap-2" role="group" aria-label="Filter status penilaian">
			{#each [{ value: 'all', label: 'Semua' }, { value: 'Menunggu', label: 'Menunggu' }, { value: 'Dinilai', label: 'Dinilai' }] as f}
				<button
					type="button"
					onclick={() => (activeFilter = f.value as Filter)}
					aria-pressed={activeFilter === f.value}
					class={`rounded-xl px-4 py-2 text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
						activeFilter === f.value
							? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
							: 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
					}`}
				>
					{f.label}
				</button>
			{/each}
		</div>
	</div>

	<div class="overflow-hidden rounded-2xl border border-slate-200/60 bg-white">
		<div class="overflow-x-auto">
			<table class="w-full min-w-[760px] text-left text-sm">
				<thead>
					<tr class="border-b border-slate-100 bg-slate-50/60 text-xs text-slate-500">
						<th scope="col" class="px-5 py-3 font-bold">Peserta</th>
						<th scope="col" class="px-5 py-3 font-bold">Tugas / Kuis</th>
						<th scope="col" class="px-5 py-3 font-bold">Status</th>
						<th scope="col" class="px-5 py-3 font-bold">Nilai</th>
						<th scope="col" class="px-5 py-3 text-right font-bold">Aksi</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each filtered as r (r.id)}
						<tr class="transition-colors hover:bg-slate-50/50">
							<td class="px-5 py-4">
								<div class="font-semibold text-slate-900">{r.student}</div>
								<div class="mt-0.5 text-xs text-slate-500">{r.nim} · {r.date}</div>
							</td>
							<td class="px-5 py-4">
								<div class="font-semibold text-slate-800">{r.task}</div>
								<div class="mt-0.5 text-xs text-slate-500">{r.course} · {r.type}</div>
							</td>
							<td class="px-5 py-4">
								<span
									class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold {r.status === 'Dinilai' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}"
								>
									{r.status}
								</span>
							</td>
							<td class="px-5 py-4">
								{#if r.status === 'Dinilai' && r.score !== null}
									<span class="text-sm font-bold text-emerald-600">{r.score}</span>
								{:else}
									<label for={`score-${r.id}`} class="sr-only">Nilai untuk {r.student}</label>
									<input
										id={`score-${r.id}`}
										type="number"
										min="0"
										max="100"
										placeholder="0–100"
										bind:value={draftScores[r.id]}
										class="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
									/>
								{/if}
							</td>
							<td class="px-5 py-4 text-right">
								{#if r.status === 'Menunggu'}
									<button
										type="button"
										onclick={() => submitScore(r.id)}
										class="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
									>
										<i class="fa-solid fa-check" aria-hidden="true"></i> Simpan Nilai
									</button>
								{:else}
									<span class="text-xs font-semibold text-slate-400">Selesai</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		{#if filtered.length === 0}
			<p class="p-8 text-center text-sm font-semibold text-slate-500">Tidak ada data pada filter ini.</p>
		{/if}
	</div>
</div>
