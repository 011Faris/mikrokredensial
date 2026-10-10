<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import { getCourseById } from '$lib/data/courses';
	import { getCourseMeta } from '$lib/data/course-meta';
	import { getTrainingStats, resolveSubModules } from '$lib/data/training';
	import TrainingHero from '$lib/components/training/organisms/TrainingHero.svelte';
	import TrainingCurriculum from '$lib/components/training/organisms/TrainingCurriculum.svelte';
	import TrainingActionCard from '$lib/components/training/organisms/TrainingActionCard.svelte';

	let {
		courseId,
		mode,
		backHref,
		backLabel = 'Semua Kursus'
	}: {
		courseId: number;
		mode: 'public' | 'user';
		backHref: string;
		backLabel?: string;
	} = $props();

	const course = $derived(getCourseById(courseId));
	const meta = $derived(course ? getCourseMeta(course.id) : undefined);
	const stats = $derived(course ? getTrainingStats(course) : undefined);
	const previewMaterialId = $derived(course?.modules[0]?.materials[0]?.id ?? null);

	let openModules = new SvelteSet<string>();
	let openSubs = new SvelteSet<string>();

	$effect(() => {
		if (!course) return;
		openModules.clear();
		openSubs.clear();
		const first = course.modules[0];
		if (first) {
			openModules.add(first.id);
			const firstSub = resolveSubModules(first)[0];
			if (firstSub) openSubs.add(firstSub.id);
		}
	});

	function toggleModule(id: string) {
		if (openModules.has(id)) openModules.delete(id);
		else openModules.add(id);
	}

	function toggleSub(id: string) {
		if (openSubs.has(id)) openSubs.delete(id);
		else openSubs.add(id);
	}
</script>

{#if !course || !meta || !stats}
	<div class="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center">
		<i class="fa-solid fa-triangle-exclamation mb-3 text-3xl text-amber-500" aria-hidden="true"></i>
		<h1 class="text-xl font-bold text-slate-900">Kursus tidak ditemukan</h1>
		<a
			href={backHref}
			class="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700"
		>
			<i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Kembali ke {backLabel}
		</a>
	</div>
{:else}
	<TrainingHero {course} {meta} {stats} crumbBackHref={backHref} crumbBackLabel={backLabel} />

	<div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
		<div class="min-w-0 space-y-6">
			<section aria-labelledby="pv-tentang" class="rounded-2xl border border-slate-200/70 bg-white p-5 sm:p-6">
				<h2 id="pv-tentang" class="mb-2 text-lg font-bold text-slate-900">Tentang Pelatihan Ini</h2>
				<p class="text-sm leading-relaxed text-slate-600">{course.description}</p>
			</section>

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

			<TrainingCurriculum
				modules={course.modules}
				{openModules}
				{openSubs}
				ontogglemodule={toggleModule}
				ontogglesub={toggleSub}
				{previewMaterialId}
			/>

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

		<TrainingActionCard {course} {meta} {mode} />
	</div>
{/if}
