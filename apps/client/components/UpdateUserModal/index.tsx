import { toast } from "@/shadcn/hooks/use-toast";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { getCookie } from "cookies-next";
import { useRouter } from "next/router";
import { Fragment, useState, useEffect } from "react";

export default function UpdateUserModal({ user }) {
  const [open, setOpen] = useState(false);
  const [admin, setAdmin] = useState(user.isAdmin);
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Fetch all available roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch("/api/v1/roles/all", {
          headers: {
            Authorization: `Bearer ${getCookie("session")}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setRoles(data.roles);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    if (open) {
      fetchRoles();
      fetchUserRoles();
    }
  }, [open, user.id]);

  // Fetch user's current roles
  const fetchUserRoles = async () => {
    try {
      const response = await fetch(`/api/v1/user/${user.id}/roles`, {
        headers: {
          Authorization: `Bearer ${getCookie("session")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setUserRoles(data.roles || []);
      }
    } catch (error) {
      console.error("Error fetching user roles:", error);
    }
  };

  // Update user's admin status
  async function updateUserAdmin() {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/auth/user/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("session")}`,
        },
        body: JSON.stringify({
          role: admin,
          id: user.id,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        toast({
          variant: "default",
          title: "Success",
          description: "Admin status updated successfully",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update admin status",
      });
    } finally {
      setLoading(false);
    }
  }

  // Assign a role to the user
  async function assignRole() {
    if (!selectedRoleId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/role/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("session")}`,
        },
        body: JSON.stringify({
          userId: user.id,
          roleId: selectedRoleId,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        toast({
          variant: "default",
          title: "Success",
          description: "Role assigned successfully",
        });
        fetchUserRoles();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to assign role",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to assign role",
      });
    } finally {
      setLoading(false);
    }
  }

  // Remove a role from the user
  async function removeRole(roleId) {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/role/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("session")}`,
        },
        body: JSON.stringify({
          userId: user.id,
          roleId: roleId,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        toast({
          variant: "default",
          title: "Success",
          description: "Role removed successfully",
        });
        fetchUserRoles();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to remove role",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove role",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        type="button"
        className="inline-flex items-center px-4 py-1.5 border font-semibold border-gray-300 shadow-sm text-xs rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Role
      </button>

      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="fixed z-10 inset-0 overflow-y-auto"
          onClose={setOpen}
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
                  <button
                    type="button"
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <Dialog.Title
                      as="h3"
                      className="text-lg leading-6 font-medium text-gray-900"
                    >
                      Edit User Role
                    </Dialog.Title>
                    
                    {/* Admin Toggle Section */}
                    <div className="mt-4">
                      <h4 className="text-md font-medium text-gray-700">Admin Status</h4>
                      <div className="mt-2 space-y-4">
                        <div className="">
                          <div className="space-y-2 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                            <span className="relative z-0 inline-flex shadow-sm rounded-md space-x-4">
                              <button
                                onClick={() => setAdmin(false)}
                                type="button"
                                className={
                                  admin === false
                                    ? "relative inline-flex items-center px-4 py-2 border border-gray-300 bg-green-500 text-sm font-medium text-white hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1"
                                    : "relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1"
                                }
                              >
                                User
                              </button>
                              <button
                                onClick={() => setAdmin(true)}
                                type="button"
                                className={
                                  admin === true
                                    ? "relative inline-flex items-center px-4 py-2 border border-gray-300 bg-green-500 text-sm font-medium text-white hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1"
                                    : "relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1"
                                }
                              >
                                Admin
                              </button>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <button
                          type="button"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
                          onClick={updateUserAdmin}
                          disabled={loading}
                        >
                          Update Admin Status
                        </button>
                      </div>
                    </div>
                    
                    {/* Role Assignment Section */}
                    <div className="mt-6 border-t border-gray-200 pt-4">
                      <h4 className="text-md font-medium text-gray-700">Role Assignment</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Roles determine what permissions a user has and which tickets they can see.
                      </p>
                      
                      {/* Current Roles */}
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-gray-600">Current Roles:</h5>
                        {userRoles.length === 0 ? (
                          <p className="text-sm text-gray-500 mt-1">No roles assigned</p>
                        ) : (
                          <ul className="mt-2 space-y-2">
                            {userRoles.map(role => (
                              <li key={role.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                                <div>
                                  <span className="font-medium">{role.name}</span>
                                  {role.group && (
                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {role.group}
                                    </span>
                                  )}
                                  {role.description && (
                                    <p className="text-xs text-gray-500 mt-0.5">{role.description}</p>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  className="text-red-600 hover:text-red-800 text-xs"
                                  onClick={() => removeRole(role.id)}
                                  disabled={loading}
                                >
                                  Remove
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      
                      {/* Assign New Role */}
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-600">Assign New Role:</h5>
                        <div className="mt-2 flex space-x-2">
                          <select
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            value={selectedRoleId}
                            onChange={(e) => setSelectedRoleId(e.target.value)}
                          >
                            <option value="">Select a role</option>
                            {roles.map(role => (
                              <option key={role.id} value={role.id}>
                                {role.name} {role.group ? `(${role.group})` : ''}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                            onClick={assignRole}
                            disabled={!selectedRoleId || loading}
                          >
                            Assign
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setOpen(false)}
                  >
                    Done
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}
