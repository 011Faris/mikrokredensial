<script lang="ts">
	import type { CourseModule } from '$lib/data/courses';
	import { isModuleLocked, isSubModuleLocked } from '$lib/data/courses';
	import { doneMaterials } from '$lib/stores/progress.svelte';
	import {
		ROADMAP_NODE_H,
		ROADMAP_NODE_W,
		computeRoadmapLayout,
		firstUnfinishedInModule,
		firstUnfinishedInModules,
		firstUnfinishedMaterial,
		moduleProgress,
		resolveRoadmapSelection,
		subModuleProgress,
		type RoadmapSelection
	} from '$lib/data/training';
	import InfoDrawer from './InfoDrawer.svelte';
	import ProgressBar from '../atoms/ProgressBar.svelte';
	import '../roadmap.css';

	/**
	 * Roadmap canvas terotentikasi: geometri sama dengan versi publik,
	 * ditambah status belajar per node (selesai / terkunci / berjalan)
	 * dan drawer berisi progres + tautan lanjut belajar.
	 * Mode `preview`: semua terbuka tanpa progres (untuk pratinjau).
	 */
	type NodeStatus = 'todo' | 'done' | 'locked';

	interface StatusColor {
		main: string;
		deep: string;
		ring: string;
	}

	const TODO_MODULE: StatusColor = { main: '#2563eb', deep: '#1d4ed8', ring: 'rgb(37 99 235 / 22%)' };
	const TODO_SUB: StatusColor = { main: '#7c3aed', deep: '#6d28d9', ring: 'rgb(124 58 237 / 22%)' };
	const DONE_C: StatusColor = { main: '#059669', deep: '#047857', ring: 'rgb(5 150 105 / 22%)' };
	const LOCKED_C: StatusColor = { main: '#94a5b8', deep: '#64748b', ring: 'rgb(100 116 139 / 22%)' };

	let {
		modules,
		courseId,
		preview = false
	}: {
		modules: CourseModule[];
		courseId: number;
		preview?: boolean;
	} = $props();

	const base = $derived(`/user/kursusku/${courseId}`);
	const isDone = (id: string) => (preview ? false : doneMaterials.has(id));

	let selectedNode = $state<string | null>(null);

	const selection = $derived(resolveRoadmapSelection(modules, selectedNode));

	function openNode(id: string) {
		if (selectedNode === id) {
			closeDrawer();
			return;
		}
		selectedNode = id;
	}

	function closeDrawer() {
		const id = selectedNode;
		selectedNode = null;
		if (id) document.getElementById(`user-node-${id}`)?.focus({ preventScroll: true });
	}

	const layout = $derived(computeRoadmapLayout(modules));
	const nodeMap = $derived(new Map(layout.nodes.map((n) => [n.id, n] as const)));

	const statusById = $derived.by(() => {
		const map = new Map<string, NodeStatus>();
		for (const n of layout.nodes) {
			if (preview) {
				map.set(n.id, 'todo');
				continue;
			}
			const sel = resolveRoadmapSelection(modules, n.id);
			if (!sel) continue;
			const locked =
				sel.kind === 'module'
					? isModuleLocked(modules, sel.moduleIndex, isDone)
					: isSubModuleLocked(modules, sel.moduleIndex, sel.subIndex, isDone);
			if (locked) {
				map.set(n.id, 'locked');
				continue;
			}
			const percent =
				sel.kind === 'module'
					? moduleProgress(sel.module, isDone).percent
					: subModuleProgress(sel.sub, isDone).percent;
			map.set(n.id, percent === 100 ? 'done' : 'todo');
		}
		return map;
	});

	const currentId = $derived(
		preview ? null : (layout.nodes.find((n) => statusById.get(n.id) === 'todo')?.id ?? null)
	);

	function colorOf(kind: 'module' | 'sub', status: NodeStatus): StatusColor {
		if (status === 'done') return DONE_C;
		if (status === 'locked') return LOCKED_C;
		return kind === 'module' ? TODO_MODULE : TODO_SUB;
	}

	function ariaLabelFor(label: string, status: NodeStatus, isCurrent: boolean): string | undefined {
		if (status === 'locked') return `Terkunci: ${label}`;
		if (status === 'done') return `Selesai: ${label}`;
		if (isCurrent) return `Lanjutkan: ${label}`;
		return undefined;
	}

	function materialHref(moduleId: string, materialId: string): string {
		return `${base}/${moduleId}/${materialId}`;
	}

	const nodeStatus = (id: string): NodeStatus => statusById.get(id) ?? 'todo';
</script>

