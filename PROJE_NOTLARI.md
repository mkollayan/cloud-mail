# Cloud Mail Proje Notları

Son güncelleme: 2026-05-31

Bu dosya, bu fork üzerinde yaptığımız özel değişiklikleri ve ileride tekrar bakmamız gereken noktaları hatırlamak için tutuluyor.

## Mevcut Durum

- Ana repo: `https://github.com/maillab/cloud-mail`
- Bizim fork: `https://github.com/mkollayan/cloud-mail`
- Canlı deploy branch'i: `main`
- Yerel çalışma branch'i: `upgrade-v3`
- v3 geçiş commit'i: `31edfeb chore: migrate to cloud-mail v3.0.0`
- Son Türkçeleştirme düzeltme commit'i: `2a1140e fix: polish Turkish localization`
- Eski canlı hal için yedek branch: `backup-before-v3`

Ana repo geçmişini değiştirdiği için v3 geçişinde klasik merge yapılmadı. Temiz `upstream/main` tabanı alındı, sonra bizim özel değişiklikler tekrar uygulandı.

## Yaptığımız Özel Değişiklikler

### Türkçe Dil Desteği

- Frontend için `mail-vue/src/i18n/tr.js` eklendi.
- Backend için `mail-worker/src/i18n/tr.js` eklendi.
- `mail-vue/src/i18n/index.js` içine `tr` locale kaydedildi.
- `mail-worker/src/i18n/i18n.js` içine `tr` locale kaydedildi.
- Backend fallback dili `tr` yapıldı.
- Tarayıcı dili `tr` ise Türkçe açılıyor; bilinmeyen dillerde varsayılan Türkçe.
- `dayjs` Türkçe tarih/saat formatı eklendi.

### Hardcoded Çince / İngilizce Düzeltmeleri

- Login ekranındaki Çince metinler i18n'e taşındı.
- Kullanıcı detayındaki `用户名 / 等级` metinleri Türkçeleştirildi.
- Kayıt kodu ekranındaki Türkçe tarih formatı düzeltildi.
- Kopyalama hata mesajı Türkçe i18n kullanıyor.
- KV/D1/OAuth/Resend kaynaklı bazı hata mesajları Türkçeye çekildi.

### Global E-posta İmzası

- Sistem Ayarları > E-posta Ayarları içine global e-posta imzası alanı eklendi.
- Backend gönderim sırasında imzayı tüm giden e-postaların altına ekliyor.
- İmza düz metin olarak saklanıyor; HTML escape yapılıyor ve satır sonları `<br>` olarak korunuyor.
- DB alanı: `setting.email_signature`
- Migration: `v3_2DB`

### Varsayılan DB İçeriği Türkçeleştirme

- Yeni kurulumlarda varsayılan duyuru Türkçe olacak.
- Yeni kurulumlarda varsayılan rol adı `Normal Kullanıcı` olacak.
- Eski DB'de hâlâ varsayılan Çince duyuru/rol varsa `v3_3DB` migration exact eski değerleri Türkçeye çevirir.

### v3.0.0 Özellikleri

Ana repo v3 tarafındaki özellikler bizde de var:

- Workers AI ile doğrulama kodu tanıma
- Cloudflare Email Sending desteği
- Blocklist / kara liste
- Login arka plan karartma ayarı
- Telegram bot token maskeleme
- Analiz cache ayarı

Workers AI özelliği kodda mevcut. Admin panelde Sistem Ayarları > Workers AI kısmından açılabilir. Varsayılan olarak kapalı gelir.

## Deploy Yapısı

Cloudflare dashboard tarafındaki otomatik Git deploy kapatıldı. Deploy artık GitHub Actions üzerinden yapılır.

Kullanılan dosyalar:

- `.github/workflows/deploy-cloudflare.yml`
- `mail-worker/wrangler-action.toml`

Cloudflare dashboard CI tekrar bağlanmamalı. Bağlanırsa `wrangler.toml` içindeki yorumlu binding'ler yüzünden KV/D1 binding sorunu tekrar çıkabilir.

