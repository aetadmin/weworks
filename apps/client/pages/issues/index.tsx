import TicketFilters from "@/shadcn/components/tickets/TicketFilters";
import TicketKanban from "@/shadcn/components/tickets/TicketKanban";
import TicketList from "@/shadcn/components/tickets/TicketList";
import ViewSettings from "@/shadcn/components/tickets/ViewSettings";
import { useTicketActions } from "@/shadcn/hooks/useTicketActions";
import { useTicketFilters } from "@/shadcn/hooks/useTicketFilters";
import { useTicketView } from "@/shadcn/hooks/useTicketView";
import { Button } from "@/shadcn/ui/button";
import { getCookie } from "cookies-next";
import { Loader } from "lucide-react";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useUser } from "../../store/session";

async function getUserTickets(token: any) {
  try {
    console.log("Fetching tickets from /api/v1/tickets/filtered");
    const res = await fetch(`/api/v1/tickets/filtered`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!res.ok) {
      console.error(`Error response from server: ${res.status} ${res.statusText}`);
      try {
        const errorData = await res.json();
        console.error("Error details:", errorData);
        return { tickets: [], error: errorData };
      } catch (parseError) {
        console.error("Could not parse error response:", parseError);
        return { tickets: [], error: { message: `Server error: ${res.status} ${res.statusText}` } };
      }
    }
    
    try {
      const data = await res.json();
      console.log("Filtered tickets response:", data);
      
      // Ensure tickets is always an array
      if (!data.tickets) {
        console.warn("Response missing tickets array, defaulting to empty array");
        data.tickets = [];
      }
      
      return data;
    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      return { tickets: [], error: { message: "Could not parse server response" } };
    }
  } catch (error) {
    console.error("Failed to fetch filtered tickets:", error);
    return { tickets: [], error: { message: error.message || "Network error" } };
  }
}

export default function Tickets() {
  const router = useRouter();
  const { t } = useTranslation("peppermint");

  const token = getCookie("session");
  const user = useUser();
  
  // State for error handling
  const [error, setError] = useState<string | null>(null);
  
  // Fetch tickets data
  const { data, status, refetch } = useQuery(
    "allusertickets",
    () => getUserTickets(token),
    {
      refetchInterval: 5000,
      onError: (err: any) => {
        console.error("Query error:", err);
        setError(err.message || "Failed to fetch tickets");
      },
      onSuccess: (data: any) => {
        if (data.error) {
          console.error("Data contains error:", data.error);
          setError(data.error.message || "Error in response data");
        } else {
          setError(null);
        }
      }
    }
  );

  // Custom hooks for managing state
  const {
    selectedPriorities,
    selectedStatuses,
    selectedAssignees,
    handlePriorityToggle,
    handleStatusToggle,
    handleAssigneeToggle,
    clearFilters,
    filteredTickets
  } = useTicketFilters(data?.tickets || []);

  const {
    viewMode,
    kanbanGrouping,
    sortBy,
    setViewMode,
    setKanbanGrouping,
    setSortBy,
    sortedTickets,
    kanbanColumns,
    uiSettings,
    handleUISettingChange,
  } = useTicketView(filteredTickets);

  const {
    updateTicketStatus,
    updateTicketAssignee,
    updateTicketPriority,
    deleteTicket
  } = useTicketActions(token, refetch);

  // Update local storage when filters change
  useEffect(() => {
    localStorage.setItem(
      "all_selectedPriorities",
      JSON.stringify(selectedPriorities)
    );
    localStorage.setItem(
      "all_selectedStatuses",
      JSON.stringify(selectedStatuses)
    );
    localStorage.setItem(
      "all_selectedAssignees",
      JSON.stringify(selectedAssignees)
    );
  }, [selectedPriorities, selectedStatuses, selectedAssignees]);

  const [users, setUsers] = useState<any[]>([]);

  async function fetchUsers() {
    await fetch(`/api/v1/users/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res) {
          setUsers(res.users);
        }
      });
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  // Add this to the useEffect that saves preferences
  useEffect(() => {
    localStorage.setItem("preferred_view_mode", viewMode);
    localStorage.setItem("preferred_kanban_grouping", kanbanGrouping);
    localStorage.setItem("preferred_sort_by", sortBy);
  }, [viewMode, kanbanGrouping, sortBy]);

  if (status === "loading") {
    return <Loader className="animate-spin" />;
  }
  
  if (status === "error" || error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-red-500 mb-4">Error loading tickets: {error}</div>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="py-2 px-3 bg-background border-b-[1px] flex flex-row items-center justify-between">
        <TicketFilters
          selectedPriorities={selectedPriorities}
          selectedStatuses={selectedStatuses}
          selectedAssignees={selectedAssignees}
          users={users}
          onPriorityToggle={handlePriorityToggle}
          onStatusToggle={handleStatusToggle}
          onAssigneeToggle={handleAssigneeToggle}
          onClearFilters={clearFilters}
        />
        
        <ViewSettings
          viewMode={viewMode}
          kanbanGrouping={kanbanGrouping}
          sortBy={sortBy}
          uiSettings={uiSettings}
          onViewModeChange={setViewMode}
          onKanbanGroupingChange={setKanbanGrouping}
          onSortChange={setSortBy}
          onUISettingChange={handleUISettingChange}
        />
      </div>

      {viewMode === "list" ? (
        <TicketList
          tickets={sortedTickets}
          onStatusChange={updateTicketStatus}
          onAssigneeChange={updateTicketAssignee}
          onPriorityChange={updateTicketPriority}
          onDelete={user.isAdmin ? deleteTicket : undefined}
          users={users}
          currentUser={user}
          uiSettings={uiSettings}
        />
      ) : (
        <TicketKanban 
          columns={kanbanColumns} 
          uiSettings={uiSettings}
        />
      )}
    </div>
  );
}
