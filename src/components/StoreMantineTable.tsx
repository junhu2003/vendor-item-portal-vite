import React, { useMemo, useState, useEffect } from 'react';
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
import { Store, StoreCreation, Users } from '../types/vpadmin/vpAdminTypes';
import {   
  CreateStore,
  UpdateStores,
  DeleteStore,  
  GetUserStores,
  } from '../api/vp-item-api';
import { IsStoreExistByPublicToken } from '../api/sd-item-api';
import { StoreMantineTableProps } from '../types/components/StoreMantineTableTypes';
import { formatToGuid, isValidGuid } from '../helper/help-functions';  
import { useAuth } from '../context/AuthContext';

const StoreMantineTable: React.FC<StoreMantineTableProps> = ({noticeRefreshStoreDropdown}) => {
const { loginUser } = useAuth();

const [validationErrors, setValidationErrors] = useState<
  Record<string, string | undefined>
>({});

//keep track of rows that have been edited
const [editedStores, setEditedStores] = useState<Record<string, Store>>({});

const queryClient = useQueryClient();
useEffect(() => {
  queryClient.invalidateQueries({ queryKey: ['stores'] })
}, []);


//call CREATE hook
const { mutateAsync: createStore, isPending: isCreatingStore } =
  useCreateStore(loginUser, noticeRefreshStoreDropdown);
//call READ hook
const {
  data: fetchedStores = [],
  isError: isLoadingStoresError,
  isFetching: isFetchingStores,
  isLoading: isLoadingStores,
} = useGetStores(loginUser);
//call UPDATE hook
const { mutateAsync: updateStores, isPending: isUpdatingStore } =
  useUpdateStores(noticeRefreshStoreDropdown);
//call DELETE hook
const { mutateAsync: deleteStore, isPending: isDeletingStore } =
  useDeleteStore(noticeRefreshStoreDropdown);

//CREATE action
const handleCreateStore: MRT_TableOptions<Store>['onCreatingRowSave'] = async ({
  values,
  exitCreatingMode,
}) => {
  const newValidationErrors = validateStore(values);
  if (Object.values(newValidationErrors).some((error) => !!error)) {
    setValidationErrors(newValidationErrors);
    return;
  }
  setValidationErrors({});
  await createStore(values);
  exitCreatingMode();
};

//UPDATE action
const handleSaveStores = async () => {
  if (Object.values(validationErrors).some((error) => !!error)) return;
  await updateStores(Object.values(editedStores));
  setEditedStores({});
};

//DELETE action
const openDeleteConfirmModal = (row: MRT_Row<Store>) =>
  modals.openConfirmModal({
    title: 'Are you sure you want to delete this store?',
    children: (
      <Text>
        Are you sure you want to delete {row.original.StoreName}{' '}?
         This action cannot be undone.
      </Text>
    ),
    labels: { confirm: 'Delete', cancel: 'Cancel' },
    confirmProps: { color: 'red' },
    onConfirm: () => deleteStore(row.original.StoreID),
  });

const columns = useMemo<MRT_ColumnDef<Store>[]>(    
  () => [          
    {
      accessorKey: 'StoreName',
      header: 'Store Name',
      size: 300,
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
          setEditedStores({ 
            ...editedStores,
            [row.id]: { ...(editedStores[row.id] ? editedStores[row.id] : row.original), StoreName: event.currentTarget.value },
          });
        },
      }),
    },      
    {
      accessorKey: 'HeadOfficeName',
      header: 'Head Office',
      size: 300,
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
          setEditedStores({ 
            ...editedStores, 
            [row.id]: { ...(editedStores[row.id] ? editedStores[row.id] : row.original), HeadOfficeName: event.currentTarget.value },
          });
        },
      }),
    },      
    {
      accessorKey: 'StoreToken',
      header: 'Store Token',
      size: 300,
      mantineEditTextInputProps: ({ cell, row }) => ({
        type: 'text',
        required: true,
        error: validationErrors?.[cell.id],
        //store edited user in state to be saved later
        onBlur: async (event) => {
          const validationError = await validatePublicToken(event.currentTarget.value);
          setValidationErrors({
            ...validationErrors,
            [cell.id]: validationError,
          });
          setEditedStores({ 
            ...editedStores, 
            [row.id]: { ...(editedStores[row.id] ? editedStores[row.id] : row.original), StoreToken: formatToGuid(event.currentTarget.value) },
          });
        },
      }),
    },      
    {
      accessorKey: 'HeadOfficeToken',
      header: 'Head Office Token',
      size: 300,
      mantineEditTextInputProps: ({ cell, row }) => ({
        type: 'text',
        required: true,
        error: validationErrors?.[cell.id],
        //store edited user in state to be saved later
        onBlur: async (event) => {
          const validationError = await validatePublicToken(event.currentTarget.value);
          setValidationErrors({
            ...validationErrors,
            [cell.id]: validationError,
          });
          setEditedStores({ 
            ...editedStores, 
            [row.id]: { ...(editedStores[row.id] ? editedStores[row.id] : row.original), HeadOfficeToken: formatToGuid(event.currentTarget.value) },
          });
        },
      }),
    },      
  ],
  [editedStores, validationErrors],
);

