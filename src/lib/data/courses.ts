export type CourseStatus = 'in-progress' | 'completed' | 'not-started';

export type MaterialType = 'video' | 'bacaan' | 'audio' | 'foto' | 'kuis' | 'tugas';

export interface Material {
	id: string;
	title: string;
	type: MaterialType;
	duration: string;
	completed: boolean;
}

/**
 * ATOMIC HIERARCHY
 * Pelatihan (Course) → Modul (CourseModule) → Sub-Modul (SubModule) → Materi (Material)
 *
 * `materials` pada modul dipertahankan sebagai flatten dari semua sub-modul
 * agar kode lama (progress, locking, instruktur) tetap kompatibel.
 */
export interface SubModule {
	id: string;
	title: string;
	description: string;
	materials: Material[];
}

export interface CourseModule {
	id: string;
	title: string;
	description: string;
	/** Flatten semua materi dari sub-modul — untuk kompatibilitas mundur. */
	materials: Material[];
	/** Sumber kebenaran hierarki. Opsional agar draf lama tetap valid. */
	subModules?: SubModule[];
}

export interface Course {
	id: number;
	title: string;
	category: string;
	instructor: string;
	image: string;
	description: string;
	duration: string;
	level: string;
	progress: number;
	totalMaterials: number;
	completedMaterials: number;
	status: CourseStatus;
	lastAccessed: string;
	modules: CourseModule[];
}

/** Input ringkas untuk mendefinisikan satu sub-modul di dalam `mod()`. */
export interface SubModuleInput {
	title: string;
	description: string;
	materials: Array<Omit<Material, 'id'>>;
}

function mod(
	courseId: number,
	index: number,
	title: string,
	description: string,
	subs: SubModuleInput[]
): CourseModule {
	// Counter global per modul agar ID materi tetap stabil (m{course}-{mod}-mat{n}),
	// sehingga override di material-details.ts tidak rusak saat migrasi ke hierarki.
	let counter = 1;
	const subModules: SubModule[] = subs.map((s, si) => ({
		id: `m${courseId}-${index}-sub${si + 1}`,
		title: s.title,
		description: s.description,
		materials: s.materials.map((m) => ({ ...m, id: `m${courseId}-${index}-mat${counter++}` }))
	}));
	return {
		id: `m${courseId}-${index}`,
		title,
		description,
		materials: subModules.flatMap((s) => s.materials),
		subModules
	};
}

export const courses: Course[] = [
	{
		id: 1,
		title: 'Pengembangan Web Frontend',
		category: 'Pengembangan Web',
		instructor: 'Kevin Perry',
		image:
			'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80',
		description:
			'Kuasai HTML, CSS, JavaScript, dan framework modern untuk membangun antarmuka web yang responsif dan aksesibel.',
		duration: '8 Minggu',
		level: 'Pemula',
		progress: 75,
		totalMaterials: 12,
		completedMaterials: 9,
		status: 'in-progress',
		lastAccessed: 'Kemarin',
		modules: [
			mod(1, 1, 'Dasar HTML & Struktur Web', 'Pahami semantik HTML dan struktur dokumen yang aksesibel.', [
				{
					title: 'Struktur & Semantik',
					description: 'Elemen semantik, form, dan validasi bawaan browser.',
					materials: [
						{ title: 'Pengenalan HTML5', type: 'video', duration: '18 mnt', completed: true },
						{ title: 'Form & Validasi Native', type: 'video', duration: '24 mnt', completed: true }
					]
				},
				{
					title: 'Praktik Terpandu',
					description: 'Latihan membangun landing page semantik.',
					materials: [
						{ title: 'Latihan: Landing Page Semantik', type: 'tugas', duration: '60 mnt', completed: true }
					]
				}
			]),
			mod(1, 2, 'CSS Modern & Layout Responsif', 'Flexbox, Grid, dan Tailwind untuk layout profesional.', [
				{
					title: 'Layout Inti',
					description: 'Kapan memakai Flexbox vs Grid dengan contoh nyata.',
					materials: [
						{ title: 'Flexbox & Grid Mendalam', type: 'video', duration: '32 mnt', completed: true }
					]
				},
				{
					title: 'Responsif & Evaluasi',
					description: 'Pola mobile-first dan kuis pemahaman layout.',
					materials: [
						{ title: 'Desain Responsif Mobile-First', type: 'bacaan', duration: '20 mnt', completed: true },
						{ title: 'Kuis CSS Layout', type: 'kuis', duration: '15 mnt', completed: true }
					]
				}
			]),
			mod(1, 3, 'JavaScript Interaktif', 'DOM, event, dan fetch API untuk aplikasi dinamis.', [
				{
					title: 'DOM & Data',
					description: 'Event handling dan pengambilan data asinkron.',
					materials: [
						{ title: 'DOM & Event Handling', type: 'video', duration: '28 mnt', completed: true },
						{ title: 'Async & Fetch API', type: 'video', duration: '30 mnt', completed: true }
					]
				},
				{
					title: 'Proyek Mini',
					description: 'Terapkan konsep dalam galeri interaktif.',
					materials: [
						{ title: 'Proyek: Galeri Interaktif', type: 'tugas', duration: '90 mnt', completed: false }
					]
				}
			]),
			mod(1, 4, 'Framework & Deployment', 'Komponen modern dan deploy ke production.', [
				{
					title: 'Komponen & Build',
					description: 'Pola komponen, state, dan alur build.',
					materials: [
						{ title: 'Konsep Komponen & State', type: 'video', duration: '26 mnt', completed: false },
						{ title: 'Build & Deploy ke Hosting', type: 'bacaan', duration: '18 mnt', completed: false }
					]
				},
				{
					title: 'Evaluasi Akhir',
					description: 'Ujian pemahaman menyeluruh modul framework.',
					materials: [
						{ title: 'Ujian Akhir Frontend', type: 'kuis', duration: '45 mnt', completed: false }
					]
				}
			])
		]
	},
	{
		id: 2,
		title: 'Basis Data & SQL',
		category: 'Basis Data',
		instructor: 'Max Alexix',
		image:
			'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
		description:
			'Pelajari perancangan skema, query SQL lanjutan, dan optimasi performa basis data relasional.',
		duration: '6 Minggu',
		level: 'Menengah',
		progress: 100,
		totalMaterials: 10,
		completedMaterials: 10,
		status: 'completed',
		lastAccessed: '28 Jul 2026',
		modules: [
			mod(2, 1, 'Konsep & Perancangan Basis Data', 'ERD, normalisasi, dan relasi antar tabel.', [
				{
					title: 'Teori Dasar',
					description: 'DBMS, model data, dan bentuk normal.',
					materials: [
						{ title: 'Pengantar DBMS', type: 'video', duration: '20 mnt', completed: true },
						{ title: 'Normalisasi 1NF–3NF', type: 'bacaan', duration: '25 mnt', completed: true }
					]
				},
				{
					title: 'Praktik ERD',
					description: 'Merancang skema toko online.',
					materials: [
						{ title: 'Latihan: Desain ERD Toko Online', type: 'tugas', duration: '60 mnt', completed: true }
					]
				}
			]),
			mod(2, 2, 'SQL Dasar hingga Join', 'SELECT, filter, agregasi, dan join multi-tabel.', [
				{
					title: 'Query Inti',
					description: 'CRUD, filter, dan join antar tabel.',
					materials: [
						{ title: 'CRUD & Filtering', type: 'video', duration: '30 mnt', completed: true },
						{ title: 'INNER, LEFT & FULL Join', type: 'video', duration: '28 mnt', completed: true }
					]
				},
				{
					title: 'Latihan Terpandu',
					description: 'Kuis pemahaman query menengah.',
					materials: [
						{ title: 'Kuis Query Menengah', type: 'kuis', duration: '20 mnt', completed: true }
					]
				}
			]),
			mod(2, 3, 'SQL Lanjutan & Optimasi', 'Subquery, window function, index, dan tuning.', [
				{
					title: 'Query Lanjutan',
					description: 'CTE, subquery, dan strategi index.',
					materials: [
						{ title: 'Subquery & CTE', type: 'video', duration: '26 mnt', completed: true },
						{ title: 'Index & Explain Plan', type: 'bacaan', duration: '22 mnt', completed: true }
					]
				},
				{
					title: 'Studi Kasus & Ujian',
					description: 'Optimasi dataset besar dan ujian akhir.',
					materials: [
						{ title: 'Studi Kasus: Optimasi 1 Juta Baris', type: 'tugas', duration: '75 mnt', completed: true },
						{ title: 'Ujian Akhir SQL', type: 'kuis', duration: '40 mnt', completed: true }
					]
				}
			])
		]
	},
	{
		id: 3,
		title: 'Jaringan Komputer Dasar',
		category: 'Jaringan',
		instructor: 'Sarah Johnson',
		image:
			'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
		description:
			'Memahami model OSI/TCP-IP, subnetting, routing dasar, dan troubleshooting jaringan.',
		duration: '6 Minggu',
		level: 'Pemula',
		progress: 45,
		totalMaterials: 8,
		completedMaterials: 4,
		status: 'in-progress',
		lastAccessed: '2 hari lalu',
		modules: [
			mod(3, 1, 'Fondasi Jaringan', 'Perangkat, topologi, dan model OSI vs TCP/IP.', [
				{
					title: 'Perangkat & Model',
					description: 'Topologi, OSI layer, dan TCP/IP.',
					materials: [
						{ title: 'Perangkat & Topologi', type: 'video', duration: '22 mnt', completed: true },
						{ title: 'OSI & TCP/IP Layer', type: 'bacaan', duration: '18 mnt', completed: true }
					]
				},
				{
					title: 'Evaluasi Konsep',
					description: 'Kuis pemahaman fondasi jaringan.',
					materials: [{ title: 'Kuis Konsep Dasar', type: 'kuis', duration: '15 mnt', completed: true }]
				}
			]),
			mod(3, 2, 'IP Addressing & Subnetting', 'IPv4, CIDR, dan perhitungan subnet praktis.', [
				{
					title: 'Pengalamatan',
					description: 'Notasi CIDR dan pembagian alamat.',
					materials: [
						{ title: 'IPv4 & CIDR Notation', type: 'video', duration: '30 mnt', completed: true }
					]
				},
				{
					title: 'Praktik & Simulasi',
					description: 'Latihan VLSM dan simulasi visual.',
					materials: [
						{ title: 'Latihan Subnetting VLSM', type: 'tugas', duration: '60 mnt', completed: false },
						{ title: 'Simulasi Packet Tracer', type: 'foto', duration: '25 mnt', completed: false }
					]
				}
			]),
			mod(3, 3, 'Routing & Troubleshooting', 'Static routing, DHCP/DNS, dan perintah diagnostik.', [
				{
					title: 'Routing Dasar',
					description: 'Konsep static routing dan layanan jaringan.',
					materials: [
						{ title: 'Static Routing Dasar', type: 'video', duration: '24 mnt', completed: false }
					]
				},
				{
					title: 'Diagnostik',
					description: 'Alat uji konektivitas dan analisis paket.',
					materials: [
						{ title: 'Ping, Traceroute & Wireshark', type: 'bacaan', duration: '20 mnt', completed: false }
					]
				}
			])
		]
	},
	{
		id: 4,
		title: 'Keamanan Siber',
		category: 'Keamanan',
		instructor: 'Rian Pratama',
		image:
			'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
		description:
			'Prinsip CIA triad, threat modeling, hardening sistem, dan respons insiden untuk pemula.',
		duration: '5 Minggu',
		level: 'Pemula',
		progress: 0,
		totalMaterials: 6,
		completedMaterials: 0,
		status: 'not-started',
		lastAccessed: 'Belum dimulai',
		modules: [
			mod(4, 1, 'Pengantar Keamanan Siber', 'Lanskap ancaman dan prinsip pertahanan berlapis.', [
				{
					title: 'Konsep Ancaman',
					description: 'CIA triad dan lanskap ancaman modern.',
					materials: [
						{ title: 'CIA Triad & Threat Landscape', type: 'video', duration: '20 mnt', completed: false }
					]
				},
				{
					title: 'Rekayasa Sosial',
					description: 'Mengenali serangan berbasis manusia.',
					materials: [
						{ title: 'Social Engineering Awareness', type: 'audio', duration: '15 mnt', completed: false }
					]
				}
			]),
			mod(4, 2, 'Hardening & Praktikum Aman', 'Password policy, MFA, firewall, dan backup.', [
				{
					title: 'Proteksi Sistem',
					description: 'Hardening OS dan konfigurasi firewall.',
					materials: [
						{ title: 'Hardening OS & Aplikasi', type: 'video', duration: '28 mnt', completed: false },
						{ title: 'Lab: Konfigurasi Firewall', type: 'tugas', duration: '60 mnt', completed: false }
					]
				},
				{
					title: 'Evaluasi & Simulasi',
					description: 'Kuis fundamental dan simulasi insiden.',
					materials: [
						{ title: 'Kuis Fundamental Security', type: 'kuis', duration: '15 mnt', completed: false },
						{ title: 'Simulasi Respons Insiden', type: 'video', duration: '22 mnt', completed: false }
					]
				}
			])
		]
	},
	{
		id: 5,
		title: 'Machine Learning Dasar',
		category: 'AI & Data',
		instructor: 'Kevin Perry',
		image:
			'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=600&q=80',
		description:
			'Dari preprocessing data hingga regresi, klasifikasi, dan evaluasi model dengan Python.',
		duration: '10 Minggu',
		level: 'Menengah',
		progress: 30,
		totalMaterials: 14,
		completedMaterials: 4,
		status: 'in-progress',
		lastAccessed: '3 hari lalu',
		modules: [
			mod(5, 1, 'Python untuk Data', 'NumPy, Pandas, dan visualisasi eksploratif.', [
				{
					title: 'Setup & Pandas',
					description: 'Alur kerja Jupyter dan pembersihan data.',
					materials: [
						{ title: 'Setup & Jupyter Workflow', type: 'video', duration: '18 mnt', completed: true },
						{ title: 'Pandas: Cleaning Dataset', type: 'video', duration: '32 mnt', completed: true }
					]
				},
				{
					title: 'Eksplorasi Data',
					description: 'Latihan EDA pada dataset penjualan.',
					materials: [
						{ title: 'Latihan EDA Penjualan', type: 'tugas', duration: '75 mnt', completed: true }
					]
				}
			]),
			mod(5, 2, 'Regresi & Klasifikasi', 'Model supervised learning pertama Anda.', [
				{
					title: 'Model Dasar',
					description: 'Regresi linear/logistik dan tree-based model.',
					materials: [
						{ title: 'Linear & Logistic Regression', type: 'video', duration: '30 mnt', completed: true },
						{ title: 'Decision Tree & Random Forest', type: 'video', duration: '28 mnt', completed: false }
					]
				},
				{
					title: 'Evaluasi Model',
					description: 'Kuis metrik evaluasi dan validasi.',
					materials: [
						{ title: 'Kuis Evaluasi Model', type: 'kuis', duration: '20 mnt', completed: false }
					]
				}
			]),
			mod(5, 3, 'Validasi & Proyek Akhir', 'Cross-validation, tuning, dan deployment sederhana.', [
				{
					title: 'Proyek Inti',
					description: 'Validasi silang dan prediksi churn.',
					materials: [
						{ title: 'Cross-Validation & Tuning', type: 'video', duration: '26 mnt', completed: false },
						{ title: 'Proyek: Prediksi Churn', type: 'tugas', duration: '120 mnt', completed: false },
						{ title: 'Presentasi Model', type: 'bacaan', duration: '15 mnt', completed: false }
					]
				},
				{
					title: 'Evaluasi Sejawat',
					description: 'Ujian akhir dan telaah proyek teman.',
					materials: [
						{ title: 'Ujian Akhir ML Dasar', type: 'kuis', duration: '45 mnt', completed: false },
						{ title: 'Peer Review Proyek', type: 'tugas', duration: '30 mnt', completed: false }
					]
				},
				{
					title: 'Penutup & Roadmap',
					description: 'Langkah lanjut menuju deep learning dan sertifikasi.',
					materials: [
						{ title: 'Next Step: Deep Learning', type: 'bacaan', duration: '12 mnt', completed: false },
						{ title: 'Sertifikasi Siap Kerja', type: 'video', duration: '10 mnt', completed: false },
						{ title: 'Refleksi & Roadmap', type: 'bacaan', duration: '10 mnt', completed: false }
					]
				}
			])
		]
	},
	{
		id: 6,
		title: 'Sistem Operasi',
		category: 'Infrastruktur',
		instructor: 'Max Alexix',
		image:
			'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
		description:
			'Proses, memori, filesystem Linux, scripting shell, dan administrasi server dasar.',
		duration: '6 Minggu',
		level: 'Menengah',
		progress: 100,
		totalMaterials: 8,
		completedMaterials: 8,
		status: 'completed',
		lastAccessed: '10 Jul 2026',
		modules: [
			mod(6, 1, 'Arsitektur & Proses', 'Kernel, scheduling, dan manajemen proses.', [
				{
					title: 'Kernel & Proses',
					description: 'Ruang kernel vs user dan monitoring proses.',
					materials: [
						{ title: 'Kernel vs User Space', type: 'video', duration: '20 mnt', completed: true },
						{ title: 'Monitoring Proses Linux', type: 'bacaan', duration: '15 mnt', completed: true }
					]
				},
				{
					title: 'Evaluasi',
					description: 'Kuis manajemen proses.',
					materials: [
						{ title: 'Kuis Manajemen Proses', type: 'kuis', duration: '15 mnt', completed: true }
					]
				}
			]),
			mod(6, 2, 'Filesystem & Shell', 'Permission, scripting bash, dan automasi tugas.', [
				{
					title: 'Izin & Skrip',
					description: 'Ownership file dan automasi Bash.',
					materials: [
						{ title: 'Permission & Ownership', type: 'video', duration: '24 mnt', completed: true },
						{ title: 'Bash Scripting Praktis', type: 'video', duration: '30 mnt', completed: true },
						{ title: 'Tugas: Automasi Backup', type: 'tugas', duration: '60 mnt', completed: true }
					]
				},
				{
					title: 'Administrasi & Ujian',
					description: 'Server mini dan ujian akhir.',
					materials: [
						{ title: 'Administrasi Server Mini', type: 'video', duration: '22 mnt', completed: true },
						{ title: 'Ujian Akhir Sistem Operasi', type: 'kuis', duration: '40 mnt', completed: true }
					]
				}
			])
		]
	}
];

