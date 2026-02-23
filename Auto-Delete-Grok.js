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

    console.log("🚀 Starting Universal Turbo Deletion Mode (EN/ID)...");

    while (true) {
        const firstCard = document.querySelector('div[role="listitem"] .cursor-pointer');
        
        if (firstCard) {
            console.log("📂 Opening Item...");
            forcePointerClick(firstCard);
            await sleep(500);
        } else {
            // Cek tombol opsi dengan dua bahasa
            const checkExist = document.querySelector('button[aria-label="More options"], button[aria-label="Opsi lainnya"]');
            if (!checkExist) {
                console.log("✅ Semua item telah dibersihkan!");
                break;
            }
        }

        let deleteFoundInLoop = true;
        while (deleteFoundInLoop) {
            // 1. Cari tombol "More options" atau "Opsi lainnya"
            const btnMore = await findWithRetry(
                () => document.querySelector('button[aria-label="More options"], button[aria-label="Opsi lainnya"]'),
                "Menu Opsi"
            );

            if (!btnMore) {
                console.log("⏭️ List ini selesai, mencari item berikutnya...");
                deleteFoundInLoop = false;
                break; 
            }

            forcePointerClick(btnMore);
            await sleep(200);

            // 2. Klik menu "Delete" atau "Hapus"
            const menuDelete = await findWithRetry(
                () => Array.from(document.querySelectorAll('div[role="menuitem"], .relative'))
                           .find(el => {
                               const txt = el.textContent.toLowerCase();
                               return txt.includes('delete') || txt.includes('hapus');
                           }),
                "Tombol Hapus"
            );

            if (menuDelete) {
                forcePointerClick(menuDelete);
                await sleep(200);
            } else {
                document.body.click(); 
                await sleep(200);
                continue;
            }

            // 3. Konfirmasi (Cari teks 'Delete video', 'Hapus video', atau tombol merah)
            const btnConfirm = await findWithRetry(
                () => Array.from(document.querySelectorAll('button'))
                           .find(el => {
                               const txt = el.textContent.trim();
                               return txt === 'Delete video' || 
                                      txt === 'Hapus video' || 
                                      txt === 'Hapus' ||
                                      el.classList.contains('text-red-400');
                           }),
                "Konfirmasi Hapus"
            );

            if (btnConfirm) {
                forcePointerClick(btnConfirm);
                console.log("🗑️ Item Berhasil Dihapus!");
                await sleep(350); // Jeda sedikit lebih lama untuk sync database
            } else {
                document.body.click();
                await sleep(200);
            }
        }
        await sleep(300);
    }
})();
