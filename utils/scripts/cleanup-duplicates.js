const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupDuplicateRoles() {
    try {
        console.log('Starting duplicate role cleanup...');

        // Get all roles
        const allRoles = await prisma.role.findMany({
            orderBy: { id: 'asc' }
        });

        console.log(`Found ${allRoles.length} total roles`);

        // Group by normalized name (case-insensitive)
        const roleGroups = {};
        const duplicates = [];

        allRoles.forEach(role => {
            const normalized = role.name.toLowerCase().trim();
            if (!roleGroups[normalized]) {
                roleGroups[normalized] = [];
            }
            roleGroups[normalized].push(role);
        });

        // Find duplicates
        Object.keys(roleGroups).forEach(normalizedName => {
            if (roleGroups[normalizedName].length > 1) {
                // Keep the first one (oldest), mark others as duplicates
                const [keep, ...remove] = roleGroups[normalizedName];
                duplicates.push(...remove);
                console.log(`Found duplicates for "${normalizedName}": keeping "${keep.name}" (ID: ${keep.id}), removing:`, remove.map(r => `${r.name} (ID: ${r.id})`));
            }
        });

        if (duplicates.length === 0) {
            console.log('No duplicate roles found.');
            return;
        }

        console.log(`Found ${duplicates.length} duplicate roles to remove`);

        // For each duplicate role, we need to:
        // 1. Move users to the kept role
        // 2. Delete the duplicate role

        for (const duplicateRole of duplicates) {
            const normalizedName = duplicateRole.name.toLowerCase().trim();

            // Find the role to keep (the first one in the group)
            const rolesWithSameName = roleGroups[normalizedName];
            const roleToKeep = rolesWithSameName[0];

            if (duplicateRole.id === roleToKeep.id) {
                continue; // Skip if this is the one we're keeping
            }

            console.log(`Processing duplicate role "${duplicateRole.name}" (ID: ${duplicateRole.id})`);

            // Move users from duplicate role to the kept role
            const usersToMove = await prisma.user.findMany({
                where: { roleId: duplicateRole.id }
            });

            if (usersToMove.length > 0) {
                console.log(`Moving ${usersToMove.length} users from role ${duplicateRole.id} to role ${roleToKeep.id}`);

                await prisma.user.updateMany({
                    where: { roleId: duplicateRole.id },
                    data: { roleId: roleToKeep.id }
                });
            }

            // Delete the duplicate role
            await prisma.role.delete({
                where: { id: duplicateRole.id }
            });

            console.log(`Deleted duplicate role "${duplicateRole.name}" (ID: ${duplicateRole.id})`);
        }

        // Now normalize all remaining role names
        console.log('Normalizing remaining role names...');

        const remainingRoles = await prisma.role.findMany();

        for (const role of remainingRoles) {
            const normalizedName = role.name.trim().charAt(0).toUpperCase() + role.name.trim().slice(1).toLowerCase();

            if (normalizedName !== role.name) {
                console.log(`Normalizing role name: "${role.name}" -> "${normalizedName}"`);
                await prisma.role.update({
                    where: { id: role.id },
                    data: { name: normalizedName }
                });
            }
        }

        console.log('Cleanup completed successfully!');

        // Show final results
        const finalRoles = await prisma.role.findMany({
            include: {
                _count: {
                    select: { users: true }
                }
            }
        });

        console.log('\nFinal roles:');
        finalRoles.forEach(role => {
            console.log(`- ${role.name} (ID: ${role.id}, Users: ${role._count.users})`);
        });

    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanupDuplicateRoles();