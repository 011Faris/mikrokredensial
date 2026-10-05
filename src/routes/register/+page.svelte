<script lang="ts">
	import '../../app.css';
	import Logo from '$lib/components/Logo.svelte';

	let showPassword = $state(false);
	let showConfirmPassword = $state(false);
	let fullName = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let agreeTerms = $state(false);
	let isLoading = $state(false);

	let passwordStrength = $state(0);
	let passwordStrengthLabel = $state('');
	let passwordStrengthColor = $state('bg-slate-300');

	function togglePassword() {
		showPassword = !showPassword;
	}

	function toggleConfirmPassword() {
		showConfirmPassword = !showConfirmPassword;
	}

	function calculatePasswordStrength(pw: string) {
		let strength = 0;
		if (pw.length >= 8) strength += 1;
		if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) strength += 1;
		if (/[^A-Za-z0-9]/.test(pw)) strength += 1;

		passwordStrength = strength;

		if (strength === 0) {
			passwordStrengthLabel = pw.length > 0 ? 'Sangat Lemah' : '';
			passwordStrengthColor = 'bg-red-500';
		} else if (strength === 1) {
			passwordStrengthLabel = 'Cukup';
			passwordStrengthColor = 'bg-amber-500';
		} else if (strength === 2) {
			passwordStrengthLabel = 'Kuat';
			passwordStrengthColor = 'bg-blue-500';
		} else {
			passwordStrengthLabel = 'Sangat Aman';
			passwordStrengthColor = 'bg-green-500';
		}
	}

	function handlePasswordInput(event: Event) {
		const value = (event.target as HTMLInputElement).value;
		password = value;
		calculatePasswordStrength(value);
	}

	function handleSubmit(event: Event) {
		event.preventDefault();
		if (!agreeTerms) {
			alert('Anda harus menyetujui Syarat & Ketentuan.');
			return;
		}
		if (password !== confirmPassword) {
			alert('Kata sandi tidak cocok.');
			return;
		}
		isLoading = true;
		console.log('Register attempt:', { fullName, email, password });
		setTimeout(() => {
			isLoading = false;
		}, 1500);
	}
</script>

