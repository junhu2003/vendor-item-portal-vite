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
import { Users, Store, UserStoreRelation } from '../types/vpadmin/vpAdminTypes';
import {   
  CreateUserStoreRelation,
  UpdateUserStoreRelations,
  DeleteUserStoreRelation,
  GetAllUserStoreRelations,
  GetMyUserStoreRelations,
  GetAllVpUsers,
  GetAllStores,
  } from '../api/vp-item-api';
  import { useAuth } from '../context/AuthContext';

const UserStoreRelationMantineTable: React.FC = () => {
const { loginUser } = useAuth();

  const [validationErrors, setValidationErrors] = useState<
  Record<string, string | undefined>
>({});
//keep track of rows that have been edited
const [editedUserStoreRelations, setEditedUserStoreRelations] = useState<Record<string, UserStoreRelation>>({});

const [userLabels, setUserLabels] = useState<{ label: string, value: string }[]>([]);
const [storeLabels, setStoreLabels] = useState<{ label: string, value: string }[]>([]);

useEffect(() => {
  const fetchData = async () => {    

    // retrieve users
    const userData: Users[] = await GetAllVpUsers();
    let userLabelList: { label: string, value: string }[]
      = userData.map((c) => ({
          value: c.UserID.toString(),
          label: c.Name,
        }));
    setUserLabels(userLabelList);      

    // retrieve stores
    const storeData: Store[] = await GetAllStores();
    let storeLabelList: { label: string, value: string }[]
      = storeData.map((c) => ({
          value: c.StoreID.toString(),
          label: c.StoreName,
        }));
    setStoreLabels(storeLabelList);      
  };

  fetchData();
}, []);


//call CREATE hook
const { mutateAsync: createUserStoreRelation, isPending: isCreatingUserStoreRelation } =
  useCreateUserStoreRelation();
//call READ hook
const {
  data: fetchedUserStoreRelations = [],
  isError: isLoadingUserStoreRelationsError,
  isFetching: isFetchingUserStoreRelations,
  isLoading: isLoadingUserStoreRelations,
} = useGetUserStoreRelations(loginUser);
//call UPDATE hook
const { mutateAsync: updateUserStoreRelations, isPending: isUpdatingUserStoreRelation } =
  useUpdateUserStoreRelations();
//call DELETE hook
const { mutateAsync: deleteUserStoreRelation, isPending: isDeletingUserStoreRelation } =
  useDeleteUserStoreRelation();

//CREATE action
const handleCreateUserStoreRelation: MRT_TableOptions<UserStoreRelation>['onCreatingRowSave'] = async ({
  values,
  exitCreatingMode,
}) => {
  const newValidationErrors = validateUserStoreRelation(values);
  if (Object.values(newValidationErrors).some((error) => !!error)) {
    setValidationErrors(newValidationErrors);
    return;
  }
  setValidationErrors({});
  await createUserStoreRelation(values);
  exitCreatingMode();
};

//UPDATE action
const handleSaveUserStoreRelations = async () => {
  if (Object.values(validationErrors).some((error) => !!error)) return;
  await updateUserStoreRelations(Object.values(editedUserStoreRelations));
  setEditedUserStoreRelations({});
};

//DELETE action
const openDeleteConfirmModal = (row: MRT_Row<UserStoreRelation>) =>
  modals.openConfirmModal({
    title: 'Are you sure you want to delete this User Store Relation?',
    children: (
      <Text>
        Are you sure you want to delete {row.original.UserID}{' '}?
         This action cannot be undone.
      </Text>
    ),
    labels: { confirm: 'Delete', cancel: 'Cancel' },
    confirmProps: { color: 'red' },
    onConfirm: () => deleteUserStoreRelation(row.original.RelationID),
  });

const columns = useMemo<MRT_ColumnDef<UserStoreRelation>[]>(    
  () => [          
    {
      accessorKey: 'UserID',
      header: 'User ID',
      editable: false,
      editVariant: 'select',
      mantineEditSelectProps: ({ row }) => ({
        data: userLabels,
        //store edited User Store Relation in state to be saved later
        onChange: (value: any) =>
          setEditedUserStoreRelations({
            ...editedUserStoreRelations,
            [row.id]: { ...(editedUserStoreRelations[row.id] ? editedUserStoreRelations[row.id] : row.original), UserID: value },
          }),
      }),
    },      
    {
      accessorKey: 'StoreID',
      header: 'Store ID',
      editable: false,
      editVariant: 'select',
      mantineEditSelectProps: ({ row }) => ({
        data: storeLabels,
        //store edited UserStoreRelation in state to be saved later
        onChange: (value: any) =>
          setEditedUserStoreRelations({
            ...editedUserStoreRelations,
            [row.id]: { ...(editedUserStoreRelations[row.id] ? editedUserStoreRelations[row.id] : row.original), StoreID: value },
          }),
      }),
    },    
  ],
  [editedUserStoreRelations, validationErrors, userLabels, storeLabels],
);

const table = useMantineReactTable(
  {
    columns,
    data: fetchedUserStoreRelations,
    createDisplayMode: 'row', // ('modal', and 'custom' are also available)
    editDisplayMode: 'table', // ('modal', 'row', 'cell', and 'custom' are also available)
    enableEditing: true,
    enableRowActions: true,
    positionActionsColumn: 'last',
    getRowId: (row) => row.RelationID,
    mantineToolbarAlertBannerProps: isLoadingUserStoreRelationsError
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
    mantineTableProps: {     
      className: 'custom-table',
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateUserStoreRelation,
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
        onClick={handleSaveUserStoreRelations}
        disabled={
          Object.keys(editedUserStoreRelations).length === 0 ||
          Object.values(validationErrors).some((error) => !!error)
        }
        loading={isUpdatingUserStoreRelation}
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
        Create New User & Store Relation
      </Button>
    ),
    state: {
      isLoading: isLoadingUserStoreRelations,
      isSaving: isCreatingUserStoreRelation || isUpdatingUserStoreRelation || isDeletingUserStoreRelation,
      showAlertBanner: isLoadingUserStoreRelationsError,
      showProgressBars: isFetchingUserStoreRelations,
    },
  });

  return <MantineReactTable table={table} />;
};

