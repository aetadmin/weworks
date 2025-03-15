import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { checkToken } from "../lib/jwt";
import { requirePermission } from "../lib/roles";
import { checkSession } from "../lib/session";
import { prisma } from "../prisma";

/**
 * Get the role group for a user
 * @param userId The user ID to check
 * @returns The role group (owner, tasker, coordinator) or null
 */
export async function getUserRoleGroup(userId: string): Promise<string | null> {
  try {
    const userWithRoles = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: true,
      },
    });

    if (!userWithRoles || userWithRoles.isAdmin) {
      return null; // Admins see everything
    }

    if (userWithRoles.roles.length === 0) {
      return null; // No roles, default behavior
    }

    // Find a role with a group
    for (const role of userWithRoles.roles) {
      // Need to use type assertion since the Prisma client doesn't know about our new field yet
      const group = (role as any).group;
      if (group) {
        return group;
      }
    }

    return null;
  } catch (error) {
    console.error("Error getting user role group:", error);
    return null;
  }
}

/**
 * Apply role group filtering to a where clause
 * @param whereClause The existing where clause
 * @param roleGroup The role group
 * @param userId The user ID
 * @returns The updated where clause
 */
export function applyRoleGroupFiltering(
  whereClause: any,
  roleGroup: string | null,
  userId: string
): any {
  if (!roleGroup) {
    return whereClause; // No role group, return original where clause
  }

  if (roleGroup === "owner") {
    // Owner: only tickets created by themselves
    return {
      ...whereClause,
      OR: [
        {
          createdBy: {
            path: ["id"],
            equals: userId,
          },
        },
        {
          createdBy: {
            path: ["$.id"],
            equals: userId,
          },
        },
      ],
    };
  } else if (roleGroup === "tasker") {
    // Tasker: tickets assigned to them or created by them
    return {
      ...whereClause,
      OR: [
        { userId: userId },
        {
          createdBy: {
            path: ["id"],
            equals: userId,
          },
        },
      ],
    };
  }

  // Coordinator: all tickets (default behavior)
  return whereClause;
}

export function ticketGroupRoutes(fastify: FastifyInstance) {
  // Get all tickets with role group filtering
  fastify.get(
    "/api/v1/tickets/filtered",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = await checkSession(request);

        if (!user) {
          return reply.status(401).send({
            message: "Unauthorized",
            success: false,
          });
        }

        // Get the user's role group
        const roleGroup = await getUserRoleGroup(user.id);

        try {
          // Build the where clause based on the user's role group
          let whereClause: any = { hidden: false };
          
          if (roleGroup === "owner") {
            // Owner: only tickets created by themselves
            whereClause = {
              ...whereClause,
              OR: [
                {
                  createdBy: {
                    path: ["id"],
                    equals: user.id,
                  },
                },
                {
                  createdBy: {
                    path: ["$.id"],
                    equals: user.id,
                  },
                },
              ],
            };
          } else if (roleGroup === "tasker") {
            // Tasker: tickets assigned to them or created by them
            whereClause = {
              ...whereClause,
              OR: [
                { userId: user.id },
                {
                  createdBy: {
                    path: ["id"],
                    equals: user.id,
                  },
                },
              ],
            };
          }
          // For coordinator or no role group, show all tickets (default behavior)
          
          // Fetch tickets with the role-based filtering applied directly in the query
          const filteredTickets = await prisma.ticket.findMany({
            where: whereClause,
            orderBy: [
              {
                createdAt: "desc",
              },
            ],
            include: {
              client: {
                select: { id: true, name: true, number: true },
              },
              assignedTo: {
                select: { id: true, name: true },
              },
              team: {
                select: { id: true, name: true },
              },
            },
          });

          reply.send({
            tickets: filteredTickets,
            success: true,
          });
        } catch (prismaError: any) {
          console.error("Prisma query error:", prismaError);
          reply.status(500).send({
            message: "Database query error",
            error: prismaError.message,
            success: false,
          });
        }
      } catch (error: any) {
        console.error("Error fetching filtered tickets:", error);
        reply.status(500).send({
          message: "Internal server error",
          error: error.message,
          success: false,
        });
      }
    }
  );
} 