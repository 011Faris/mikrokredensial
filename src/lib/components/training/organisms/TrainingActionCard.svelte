<script lang="ts">
	import type { Course } from '$lib/data/courses';
	import type { CourseMeta } from '$lib/data/course-meta';

	let {
		course,
		meta,
		mode
	}: {
		course: Course;
		meta: CourseMeta;
		mode: 'public' | 'user';
	} = $props();
</script>

<aside aria-label="Ringkasan dan pendaftaran pelatihan" class="overflow-hidden rounded-2xl border border-slate-200/70 bg-white lg:sticky lg:top-24">
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
			>
				<i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i> Periode Berakhir
			</span>
			<p class="text-center text-[11px] text-slate-500">
				Batch pelatihan ini sudah lewat. Pantau katalog untuk batch berikutnya.
			</p>
		{:else if mode === 'public'}
			<a
				href="/login"
				class="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 ease-smooth hover:bg-blue-700 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-blue-600"
			>
				<i class="fa-solid fa-arrow-right-to-bracket" aria-hidden="true"></i>
				{meta.period === 'upcoming' ? `Daftar Batch ${meta.startMonth ?? ''}`.trim() : 'Masuk untuk Mulai'}
			</a>
			<p class="text-center text-[11px] text-slate-500">
				Masuk untuk melihat modul dan mulai belajar.
			</p>
		{:else}
			<a
				href={`/user/kursusku/${course.id}`}
				class="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 ease-smooth hover:bg-blue-700 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-blue-600"
			>
				<i class="fa-solid fa-play" aria-hidden="true"></i> Lanjut Belajar
			</a>
		{/if}
		<ul class="space-y-2 border-t border-slate-100 pt-3 text-[13px] text-slate-600">
			<li class="flex items-center gap-2.5">
				<i class="fa-solid fa-layer-group w-4 text-center text-slate-400" aria-hidden="true"></i> Modul → sub-modul → materi bertahap
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
