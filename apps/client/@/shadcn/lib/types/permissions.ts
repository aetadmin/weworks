export type TaskPermission =
  | "task::create"
  | "task::read"
  | "task::write"
  | "task::update"
  | "task::delete"
  | "task::assign"
  | "task::transfer"
  | "task::comment";

export type UserPermission =
  | "user::create"
  | "user::read"
  | "user::update"
  | "user::delete"
  | "user::manage";

export type RolePermission =
  | "role::create"
  | "role::read"
  | "role::update"
  | "role::delete"
  | "role::manage";

export type TeamPermission =
  | "team::create"
  | "team::read"
  | "team::update"
  | "team::delete"
  | "team::manage";

export type ClientPermission =
  | "client::create"
  | "client::read"
  | "client::update"
  | "client::delete"
  | "client::manage";

export type KnowledgeBasePermission =
  | "kb::create"
  | "kb::read"
  | "kb::update"
  | "kb::delete"
  | "kb::manage";

export type SystemPermission =
  | "settings::view"
  | "settings::manage"
  | "webhook::manage"
  | "integration::manage"
  | "email_template::manage";

export type TimeTrackingPermission =
  | "time_entry::create"
  | "time_entry::read"
  | "time_entry::update"
  | "time_entry::delete";

export type DocumentPermission =
  | "document::create"
  | "document::read"
  | "document::update"
  | "document::delete"
  | "document::manage";

export type WebhookPermission =
  | "webhook::create"
  | "webhook::read"
  | "webhook::update"
  | "webhook::delete";

export type Permission =
  | TaskPermission
  | UserPermission
  | RolePermission
  | TeamPermission
  | ClientPermission
  | KnowledgeBasePermission
  | SystemPermission
  | TimeTrackingPermission
  | WebhookPermission
  | DocumentPermission;

// Useful type for grouping permissions by category
export const PermissionCategories = {
  TASK: "Task Management",
  USER: "User Management",
  ROLE: "Role Management",
  TEAM: "Team Management",
  CLIENT: "Client Management",
  KNOWLEDGE_BASE: "Knowledge Base",
  SYSTEM: "System Settings",
  TIME_TRACKING: "Time Tracking",
  WEBHOOK: "Webhook Management",
  DOCUMENTATION: "Documentation",
} as const;

export type PermissionCategory =
  (typeof PermissionCategories)[keyof typeof PermissionCategories];

// Helper type for permission groups
export interface PermissionGroup {
  category: PermissionCategory;
  permissions: Permission[];
}

export const PERMISSIONS_CONFIG = [
  {
    category: "Task Management",
    permissions: [
      "task::create",
      "task::read",
      "task::write",
      "task::update",
      "task::delete",
      "task::assign",
      "task::transfer",
      "task::comment",
    ],
  },
  // {
  //   category: "User Management",
  //   permissions: [
  //     "user::create",
  //     "user::read",
  //     "user::update",
  //     "user::delete",
  //     "user::manage",
  //   ],
  // },
  {
    category: "Role Management",
    permissions: [
      "role::create",
      "role::read",
      "role::update",
      "role::delete",
      "role::manage",
    ],
  },
  // {
  //   category: "Team Management",
  //   permissions: [
  //     "team::create",
  //     "team::read",
  //     "team::update",
  //     "team::delete",
  //     "team::manage"
  //   ]
  // },
  // {
  //   category: "Client Management",
  //   permissions: [
  //     "client::create",
  //     "client::read",
  //     "client::update",
  //     "client::delete",
  //     "client::manage",
  //   ],
  // },
  // {
  //   category: "Knowledge Base",
  //   permissions: [
  //     "kb::create",
  //     "kb::read",
  //     "kb::update",
  //     "kb::delete",
  //     "kb::manage"
  //   ]
  // },
  // {
  //   category: "System Settings",
  //   permissions: [
  //     "settings::view",
  //     "settings::manage",
  //     "webhook::manage",
  //     "integration::manage",
  //     "email_template::manage",
  //   ],
  // },
  // {
  //   category: "Time Tracking",
  //   permissions: [
  //     "time_entry::create",
  //     "time_entry::read",
  //     "time_entry::update",
  //     "time_entry::delete"
  //   ]
  // },
  {
    category: "Document Management",
    permissions: [
      "document::create",
      "document::read",
      "document::update",
      "document::delete",
      "document::manage",
    ],
  },
  {
    category: "Webhook Management",
    permissions: [
      "webhook::create",
      "webhook::read",
      "webhook::update",
      "webhook::delete",
    ],
  },
] as const;
