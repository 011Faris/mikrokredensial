<script lang="ts">
	import { goto } from '$app/navigation';
	import '../../app.css';
	import Logo from '$lib/components/Logo.svelte';

	/** Akun dummy untuk simulasi login (sisi klien, tanpa backend) */
	const DUMMY_ACCOUNTS = [
		{
			email: 'farisi@gmail.com',
			password: '1234567',
			name: 'Ahmad Farizi',
			role: 'Mahasiswa UNIRA',
			home: '/user'
		},
		{
			email: 'kevin@aristoteles.ac.id',
			password: '1234567',
			name: 'Kevin Perry',
			role: 'Instruktur',
			home: '/instruktur'
		}
	];

	let showPassword = $state(false);
	let email = $state('');
	let password = $state('');
	let rememberMe = $state(false);
	let isLoading = $state(false);
	let errorMessage = $state('');

	function togglePassword() {
		showPassword = !showPassword;
	}

	function fillDemoAccount(account: (typeof DUMMY_ACCOUNTS)[number] = DUMMY_ACCOUNTS[0]) {
		email = account.email;
		password = account.password;
		errorMessage = '';
	}

	function handleSubmit(event: Event) {
		event.preventDefault();
		errorMessage = '';
		isLoading = true;

		const account = DUMMY_ACCOUNTS.find(
			(a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password
		);

		setTimeout(() => {
			isLoading = false;
			if (!account) {
				errorMessage = 'Email atau kata sandi salah. Gunakan akun demo di bawah untuk mencoba.';
				return;
			}
			try {
				const session = {
					email: account.email,
					name: account.name,
					role: account.role,
					loginAt: new Date().toISOString(),
					rememberMe
				};
				(rememberMe ? localStorage : sessionStorage).setItem('aristoteles-session', JSON.stringify(session));
			} catch {
				// abaikan bila penyimpanan tidak tersedia
			}
			goto(account.home ?? '/user');
		}, 900);
	}
</script>

<!-- Full Screen Login Layout -->
<div class="min-h-screen flex flex-col lg:flex-row bg-slate-50">

	<!-- Left Panel: Branding & Info (Hidden on mobile) -->
	<div class="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
		<!-- Background Pattern -->
		<div class="absolute inset-0 opacity-10">
			<div class="absolute top-0 left-0 w-full h-full" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
		</div>

		<!-- Decorative Circles -->
		<div class="absolute -top-24 -right-24 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl"></div>
		<div class="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-3xl"></div>

		<!-- Content -->
		<div class="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
			<!-- Logo & Branding -->
			<Logo size="xl" showText={true} textSize="xl" dark={true} />

			<!-- Center Content -->
			<div class="flex-grow flex flex-col justify-center max-w-lg">
				<div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-cyan-300 px-4 py-2 rounded-full text-sm font-semibold mb-6 w-fit border border-white/10">
					<i class="fa-solid fa-shield-halved"></i> Portal Akademik Terpadu
				</div>

				<h2 class="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
					Sistem Pendukung<br />
					<span class="text-cyan-400">Akademik Terpadu</span>
				</h2>

				<p class="text-blue-100 text-lg leading-relaxed mb-10">
					Platform terkemuka untuk bimbingan skripsi, kerja praktik, KRS, dan pelayanan akademik mahasiswa secara real-time.
				</p>

				<!-- Features List -->
				<div class="space-y-4">
					<div class="flex items-center gap-3 text-white/90">
						<div class="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
							<i class="fa-solid fa-book-open text-cyan-400"></i>
						</div>
						<span class="font-medium">Akses Modul Belajar &amp; Sertifikasi</span>
					</div>
					<div class="flex items-center gap-3 text-white/90">
						<div class="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
							<i class="fa-solid fa-award text-cyan-400"></i>
						</div>
						<span class="font-medium">Sertifikat Terverifikasi &amp; Terakreditasi</span>
					</div>
					<div class="flex items-center gap-3 text-white/90">
						<div class="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
							<i class="fa-solid fa-chart-line text-cyan-400"></i>
						</div>
						<span class="font-medium">Pantau Progres &amp; Peringkat</span>
					</div>
				</div>
			</div>

			<!-- Bottom Stats -->
			<div class="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
				<div>
					<div class="text-3xl font-bold text-white">45.000+</div>
					<div class="text-blue-200 text-sm">Mahasiswa</div>
				</div>
				<div>
					<div class="text-3xl font-bold text-white">120+</div>
					<div class="text-blue-200 text-sm">Modul</div>
				</div>
				<div>
					<div class="text-3xl font-bold text-white">80+</div>
					<div class="text-blue-200 text-sm">Mitra Industri</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Right Panel: Login Form -->
	<div class="flex-1 lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-slate-50">
		<div class="w-full max-w-md">
			<!-- Mobile Logo (visible only on small screens) -->
			<div class="lg:hidden flex items-center gap-3 mb-8 justify-center">
				<Logo size="lg" showText={true} textSize="lg" />
			</div>

			<!-- Login Card -->
			<div class="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
				<!-- Top Accent Bar -->
				<div class="h-1.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600"></div>

				<div class="p-8 sm:p-10">
					<!-- Header -->
					<div class="mb-8">
						<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-4 border border-blue-100">
							<i class="fa-solid fa-user-graduate"></i> Portal Mahasiswa
						</div>
						<h2 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
							Selamat Datang Kembali
						</h2>
						<p class="text-slate-500 text-sm">
							Masuk untuk melanjutkan progres belajar dan sertifikasi Anda.
						</p>
					</div>

					<!-- Form -->
					<form class="space-y-5" onsubmit={handleSubmit}>
						{#if errorMessage}
							<p
								role="alert"
								class="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700"
							>
								<i class="fa-solid fa-circle-exclamation mt-0.5 shrink-0" aria-hidden="true"></i>
								<span>{errorMessage}</span>
							</p>
						{/if}
						<!-- Email Input -->
						<div>
							<label for="student-email" class="block text-sm font-semibold text-slate-700 mb-2">
								Email / NIM
							</label>
							<div class="relative">
								<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
									<i class="fa-solid fa-envelope"></i>
								</div>
								<input
									id="student-email"
									name="email"
									type="email"
									placeholder="nim@student.ac.id atau email@anda.com"
									bind:value={email}
									class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
								/>
							</div>
						</div>

						<!-- Password Input -->
						<div>
							<div class="flex items-center justify-between mb-2">
								<label for="student-password" class="block text-sm font-semibold text-slate-700">
									Kata Sandi
								</label>
								<a href="/verify" class="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
									Lupa Kata Sandi?
								</a>
							</div>
							<div class="relative">
								<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
									<i class="fa-solid fa-lock"></i>
								</div>
								<input
									id="student-password"
									name="password"
									type={showPassword ? 'text' : 'password'}
									placeholder="Masukkan kata sandi"
									bind:value={password}
									class="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
								/>
								<button
									type="button"
									aria-label="Tampilkan atau sembunyikan kata sandi"
									onclick={togglePassword}
									class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
								>
									<i class="fa-solid {showPassword ? 'fa-eye-slash' : 'fa-eye'}"></i>
								</button>
							</div>
						</div>

						<!-- Remember Me -->
						<div class="flex items-center justify-between">
							<div class="flex items-center">
								<input
									id="remember-me"
									name="remember-me"
									type="checkbox"
									bind:checked={rememberMe}
									class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
								/>
								<label for="remember-me" class="ml-2 block text-sm text-slate-600 cursor-pointer select-none">
									Ingat saya
								</label>
							</div>
							<a href="/register" class="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
								Daftar Akun
							</a>
						</div>

						<!-- Submit Button -->
						<button
							type="submit"
							disabled={isLoading}
							class="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg shadow-blue-600/25 active:scale-[0.98] disabled:cursor-not-allowed"
						>
							{#if isLoading}
								<i class="fa-solid fa-circle-notch fa-spin"></i>
								<span>Memproses...</span>
							{:else}
								<span>Masuk ke Portal</span>
								<i class="fa-solid fa-arrow-right"></i>
							{/if}
						</button>

						<!-- Divider -->
						<div class="relative flex py-3 items-center">
							<div class="grow border-t border-slate-200"></div>
							<span class="shrink mx-4 text-xs text-slate-400 uppercase tracking-wider font-semibold">atau</span>
							<div class="grow border-t border-slate-200"></div>
						</div>

						<!-- Demo account -->
						<div class="rounded-xl border border-dashed border-blue-200 bg-blue-50/60 p-4">
							<p class="flex items-center gap-2 text-xs font-bold text-blue-800">
								<i class="fa-solid fa-flask" aria-hidden="true"></i> Akun demo
							</p>
							<ul class="mt-2 space-y-2.5">
								{#each DUMMY_ACCOUNTS as account (account.email)}
									<li class="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/70 px-3 py-2">
										<span>
											<span class="block text-[11px] font-bold text-slate-800">{account.role} — {account.name}</span>
											<span class="block font-mono text-[11px] text-blue-700">
												{account.email} · {account.password}
											</span>
										</span>
										<button
											type="button"
											onclick={() => fillDemoAccount(account)}
											class="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
										>
											<i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i>
											Isi otomatis
										</button>
									</li>
								{/each}
							</ul>
						</div>

						<!-- SSO Button -->
						<a href="/with_UNIRA">
							<button
								type="button"
								class="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-[0.98]"
							>
								<i class="fa-brands fa-google text-red-500"></i>
								<span>Masuk dengan UNIRA</span>
							</button>
						</a>
					</form>
				</div>

				<!-- Card Footer -->
				<div class="px-8 sm:px-10 py-4 bg-slate-50 border-t border-slate-100">
					<div class="flex items-center justify-center gap-4 text-xs text-slate-500">
						<span class="flex items-center gap-1.5">
							<i class="fa-solid fa-shield-halved text-green-500"></i>
							Enkripsi TLS 1.3
						</span>
						<span class="text-slate-300">|</span>
						<span class="flex items-center gap-1.5">
							<i class="fa-solid fa-certificate text-green-500"></i>
							ISO 27001
						</span>
					</div>
				</div>
			</div>

			<!-- Back to Home -->
			<div class="mt-6 text-center">
				<a href="/" class="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors font-medium">
					<i class="fa-solid fa-arrow-left"></i>
					Kembali ke Beranda
				</a>
			</div>

			<!-- Footer Links -->
			<div class="mt-8 text-center text-xs text-slate-400">
				<p>&copy; 2026 Aristoteles Platform Mikrokredensial. Semua hak dilindungi.</p>
				<div class="flex items-center justify-center gap-3 mt-2">
					<a href="#" class="hover:text-blue-600 transition">Privasi</a>
					<span>•</span>
					<a href="#" class="hover:text-blue-600 transition">Bantuan</a>
					<span>•</span>
					<a href="/#verifikasi" class="hover:text-blue-600 transition">Validasi</a>
				</div>
			</div>
		</div>
	</div>
</div>
