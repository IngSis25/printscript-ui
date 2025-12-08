import {Autocomplete, Box, Button, Divider, TextField, Typography} from "@mui/material";
import {ModalWrapper} from "../common/ModalWrapper.tsx";
import {useGetUsers} from "../../utils/queries.tsx";
import {useEffect, useMemo, useState} from "react";
import {User} from "../../utils/users.ts";

type ShareSnippetModalProps = {
  open: boolean
  onClose: () => void
  onShare: (userEmail: string) => void
  loading: boolean
  users?: User[]
  usersLoading?: boolean
}
export const ShareSnippetModal = (props: ShareSnippetModalProps) => {
  const {open, onClose, onShare, loading, users: usersProp, usersLoading: usersLoadingProp} = props
  const [name, setName] = useState("")
  const [debouncedName, setDebouncedName] = useState("")
  const {data, isLoading: isLoadingInternal} = useGetUsers(debouncedName, 1, 5)
  const [selectedUser, setSelectedUser] = useState<User | undefined>()

  // Si users se proporciona como prop, usarlos. Si no, usar la búsqueda interna
  const users = usersProp ?? data?.users ?? []
  const isLoading = usersLoadingProp ?? isLoadingInternal

  // Filtrar usuarios localmente si se proporcionan como prop
  const filteredUsers = useMemo(() => {
    if (usersProp && name.trim()) {
      const searchLower = name.toLowerCase()
      return usersProp.filter(user => 
        user.name.toLowerCase().includes(searchLower)
      )
    }
    return users
  }, [usersProp, users, name])

  useEffect(() => {
    if (!usersProp) {
      // Solo usar debounce si no se proporcionan usuarios como prop
      const getData = setTimeout(() => {
        setDebouncedName(name)
      }, 500)
      return () => clearTimeout(getData)
    }
  }, [name, usersProp])

  function handleSelectUser(newValue: User | null) {
    newValue && setSelectedUser(newValue)
  }

  return (
      <ModalWrapper open={open} onClose={onClose}>
        <Typography variant={"h5"}>Share your snippet</Typography>
        <Divider/>
        <Box mt={2}>
          <Autocomplete
              renderInput={(params) => <TextField {...params} label="Type the user's name"/>}
              options={filteredUsers}
              isOptionEqualToValue={(option, value) =>
                  option.id === value.id
              }
              getOptionLabel={(option) => option.name}
              loading={isLoading}
              value={selectedUser}
              inputValue={name}
              onInputChange={(_: unknown, newValue: string) => setName(newValue)}
              onChange={(_: unknown, newValue: User | null) => handleSelectUser(newValue)}
              freeSolo={false}
              filterOptions={(x) => x} // Deshabilitar filtrado local, usar solo los resultados del servidor o el filtrado manual
          />
          <Box mt={4} display={"flex"} width={"100%"} justifyContent={"flex-end"}>
            <Button onClick={onClose} variant={"outlined"}>Cancel</Button>
            <Button disabled={!selectedUser || loading} onClick={() => selectedUser && onShare(selectedUser.name)} sx={{marginLeft: 2}} variant={"contained"}>Share</Button>
          </Box>
        </Box>
      </ModalWrapper>
  )
}
