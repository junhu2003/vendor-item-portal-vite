import React, { useEffect, useMemo, useState } from 'react';
import {
  MantineReactTable,
  // createRow,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMantineReactTable,
} from 'mantine-react-table';
import {  
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { ActionIcon, Button, Text, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconTrash, IconKey, IconPasswordUser } from '@tabler/icons-react';
import {   
  LockIcon,
  XIcon,
} from 'lucide-react';
import { UserLevel, Users } from '../types/vpadmin/vpAdminTypes';
import { 
  GetAllVpUserLevels,
  CreateVpUser,
  UpdateVpUser,
  DeleteVpUser,  
  GetMyVpUsers,
  } from '../api/vp-item-api';  
import { useAuth } from '../context/AuthContext';
import bcryptjs from 'bcryptjs';


const UserMantineTable: React.FC = () => {
  const { loginUser } = useAuth(); //get logged in user from context  

  const [validationErrors, setValidationErrors] = useState<
  Record<string, string | undefined>
>({});

const [isChangeUserPwdModalOpen, setIsChangeUserPwdModalOpen] = useState(false);
const [selUser, setSelUser] = useState<Users | null>(null); //user state for change password modal
const [error, setError] = useState<string>(''); //error state for change password modal
const [currentPwd, setCurrentPwd] = useState<string>(''); //password state for change password modal
const [newPwd, setNewPwd] = useState<string>(''); //password state for change password modal
const [confirmPwd, setConfirmPwd] = useState<string>(''); //password state for change password modal

//keep track of rows that have been edited
const [editedUsers, setEditedUsers] = useState<Record<string, Users>>({});

const [userLevels, setUserLevels] = useState<{ label: string, value: string }[]>([]);

const queryClient = useQueryClient();
useEffect(() => {
  const fetchData = async () => {    

    // retrieve user levels
    const userLevelData: UserLevel[] = await GetAllVpUserLevels();
    let userLevelList: { label: string, value: string }[] 
      = userLevelData.map((c) => ({
          value: c.UserLevelID.toString(),
          label: c.Name,
        }));
    setUserLevels(userLevelList);      
  };

  fetchData();
  queryClient.invalidateQueries({ queryKey: ['users'] })
}, []);

const openModal = (user: Users) => {
  setSelUser(user); //set selected user for change password modal
  setIsChangeUserPwdModalOpen(true);
}
const closeModal = () => setIsChangeUserPwdModalOpen(false);

const changeUserPassword = async (user: Users | null): Promise<boolean> => {
  if (!user) return false; //check if user is null

  const passwordsMatch = await bcryptjs.compare(currentPwd, user.Password);    
  if (!passwordsMatch) {
    setError('Current Password is incorrect');
    return false;
  } else {
    setError('');
  }

  if (newPwd && newPwd.length < 6)  {
    setError('New Password must be at least 6 characters long');
    return false;
  } else if ( newPwd !== confirmPwd) {  
    setError('New Password and Confirm Password do not match');
    return false;
  } else {
    setError('');
  }
  
  user.Password = await bcryptjs.hash(newPwd, 10);
  const isUpdateSuccess = await UpdateVpUser([user]);

  setCurrentPwd('');
  setNewPwd('');
  setConfirmPwd('');  

  if (isUpdateSuccess) {
    setError('');
  } else {
    setError('Failed to update password');      
    return false;
  }

  return true;
}

const resetUserPassword = async (user: Users): Promise<boolean> => {
  if (!user) return false; //check if user is null  

  user.Password = await bcryptjs.hash('123456', 10);
  const isUpdateSuccess = await UpdateVpUser([user]);

  return isUpdateSuccess;
}

//call CREATE hook
const { mutateAsync: createUser, isPending: isCreatingUser } =
  useCreateUser(loginUser);
//call READ hook
const {
  data: fetchedUsers = [],
  isError: isLoadingUsersError,
  isFetching: isFetchingUsers,
  isLoading: isLoadingUsers,
} = loginUser ? useGetUsers(loginUser) : { data: [], isError: false, isFetching: false, isLoading: false };
//call UPDATE hook
const { mutateAsync: updateUsers, isPending: isUpdatingUser } =
  useUpdateUsers();
//call DELETE hook
const { mutateAsync: deleteUser, isPending: isDeletingUser } =
  useDeleteUser();

//CREATE action
const handleCreateUser: MRT_TableOptions<Users>['onCreatingRowSave'] = async ({
  values,
  exitCreatingMode,
}) => {
  const newValidationErrors = validateUser(values);
  if (Object.values(newValidationErrors).some((error) => !!error)) {
    setValidationErrors(newValidationErrors);
    return;
  }
  setValidationErrors({});
  await createUser(values);
  exitCreatingMode();
};

//UPDATE action
const handleSaveUsers = async () => {
  if (Object.values(validationErrors).some((error) => !!error)) return;
  await updateUsers(Object.values(editedUsers));
  setEditedUsers({});
};

//DELETE action
const openDeleteConfirmModal = (row: MRT_Row<Users>) =>
  modals.openConfirmModal({
    title: 'Are you sure you want to delete this user?',
    children: (
      <Text>
        Are you sure you want to delete {row.original.Name}{' '}?
         This action cannot be undone.
      </Text>
    ),
    labels: { confirm: 'Delete', cancel: 'Cancel' },
    confirmProps: { color: 'red' },
    onConfirm: () => deleteUser(row.original.UserID ?? ''),
  });

//Change User Password
const openChangePasswordModal = (row: MRT_Row<Users>) =>  
  openModal(row.original);

//DELETE action
const openResetPwdConfirmModal = (row: MRT_Row<Users>) =>
  modals.openConfirmModal({
    title: 'Password Reset',
    children: (
      <Text>
        Are you sure you want to reset {row.original.Name} password to '123456'?
         This action cannot be undone.
      </Text>
    ),
    labels: { confirm: 'Reset', cancel: 'Cancel' },
    confirmProps: { color: 'red' },
    onConfirm: () => resetUserPassword(row.original),
  });


const columns = useMemo<MRT_ColumnDef<Users>[]>(    
  () => [          
    {
      accessorKey: 'Name',
      header: 'Name',
      mantineEditTextInputProps: ({ cell, row }) => ({
        type: 'text',
        required: true,
        error: validationErrors?.[cell.id],
        //store edited user in state to be saved later
        onBlur: (event) => {            
          const validationError = !validateRequired(event.currentTarget.value)
            ? 'Required'
            : undefined;
          setValidationErrors({
            ...validationErrors,
            [cell.id]: validationError,
          });
          setEditedUsers({ 
            ...editedUsers,
            [row.id]: { ...(editedUsers[row.id] ? editedUsers[row.id] : row.original), Name: event.currentTarget.value },
          });
        },
      }),
    },      
    {
      accessorKey: 'Email',
      header: 'Email',
      mantineEditTextInputProps: ({ cell, row }) => ({
        type: 'email',
        required: true,
        error: validationErrors?.[cell.id],
        //store edited user in state to be saved later
        onBlur: (event) => {
          const validationError = !validateEmail(event.currentTarget.value)
            ? 'Invalid Email'
            : undefined;
          setValidationErrors({
            ...validationErrors,
            [cell.id]: validationError,
          });
          setEditedUsers({ 
            ...editedUsers, 
            [row.id]: { ...(editedUsers[row.id] ? editedUsers[row.id] : row.original), Email: event.currentTarget.value },
          });
        },
      }),
    },      
    /*{
      accessorKey: 'UserLevelID',
      header: 'User Level',
      editable: false,
      editVariant: 'select',
      mantineEditSelectProps: ({ row }) => ({
        data: userLevels,
        //store edited user in state to be saved later
        onChange: (value: any) =>
          setEditedUsers({
            ...editedUsers,
            [row.id]: { ...(editedUsers[row.id] ? editedUsers[row.id] : row.original), UserLevelID: value },
          }),
      }),
    },*/      
  ],
  [editedUsers, validationErrors, userLevels],
);

const table = useMantineReactTable(
  {
    columns,
    data: fetchedUsers,
    createDisplayMode: 'row', // ('modal', and 'custom' are also available)
    editDisplayMode: 'table', // ('modal', 'row', 'cell', and 'custom' are also available)
    enableEditing: true,
    enableRowActions: true,
    positionActionsColumn: 'last',
    getRowId: (row) => row.UserID,
    mantineToolbarAlertBannerProps: isLoadingUsersError
      ? {
          color: 'red',
          children: 'Error loading data',
        }
      : undefined,    
    mantineTableProps: {     
      className: 'custom-table',
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateUser,
    renderRowActions: ({ row }) => (
      <div className='flex items-centers space-x-1' style={{ width: '300px' }}>
        { loginUser?.UserID !== row.original.UserID &&
          <Tooltip label="Delete">
            <ActionIcon style={{background: 'transparent'}} onClick={() => openDeleteConfirmModal(row)}>
              <IconTrash color='red' />
            </ActionIcon>
          </Tooltip>
        }
        { loginUser?.UserID === row.original.UserID &&
          <Tooltip label="Change Password">
            <ActionIcon style={{background: 'transparent'}} onClick={() => openChangePasswordModal(row)}>
              <IconKey color='blue' />
            </ActionIcon>
          </Tooltip>
        }
        {
          loginUser?.UserID !== row.original.UserID &&
          <Tooltip label="Reset Password">
            <ActionIcon style={{background: 'transparent'}} onClick={() => openResetPwdConfirmModal(row)}>
              <IconPasswordUser color='blue' />
            </ActionIcon>
          </Tooltip>
        }
      </div>
    ),
    renderBottomToolbarCustomActions: () => (
      <Button
        color="blue"
        onClick={handleSaveUsers}
        disabled={
          Object.keys(editedUsers).length === 0 ||
          Object.values(validationErrors).some((error) => !!error)
        }
        loading={isUpdatingUser}
      >
        Save
      </Button>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      loginUser?.UserLevelID.toString() !== '3' &&
      <Button
        onClick={() => {
          table.setCreatingRow(true);
        }}
      >
        Create New User
      </Button>
    ),
    state: {
      isLoading: isLoadingUsers,
      isSaving: isCreatingUser || isUpdatingUser || isDeletingUser,
      showAlertBanner: isLoadingUsersError,
      showProgressBars: isFetchingUsers,
    },
  });

  return ( 
    <div>
      <MantineReactTable table={table} />

      {/* Modal Backdrop */}
      {isChangeUserPwdModalOpen && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 bg-opacity-50">
          {/* Modal Content */}
          <div className="relative w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl">
            {/* Modal Header */}
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">Change User Password</h3>
              <button
                onClick={closeModal}
                className="absolute p-1 text-gray-400 top-4 right-4 hover:text-gray-500"
              >
                <XIcon size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mb-6">
              {error && error.length > 0  && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    {error}
                  </div>
                )}
              <div className="relative mb-4 mt-1">          
                <input
                  type="password"
                  id="current-password"
                  value={currentPwd}
                  placeholder='Current Password'
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  className="w-full pl-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required            
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <LockIcon size={20} />
                </div>
              </div>          
              <div className="relative mb-6">            
                <input
                  type="password"
                  id="new-password"
                  value={newPwd}
                  placeholder='New Password'
                  onChange={(e) => setNewPwd(e.target.value)}
                  className="w-full pl-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required            
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <LockIcon size={20} />
                </div>
              </div>
              <div className="relative mb-6">            
                <input
                  type="password"
                  id="confirm-password"
                  value={confirmPwd}
                  placeholder='Confirm Password'
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  className="w-full pl-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required            
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <LockIcon size={20} />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <Button
                color="gray"
                variant="default"
                onClick={() => {              
                  setCurrentPwd('');
                  setNewPwd('');  
                  setConfirmPwd('');
                  setError('');
                  closeModal();
                }}
                style={{ marginRight: 10 }}
              >
                Cancel
              </Button>
              <Button
                color="red"
                onClick={async () => {
                  const shouldClose = await changeUserPassword(selUser);
                  if (shouldClose) {
                    closeModal();
                  }
                }}
              >
                Confirm
              </Button>              
            </div>
          </div>
        </div>
      )}
    </div>
  
  )
};

