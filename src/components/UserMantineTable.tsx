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
import {modals } from '@mantine/modals';
import { IconTrash } from '@tabler/icons-react';
import { UserLevel, Users } from '../types/vpadmin/vpAdminTypes';
import { 
  GetAllVpUserLevels,
  CreateVpUser,
  UpdateVpUser,
  DeleteVpUser,
  GetAllVpUsers,
  } from '../api/vp-item-api';

const UserMantineTable: React.FC = () => {
  const [validationErrors, setValidationErrors] = useState<
  Record<string, string | undefined>
>({});
//keep track of rows that have been edited
const [editedUsers, setEditedUsers] = useState<Record<string, Users>>({});

const [userLevels, setUserLevels] = useState<{ label: string, value: string }[]>([]);

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
}, []);

//call CREATE hook
const { mutateAsync: createUser, isPending: isCreatingUser } =
  useCreateUser();
//call READ hook
const {
  data: fetchedUsers = [],
  isError: isLoadingUsersError,
  isFetching: isFetchingUsers,
  isLoading: isLoadingUsers,
} = useGetUsers();
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
    onConfirm: () => deleteUser(row.original.UserID),
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
    {
      accessorKey: 'UserLevelID',
      header: 'User Level',
      editable: true,
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
    },      
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
    mantineTableContainerProps: {
      sx: {
        minHeight: '500px',
      },
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateUser,
    renderRowActions: ({ row }) => (
      <Tooltip label="Delete">
        <ActionIcon style={{background: 'transparent'}} onClick={() => openDeleteConfirmModal(row)}>
          <IconTrash color='red' />
        </ActionIcon>
      </Tooltip>
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
      <Button
        onClick={() => {
          table.setCreatingRow(true); //simplest way to open the create row modal with no default values
          //or you can pass in a row object to set default values with the `createRow` helper function
          // table.setCreatingRow(
          //   createRow(table, {
          //     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
          //   }),
          // );
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

  return <MantineReactTable table={table} />;
};

//CREATE hook (post new user to api)
function useCreateUser() {
const queryClient = useQueryClient();
return useMutation({
  mutationFn: async (user: Users) => {
    //send api create request here
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
function useGetUsers() {
return useQuery<Users[]>({
  queryKey: ['users'],
  queryFn: async () => {
    //send api request here
    const list = await GetAllVpUsers();
    const users = list?.map((user) => ({
      UserID: user.UserID,
      Name: user.Name,
      Email: user.Email,
      Password: user.Password,
      UserLevelID: user.UserLevelID.toString(),
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
    return await new Promise((resolve) => {
      users.forEach(async (user) => {
        const result = await UpdateVpUser(user);
        resolve(result);  
      });
    });      
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