import { Permission, PERMISSIONS_CONFIG } from "@/shadcn/lib/types/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/shadcn/ui/card";
import { Input } from "@/shadcn/ui/input";
import { getCookie } from "cookies-next";
import { Search } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Roles() {
  const [step, setStep] = useState(1);
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(
    []
  );
  const [roleName, setRoleName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<Array<{ id: string; email: string }>>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [roleGroup, setRoleGroup] = useState<string>("tasker");
  const router = useRouter();

  const handleAddRole = async () => {
    if (!roleName) return;

    await fetch("/api/v1/role/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getCookie("session")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: roleName,
        permissions: selectedPermissions,
        users: selectedUsers,
        group: roleGroup,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          router.push("/admin/roles");
        }
      });
  };

  const handleSelectCategory = (category: string, isSelected: boolean) => {
    const categoryPermissions =
      PERMISSIONS_CONFIG.find((group) => group.category === category)
        ?.permissions || [];

    if (isSelected) {
      const newPermissions = [
        ...selectedPermissions,
        ...categoryPermissions.filter(
          (p: Permission) => !selectedPermissions.includes(p)
        ),
      ];
      setSelectedPermissions(newPermissions);
    } else {
      setSelectedPermissions(
        selectedPermissions.filter(
          // @ts-ignore
          (p: Permission) => !categoryPermissions.includes(p)
        )
      );
    }
  };

  const isCategoryFullySelected = (category: string) => {
    const categoryPermissions =
      PERMISSIONS_CONFIG.find((group) => group.category === category)
        ?.permissions || [];
    return categoryPermissions.every((p) => selectedPermissions.includes(p));
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/users/all", {
        headers: {
          Authorization: `Bearer ${getCookie("session")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (step === 2) {
      fetchUsers();
    }
  }, [step]);

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New Role</h1>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {step === 1 && (
          <Card>
            <CardHeader>
              <div className="flex flex-row justify-between items-center">
                <CardTitle>Role Details</CardTitle>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={() => setStep(2)}
                    disabled={!roleName}
                  >
                    Next: Select Users
                  </button>
                  <button
                    className="px-4 py-2 bg-green-500 text-white rounded"
                    onClick={handleAddRole}
                    disabled={!roleName}
                  >
                    Save Role
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="roleName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Role Name
                  </label>
                  <Input
                    id="roleName"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="mt-1"
                    placeholder="Enter role name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="roleGroup"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Role Group
                  </label>
                  <select
                    id="roleGroup"
                    value={roleGroup}
                    onChange={(e) => setRoleGroup(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="owner">Owner</option>
                    <option value="tasker">Tasker (Engineer)</option>
                    <option value="coordinator">Coordinator</option>
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    Owner: Can only see issues created by themselves<br />
                    Tasker: Can see issues assigned to them or created by them<br />
                    Coordinator: Can see all issues
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Select Permissions</h3>
                  {PERMISSIONS_CONFIG.map((group) => (
                    <div key={group.category} className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{group.category}</h4>
                        <label className="flex items-center space-x-2 text-sm text-gray-600">
                          <input
                            type="checkbox"
                            checked={isCategoryFullySelected(group.category)}
                            onChange={(e) =>
                              handleSelectCategory(group.category, e.target.checked)
                            }
                            className="rounded"
                          />
                          <span>Select All</span>
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {group.permissions.map((permission) => (
                          <label
                            key={permission}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              checked={selectedPermissions.includes(permission)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPermissions([
                                    ...selectedPermissions,
                                    permission,
                                  ]);
                                } else {
                                  setSelectedPermissions(
                                    selectedPermissions.filter(
                                      (p) => p !== permission
                                    )
                                  );
                                }
                              }}
                            />
                            <span>{permission}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <div className="flex flex-row justify-between items-center">
                <CardTitle>Select Users</CardTitle>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 bg-gray-500 text-white rounded"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </button>
                  <button
                    className="px-4 py-2 bg-green-500 text-white rounded"
                    onClick={handleAddRole}
                    disabled={isLoading}
                  >
                    Create Role
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative mb-4">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search users..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {isLoading ? (
                  <div className="text-center py-4">Loading users...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {filteredUsers.map((user) => (
                      <label
                        key={user.id}
                        className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(
                                selectedUsers.filter((id) => id !== user.id)
                              );
                            }
                          }}
                          className="rounded"
                        />
                        <span className="flex-1">{user.email}</span>
                      </label>
                    ))}
                  </div>
                )}

                {!isLoading && filteredUsers.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    {searchTerm ? "No users found" : "No users available"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
