(async () => {

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));



    const forcePointerClick = (el) => {

        const options = { bubbles: true, cancelable: true, composed: true, pointerType: 'mouse' };

        el.dispatchEvent(new PointerEvent('pointerdown', options));

        el.dispatchEvent(new PointerEvent('pointerup', options));

        el.click();

    };



    const findWithRetry = async (selectorFn, name, retries = 3) => {

        for (let i = 1; i <= retries; i++) {

            const el = selectorFn();

            if (el) return el;

            await sleep(100); 

        }

        return null;

    };



    console.log("🚀 Memulai Mode Turbo Pembersihan Massal...");



    while (true) {

        // --- LANGKAH AWAL: Klik List Item (Buka Folder/Kontainer) ---

        const firstCard = document.querySelector('div[role="listitem"] .cursor-pointer');

        

        if (firstCard) {

            console.log("📂 Membuka List Item...");

            forcePointerClick(firstCard);

            await sleep(300); // Jeda sedikit lebih lama agar konten di dalamnya render

        } else {

            // Jika tidak ada listitem dan tidak ada tombol More Options, berarti benar-benar habis

            if (!document.querySelector('button[aria-label="More options"]')) {

                console.log("✅ Semua List Item dan Video sudah habis!");

                break;

            }

        }



        // --- SUB-LOOP: Hapus semua video di dalam listitem yang aktif ---

        let deleteFoundInLoop = true;

        while (deleteFoundInLoop) {

            // 1. Cari tombol More Options

            const btnMore = await findWithRetry(

                () => document.querySelector('button[aria-label="More options"]'),

                "More Options"

            );



            if (!btnMore) {

                console.log("⏭️ Habis di list ini, mencari list item berikutnya...");

                deleteFoundInLoop = false;

                break; 

            }



            forcePointerClick(btnMore);

            await sleep(100);



            // 2. Klik Menu Delete

            const menuDelete = await findWithRetry(

                () => Array.from(document.querySelectorAll('div[role="menuitem"], .relative'))

                           .find(el => el.textContent.toLowerCase().includes('delete')),

                "Menu Delete"

            );



            if (menuDelete) {

                forcePointerClick(menuDelete);

                await sleep(100);

            } else {

                // Jika menu tidak muncul, mungkin butuh klik ulang More Options

                document.body.click(); 

                await sleep(100);

                continue;

            }



            // 3. Konfirmasi Delete

            const btnConfirm = await findWithRetry(

                () => Array.from(document.querySelectorAll('button'))

                           .find(el => el.textContent.trim() === 'Delete video' || el.classList.contains('text-red-400')),

                "Konfirmasi"

            );



            if (btnConfirm) {

                forcePointerClick(btnConfirm);

                console.log("🗑️ Video Terhapus!");

                await sleep(200); // Sinkronisasi database cepat

            } else {

                document.body.click();

                await sleep(100);

            }

        }

        

        // Jeda sangat singkat sebelum mencari listitem berikutnya

        await sleep(100);

    }

})();
