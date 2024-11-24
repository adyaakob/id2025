const fs = require('fs').promises;
const path = require('path');

async function removeDir(dir) {
    try {
        await fs.rm(dir, { recursive: true, force: true, maxRetries: 3 });
        console.log(`Successfully removed ${dir}`);
    } catch (err) {
        if (err.code === 'EPERM' || err.code === 'EBUSY') {
            console.log(`Warning: Could not remove ${dir} due to permissions. Continuing anyway.`);
        } else {
            throw err;
        }
    }
}

async function cleanup() {
    const dirs = ['.next', 'out'];
    for (const dir of dirs) {
        const fullPath = path.join(process.cwd(), dir);
        await removeDir(fullPath);
    }
}

cleanup().catch(console.error);