export function getCourseById(id: number): Course | undefined {
	return courses.find((c) => c.id === id);
}

/**
 * Materi index ke-i terkunci bila ada materi sebelumnya dalam modul yang sama
 * yang belum selesai. Materi pertama tiap modul selalu terbuka.
 */
export function isMaterialLocked(
	materials: Material[],
	index: number,
	isDone: (id: string) => boolean
): boolean {
	if (index <= 0) return false;
	for (let i = 0; i < index; i++) {
		if (!isDone(materials[i].id)) return true;
	}
	return false;
}

/**
 * Modul index ke-i terkunci bila ada materi di modul-modul sebelumnya
 * yang belum selesai. Modul pertama selalu terbuka.
 */
export function isModuleLocked(
	modules: CourseModule[],
	index: number,
	isDone: (id: string) => boolean
): boolean {
	if (index <= 0) return false;
	for (let i = 0; i < index; i++) {
		for (const mat of modules[i].materials) {
			if (!isDone(mat.id)) return true;
		}
	}
	return false;
}

/** Ambil semua materi dalam satu modul (flatten dari sub-modul). */
export function getModuleMaterials(module: CourseModule): Material[] {
	if (module.subModules?.length) return module.subModules.flatMap((s) => s.materials);
	return module.materials;
}

/** Sub-modul index ke-i terkunci bila sub-modul/modul sebelumnya belum tuntas. */
export function isSubModuleLocked(
	modules: CourseModule[],
	moduleIndex: number,
	subIndex: number,
	isDone: (id: string) => boolean
): boolean {
	if (isModuleLocked(modules, moduleIndex, isDone)) return true;
	if (subIndex <= 0) return false;
	const subs = modules[moduleIndex]?.subModules ?? [];
	for (let i = 0; i < subIndex; i++) {
		for (const mat of subs[i]?.materials ?? []) {
			if (!isDone(mat.id)) return true;
		}
	}
	return false;
}
