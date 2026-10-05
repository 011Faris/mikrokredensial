<script lang="ts">
	import type { QuizQuestion } from '$lib/data/material-details';

	let { questions, intro, onPass }: { questions: QuizQuestion[]; intro?: string; onPass?: () => void } = $props();

	const PASS_SCORE = 70;

	let answers = $state<Array<number | null>>([]);
	let submitted = $state(false);

	// Reset saat set soal berganti (navigasi antar materi kuis)
	$effect(() => {
		answers = questions.map(() => null);
		submitted = false;
	});

	const answeredCount = $derived(answers.filter((a) => a !== null).length);
	const score = $derived(
		questions.length === 0
			? 0
			: Math.round(
					(questions.filter((q, i) => answers[i] === q.answer).length / questions.length) * 100
				)
	);
	const passed = $derived(score >= PASS_SCORE);

	function select(qi: number, oi: number) {
		if (submitted) return;
		const next = [...answers];
		next[qi] = oi;
		answers = next;
	}

	function submit() {
		submitted = true;
		if (score >= PASS_SCORE) onPass?.();
	}

	function retry() {
		answers = answers.map(() => null);
		submitted = false;
	}
</script>

<div class="space-y-5">
	{#if intro}
		<p class="text-sm leading-relaxed text-slate-600 sm:text-[15px]">{intro}</p>
	{/if}

	{#if submitted}
		<div
			role="status"
			aria-live="polite"
			class={`flex items-center gap-4 rounded-2xl border p-5 ${
				passed ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
			}`}
		>
			<span
				class={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white ${
					passed ? 'bg-emerald-600' : 'bg-amber-500'
				}`}
				aria-hidden="true"
			>
				<i class={`fa-solid ${passed ? 'fa-trophy' : 'fa-rotate-right'} text-lg`}></i>
			</span>
			<div class="flex-1">
				<p class="text-lg font-extrabold {passed ? 'text-emerald-800' : 'text-amber-800'}">
					Skor: {score}
				</p>
				<p class="text-xs {passed ? 'text-emerald-700' : 'text-amber-700'}">
					{passed
						? `Lulus! Kamu menjawab benar ${questions.filter((q, i) => answers[i] === q.answer).length} dari ${questions.length} soal. Materi berikutnya sudah terbuka.`
						: `Belum lolos (minimal ${PASS_SCORE}). Pelajari lagi pembahasannya lalu coba lagi.`}
				</p>
			</div>
			<button
				type="button"
				onclick={retry}
				class="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600"
			>
				Ulangi
			</button>
		</div>
	{/if}

	<ol class="space-y-4">
		{#each questions as q, qi (q.question)}
			{@const correct = submitted && answers[qi] === q.answer}
			{@const wrong = submitted && answers[qi] !== null && answers[qi] !== q.answer}
			<li
				class={`rounded-2xl border bg-white p-5 ${
					correct ? 'border-emerald-300' : wrong ? 'border-red-300' : 'border-slate-200'
				}`}
			>
				<fieldset>
					<legend class="contents">
						<span class="mb-3 block text-sm font-bold text-slate-900">
							<span class="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900 text-[11px] font-extrabold text-white" aria-hidden="true">
								{qi + 1}
							</span>
							{q.question}
						</span>
					</legend>
					<div class="space-y-2" role="radiogroup" aria-label={`Pilihan jawaban soal ${qi + 1}`}>
						{#each q.options as opt, oi (opt)}
							{@const selected = answers[qi] === oi}
							{@const isAnswer = q.answer === oi}
							<button
								type="button"
								role="radio"
								aria-checked={selected}
								disabled={submitted}
								onclick={() => select(qi, oi)}
								class={`flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm transition-all focus-visible:outline-2 focus-visible:outline-blue-600 ${
									submitted
										? isAnswer
											? 'border-emerald-500 bg-emerald-50 font-semibold text-emerald-800'
											: selected
												? 'border-red-400 bg-red-50 text-red-700'
												: 'border-slate-200 bg-slate-50 text-slate-400'
										: selected
											? 'border-blue-600 bg-blue-50 font-semibold text-blue-800'
											: 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/50'
								}`}
							>
								<span
									class={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold ${
										submitted && isAnswer
											? 'border-emerald-500 bg-emerald-500 text-white'
											: selected
												? 'border-blue-600 bg-blue-600 text-white'
												: 'border-slate-300 text-transparent'
									}`}
									aria-hidden="true"
								>
									{String.fromCharCode(65 + oi)}
								</span>
								<span class="flex-1">{opt}</span>
								{#if submitted && isAnswer}
									<i class="fa-solid fa-check text-emerald-600" aria-hidden="true"></i>
								{:else if submitted && selected && !isAnswer}
									<i class="fa-solid fa-xmark text-red-500" aria-hidden="true"></i>
								{/if}
							</button>
						{/each}
					</div>
				</fieldset>
				{#if submitted && q.explanation}
					<p class="mt-3 rounded-xl bg-slate-50 px-4 py-2.5 text-xs leading-relaxed text-slate-600">
						<i class="fa-solid fa-circle-info mr-1.5 text-blue-500" aria-hidden="true"></i>
						<strong>Pembahasan:</strong> {q.explanation}
					</p>
				{/if}
			</li>
		{/each}
	</ol>

	{#if !submitted}
		<button
			type="button"
			onclick={submit}
			disabled={answeredCount < questions.length}
			class="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
		>
			<i class="fa-solid fa-paper-plane" aria-hidden="true"></i>
			Kumpulkan Jawaban ({answeredCount}/{questions.length})
		</button>
	{/if}
</div>
