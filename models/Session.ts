// Session model (Week 10): the rows of the "sessions" table (ddd.md, Login and sessions).
// Only the SHA-256 hash of a session token is stored and looked up, never the token.
// The cookie and the token itself are handled by lib/session.ts. No HTTP or Next.js code.
import { prisma } from "@/lib/prisma";

export type SessionRow = { id: number; userId: number; expiresAt: Date };

export const SessionModel = {
  async create(data: { tokenHash: string; userId: number; expiresAt: Date }): Promise<void> {
    await prisma.session.create({ data, select: { id: true } });
  },

  // The session with this token hash, or null. Whether it has expired is up to the caller.
  async findByTokenHash(tokenHash: string): Promise<SessionRow | null> {
    return prisma.session.findUnique({ where: { tokenHash }, select: { id: true, userId: true, expiresAt: true } });
  },

  // Deletes the session with this token hash, if there is one.
  async removeByTokenHash(tokenHash: string): Promise<void> {
    await prisma.session.deleteMany({ where: { tokenHash } });
  },

  async removeById(id: number): Promise<void> {
    await prisma.session.deleteMany({ where: { id } });
  },
};
