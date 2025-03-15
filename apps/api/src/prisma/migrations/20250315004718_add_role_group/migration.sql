-- CreateEnum
CREATE TYPE "RoleGroup" AS ENUM ('owner', 'tasker', 'coordinator');

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "group" "RoleGroup" DEFAULT 'tasker';
