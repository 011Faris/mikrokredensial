import type { QuizQuestion } from '$lib/data/material-details';

/** Draf kuis per materi (frontend-only, localStorage). */
export interface QuizDraft {
	title: string;
	intro: string;
	questions: QuizQuestion[];
	updatedAt: string;
}

function quizKey(courseId: number, moduleId: string, subId: string, materialId: string): string {
	return `materi-kuis-${courseId}-${moduleId}-${subId}-${materialId}`;
}

function storageAvailable(): boolean {
	return typeof localStorage !== 'undefined';
}

export function blankQuizQuestion(): QuizQuestion {
	return { question: '', options: ['', '', '', ''], answer: 0, explanation: '' };
}

export function blankQuizDraft(title = ''): QuizDraft {
	return { title, intro: '', questions: [blankQuizQuestion()], updatedAt: '' };
}

/** Muat draf kuis. Null bila belum ada / SSR / rusak. */
export function loadQuizDraft(
	courseId: number,
	moduleId: string,
	subId: string,
	materialId: string
): QuizDraft | null {
	if (!storageAvailable()) return null;
	try {
		const raw = localStorage.getItem(quizKey(courseId, moduleId, subId, materialId));
		if (!raw) return null;
		const parsed = JSON.parse(raw) as QuizDraft;
		if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.questions)) return null;
		const questions = parsed.questions
			.filter((q) => q && typeof q === 'object')
			.map((q) => ({
				question: String(q.question ?? ''),
				options: Array.from({ length: 4 }, (_, i) => String(q.options?.[i] ?? '')),
				answer: Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4 ? q.answer : 0,
				explanation: String(q.explanation ?? '')
			}));
		return {
			title: String(parsed.title ?? ''),
			intro: String(parsed.intro ?? ''),
			questions,
			updatedAt: String(parsed.updatedAt ?? '')
		};
	} catch {
		return null;
	}
}

/** Simpan draf kuis. False bila storage penuh / tidak tersedia. */
export function saveQuizDraft(
	courseId: number,
	moduleId: string,
	subId: string,
	materialId: string,
	draft: QuizDraft
): boolean {
	if (!storageAvailable()) return false;
	try {
		localStorage.setItem(quizKey(courseId, moduleId, subId, materialId), JSON.stringify(draft));
		return true;
	} catch {
		return false;
	}
}

/** Validasi draf kuis untuk tombol simpan. */
export function validateQuizDraft(draft: QuizDraft): string | null {
	if (draft.questions.length === 0) return 'Tambahkan minimal 1 soal.';
	for (let i = 0; i < draft.questions.length; i++) {
		const q = draft.questions[i];
		if (!q.question.trim()) return `Soal ${i + 1} belum ada pertanyaan.`;
		for (let o = 0; o < 4; o++) {
			if (!q.options[o]?.trim()) return `Soal ${i + 1} opsi ${String.fromCharCode(65 + o)} masih kosong.`;
		}
		if (q.answer < 0 || q.answer > 3) return `Soal ${i + 1} belum ada kunci jawaban.`;
	}
	return null;
}