<!-- Full Screen Register Layout -->
<div class="min-h-screen flex flex-col lg:flex-row bg-slate-50">

		<!-- Left Panel: Branding & Info -->
	<div class="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
		<!-- Background Pattern -->
		<div class="absolute inset-0 opacity-10">
			<div
				class="absolute inset-0"
				style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"
			></div>
		</div>

		<!-- Decorative Circles -->
		<div class="absolute -top-24 -right-24 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl"></div>
		<div class="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-3xl"></div>

		<!-- Content -->
		<div class="relative z-10 flex flex-col p-8 xl:p-10 w-full gap-8">

			<!-- Logo & Branding -->
			<Logo size="md" showText={true} textSize="lg" dark={true} />

			<!-- Center Content -->
			<div class="flex flex-col justify-center max-w-lg">

				<!-- Badge -->
				<div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-cyan-300 px-3 py-1.5 rounded-full text-xs font-semibold mb-3 w-fit border border-white/10">
					<i class="fa-solid fa-user-plus"></i>
					Bergabung dengan Kami
				</div>

				<!-- Heading -->
				<h2 class="text-3xl xl:text-4xl font-bold text-white leading-tight mb-3">
					Mulai Perjalanan<br />
					<span class="text-cyan-400">Akademik Anda</span>
				</h2>

				<!-- Description -->
				<p class="text-blue-100 text-sm leading-relaxed mb-5">
					Daftarkan diri Anda dan bergabung dengan ribuan mahasiswa yang telah
					meraih sertifikat kompetensi industri terverifikasi.
				</p>

				<!-- Benefits List -->
				<div class="space-y-2.5">

					<div class="flex items-center gap-3 text-white/90">
						<div class="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/10 shrink-0">
							<i class="fa-solid fa-rocket text-cyan-400 text-sm"></i>
						</div>

						<span class="text-sm font-medium">
							Akses 120+ Modul Standar Industri
						</span>
					</div>

					<div class="flex items-center gap-3 text-white/90">
						<div class="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/10 shrink-0">
							<i class="fa-solid fa-certificate text-cyan-400 text-sm"></i>
						</div>

						<span class="text-sm font-medium">
							Sertifikat Terverifikasi & Terakreditasi
						</span>
					</div>

					<div class="flex items-center gap-3 text-white/90">
						<div class="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/10 shrink-0">
							<i class="fa-solid fa-handshake text-cyan-400 text-sm"></i>
						</div>

						<span class="text-sm font-medium">
							Koneksi dengan 80+ Mitra Perekrut
						</span>
					</div>

				</div>
			</div>

			<!-- Bottom Stats -->
			<div class="grid grid-cols-3 gap-4 pt-5 border-t border-white/10">

				<div>
					<div class="text-xl font-bold text-white">45.000+</div>
					<div class="text-blue-200 text-xs">Mahasiswa Aktif</div>
				</div>

				<div>
					<div class="text-xl font-bold text-white">98.4%</div>
					<div class="text-blue-200 text-xs">Tingkat Kelulusan</div>
				</div>

				<div>
					<div class="text-xl font-bold text-white">4.8/5</div>
					<div class="text-blue-200 text-xs">Rating Platform</div>
				</div>

			</div>
		</div>
	</div>

	<!-- Right Panel: Register Form -->
	<div class="flex-1 lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-slate-50 overflow-y-auto">
		<div class="w-full max-w-md">
			<!-- Mobile Logo (visible only on small screens) -->
			<div class="lg:hidden flex items-center gap-3 mb-8 justify-center">
				<Logo size="lg" showText={true} textSize="lg" />
			</div>

			<!-- Register Card -->
			<div class="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
				<!-- Top Accent Bar -->
				<div class="h-1.5 bg-linear-to-r from-blue-600 via-cyan-500 to-blue-600"></div>

				<div class="p-8 sm:p-10">
					<!-- Header -->
					<div class="mb-8">
						<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-4 border border-blue-100">
							<i class="fa-solid fa-user-plus"></i> Pendaftaran Mahasiswa
						</div>
						<h2 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
							Buat Akun Baru
						</h2>
						<p class="text-slate-500 text-sm">
							Daftarkan diri Anda untuk mulai belajar dan meraih sertifikat kompetensi.
						</p>
					</div>

					<!-- Form -->
					<form class="space-y-5" onsubmit={handleSubmit}>
						<!-- Full Name -->
						<div>
							<label for="full-name" class="block text-sm font-semibold text-slate-700 mb-2">
								Nama Lengkap <span class="text-red-500">*</span>
							</label>
							<div class="relative">
								<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
									<i class="fa-solid fa-user"></i>
								</div>
								<input
									id="full-name"
									name="fullName"
									type="text"
									placeholder="cth. Rian Pratama"
									bind:value={fullName}
									class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
								/>
							</div>
						</div>

						<!-- Email -->
						<div>
							<label for="reg-email" class="block text-sm font-semibold text-slate-700 mb-2">
								Email <span class="text-red-500">*</span>
							</label>
							<div class="relative">
								<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
									<i class="fa-solid fa-envelope"></i>
								</div>
								<input
									id="reg-email"
									name="email"
									type="email"
									placeholder="email@anda.com"
									bind:value={email}
									class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
								/>
							</div>
						</div>

						<!-- Password -->
						<div>
							<label for="reg-password" class="block text-sm font-semibold text-slate-700 mb-2">
								Kata Sandi <span class="text-red-500">*</span>
							</label>
							<div class="relative">
								<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
									<i class="fa-solid fa-lock"></i>
								</div>
								<input
									id="reg-password"
									name="password"
									type={showPassword ? 'text' : 'password'}
									placeholder="Kombinasi kata sandi kuat"
									bind:value={password}
									oninput={handlePasswordInput}
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

							<!-- Password Strength Meter -->
							{#if password.length > 0}
								<div class="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
									<div class="flex items-center justify-between mb-2">
										<span class="text-xs text-slate-500 font-semibold">Tingkat Kekuatan Sandi</span>
										<span class="text-xs font-semibold text-blue-600">{passwordStrengthLabel}</span>
									</div>
									<div class="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2.5">
										<div
											class="h-full {passwordStrengthColor} transition-all duration-300 rounded-full"
											style="width: {passwordStrength === 0 ? '10' : passwordStrength * 33}%"
										></div>
									</div>
									<div class="grid grid-cols-2 gap-1.5">
										<div class="flex items-center gap-1.5 text-xs {password.length >= 8 ? 'text-green-600' : 'text-slate-400'}">
											<i class="fa-solid {password.length >= 8 ? 'fa-circle-check' : 'fa-circle'}"></i>
											<span>Minimal 8 karakter</span>
										</div>
										<div class="flex items-center gap-1.5 text-xs {/[A-Z]/.test(password) && /[0-9]/.test(password) ? 'text-green-600' : 'text-slate-400'}">
											<i class="fa-solid {/[A-Z]/.test(password) && /[0-9]/.test(password) ? 'fa-circle-check' : 'fa-circle'}"></i>
											<span>Huruf besar &amp; angka</span>
										</div>
									</div>
								</div>
							{/if}
						</div>

						<!-- Confirm Password -->
						<div>
							<label for="confirm-password" class="block text-sm font-semibold text-slate-700 mb-2">
								Konfirmasi Kata Sandi <span class="text-red-500">*</span>
							</label>
							<div class="relative">
								<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
									<i class="fa-solid fa-lock"></i>
								</div>
								<input
									id="confirm-password"
									name="confirmPassword"
									type={showConfirmPassword ? 'text' : 'password'}
									placeholder="Ulangi kata sandi Anda"
									bind:value={confirmPassword}
									class="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
								/>
								<button
									type="button"
									aria-label="Tampilkan atau sembunyikan kata sandi"
									onclick={toggleConfirmPassword}
									class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
								>
									<i class="fa-solid {showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}"></i>
								</button>
							</div>
							{#if confirmPassword.length > 0 && password !== confirmPassword}
								<p class="text-xs text-red-500 mt-1.5 flex items-center gap-1">
									<i class="fa-solid fa-circle-exclamation"></i>
									<span>Kata sandi tidak cocok.</span>
								</p>
							{/if}
						</div>

						<!-- Terms Checkbox -->
						<div class="pt-1">
							<label class="flex items-start gap-2.5 cursor-pointer select-none">
								<input
									id="terms-checkbox"
									name="terms"
									type="checkbox"
									bind:checked={agreeTerms}
									class="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
								/>
								<span class="text-sm text-slate-600 leading-snug">
									Saya menyetujui <a href="#" class="text-blue-600 hover:underline font-medium">Syarat &amp; Ketentuan</a> serta <a href="#" class="text-blue-600 hover:underline font-medium">Kebijakan Privasi</a> Aristoteles.
								</span>
							</label>
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
								<span>Daftar Akun Sekarang</span>
								<i class="fa-solid fa-arrow-right"></i>
							{/if}
						</button>

						<!-- Divider -->
						<div class="relative flex py-3 items-center">
							<div class="grow border-t border-slate-200"></div>
							<span class="shrink mx-4 text-xs text-slate-400 uppercase tracking-wider font-semibold">atau</span>
							<div class="grow border-t border-slate-200"></div>
						</div>

						<!-- SSO Button -->
						<button
							type="button"
							class="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-[0.98]"
						>
							<i class="fa-brands fa-google text-red-500"></i>
							<span>Daftar dengan UNIRA</span>
						</button>
					</form>

					<!-- Card Footer -->
					<div class="mt-6 pt-5 border-t border-slate-100 text-center">
						<p class="text-sm text-slate-600">
							Sudah memiliki akun?
							<a href="/login" class="font-bold text-blue-600 hover:text-blue-700 hover:underline ml-1">
								Masuk di sini
							</a>
						</p>
					</div>
				</div>

				<!-- Card Footer Bar -->
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