//CREATE hook (post new user to api)
function useCreateUser(loginUser: Users | null) {
const queryClient = useQueryClient();
return useMutation({
  mutationFn: async (user: Users) => {
    //send api create request here
    if (loginUser?.UserLevelID === '1') {
      user.UserLevelID = '2';
    } else if (loginUser?.UserLevelID === '2') {
      user.UserLevelID = '3';
    }    
    user.ManagerUserID = loginUser?.UserID ?? ''; //set manager user id to logged in user id
    user.IsNewUser = true; //set new user flag to true
    const result = await CreateVpUser(user);    
    return result;    
  },
  //client side optimistic update
  onMutate: (newUserInfo: Users) => {
    queryClient.setQueryData(
      ['users'],
      (prevUsers: any) =>
        [
          ...prevUsers,
          {
            ...newUserInfo,
            id: (Math.random() + 1).toString(36).substring(7),
          },
        ] as Users[],
    );
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
});
}

//READ hook (get users from api)
function useGetUsers(loginUser: Users) {
return useQuery<Users[]>({
  queryKey: ['users'],
  queryFn: async () => {
    //send api request here
    const list = loginUser.UserID ? await GetMyVpUsers(loginUser.UserID) : [];
    const users = list?.map((user) => ({
      UserID: user.UserID,
      Name: user.Name,
      Email: user.Email,
      Password: user.Password,
      UserLevelID: user.UserLevelID.toString(),
      ManagerUserID: user.ManagerUserID,
      IsNewUser: user.IsNewUser,
    }));
    return users ? users : [];
  },
  refetchOnWindowFocus: false,
});
}

//UPDATE hook (put users in api)
function useUpdateUsers() {
const queryClient = useQueryClient();
return useMutation({
  mutationFn: async (users: Users[]) => {
    //send api update request here
    const result = await UpdateVpUser(users);    
    return result  
  },
  //client side optimistic update
  onMutate: (newUsers: Users[]) => {
    queryClient.setQueryData(
      ['users'],
      (prevUsers: any) =>
        prevUsers?.map((user: Users) => {
          const newUser = newUsers.find((u) => u.UserID === user.UserID);
          return newUser ? newUser : user;
        }),
    );
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
});
}

//DELETE hook (delete user in api)
function useDeleteUser() {
const queryClient = useQueryClient();
return useMutation({
  mutationFn: async (userId: string) => {
    //send api update request here
    const result = await DeleteVpUser(userId);    
    return result;    
  },
  //client side optimistic update
  onMutate: (userId: string) => {
    queryClient.setQueryData(
      ['users'],
      (prevUsers: any) =>
        prevUsers?.filter((user: Users) => user.UserID !== userId),
    );
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
});
}

const validateRequired = (value: string) => !!value?.length;
const validateEmail = (email: string) =>
!!email.length &&
email
  .toLowerCase()
  .match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  );

function validateUser(user: Users) {
return {
  name: !validateRequired(user.Name)
    ? 'Name is Required'
    : '',    
  email: !validateEmail(user.Email) ? 'Incorrect Email Format' : '',
};
}

export default UserMantineTable;  