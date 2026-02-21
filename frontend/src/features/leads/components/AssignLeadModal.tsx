import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { employeesApi } from "@/features/employees/api/employeesApi";
import { toast } from "react-hot-toast";

type Props = {
    open: boolean;
    onClose: () => void;
    onAssign: (employeeId: string) => void;
    isPending: boolean;
};

export const AssignLeadModal = ({ open, onClose, onAssign, isPending }: Props) => {
    const [selectedId, setSelectedId] = useState("");

    const { data: employees, isLoading } = useQuery({
        queryKey: ["employees", "list-compact"],
        queryFn: () => employeesApi.list({ page: 1, limit: 100 }),
        enabled: open
    });

    const handleAssign = () => {
        if (!selectedId) {
            toast.error("Please select an employee");
            return;
        }
        onAssign(selectedId);
    };

    return (
        <Modal open={open} onClose={onClose} title="Assign Lead">
            <div className="space-y-4">
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Select Employee</label>
                    <select
                        value={selectedId}
                        onChange={(e) => setSelectedId(e.target.value)}
                        disabled={isLoading || isPending}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
                    >
                        <option value="">-- Choose an employee --</option>
                        {employees?.items.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                                {emp.firstName} {emp.lastName} ({emp.email})
                            </option>
                        ))}
                    </select>
                    {isLoading && <p className="mt-1 text-xs text-slate-500">Loading employees...</p>}
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
                    <Button onClick={handleAssign} loading={isPending} disabled={!selectedId}>Assign Lead</Button>
                </div>
            </div>
        </Modal>
    );
};
