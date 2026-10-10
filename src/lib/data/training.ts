import type { Course, CourseModule, Material, SubModule } from './courses';
import { getModuleMaterials } from './courses';

/** Level hierarki pelatihan — discriminated union untuk type-safe traversal. */
export type TrainingLevel = 'pelatihan' | 'modul' | 'submodul' | 'materi';

export interface TrainingNodeBase<L extends TrainingLevel> {
	level: L;
	path: string;
}

export type TrainingNode =
	| (TrainingNodeBase<'pelatihan'> & { course: Course })
	| (TrainingNodeBase<'modul'> & { course: Course; module: CourseModule; moduleIndex: number })
	| (TrainingNodeBase<'submodul'> & {
			course: Course;
			module: CourseModule;
			moduleIndex: number;
			sub: SubModule;
			subIndex: number;
	  })
	| (TrainingNodeBase<'materi'> & {
			course: Course;
			module: CourseModule;
			moduleIndex: number;
			sub: SubModule;
			subIndex: number;
			material: Material;
			materialIndex: number;
	  });

export interface TrainingStats {
	moduleCount: number;
	subModuleCount: number;
	materialCount: number;
	byType: Record<Material['type'], number>;
	estimatedLabel: string;
}

/** Fallback: modul lama tanpa subModules dibungkus jadi 1 sub-modul agar UI tetap hierarkis. */
export function resolveSubModules(module: CourseModule): SubModule[] {
	if (module.subModules?.length) return module.subModules;
	return [
		{
			id: `${module.id}-sub1`,
			title: 'Materi Pokok',
			description: module.description,
			materials: module.materials
		}
	];
}

export function flattenTrainingMaterials(course: Course): Material[] {
	return course.modules.flatMap((m) => getModuleMaterials(m));
}

export function getTrainingStats(course: Course): TrainingStats {
	const materials = flattenTrainingMaterials(course);
	const byType: TrainingStats['byType'] = {
		video: 0,
		bacaan: 0,
		audio: 0,
		foto: 0,
		kuis: 0,
		tugas: 0
	};
	for (const m of materials) byType[m.type] += 1;
	return {
		moduleCount: course.modules.length,
		subModuleCount: course.modules.reduce((n, m) => n + resolveSubModules(m).length, 0),
		materialCount: materials.length,
		byType,
		estimatedLabel: `${course.modules.length} modul · ${course.modules.reduce((n, m) => n + resolveSubModules(m).length, 0)} sub-modul · ${materials.length} materi`
	};
}

export type ProgressReader = (id: string) => boolean;

export function subModuleProgress(sub: SubModule, isDone: ProgressReader): { done: number; total: number; percent: number } {
	const done = sub.materials.filter((m) => isDone(m.id)).length;
	const total = sub.materials.length;
	return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export function moduleProgress(module: CourseModule, isDone: ProgressReader): { done: number; total: number; percent: number } {
	const mats = getModuleMaterials(module);
	const done = mats.filter((m) => isDone(m.id)).length;
	const total = mats.length;
	return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export function courseProgress(course: Course, isDone: ProgressReader): { done: number; total: number; percent: number } {
	const mats = flattenTrainingMaterials(course);
	const done = mats.filter((m) => isDone(m.id)).length;
	const total = mats.length;
	return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

/** Cari lokasi materi dalam hierarki (modul + sub-modul + index). */
export function locateMaterial(
	course: Course,
	materialId: string
): Extract<TrainingNode, { level: 'materi' }> | null {
	for (let mi = 0; mi < course.modules.length; mi++) {
		const module = course.modules[mi];
		const subs = resolveSubModules(module);
		for (let si = 0; si < subs.length; si++) {
			const idx = subs[si].materials.findIndex((m) => m.id === materialId);
			if (idx >= 0) {
				return {
					level: 'materi',
					path: `/modules/${course.id}#${module.id}/${subs[si].id}/${materialId}`,
					course,
					module,
					moduleIndex: mi,
					sub: subs[si],
					subIndex: si,
					material: subs[si].materials[idx],
					materialIndex: idx
				};
			}
		}
	}
	return null;
}

/** Cari satu sub-modul beserta konteks modulnya. Dipakai halaman kumpulan materi. */
export function locateSubModule(
	course: Course,
	moduleId: string,
	subId: string
): Extract<TrainingNode, { level: 'submodul' }> | null {
	for (let mi = 0; mi < course.modules.length; mi++) {
		const module = course.modules[mi];
		if (module.id !== moduleId) continue;
		const subs = resolveSubModules(module);
		for (let si = 0; si < subs.length; si++) {
			if (subs[si].id !== subId) continue;
			return {
				level: 'submodul',
				path: subModuleHref(course.id, module.id, subs[si].id),
				course,
				module,
				moduleIndex: mi,
				sub: subs[si],
				subIndex: si
			};
		}
		return null;
	}
	return null;
}

/** URL kanonis halaman kumpulan materi sebuah sub-modul (route publik modules). */
export function subModuleHref(courseId: number | string, moduleId: string, subId: string): string {
	return `/modules/${courseId}/${moduleId}/${subId}`;
}

/** Sub-modul sebelum/sesudah dalam modul yang sama — untuk navigasi halaman materi. */
export function adjacentSubs(
	course: Course,
	moduleId: string,
	subId: string
): { prev: SubModule | null; next: SubModule | null; module: CourseModule | null; moduleIndex: number } {
	const moduleIndex = course.modules.findIndex((m) => m.id === moduleId);
	if (moduleIndex < 0) return { prev: null, next: null, module: null, moduleIndex: -1 };
	const module = course.modules[moduleIndex];
	const subs = resolveSubModules(module);
	const idx = subs.findIndex((s) => s.id === subId);
	if (idx < 0) return { prev: null, next: null, module, moduleIndex };
	return {
		prev: idx > 0 ? subs[idx - 1] : null,
		next: idx < subs.length - 1 ? subs[idx + 1] : null,
		module,
		moduleIndex
	};
}

/** Breadcrumb label generik untuk setiap node: Pelatihan › Modul n › Sub-modul m › Materi. */
export function nodeBreadcrumb(node: TrainingNode): string[] {
	if (node.level === 'pelatihan') return [node.course.title];
	if (node.level === 'modul') return [node.course.title, `Modul ${node.moduleIndex + 1}: ${node.module.title}`];
	if (node.level === 'submodul')
		return [
			node.course.title,
			`Modul ${node.moduleIndex + 1}: ${node.module.title}`,
			`Sub-modul ${node.subIndex + 1}: ${node.sub.title}`
		];
	return [
		node.course.title,
		`Modul ${node.moduleIndex + 1}: ${node.module.title}`,
		`Sub-modul ${node.subIndex + 1}: ${node.sub.title}`,
		node.material.title
	];
}
