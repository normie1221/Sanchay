import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from './prisma';

/**
 * Get the current user from Clerk and ensure they exist in the database
 */
export async function getCurrentUser() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  // If user doesn't exist in database, create them
  if (!user) {
    const clerkUser = await currentUser();
    if (clerkUser) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
        },
      });
    }
  }

  return user;
}

/**
 * Get or create user in database from Clerk session
 */
export async function getOrCreateUser() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    const clerkUser = await currentUser();
    if (clerkUser) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
        },
      });
    } else {
      throw new Error('User not found');
    }
  }

  return user;
}

/**
 * Verify user owns a resource
 */
export async function verifyUserOwnership(userId: string, resourceUserId: string) {
  if (userId !== resourceUserId) {
    throw new Error('Unauthorized access to resource');
  }
}
