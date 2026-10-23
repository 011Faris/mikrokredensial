<script lang="ts">
	import type { QuizDraft } from '$lib/stores/quiz-drafts';
	import { blankQuizQuestion, validateQuizDraft } from '$lib/stores/quiz-drafts';
	import type { QuizQuestion } from '$lib/data/material-details';

	/**
	 * Pembuat kuis instruktur: susun soal pilihan ganda (4 opsi + kunci).
	 * Murni permukaan sunting — penyimpanan ditangani halaman via `onupdate`.
	 */
	let {
		draftKey,
		initial = null,
		onupdate = (_info: { draft: QuizDraft; valid: boolean; count: number }) => {}
	}: {
		draftKey: string;
		initial?: QuizDraft | null;
		onupdate?: (info: { draft: QuizDraft; valid: boolean; count: number }) => void;
	} = $props();

	let intro = $state('');
	let questions = $state<QuizQuestion[]>([blankQuizQuestion()]);
	let loadedFor = $state<string | null>(null);

	/* Muat draf sekali per materi. */
	$effect(() => {
		if (loadedFor === draftKey) return;
		const src = initial;
		intro = src?.intro ?? '';
		questions =
			src && src.questions.length > 0
				? src.questions.map((q) => ({
						question: q.question,
						options: [...q.options],
						answer: q.answer,
						explanation: q.explanation ?? ''
					}))
				: [blankQuizQuestion()];
		loadedFor = draftKey;
	});

	/* Laporkan draf ke induk setiap berubah. */
	$effect(() => {
		if (loadedFor !== draftKey) return;
		const draft: QuizDraft = {
			title: '',
			intro,
			questions: questions.map((q) => ({
				question: q.question,
				options: [...q.options],
				answer: q.answer,
				explanation: q.explanation ?? ''
			})),
			updatedAt: ''
		};
		onupdate({ draft, valid: validateQuizDraft({ ...draft, title: 'x' }) === null, count: questions.length });
	});

	function addQuestion() {
		questions = [...questions, blankQuizQuestion()];
	}

	function removeQuestion(i: number) {
		if (questions.length <= 1) return;
		questions = questions.filter((_, x) => x !== i);
	}

	function moveQuestion(i: number, dir: -1 | 1) {
		const t = i + dir;
		if (t < 0 || t >= questions.length) return;
		const next = [...questions];
		[next[i], next[t]] = [next[t], next[i]];
		questions = next;
	}

	function setOption(qi: number, oi: number, v: string) {
		questions = questions.map((q, x) =>
			x === qi ? { ...q, options: q.options.map((o, y) => (y === oi ? v : o)) } : q
		);
	}
</script>

