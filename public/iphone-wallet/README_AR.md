# محفظتي المالية – نسخة iPhone PWA

## ما الذي تم عمله
- تحويل التطبيق إلى PWA يمكن إضافته إلى شاشة iPhone الرئيسية.
- الإبقاء على التخزين المحلي LocalStorage.
- الإبقاء على مزامنة Google Drive داخل appDataFolder.
- إضافة شاشة إعداد Google OAuth Client ID من داخل التطبيق.
- عدم تخزين Client Secret داخل التطبيق.

## الإعداد المطلوب مرة واحدة في Google Cloud
1. أنشئ Project في Google Cloud Console.
2. فعّل Google Drive API.
3. أنشئ OAuth 2.0 Client ID من نوع Web application.
4. أضف رابط HTTPS الذي ستستضيف عليه التطبيق ضمن Authorized JavaScript origins.
5. افتح التطبيق > الإعدادات (⚙) > أدخل Client ID.
6. اضغط ربط الحساب ووافق على صلاحية Google Drive الخاصة بالتطبيق.

## التثبيت على iPhone
1. ارفع هذه الملفات على استضافة HTTPS مثل GitHub Pages / Netlify / Cloudflare Pages.
2. افتح الرابط في Safari.
3. Share > Add to Home Screen.
4. اختر Open as Web App إن ظهر الخيار.

## ملاحظة مهمة
فتح ملف index.html مباشرة من Files على iPhone لا يكفي لتسجيل Google OAuth أو Service Worker؛ يلزم رابط HTTPS ثابت.
