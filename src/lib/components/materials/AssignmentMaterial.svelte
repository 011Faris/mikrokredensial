<script lang="ts">
	import type { AssignmentDetail } from '$lib/data/material-details';

	let { assignment, onSubmit }: { assignment: AssignmentDetail; onSubmit?: () => void } = $props();

	let answer = $state('');
	let sent = $state(false);

	function submit(e: SubmitEvent) {
		e.preventDefault();
		if (answer.trim().length < 20) return;
		sent = true;
		onSubmit?.();
	}
</script>

<div class="space-y-5">
	<div class="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-5 sm:p-6">
		<p class="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
			<i class="fa-solid fa-briefcase text-violet-600" aria-hidden="true"></i> Brief penugasan
		</p>
		<p class="text-sm leading-relaxed text-slate-700">{assignment.brief}</p>
		<div class="mt-4 grid gap-3 sm:grid-cols-2">
			<div class="rounded-xl bg-white p-3.5 ring-1 ring-slate-200">
				<p class="mb-1 flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-slate-500 uppercase">
					<i class="fa-solid fa-box-open text-violet-500" aria-hidden="true"></i> Hasil dikumpulkan
				</p>
				<p class="text-xs font-semibold text-slate-800">{assignment.deliverable}</p>
			</div>
			<div class="rounded-xl bg-white p-3.5 ring-1 ring-slate-200">
				<p class="mb-1 flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-slate-500 uppercase">
					<i class="fa-solid fa-calendar-days text-amber-500" aria-hidden="true"></i> Tenggat
				</p>
				<p class="text-xs font-semibold text-slate-800">{assignment.deadline}</p>
			</div>
		</div>
	</div>

	<div class="grid gap-4 lg:grid-cols-2">
		<div class="rounded-2xl border border-slate-200 bg-white p-5">
			<p class="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
				<i class="fa-solid fa-bullseye text-emerald-600" aria-hidden="true"></i> Tujuan
			</p>
			<ul class="space-y-2.5">
				{#each assignment.objectives as obj (obj)}
					<li class="flex items-start gap-2.5 text-sm text-slate-700">
						<i class="fa-solid fa-circle-check mt-0.5 shrink-0 text-emerald-500" aria-hidden="true"></i>
						<span>{obj}</span>
					</li>
				{/each}
			</ul>
		</div>
		<div class="rounded-2xl border border-slate-200 bg-white p-5">
			<p class="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
				<i class="fa-solid fa-shoe-prints text-blue-600" aria-hidden="true"></i> Langkah pengerjaan
			</p>
			<ol class="space-y-2.5">
				{#each assignment.steps as step, i (step)}
					<li class="flex items-start gap-3 text-sm text-slate-700">
						<span
							class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[11px] font-extrabold text-blue-700"
							aria-hidden="true"
						>
							{i + 1}
						</span>
						<span>{step}</span>
					</li>
				{/each}
			</ol>
		</div>
	</div>

	{#if sent}
		<div
			role="status"
			aria-live="polite"
			class="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"
		>
			<i class="fa-solid fa-circle-check mt-0.5 text-xl text-emerald-600" aria-hidden="true"></i>
			<div>
				<p class="text-sm font-bold text-emerald-800">Jawaban terkirim!</p>
				<p class="mt-0.5 text-xs text-emerald-700">
					Instruktur akan menilai dan memberi umpan balik maksimal 3 hari kerja. Materi berikutnya
					sudah terbuka — lanjutkan lewat tombol di bawah.
				</p>
			</div>
		</div>
	{:else}
		<form
			onsubmit={submit}
			class="rounded-2xl border border-slate-200 bg-white p-5"
			aria-label="Formulir pengumpulan tugas"
		>
			<label for="assignment-answer" class="mb-2 block text-sm font-bold text-slate-900">
				Tulis jawaban / tautan hasil kerjamu
			</label>
			<textarea
				id="assignment-answer"
				bind:value={answer}
				rows={5}
				minlength={20}
				required
				placeholder="Contoh: Saya mengerjakan di https://… — ringkasan pendekatan saya: …"
				class="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 focus:outline-none"
			></textarea>
			<div class="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<p class="text-[11px] text-slate-500" aria-live="polite">{answer.trim().length}/20 karakter minimal</p>
				<button
					type="submit"
					disabled={answer.trim().length < 20}
					class="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/25 transition-all hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-violet-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
				>
					<i class="fa-solid fa-paper-plane" aria-hidden="true"></i> Kumpulkan Tugas
				</button>
			</div>
		</form>
	{/if}
</div>
