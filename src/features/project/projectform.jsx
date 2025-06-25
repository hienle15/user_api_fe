import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../userSlice";
import { useToast } from "@/hooks/use-toast";
import { toastSuccess, toastError } from "@/hooks/toast-utils";
import { Toaster } from "sonner";
import {
    createProject,
    deleteProject,
    fetchProjects,
    updateProject,
} from "./projectSlice";

import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Checkbox } from "../../components/ui/checkbox";
import {
    Table,
    TableHead,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
} from "../../components/ui/table";

import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
} from "@tanstack/react-table";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
} from "../../components/ui/dropdown-menu";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
//định nghĩa các nhãn cột cho bảng
const columnLabels = {
    name: "Project Name",
    description: "Description",
    owner: "Owner",
    actions: "Actions",
};

export default function ProjectForm() {
    const dispatch = useDispatch();//lấy hàm dispatch từ Redux store
    // Lấy danh sách dự án và người dùng từ Redux store
    const { projects } = useSelector((state) => state.projects);// lấy danh sách dự án từ Redux store
    const { users } = useSelector((state) => state.users);// lấy danh sách người dùng từ Redux store
    const { toast } = useToast();

    console.log("1. Users from Redux store (ProjectForm render):", users);

    const [showUserDialog, setShowUserDialog] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [rowSelection, setRowSelection] = useState({});
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);


    // sử dụng useMemo để tạo map để ánh xạ id từ người dùng sang tên người dùng
    const userMap = useMemo(() => {
        const map = Object.fromEntries(users.map((user) => [user.id, user.name]));
        console.log("2. userMap created/updated:", map);
        return map;
    }, [users])

    const handleShowUsers = (userIdsInput) => { // Hàm này sẽ được gọi khi người dùng nhấn nút "Users" trong bảng
        console.log("3. User IDs passed to handleShowUsers:", userIdsInput);
        let userIdsArray = [];

        if (!Array.isArray(userIdsInput)) {
            try {
                const parsed = JSON.parse(userIdsInput);
                if (Array.isArray(parsed)) {
                    userIdsArray = parsed;
                } else if (typeof parsed === "number" || typeof parsed === "string") {
                    userIdsArray = [parsed];
                }
            } catch (e) {
                const numId = Number(userIdsInput);
                if (!isNaN(numId) && String(numId) === userIdsInput) {
                    userIdsArray = [numId];
                } else {
                    console.error(
                        "Cannot parse userIds as array or single ID. Value:",
                        userIdsInput,
                        "Error:",
                        e
                    );
                    userIdsArray = [];
                }
            }
        } else if (typeof userIdsInput === "number" || typeof userIdsInput === "string") {
            userIdsArray = [userIdsInput];
        } else {
            console.error("Unexpected type for userIdsInput. Value:", userIdsInput);
            userIdsArray = [];
        }

        userIdsArray = userIdsArray// Chuyển đổi mảng ID người dùng thành mảng số
            .map((id) => Number(id))
            .filter((id) => !isNaN(id));

        const names = userIdsArray.map((id) => {//Duyệt qua mảng các ID đã được làm sạch và sử dụng userMap để tra cứu tên người dùng tương ứng. Nếu không tìm thấy tên, nó sẽ hiển thị "User [ID]".
            const userName = userMap[id];
            console.log(`Mapping User ID: ${id}, Found Name: "${userName}"`);
            return userName || `User ${id}`;
        });
        setSelectedUsers(names);//Cập nhật state selectedUsers với danh sách tên người dùng.
        setShowUserDialog(true);//Mở dialog hiển thị danh sách người dùng.
    };

    const columns = [
        {
            accessorKey: "name",
            header: columnLabels.name,
            cell: (info) => (
                <span className="text-sm font-medium text-gray-800">
                    {info.getValue()}
                </span>
            ),
        },
        {
            accessorKey: "description",
            header: columnLabels.description,
            cell: (info) => (
                <span className="text-sm font-medium text-gray-800">
                    {info.getValue()}
                </span>
            ),
        },
        {
            accessorKey: "user_ids", // Corrected accessorKey to match project data
            header: "Owner",
            cell: ({ row }) => {
                const project = row.original;
                return (
                    <Button
                        className="bg-yellow-400 hover:bg-yellow-500"
                        onClick={() => handleShowUsers(project.user_ids)}
                    >
                        Users
                    </Button>
                );
            },
        },
        {
            id: "actions",
            header: columnLabels.actions,// tiêu đề
            cell: ({ row }) => {
                const handleDelete = async () => {
                    try {
                        // Access the message from the unwrapped result
                        const result = await dispatch(deleteProject(row.original.id)).unwrap();
                        toastSuccess("Success!", result.message); // Use result.message
                        await dispatch(fetchProjects());
                    } catch (err) {
                        toastError("Error!", err.message || "Unable to delete the project."); // Use toastError
                    }
                };
                return (
                    <div className="flex gap-2">
                        {/* Edit Dialog */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0 hover:bg-blue-100"
                                    title="Edit project"
                                >
                                    <Pencil className="h-4 w-4 text-blue-600" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Edit Project</DialogTitle>
                                </DialogHeader>
                                <ProjectFormDialog
                                    key={`edit-project-${row.original.id}`}
                                    initialData={row.original}// truyền dữ liệu dự án hiện tại vào form,lỗi read id xuất phát từ row.original
                                    onSubmit={async (data) => {
                                        if (!row?.original?.id) {
                                            toastError("Error!", "Project ID is missing.");
                                            return;
                                        }

                                        try {
                                            const result = await dispatch(
                                                updateProject({ id: data.id, projectData: data })
                                            ).unwrap();
                                            toastSuccess("Success!", result.message);
                                            await dispatch(fetchProjects()); // <-- thêm dòng này để reload lại danh sách
                                        } catch (error) {
                                            toastError("Error!", typeof error === "string" ? error : error.message || "Failed to update project.");

                                        }
                                    }}
                                />
                            </DialogContent>
                        </Dialog>
                        {/* Delete Dialog */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0 hover:bg-red-100"
                                    title="Delete project"
                                >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Delete Confirmation</DialogTitle>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => { }}>
                                        Close
                                    </Button>
                                    <Button variant="destructive" onClick={handleDelete}>
                                        Delete
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                );
            },
        },
    ];

    // Fetch projects và users khi component mount
    useEffect(() => {
        dispatch(fetchProjects());
        dispatch(fetchUsers());
    }, [dispatch]);

    // 1. Thay thế polling bằng BroadcastChannel
    const projectsChannel = new BroadcastChannel('projects-channel');

    useEffect(() => {
        // Initial fetch
        dispatch(fetchProjects());
        dispatch(fetchUsers());

        // Listen for updates from other tabs
        const handleMessage = (event) => {
            if (event.data.type === 'PROJECT_UPDATED') {
                dispatch(fetchProjects());
            }
        };

        projectsChannel.addEventListener('message', handleMessage);

        return () => {
            projectsChannel.removeEventListener('message', handleMessage);
            projectsChannel.close();
        };
    }, [dispatch]);

    useEffect(() => {
        const handleChannelMessage = (event) => {
            switch (event.data.type) {
                case 'PROJECT_CREATED':
                    // Check if we already have this project to avoid duplicates
                    const exists = projects.some(p => p.id === event.data.project.id);
                    if (!exists) {
                        dispatch(fetchProjects());
                    }
                    break;
                case 'PROJECT_UPDATED':
                    dispatch(fetchProjects());
                    break;
                case 'PROJECT_DELETE':
                    dispatch(fetchProjects());
                    break;
            }
        };

        projectsChannel.addEventListener('message', handleChannelMessage);
        return () => {
            projectsChannel.removeEventListener('message', handleChannelMessage);
        };
    }, [dispatch, projects]);

    const table = useReactTable({
        data: projects,
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
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <Input
                        placeholder="Filter projects..."
                        value={table.getColumn("name")?.getFilterValue() ?? ""}
                        onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
                        className="w-full md:max-w-sm border-gray-300 shadow-sm focus:ring-purple-100"
                    />
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center gap-2 text-sm font-medium hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-200">
                                    Add
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Add Project</DialogTitle>
                                </DialogHeader>
                                <ProjectFormDialog
                                    key={`add-project`}
                                    onSubmit={async (data) => {
                                        try {
                                            const result = await dispatch(createProject(data)).unwrap();
                                            await dispatch(fetchProjects());
                                            // Sử dụng toastSuccess (lấy từ file toast-utils, giống trong UserForm)
                                            toastSuccess("Success!", result.message);
                                            setIsAddDialogOpen(false);
                                        } catch (error) {
                                            // Sử dụng toastError nếu có lỗi
                                            toastError("Error!", typeof error === "string" ? error : error.message || "Failed to create project.");
                                        }
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
                                    .filter((col) => col.getCanHide && col.getCanHide())
                                    .map((col) => (
                                        <DropdownMenuCheckboxItem
                                            key={col.id}
                                            checked={col.getIsVisible && col.getIsVisible()}
                                            onCheckedChange={(val) =>
                                                col.toggleVisibility && col.toggleVisibility(!!val)
                                            }
                                            className="capitalize text-sm"
                                        >
                                            {columnLabels[col.id] ?? col.id}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

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
                                    <TableRow key={row.id} className="hover:bg-purple-50 transition duration-300">
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

                {/* Dialog hiển thị danh sách user */}
                <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
                    <DialogContent className="sm:max-w-md p-6 bg-white rounded-lg shadow-xl animate-fade-in-up">
                        <DialogHeader className="border-b pb-3 mb-4">
                            <DialogTitle className="text-2xl font-bold text-gray-800">
                                Assigned Users
                            </DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            {selectedUsers.length > 0 ? (
                                <ul className="list-disc list-inside text-base text-gray-700 space-y-2">
                                    {selectedUsers.map((name, idx) => (
                                        <li key={idx} className="flex items-center">
                                            <span className="inline-block w-2 h-2 mr-2 bg-blue-500 rounded-full"></span>
                                            {name}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-center italic">No users assigned or loaded.</p>
                            )}
                        </div>
                        <DialogFooter className="pt-4 border-t mt-4 flex justify-end">
                            <Button
                                onClick={() => setShowUserDialog(false)}
                                className="bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200"
                            >
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-700">
                        <span className="font-semibold">
                            {table.getFilteredSelectedRowModel().rows.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold">
                            {table.getFilteredRowModel().rows.length}
                        </span>{" "}
                        row(s)
                    </div>
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
function ProjectFormDialog({
    initialData = { name: "", description: "", user_ids: [] },
    onSubmit,

}) {
    const dispatch = useDispatch();
    const { users } = useSelector((state) => state.users);
    const { toast } = useToast();
    const [selectedUserIds, setSelectedUserIds] = useState(() =>
        Array.isArray(initialData.user_ids)
            ? initialData.user_ids.map((id) => Number(id)).filter((id) => !isNaN(id))
            : []
    );
    // Sử dụng lazy initializer để khởi tạo formData từ initialData
    const [formData, setFormData] = useState(() => {
        const initialUserIds = Array.isArray(initialData.user_ids)
            ? initialData.user_ids.map((id) => Number(id)).filter((id) => !isNaN(id))
            : initialData.user_id
                ? [Number(initialData.user_id)]
                : [];
        // return { ...initialData, user_ids: initialUserIds };
        return { ...initialData, id: initialData.id, user_ids: initialUserIds };
    });
    // Khi form Edit được mở, ProjectFormDialog nhận initialData.user_ids, nhưng đôi khi user_ids lại là string JSON (ví dụ: "[1,2]") 
    // thay vì mảng thực tế ([1, 2]). Điều này khiến formData.user_ids.includes(user.id) không hoạt động đúng, 
    // vì formData.user_ids là một chuỗi chứ không phải mảng số.
    //Sửa useEffect trong ProjectFormDialog để chắc chắn user_ids luôn là mảng số.
    useEffect(() => {
        let userIds = [];

        if (Array.isArray(initialData.user_ids)) {
            userIds = initialData.user_ids.map((id) => Number(id));
        } else if (typeof initialData.user_ids === "string") {
            try {
                const parsed = JSON.parse(initialData.user_ids);
                if (Array.isArray(parsed)) {
                    userIds = parsed.map((id) => Number(id));
                }
            } catch (e) {
                console.error("Không thể parse user_ids:", initialData.user_ids);
            }
        }

        setFormData({
            ...initialData,
            id: initialData.id,
            user_ids: userIds
        });
    }, []);

    useEffect(() => {
        const usersChannel = new BroadcastChannel('users-channel');

        const handleMessage = (event) => {

            if (event.data.type === 'USER_CREATED') {
                dispatch(fetchUsers());
            }
            if (event.data.type === 'USER_UPDATED') {
                dispatch(fetchUsers());
            }
            if (event.data.type === 'USER_DELETED') {
                const deletedId = Number(event.data.id);
                dispatch(fetchUsers());
            }
        };

        usersChannel.addEventListener('message', handleMessage);
        return () => {
            usersChannel.removeEventListener('message', handleMessage);
            usersChannel.close();
        };
    }, [dispatch]);

    useEffect(() => {
        if (!users || users.length === 0) {
            dispatch(fetchUsers());
        }
    }, [dispatch, users]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    //const toggleUser = (id) => { ... };: Hàm xử lý sự kiện onCheckedChange cho các checkbox người dùng.
    // Nếu user.id đã có trong formData.user_ids, nó sẽ bị xóa khỏi mảng (bỏ chọn).
    // Nếu user.id chưa có, nó sẽ được thêm vào mảng (chọn).
    // Number(id): Đảm bảo ID luôn là số.
    const toggleUser = (id) => {
        const parsedId = Number(id);
        setFormData((prev) => ({
            ...prev,
            user_ids: prev.user_ids.includes(parsedId)
                ? prev.user_ids.filter((uid) => uid !== parsedId)
                : [...prev.user_ids, parsedId],
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            user_ids: formData.user_ids || [],
            id: formData.id || undefined, // Ensure id is included if it exists
        };
        if (payload.user_id !== undefined) delete payload.user_id;
        if (onSubmit) onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                name="name"
                placeholder="Project Name"
                value={formData.name || ""}
                onChange={handleChange}
                required
            />
            <Textarea
                name="description"
                placeholder="Project Description"
                value={formData.description || ""}
                onChange={handleChange}
                required
            />
            <div className="grid grid-cols-2 gap-2 mt-4">
                {users.map((user) => (
                    <label key={user.id} className="flex items-center gap-2">
                        {/* Một lưới các Checkbox để chọn người dùng. Mỗi checkbox được tạo cho mỗi người dùng trong mảng users. Trạng thái checked của checkbox phụ thuộc vào việc user.id có trong formData.user_ids hay không. */}
                        <Checkbox
                            checked={formData.user_ids.includes(user.id)}
                            onCheckedChange={() => toggleUser(user.id)}
                        />

                        <span className="text-sm">{user.name}</span>
                    </label>
                ))}
            </div>
            <DialogFooter>

                <Button
                    type="submit"
                    className="bg-green-500 text-white hover:bg-green-600 transition-colors duration-200"
                >
                    Save
                </Button>

            </DialogFooter>
        </form>
    );
}