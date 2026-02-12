(async () => {
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    // Force click using PointerEvents to bypass Radix UI / Shadow DOM restrictions
    const forcePointerClick = (el) => {
        const options = { bubbles: true, cancelable: true, composed: true, pointerType: 'mouse' };
        el.dispatchEvent(new PointerEvent('pointerdown', options));
        el.dispatchEvent(new PointerEvent('pointerup', options));
        el.click(); // Standard click fallback
    };

    // Helper to find elements with a retry mechanism
    const findWithRetry = async (selectorFn, name, retries = 3) => {
        for (let i = 1; i <= retries; i++) {
            const el = selectorFn();
            if (el) return el;
            await sleep(100); 
        }
        return null;
    };

    console.log("🚀 Starting Turbo Mass Deletion Mode for Grok Imagine...");

    while (true) {
        // --- STEP 1: Open the List Item (The Image/Card Container) ---
        const firstCard = document.querySelector('div[role="listitem"] .cursor-pointer');
        
        if (firstCard) {
            console.log("📂 Opening List Item...");
            forcePointerClick(firstCard);
            await sleep(400); // Slight delay to allow the modal/options to render
        } else {
            // Exit if no list items and no action buttons are visible
            if (!document.querySelector('button[aria-label="More options"]')) {
                console.log("✅ All items and videos have been cleared!");
                break;
            }
        }

        // --- SUB-LOOP: Delete all items inside the currently active container ---
        let deleteFoundInLoop = true;
        while (deleteFoundInLoop) {
            // 1. Find the "More options" (Ellipsis) button
            const btnMore = await findWithRetry(
                () => document.querySelector('button[aria-label="More options"]'),
                "More Options"
            );

            if (!btnMore) {
                console.log("⏭️ Current list cleared, searching for next list item...");
                deleteFoundInLoop = false;
                break; 
            }

            forcePointerClick(btnMore);
            await sleep(150);

            // 2. Click the "Delete" menu item
            const menuDelete = await findWithRetry(
                () => Array.from(document.querySelectorAll('div[role="menuitem"], .relative'))
                           .find(el => el.textContent.toLowerCase().includes('delete')),
                "Delete Menu"
            );

            if (menuDelete) {
                forcePointerClick(menuDelete);
                await sleep(150);
            } else {
                // Close the menu and retry if the delete option didn't appear
                document.body.click(); 
                await sleep(150);
                continue;
            }

            // 3. Confirm the Deletion (Red Button)
            const btnConfirm = await findWithRetry(
                () => Array.from(document.querySelectorAll('button'))
                           .find(el => el.textContent.trim() === 'Delete video' || el.classList.contains('text-red-400')),
                "Confirm Button"
            );

            if (btnConfirm) {
                forcePointerClick(btnConfirm);
                console.log("🗑️ Item Deleted!");
                await sleep(250); // Database sync delay
            } else {
                // If confirm button is missing, click away to reset
                document.body.click();
                await sleep(150);
            }
        }
        
        // Short pause before opening the next list item
        await sleep(200);
    }
})();