<div class="space-y-4">
	<div class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
		<div class="border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
			<label for="quiz-intro" class="block text-xs font-bold text-slate-700">
				Pengantar kuis <span class="font-normal text-slate-400">(opsional)</span>
			</label>
		</div>
		<div class="p-4 sm:p-5">
			<textarea
				id="quiz-intro"
				bind:value={intro}
				rows={2}
				maxlength={500}
				placeholder="cth. Kerjakan dengan jujur — nilai minimal 70 untuk lolos."
				class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none"
			></textarea>
		</div>
	</div>

	<ol class="space-y-4" aria-label="Daftar soal kuis">
		{#each questions as q, qi (qi)}
			<li class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
				<div class="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-3">
					<span
						class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-extrabold text-white"
						aria-hidden="true"
					>
						{qi + 1}
					</span>
					<span class="min-w-0 flex-1 text-sm font-extrabold text-slate-900">Soal {qi + 1}</span>
					<span class="flex shrink-0 items-center gap-1" role="group" aria-label={`Aksi soal ${qi + 1}`}>
						<button
							type="button"
							onclick={() => moveQuestion(qi, -1)}
							disabled={qi === 0}
							aria-label={`Pindah soal ${qi + 1} ke atas`}
							class="flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:border-amber-300 hover:text-amber-600 focus-visible:outline-2 focus-visible:outline-amber-600 disabled:cursor-not-allowed disabled:opacity-35"
						>
							<i class="fa-solid fa-arrow-up text-[11px]" aria-hidden="true"></i>
						</button>
						<button
							type="button"
							onclick={() => moveQuestion(qi, 1)}
							disabled={qi === questions.length - 1}
							aria-label={`Pindah soal ${qi + 1} ke bawah`}
							class="flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:border-amber-300 hover:text-amber-600 focus-visible:outline-2 focus-visible:outline-amber-600 disabled:cursor-not-allowed disabled:opacity-35"
						>
							<i class="fa-solid fa-arrow-down text-[11px]" aria-hidden="true"></i>
						</button>
						<button
							type="button"
							onclick={() => removeQuestion(qi)}
							disabled={questions.length <= 1}
							aria-label={`Hapus soal ${qi + 1}`}
							class="flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-red-500 disabled:cursor-not-allowed disabled:opacity-35"
						>
							<i class="fa-solid fa-trash text-[11px]" aria-hidden="true"></i>
						</button>
					</span>
				</div>

				<div class="space-y-3 p-4 sm:p-5">
					<div>
						<label for={`quiz-q-${qi}`} class="mb-1 block text-xs font-bold text-slate-700">
							Pertanyaan <span class="text-red-500" aria-hidden="true">*</span>
						</label>
						<textarea
							id={`quiz-q-${qi}`}
							bind:value={questions[qi].question}
							rows={2}
							placeholder="cth. Apa fungsi utama DOM dalam aplikasi web?"
							class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none"
						></textarea>
					</div>

					<fieldset>
						<legend class="mb-1 block text-xs font-bold text-slate-700">
							Opsi jawaban <span class="text-red-500" aria-hidden="true">*</span>
							<span class="font-normal text-slate-400">— pilih satu kunci</span>
						</legend>
						<div class="space-y-2">
							{#each q.options as opt, oi (oi)}
								<div class="flex items-center gap-2">
									<input
										type="radio"
										id={`quiz-q${qi}-k${oi}`}
										name={`quiz-q${qi}-key`}
										checked={q.answer === oi}
										onchange={() => {
											questions = questions.map((x, xi) =>
												xi === qi ? { ...x, answer: oi } : x
											);
										}}
										class="h-4 w-4 shrink-0 cursor-pointer accent-amber-600"
										aria-label={`Kunci soal ${qi + 1}: opsi ${String.fromCharCode(65 + oi)}`}
									/>
									<span
										class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-extrabold {q.answer ===
										oi
											? 'bg-amber-500 text-white'
											: 'bg-slate-100 text-slate-500'}"
										aria-hidden="true"
									>
										{String.fromCharCode(65 + oi)}
									</span>
									<label for={`quiz-q${qi}-o${oi}`} class="sr-only"
										>Soal {qi + 1} opsi {String.fromCharCode(65 + oi)}</label
									>
									<input
										id={`quiz-q${qi}-o${oi}`}
										type="text"
										value={opt}
										oninput={(e) => setOption(qi, oi, e.currentTarget.value)}
										placeholder={`Opsi ${String.fromCharCode(65 + oi)}…`}
										class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none"
									/>
								</div>
							{/each}
						</div>
					</fieldset>

					<div>
						<label for={`quiz-q${qi}-exp`} class="mb-1 block text-xs font-bold text-slate-700">
							Pembahasan <span class="font-normal text-slate-400">(opsional)</span>
						</label>
						<input
							id={`quiz-q${qi}-exp`}
							type="text"
							bind:value={questions[qi].explanation}
							placeholder="Kenapa jawaban itu benar?"
							class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none"
						/>
					</div>
				</div>
			</li>
		{/each}
	</ol>

	<button
		type="button"
		onclick={addQuestion}
		class="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-amber-300 bg-amber-50/60 px-4 py-3 text-xs font-bold text-amber-700 transition-all hover:border-amber-500 hover:bg-amber-50 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-amber-600"
	>
		<i class="fa-solid fa-plus" aria-hidden="true"></i>
		Tambah Soal {questions.length + 1}
	</button>
</div>