const table = useMantineReactTable(
  {
    columns,
    data: fetchedStores,
    createDisplayMode: 'row', // ('modal', and 'custom' are also available)
    editDisplayMode: 'table', // ('modal', 'row', 'cell', and 'custom' are also available)
    enableEditing: true,
    enableRowActions: true,
    positionActionsColumn: 'last',
    getRowId: (row) => row.StoreID ? row.StoreID.toString() : '',
    mantineToolbarAlertBannerProps: isLoadingStoresError
      ? {
          color: 'red',
          children: 'Error loading data',
        }
      : undefined,    
    mantineTableProps: {     
      className: 'custom-table',
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateStore,
    renderRowActions: ({ row }) => (
      loginUser?.UserLevelID.toString() !== '3' &&
      <Tooltip label="Delete">
        <ActionIcon style={{background: 'transparent'}} onClick={() => openDeleteConfirmModal(row)}>
          <IconTrash color='red' />
        </ActionIcon>
      </Tooltip>
    ),
    renderBottomToolbarCustomActions: () => (
      <Button
        color="blue"
        onClick={handleSaveStores}
        disabled={
          Object.keys(editedStores).length === 0 ||
          Object.values(validationErrors).some((error) => !!error)
        }
        loading={isUpdatingStore}
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
        Create New Store
      </Button>
    ),
    state: {
      isLoading: isLoadingStores,
      isSaving: isCreatingStore || isUpdatingStore || isDeletingStore,
      showAlertBanner: isLoadingStoresError,
      showProgressBars: isFetchingStores,
    },
  });

  return <MantineReactTable table={table} />;
};

//CREATE hook (post new user to api)
function useCreateStore(loginUser: Users | null, noticeRefreshStoreDropdown: any) {
const queryClient = useQueryClient();
return useMutation({
  mutationFn: async (store: Store) => {
    //send api create request here  
    store.StoreToken = formatToGuid(store.StoreToken);
    store.HeadOfficeToken = formatToGuid(store.HeadOfficeToken);  
    const storeCreator: StoreCreation = { 
      NewStore: store,     
      CreateUser: loginUser,
    };
    const result = await CreateStore(storeCreator);
    if (result) {
      noticeRefreshStoreDropdown();
    }
    return result;    
  },
  //client side optimistic update
  onMutate: (newStoreInfo: Store) => {
    queryClient.setQueryData(
      ['stores'],
      (prevStores: any) =>
        [
          ...prevStores,
          {
            ...newStoreInfo,
            id: (Math.random() + 1).toString(36).substring(7),
          },
        ] as Store[],
    );
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['stores'] }), //refetch users after mutation, disabled for demo
});
}

//READ hook (get users from api)
function useGetStores(loginUser: Users | null) {
return useQuery<Store[]>({
  queryKey: ['stores'],
  queryFn: async () => {
    //send api request here
    const stores = loginUser && loginUser.UserID ? await GetUserStores(loginUser.UserID) : [];    
    return stores;

  },
  refetchOnWindowFocus: false,
});
}

//UPDATE hook (put users in api)
function useUpdateStores(noticeRefreshStoreDropdown: any) {
const queryClient = useQueryClient();
return useMutation({
  mutationFn: async (stores: Store[]) => {
    //send api update request here
    const result = await UpdateStores(stores);
    if (result) {
      noticeRefreshStoreDropdown();      
    }
    return result;
  },
  //client side optimistic update
  onMutate: (newStores: Store[]) => {
    queryClient.setQueryData(
      ['stores'],
      (prevStores: any) =>
        prevStores?.map((store: Store) => {
          const newStore = newStores.find((u) => u.StoreID === store.StoreID);
          return newStore ? newStore : store;
        }),
    );
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['stores'] }), //refetch stores after mutation, disabled for demo
});
}

//DELETE hook (delete store in api)
function useDeleteStore(noticeRefreshStoreDropdown: any) {
const queryClient = useQueryClient();
return useMutation({
  mutationFn: async (storeId: number) => {
    //send api update request here
    const result = await DeleteStore(storeId);
    if (result) {
      noticeRefreshStoreDropdown();      
    }
    return result;    
  },
  //client side optimistic update
  onMutate: (storeId: number) => {
    queryClient.setQueryData(
      ['stores'],
      (prevStores: any) =>
        prevStores?.filter((store: Store) => store.StoreID !== storeId),
    );
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['stores'] }), //refetch stores after mutation, disabled for demo
});
}

const validateRequired = (value: string) => !!value?.length;

const validatePublicToken = async (publicToken: string): Promise<string> => {
  let result = '';
  if (!validateRequired(publicToken)) {
    result = 'Public token is required.';
  } else if (!isValidGuid(formatToGuid( publicToken))) {
    result = 'Public token Guid is invalid.';
  } else if (await IsStoreExistByPublicToken(formatToGuid(publicToken))) {
    result = 'No store found by this token.';
  }
  return result;
}

function validateStore(store: Store) {
return {
  StoreName: !validateRequired(store.StoreName)
    ? 'Store Name is Required'
    : '',    
    HeadOfficeToken: !validateRequired(store.HeadOfficeToken)
    ? 'Head Office Token is Required'
    : '',    
};
}

export default StoreMantineTable;  