## GitHub Secrets

GitHub repo > Settings > Secrets and variables > Actions altında gereken temel secret'lar:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `JWT_SECRET`
- `DOMAIN`
- `ADMIN`
- `KV_NAMESPACE_ID`
- `D1_DATABASE_ID`

Opsiyonel:

- `CUSTOM_DOMAIN`
- `R2_BUCKET_NAME`
- `PROJECT_LINK`
- `LINUXDO_CLIENT_ID`
- `LINUXDO_CLIENT_SECRET`
- `LINUXDO_CALLBACK_URL`
- `LINUXDO_SWITCH`
- `AI_MODEL`
- `ANALYSIS_CACHE`
- `CF_EMAIL`

Not: `D1_DATABASE_ID` ve `KV_NAMESPACE_ID` secret olarak tutuluyor, koda gömülmüyor.

## Migration Sonrası

Deploydan sonra DB migration çalıştırmak için:

```text
https://[worker-url]/api/init/[JWT_SECRET]
```

Yeni DB alanı veya varsayılan içerik migration'ı eklediğimizde deploy sonrası bu URL tekrar açılmalı.

## Upstream Güncellemesi Gelirse

Önce kontrol:

```bash
git fetch upstream --tags
git log --oneline origin/main..upstream/main
git diff --stat origin/main..upstream/main
```

Dikkat edilecek dosyalar:

- `mail-vue/src/i18n/en.js`
- `mail-vue/src/i18n/zh.js`
- `mail-vue/src/i18n/tr.js`
- `mail-vue/src/views/sys-setting/index.vue`
- `mail-vue/src/views/login/index.vue`
- `mail-vue/src/utils/day.js`
- `mail-worker/src/entity/setting.js`
- `mail-worker/src/init/init.js`
- `mail-worker/src/service/email-service.js`
- `mail-worker/src/i18n/i18n.js`
- `mail-worker/src/i18n/tr.js`

Ana repo tekrar history rewrite yaparsa klasik merge yerine temiz upstream tabanı üzerine özel değişiklikleri tekrar uygulamak daha güvenli.

## Kontrol Komutları

Frontend ve Worker çeviri anahtar kontrolü:

```bash
grep -oE "^[[:space:]]+[a-zA-Z0-9_]+:" mail-vue/src/i18n/en.js | tr -d ' \t:' | sort > /tmp/en_keys
grep -oE "^[[:space:]]+[a-zA-Z0-9_]+:" mail-vue/src/i18n/tr.js | tr -d ' \t:' | sort > /tmp/tr_keys
comm -23 /tmp/en_keys /tmp/tr_keys

grep -oE "^[[:space:]]+[a-zA-Z0-9_]+:" mail-worker/src/i18n/en.js | tr -d ' \t:' | sort > /tmp/wen_keys
grep -oE "^[[:space:]]+[a-zA-Z0-9_]+:" mail-worker/src/i18n/tr.js | tr -d ' \t:' | sort > /tmp/wtr_keys
comm -23 /tmp/wen_keys /tmp/wtr_keys
```

Build ve dry-run:

```bash
cd mail-worker
npx pnpm@9 exec wrangler deploy --dry-run
```

Bu komut canlıya deploy etmez, sadece build ve Worker bundle kontrolü yapar.

## Yapılabilecek Sonraki İşler

- Birkaç gün stabil kaldıktan sonra `backup-before-v3` branch'i silinebilir.
- SPF/DKIM/DMARC kayıtları gözden geçirilebilir.
- Workers AI doğrulama kodu tanıma özelliği istenirse admin panelden açılabilir.
- Cloudflare Email Sending istenirse ayrıca yapılandırılabilir.
- Varsayılan DB permission isimleri hâlâ DB'de Çince saklanıyor; UI tarafında backend i18n ile Türkçeye çevrildiği için normal kullanımda sorun yok.