{#snippet drawerActions(sel: RoadmapSelection)}
	{@const locked =
		!preview &&
		(sel.kind === 'module'
			? isModuleLocked(modules, sel.moduleIndex, isDone)
			: isSubModuleLocked(modules, sel.moduleIndex, sel.subIndex, isDone))}
	{@const prog =
		preview || locked
			? null
			: sel.kind === 'module'
				? moduleProgress(sel.module, isDone)
				: subModuleProgress(sel.sub, isDone)}
	{@const nextInScope =
		preview || locked
			? null
			: sel.kind === 'module'
				? (firstUnfinishedInModule(sel.module, isDone) ?? sel.module.materials[0])
				: (firstUnfinishedMaterial(sel.sub.materials, isDone) ?? sel.sub.materials[0])}
	{@const fallback = !preview && locked ? firstUnfinishedInModules(modules, isDone) : null}
	{#if preview}
		<a
			href={`/user/kursusku/${courseId}`}
			class="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 ease-smooth hover:bg-blue-700 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-blue-600"
		>
			<i class="fa-solid fa-eye" aria-hidden="true"></i>
			Buka halaman kursus
		</a>
	{:else if locked}
		<p
			class="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800"
		>
			<i class="fa-solid fa-lock mt-0.5 shrink-0" aria-hidden="true"></i>
			<span>Selesaikan modul dan materi sebelumnya untuk membuka bagian ini.</span>
		</p>
		{#if fallback}
			<a
				href={materialHref(fallback.module.id, fallback.material.id)}
				class="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 ease-smooth hover:bg-blue-700 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-blue-600"
			>
				<i class="fa-solid fa-play" aria-hidden="true"></i>
				Kerjakan: {fallback.material.title}
			</a>
		{/if}
	{:else}
		{#if prog}
			<ProgressBar
				percent={prog.percent}
				label={`${prog.done}/${prog.total} materi`}
				tone={prog.percent === 100 ? 'emerald' : 'blue'}
			/>
		{/if}
		{#if nextInScope}
			<a
				href={materialHref(sel.module.id, nextInScope.id)}
				class="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 ease-smooth hover:bg-blue-700 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-blue-600"
			>
				<i class="fa-solid fa-play" aria-hidden="true"></i>
				{prog && prog.percent === 100 ? 'Tinjau ulang' : 'Lanjutkan belajar'}
			</a>
		{/if}
	{/if}
{/snippet}

<section aria-labelledby="alur-belajar-heading" class="overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
	<div class="border-b border-slate-100 p-5 sm:px-6">
		<h2 id="alur-belajar-heading" class="text-lg font-bold text-slate-900">Alur Belajar</h2>
	</div>
	<div class="p-4 sm:p-6">
		{#if modules.length === 0}
			<div class="rounded-xl border border-dashed border-slate-300 p-8 text-center">
				<p class="text-sm font-semibold text-slate-700">Belum ada modul pada pelatihan ini.</p>
			</div>
		{:else}
			<div class="roadmap-viewport">
				<div class="roadmap-canvas mx-auto" style="width:{layout.w}px;height:{layout.h}px">
					<svg
						class="connections"
						width={layout.w}
						height={layout.h}
						viewBox="0 0 {layout.w} {layout.h}"
						aria-hidden="true"
					>
						{#each layout.connections as connection (connection[0] + '>' + connection[1])}
							{@const from = nodeMap.get(connection[0])}
							{@const to = nodeMap.get(connection[1])}
							{#if from && to}
								<line
									x1={from.x + ROADMAP_NODE_W / 2}
									y1={from.y + ROADMAP_NODE_H / 2}
									x2={to.x + ROADMAP_NODE_W / 2}
									y2={to.y + ROADMAP_NODE_H / 2}
									stroke="#cbd5e1"
									stroke-width="2"
									stroke-linecap="round"
								/>
							{/if}
						{/each}
						{#each layout.curves as curve (curve.key)}
							<path
								d={curve.d}
								fill="none"
								stroke="#94a5b8"
								stroke-width="2"
								stroke-linecap="round"
								stroke-dasharray="7 5"
							/>
						{/each}
					</svg>
					<ul class="absolute inset-0 m-0 list-none p-0">
						{#each layout.nodes as node, ni (node.id)}
							{@const status = nodeStatus(node.id)}
							{@const isCurrent = currentId === node.id}
							<li
								class="roadmap-node-enter absolute"
								style="left:{node.x}px;top:{node.y}px;width:{ROADMAP_NODE_W}px;animation-delay:{ni * 55}ms"
							>
								<button
									type="button"
									id={`user-node-${node.id}`}
									class="roadmap-node"
									class:module={node.kind === 'module'}
									class:sub={node.kind === 'sub'}
									class:locked={status === 'locked'}
									class:current={isCurrent}
									class:selected={selectedNode === node.id}
									style="--mod:{colorOf(node.kind, status).main};--deep:{colorOf(node.kind, status).deep};--ring:{colorOf(node.kind, status).ring}"
									onclick={() => openNode(node.id)}
									aria-pressed={selectedNode === node.id}
									aria-label={ariaLabelFor(node.label, status, isCurrent)}
								>
									{#if status === 'locked'}
										<i class="fa-solid fa-lock text-[11px]" aria-hidden="true"></i>
									{/if}
									{node.label}
								</button>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		{/if}
	</div>
	<InfoDrawer selection={selection} onclose={closeDrawer} actions={drawerActions} />
</section>
