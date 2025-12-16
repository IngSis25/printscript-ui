import {Autocomplete, Box, Button, Divider, FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField, Typography} from "@mui/material";
import {ModalWrapper} from "../common/ModalWrapper.tsx";
import {useGetUsers} from "../../utils/queries.tsx";
import {useEffect, useState} from "react";
import {User} from "../../utils/users.ts";

type PermissionRole = "Editor" | "Viewer";

type ShareSnippetModalProps = {
  open: boolean
  onClose: () => void
  onShare: (userEmail: string, role: PermissionRole) => void
  loading: boolean
}

export const ShareSnippetModal = (props: ShareSnippetModalProps) => {
  const {open, onClose, onShare, loading} = props
  const [name, setName] = useState("")
  const [debouncedName, setDebouncedName] = useState("")
  const {data, isLoading} = useGetUsers(debouncedName, 1, 5)
  const [selectedUser, setSelectedUser] = useState<User | undefined>()
  const [selectedRole, setSelectedRole] = useState<PermissionRole>("Editor")

  useEffect(() => {
    const getData = setTimeout(() => {
      setDebouncedName(name)
    }, 500)
    return () => clearTimeout(getData)
  }, [name])

  function handleSelectUser(newValue: User | null) {
    newValue && setSelectedUser(newValue)
  }

  const handleShare = () => {
    if (selectedUser) {
      // selectedUser.name es el email del usuario según la estructura
      onShare(selectedUser.name, selectedRole)
      // Reset form after sharing
      setSelectedUser(undefined)
      setSelectedRole("Editor")
      setName("")
      onClose()
    }
  }

  return (
      <ModalWrapper open={open} onClose={onClose}>
        <Typography variant={"h5"}>Share your snippet</Typography>
        <Divider/>
        <Box mt={2}>
          <Autocomplete
              renderInput={(params) => <TextField {...params} label="Type the user's name"/>}
              options={data?.users ?? []}
              isOptionEqualToValue={(option, value) =>
                  option.id === value.id
              }
              getOptionLabel={(option) => option.name}
              loading={isLoading}
              value={selectedUser}
              onInputChange={(_: unknown, newValue: string | null) => newValue && setName(newValue)}
              onChange={(_: unknown, newValue: User | null) => handleSelectUser(newValue)}
              filterOptions={(x) => x}
          />
          
          <FormControl fullWidth sx={{ mt: 3 }}>
            <InputLabel id="permission-role-label">Permissions</InputLabel>
            <Select
              labelId="permission-role-label"
              id="permission-role-select"
              value={selectedRole}
              label="Permissions"
              onChange={(e) => setSelectedRole(e.target.value as PermissionRole)}
            >
              <MenuItem value="Editor">
                <Box>
                  <Typography variant="body1" fontWeight="bold">Editor (Full Access)</Typography>
                  <Typography variant="caption" color="text.secondary">Read and write access</Typography>
                </Box>
              </MenuItem>
              <MenuItem value="Viewer">
                <Box>
                  <Typography variant="body1" fontWeight="bold">Viewer (Read Only)</Typography>
                  <Typography variant="caption" color="text.secondary">Read access only</Typography>
                </Box>
              </MenuItem>
            </Select>
            <FormHelperText>Choose what permissions the user will have</FormHelperText>
          </FormControl>

          <Box mt={4} display={"flex"} width={"100%"} justifyContent={"flex-end"}>
            <Button onClick={onClose} variant={"outlined"}>Cancel</Button>
            <Button disabled={!selectedUser || loading} onClick={handleShare} sx={{marginLeft: 2}} variant={"contained"}>Share</Button>
          </Box>
        </Box>
      </ModalWrapper>
  )
}