//CREATE hook (post new user to api)
function useCreateUserStoreRelation() {
const queryClient = useQueryClient();
return useMutation({
  mutationFn: async (relation: UserStoreRelation) => {
    //send api create request here
    const result = await CreateUserStoreRelation(relation);
    return result;    
  },
  //client side optimistic update
  onMutate: (newUserStoreRelationInfo: UserStoreRelation) => {
    queryClient.setQueryData(
      ['relations'],
      (prevUserStoreRelations: any) =>
        [
          ...prevUserStoreRelations,
          {
            ...newUserStoreRelationInfo,
            id: (Math.random() + 1).toString(36).substring(7),
          },
        ] as UserStoreRelation[],
    );
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['relations'] }), //refetch users after mutation, disabled for demo
});
}

//READ hook (get users from api)
function useGetUserStoreRelations(loginUser: Users) {
  return useQuery<UserStoreRelation[]>({
    queryKey: ['relations'],
    queryFn: async () => {
      //send api request here
      const relationData = await GetMyUserStoreRelations(loginUser.UserID);
      const relations: UserStoreRelation[] = relationData.map((relation) => (
        {
          RelationID: relation.RelationID,
          UserID: relation.UserID,
          StoreID: relation.StoreID.toString()
        }
      ));
      return relations ? relations : [];
    },
    refetchOnWindowFocus: false,
  });
}

//UPDATE hook (put users in api)
function useUpdateUserStoreRelations() {
const queryClient = useQueryClient();
return useMutation({
  mutationFn: async (relations: UserStoreRelation[]) => {
    //send api update request here
    const result = await UpdateUserStoreRelations(relations);
    return result;
  },
  //client side optimistic update
  onMutate: (newUserStoreRelations: UserStoreRelation[]) => {
    queryClient.setQueryData(
      ['relations'],
      (prevUserStoreRelations: any) =>
        prevUserStoreRelations?.map((relation: UserStoreRelation) => {
          const newUserStoreRelation = newUserStoreRelations.find((u) => u.RelationID === relation.RelationID);
          return newUserStoreRelation ? newUserStoreRelation : relation;
        }),
    );
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['relations'] }), //refetch stores after mutation, disabled for demo
});
}

//DELETE hook (delete UserStoreRelation in api)
function useDeleteUserStoreRelation() {
const queryClient = useQueryClient();
return useMutation({
  mutationFn: async (relationId: number) => {
    //send api update request here
    const result = await DeleteUserStoreRelation(relationId);
    return result;    
  },
  //client side optimistic update
  onMutate: (relationId: number) => {
    queryClient.setQueryData(
      ['relations'],
      (prevUserStoreRelations: any) =>
        prevUserStoreRelations?.filter((relation: UserStoreRelation) => relation.RelationID !== relationId),
    );
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['relations'] }), //refetch UserStoreRelations after mutation, disabled for demo
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

function validateUserStoreRelation(relation: UserStoreRelation) {
return {
  UserID: !validateRequired(relation.UserID)
    ? 'User ID is Required'
    : '',    
    StoreID: !validateRequired(relation.StoreID.toString())
    ? 'Store ID is Required'
    : '',    
};
}

export default UserStoreRelationMantineTable;  