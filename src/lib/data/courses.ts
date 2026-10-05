export type CourseStatus = 'in-progress' | 'completed' | 'not-started';

export type MaterialType = 'video' | 'bacaan' | 'audio' | 'foto' | 'kuis' | 'tugas';

export interface Material {
	id: string;
	title: string;
	type: MaterialType;
	duration: string;
	completed: boolean;
}

export interface CourseModule {
	id: string;
	title: string;
	description: string;
	materials: Material[];
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

function mod(
	courseId: number,
	index: number,
	title: string,
	description: string,
	materials: Array<Omit<Material, 'id'>>
): CourseModule {
	return {
		id: `m${courseId}-${index}`,
		title,
		description,
		materials: materials.map((m, i) => ({ ...m, id: `m${courseId}-${index}-mat${i + 1}` }))
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
				{ title: 'Pengenalan HTML5', type: 'video', duration: '18 mnt', completed: true },
				{ title: 'Form & Validasi Native', type: 'video', duration: '24 mnt', completed: true },
				{ title: 'Latihan: Landing Page Semantik', type: 'tugas', duration: '60 mnt', completed: true }
			]),
			mod(1, 2, 'CSS Modern & Layout Responsif', 'Flexbox, Grid, dan Tailwind untuk layout profesional.', [
				{ title: 'Flexbox & Grid Mendalam', type: 'video', duration: '32 mnt', completed: true },
				{ title: 'Desain Responsif Mobile-First', type: 'bacaan', duration: '20 mnt', completed: true },
				{ title: 'Kuis CSS Layout', type: 'kuis', duration: '15 mnt', completed: true }
			]),
			mod(1, 3, 'JavaScript Interaktif', 'DOM, event, dan fetch API untuk aplikasi dinamis.', [
				{ title: 'DOM & Event Handling', type: 'video', duration: '28 mnt', completed: true },
				{ title: 'Async & Fetch API', type: 'video', duration: '30 mnt', completed: true },
				{ title: 'Proyek: Galeri Interaktif', type: 'tugas', duration: '90 mnt', completed: false }
			]),
			mod(1, 4, 'Framework & Deployment', 'Komponen modern dan deploy ke production.', [
				{ title: 'Konsep Komponen & State', type: 'video', duration: '26 mnt', completed: false },
				{ title: 'Build & Deploy ke Hosting', type: 'bacaan', duration: '18 mnt', completed: false },
				{ title: 'Ujian Akhir Frontend', type: 'kuis', duration: '45 mnt', completed: false }
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
				{ title: 'Pengantar DBMS', type: 'video', duration: '20 mnt', completed: true },
				{ title: 'Normalisasi 1NF–3NF', type: 'bacaan', duration: '25 mnt', completed: true },
				{ title: 'Latihan: Desain ERD Toko Online', type: 'tugas', duration: '60 mnt', completed: true }
			]),
			mod(2, 2, 'SQL Dasar hingga Join', 'SELECT, filter, agregasi, dan join multi-tabel.', [
				{ title: 'CRUD & Filtering', type: 'video', duration: '30 mnt', completed: true },
				{ title: 'INNER, LEFT & FULL Join', type: 'video', duration: '28 mnt', completed: true },
				{ title: 'Kuis Query Menengah', type: 'kuis', duration: '20 mnt', completed: true }
			]),
			mod(2, 3, 'SQL Lanjutan & Optimasi', 'Subquery, window function, index, dan tuning.', [
				{ title: 'Subquery & CTE', type: 'video', duration: '26 mnt', completed: true },
				{ title: 'Index & Explain Plan', type: 'bacaan', duration: '22 mnt', completed: true },
				{ title: 'Studi Kasus: Optimasi 1 Juta Baris', type: 'tugas', duration: '75 mnt', completed: true },
				{ title: 'Ujian Akhir SQL', type: 'kuis', duration: '40 mnt', completed: true }
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
				{ title: 'Perangkat & Topologi', type: 'video', duration: '22 mnt', completed: true },
				{ title: 'OSI & TCP/IP Layer', type: 'bacaan', duration: '18 mnt', completed: true },
				{ title: 'Kuis Konsep Dasar', type: 'kuis', duration: '15 mnt', completed: true }
			]),
			mod(3, 2, 'IP Addressing & Subnetting', 'IPv4, CIDR, dan perhitungan subnet praktis.', [
				{ title: 'IPv4 & CIDR Notation', type: 'video', duration: '30 mnt', completed: true },
				{ title: 'Latihan Subnetting VLSM', type: 'tugas', duration: '60 mnt', completed: false },
				{ title: 'Simulasi Packet Tracer', type: 'foto', duration: '25 mnt', completed: false }
			]),
			mod(3, 3, 'Routing & Troubleshooting', 'Static routing, DHCP/DNS, dan perintah diagnostik.', [
				{ title: 'Static Routing Dasar', type: 'video', duration: '24 mnt', completed: false },
				{ title: 'Ping, Traceroute & Wireshark', type: 'bacaan', duration: '20 mnt', completed: false }
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
				{ title: 'CIA Triad & Threat Landscape', type: 'video', duration: '20 mnt', completed: false },
				{ title: 'Social Engineering Awareness', type: 'audio', duration: '15 mnt', completed: false }
			]),
			mod(4, 2, 'Hardening & Praktikum Aman', 'Password policy, MFA, firewall, dan backup.', [
				{ title: 'Hardening OS & Aplikasi', type: 'video', duration: '28 mnt', completed: false },
				{ title: 'Lab: Konfigurasi Firewall', type: 'tugas', duration: '60 mnt', completed: false },
				{ title: 'Kuis Fundamental Security', type: 'kuis', duration: '15 mnt', completed: false },
				{ title: 'Simulasi Respons Insiden', type: 'video', duration: '22 mnt', completed: false }
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
				{ title: 'Setup & Jupyter Workflow', type: 'video', duration: '18 mnt', completed: true },
				{ title: 'Pandas: Cleaning Dataset', type: 'video', duration: '32 mnt', completed: true },
				{ title: 'Latihan EDA Penjualan', type: 'tugas', duration: '75 mnt', completed: true }
			]),
			mod(5, 2, 'Regresi & Klasifikasi', 'Model supervised learning pertama Anda.', [
				{ title: 'Linear & Logistic Regression', type: 'video', duration: '30 mnt', completed: true },
				{ title: 'Decision Tree & Random Forest', type: 'video', duration: '28 mnt', completed: false },
				{ title: 'Kuis Evaluasi Model', type: 'kuis', duration: '20 mnt', completed: false }
			]),
			mod(5, 3, 'Validasi & Proyek Akhir', 'Cross-validation, tuning, dan deployment sederhana.', [
				{ title: 'Cross-Validation & Tuning', type: 'video', duration: '26 mnt', completed: false },
				{ title: 'Proyek: Prediksi Churn', type: 'tugas', duration: '120 mnt', completed: false },
				{ title: 'Presentasi Model', type: 'bacaan', duration: '15 mnt', completed: false },
				{ title: 'Ujian Akhir ML Dasar', type: 'kuis', duration: '45 mnt', completed: false },
				{ title: 'Next Step: Deep Learning', type: 'bacaan', duration: '12 mnt', completed: false },
				{ title: 'Peer Review Proyek', type: 'tugas', duration: '30 mnt', completed: false },
				{ title: 'Sertifikasi Siap Kerja', type: 'video', duration: '10 mnt', completed: false },
				{ title: 'Refleksi & Roadmap', type: 'bacaan', duration: '10 mnt', completed: false }
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
				{ title: 'Kernel vs User Space', type: 'video', duration: '20 mnt', completed: true },
				{ title: 'Monitoring Proses Linux', type: 'bacaan', duration: '15 mnt', completed: true },
				{ title: 'Kuis Manajemen Proses', type: 'kuis', duration: '15 mnt', completed: true }
			]),
			mod(6, 2, 'Filesystem & Shell', 'Permission, scripting bash, dan automasi tugas.', [
				{ title: 'Permission & Ownership', type: 'video', duration: '24 mnt', completed: true },
				{ title: 'Bash Scripting Praktis', type: 'video', duration: '30 mnt', completed: true },
				{ title: 'Tugas: Automasi Backup', type: 'tugas', duration: '60 mnt', completed: true },
				{ title: 'Administrasi Server Mini', type: 'video', duration: '22 mnt', completed: true },
				{ title: 'Ujian Akhir Sistem Operasi', type: 'kuis', duration: '40 mnt', completed: true }
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
