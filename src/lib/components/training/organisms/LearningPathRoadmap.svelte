<script lang="ts">
	import type { CourseModule } from '$lib/data/courses';
	import { resolveSubModules } from '$lib/data/training';

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

	interface FlowNode {
		id: string;
		label: string;
		x: number;
		y: number;
		kind: 'module' | 'sub';
		c: NodeColor;
	}

	interface CurvePath {
		key: string;
		d: string;
	}

	/** Satu warna untuk semua modul, satu warna berbeda untuk semua sub-modul. */
	const MODULE_C: NodeColor = { main: '#2563eb', deep: '#1d4ed8', ring: 'rgb(37 99 235 / 22%)' };
	const SUB_C: NodeColor = { main: '#7c3aed', deep: '#6d28d9', ring: 'rgb(124 58 237 / 22%)' };

	const NODE_W = 180;
	const NODE_H = 48;
	const CX = 360;
	const SIDE_GAP = 40;
	const Y0 = 80;
	const SUB_DY = 120;
	const SUB_STEP = 100;
	const ROW_PAD = 110;
	const PAD = 60;

	const LEFT_X = CX - SIDE_GAP - NODE_W;
	const RIGHT_X = CX + SIDE_GAP;

	let { modules }: { modules: CourseModule[] } = $props();

	let selectedNode = $state<string | null>(null);

	const layout = $derived.by(() => {
		const subsPerModule = modules.map((m) => resolveSubModules(m));
		const maxSubs = Math.max(1, ...subsPerModule.map((s) => s.length));
		const STEP = SUB_DY + (maxSubs - 1) * SUB_STEP + ROW_PAD;
		const nodes: FlowNode[] = [];
		const connections: Array<[string, string]> = [];
		const curves: CurvePath[] = [];
		modules.forEach((m, i) => {
			const modCy = Y0 + i * STEP;
			const modBottom = modCy + NODE_H / 2;
			nodes.push({ id: m.id, label: m.title, x: CX - NODE_W / 2, y: modCy - NODE_H / 2, kind: 'module', c: MODULE_C });
			if (i > 0) connections.push([modules[i - 1].id, m.id]);
			// Satu sisi per modul: genap menumpuk di kanan, ganjil di kiri.
			const leftSide = i % 2 === 1;
			subsPerModule[i].forEach((s, j) => {
				const x = leftSide ? LEFT_X : RIGHT_X;
				const cy = modCy + SUB_DY + j * SUB_STEP;
				nodes.push({ id: s.id, label: s.title, x, y: cy - NODE_H / 2, kind: 'sub', c: SUB_C });
				// Kurva dari bawah modul ke tepi dalam sub-modul:
				// berangkat vertikal, tiba horizontal (sejajar).
				const innerX = leftSide ? x + NODE_W : x;
				curves.push({ key: s.id, d: `M ${CX} ${modBottom} Q ${CX} ${cy} ${innerX} ${cy}` });
			});
		});
		return {
			nodes,
			connections,
			curves,
			w: CX + SIDE_GAP + NODE_W + PAD,
			h:
				modules.length > 0
					? Y0 + (modules.length - 1) * STEP + SUB_DY + (maxSubs - 1) * SUB_STEP + NODE_H / 2 + PAD
					: 200
		};
	});

	const nodeMap = $derived(new Map(layout.nodes.map((n) => [n.id, n] as const)));

	function toggle(id: string) {
		selectedNode = selectedNode === id ? null : id;
	}
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
									x1={from.x + NODE_W / 2}
									y1={from.y + NODE_H / 2}
									x2={to.x + NODE_W / 2}
									y2={to.y + NODE_H / 2}
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
								style="left:{node.x}px;top:{node.y}px;width:{NODE_W}px;animation-delay:{ni * 55}ms"
							>
								<button
									type="button"
									class="roadmap-node"
									class:module={node.kind === 'module'}
									class:sub={node.kind === 'sub'}
									class:selected={selectedNode === node.id}
									style="--mod:{node.c.main};--deep:{node.c.deep};--ring:{node.c.ring}"
									onclick={() => toggle(node.id)}
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
</section>

<style>
	.roadmap-viewport {
		overflow: auto;
		border: 1px solid #e2e8f0;
		border-radius: 16px;
		background-color: #fff;
		background-image: radial-gradient(#d8dee9 1px, transparent 1px);
		background-size: 22px 22px;
	}

	.roadmap-viewport:focus-visible {
		outline: 2px solid #7c3aed;
		outline-offset: 2px;
	}

	.roadmap-canvas {
		position: relative;
	}

	.connections {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.roadmap-node {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		min-height: 48px;
		padding: 12px 14px;
		border: 1px solid #cbd5e1;
		border-radius: 9px;
		background: #fff;
		color: #334155;
		font: inherit;
		font-size: 13px;
		font-weight: 600;
		text-align: center;
		overflow-wrap: anywhere;
		cursor: pointer;
		transition:
			border-color 300ms cubic-bezier(0.22, 1, 0.36, 1),
			background 300ms cubic-bezier(0.22, 1, 0.36, 1),
			color 300ms cubic-bezier(0.22, 1, 0.36, 1),
			box-shadow 300ms cubic-bezier(0.22, 1, 0.36, 1),
			transform 300ms cubic-bezier(0.22, 1, 0.36, 1),
			filter 300ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.roadmap-node.sub {
		border-color: var(--mod);
		background: var(--mod);
		color: #fff;
	}

	.roadmap-node.sub:hover {
		border-color: var(--mod);
		filter: brightness(1.08);
		box-shadow: 0 8px 20px rgb(15 23 42 / 18%);
		transform: translateY(-3px);
	}

	.roadmap-node.sub.selected {
		border-color: var(--deep);
		background: var(--deep);
		color: #fff;
		box-shadow: 0 0 0 3px var(--ring);
	}

	.roadmap-node:active {
		transform: translateY(-1px) scale(0.98);
	}

	.roadmap-node.module {
		border-color: var(--mod);
		background: var(--mod);
		color: #fff;
		font-weight: 700;
	}

	.roadmap-node.module:hover {
		border-color: var(--mod);
		filter: brightness(1.08);
		box-shadow: 0 8px 20px rgb(15 23 42 / 18%);
		transform: translateY(-3px);
	}

	.roadmap-node.module.selected {
		border-color: var(--deep);
		background: var(--deep);
		color: #fff;
		box-shadow: 0 0 0 3px var(--ring);
	}

	.roadmap-node:focus-visible {
		outline: 3px solid var(--mod, #7c3aed);
		outline-offset: 3px;
	}

	@keyframes node-enter {
		from {
			opacity: 0;
			transform: translateY(12px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.roadmap-node-enter {
		animation: node-enter 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	@media (prefers-reduced-motion: reduce) {
		.roadmap-node {
			transition: none;
		}

		.roadmap-node:hover {
			transform: none;
		}

		.roadmap-node:active {
			transform: none;
		}

		.roadmap-node-enter {
			animation: none;
		}
	}
</style>
