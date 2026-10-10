<script lang="ts">
	import type { CourseModule } from '$lib/data/courses';
	import {
		ROADMAP_NODE_H,
		ROADMAP_NODE_W,
		computeRoadmapLayout,
		resolveRoadmapSelection
	} from '$lib/data/training';
	import InfoDrawer from './InfoDrawer.svelte';
	import '../roadmap.css';

	/**
	 * Interactive Learning Roadmap (canvas + SVG ala roadmap.sh):
	 * alur Modul mengalir dari ATAS KE BAWAH pada sumbu vertikal tengah.
	 * Sub-modul menumpuk di SATU SISI per modul (kanan semua atau kiri
	 * semua, bergantian tiap modul). Garis dari Modul ke sub-modulnya
	 * berupa KURVA PUTUS-PUTUS yang sejajar (berangkat vertikal dari
	 * modul, tiba horizontal di sub-modul), lalu Modul 1 → Modul 2 →
	 * seterusnya dengan garis solid.
	 * Modul memakai SATU warna (biru), sub-modul SATU warna berbeda
	 * (ungu). Setiap node HANYA berisi nama topik dari data. Posisi dan
	 * garis dihitung deterministik dari data (bukan hardcode).
	 * Node berupa toggle statis (tanpa navigasi) sehingga materi
	 * tidak bisa diakses dari halaman publik.
	 */
	interface NodeColor {
		main: string;
		deep: string;
		ring: string;
	}

	/** Satu warna untuk semua modul, satu warna berbeda untuk semua sub-modul. */
	const MODULE_C: NodeColor = { main: '#2563eb', deep: '#1d4ed8', ring: 'rgb(37 99 235 / 22%)' };
	const SUB_C: NodeColor = { main: '#7c3aed', deep: '#6d28d9', ring: 'rgb(124 58 237 / 22%)' };

	let { modules }: { modules: CourseModule[] } = $props();

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
		if (id) document.getElementById(`roadmap-node-${id}`)?.focus({ preventScroll: true });
	}

	const geometry = $derived(computeRoadmapLayout(modules));

	const layout = $derived.by(() => {
		const colorOf = (kind: 'module' | 'sub') => (kind === 'module' ? MODULE_C : SUB_C);
		return {
			...geometry,
			nodes: geometry.nodes.map((n) => ({ ...n, c: colorOf(n.kind) }))
		};
	});

	const nodeMap = $derived(new Map(layout.nodes.map((n) => [n.id, n] as const)));
</script>

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
				<div class="roadmap-canvas" style="width:{layout.w}px;height:{layout.h}px">
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
							<li
								class="roadmap-node-enter absolute"
								style="left:{node.x}px;top:{node.y}px;width:{ROADMAP_NODE_W}px;animation-delay:{ni * 55}ms"
							>
								<button
									type="button"
									id={`roadmap-node-${node.id}`}
									class="roadmap-node"
									class:module={node.kind === 'module'}
									class:sub={node.kind === 'sub'}
									class:selected={selectedNode === node.id}
									style="--mod:{node.c.main};--deep:{node.c.deep};--ring:{node.c.ring}"
									onclick={() => openNode(node.id)}
									aria-pressed={selectedNode === node.id}
								>
									{node.label}
								</button>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		{/if}
	</div>
	<InfoDrawer selection={selection} onclose={closeDrawer} />
</section>
