import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { deleteUser, fetchUsers } from "./userSlice";
import UserForm from "./UserForm";
import { useToast } from '@/hooks/use-toast';
import { Toaster } from "@/components/ui/toaster";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { ArrowUpDown, ChevronDown, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toastSuccess } from "@/hooks/toast-utils";
// Nhãn hiển thị thân thiện cho menu dropdown
const columnLabels = {
  select: "Select",

  name: "Name",
  email: "Email",
  age: "Age",
  actions: "Actions"
};

// Định nghĩa cột bảng
const columns = [

  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="text-left text-lg font-semibold"
      >
        Name <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: (info) => (
      <span className="text-base font-medium text-gray-800">
        {info.getValue()}
      </span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: (info) => (
      <span className="text-sm text-gray-600">{info.getValue()}</span>
    ),
  },
  {
    accessorKey: "age",
    header: "Age",
    cell: (info) => (
      <span className="text-sm text-gray-700">{info.getValue()}</span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const dispatch = useDispatch(); // Thêm dòng này
      const { toast } = useToast();
      const handleDelete = async () => {
        try {
          await dispatch(deleteUser(row.original.id)).unwrap();
          toastSuccess("Success!", "User delete successfull.");
          await dispatch(fetchUsers()); // Refresh the list after deletion
        } catch (err) {
          toast({
            title: "Error!",
            description: err.message || "Unable to delete the user.",
            variant: "destructive",
          });
        }
      };

      return (
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-blue-100"
                title="Edit user"
              >
                <Pencil className="h-4 w-4 text-blue-600" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">

              <UserForm
                user={row.original}
                isEditing={true}
                onSuccess={() => {
                  dispatch(fetchUsers());
                  document.querySelector('[data-state="open"]')?.click();
                }}
                onCancel={() => {
                  document.querySelector('[data-state="open"]')?.click();
                }}
              />
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-red-100"
                title="Delete user"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Confirmation</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this user?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => document.querySelector('[data-state="open"]')?.click()}
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete();
                    document.querySelector('[data-state="open"]')?.click();
                  }}
                >
                Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
    },
    enableSorting: false,
  },

];

export default function UserList() {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-6 px-2 sm:px-4 md:px-6">
      <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-4 sm:p-6 md:p-8">

        {/* Header: Filter + Add + Columns */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <Input
            placeholder="Filter emails..."
            value={table.getColumn("email")?.getFilterValue() ?? ""}
            onChange={(e) =>
              table.getColumn("email")?.setFilterValue(e.target.value)
            }
            className="w-full md:max-w-sm border-gray-300 shadow-sm focus:ring-purple-100"
          />

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center gap-2 text-sm font-medium hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-200">
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">

                <UserForm
                  onSuccess={() => {
                    dispatch(fetchUsers());
                    document.querySelector('[data-state="open"]')?.click();
                  }}
                />
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center gap-2 text-sm font-medium hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200">
                  Columns <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white shadow-lg rounded-md p-2">
                {table
                  .getAllColumns()
                  .filter((col) => col.getCanHide())
                  .map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      checked={col.getIsVisible()}
                      onCheckedChange={(val) => col.toggleVisibility(!!val)}
                      className="capitalize text-sm"
                    >
                      {columnLabels[col.id] ?? col.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table Scroll Container */}
        <div className="rounded-xl border border-gray-100 shadow overflow-x-auto">
          <Table className="min-w-full bg-white">
            <TableHeader className="bg-blue-300">
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id}>
                  {group.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-gray-700 font-bold text-xs md:text-sm px-2 md:px-4 py-2 md:py-3"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-purple-50 transition duration-300"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="text-xs md:text-sm px-2 md:px-4 py-2 md:py-3"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getVisibleLeafColumns().length}
                    className="text-center py-8 text-gray-500 text-sm"
                  >
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6">
          {/* Row selection count - always visible */}
          <div className="text-sm text-gray-700">
            <span className="font-semibold">
              {table.getFilteredSelectedRowModel().rows.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold">
              {table.getFilteredRowModel().rows.length}
            </span>{" "}
             row (s)
          </div>

          {/* Pagination - only visible when rows > 10 */}
          {table.getFilteredRowModel().rows.length > 10 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="hover:bg-green-200"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="hover:bg-green-200"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
