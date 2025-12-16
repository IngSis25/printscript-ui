import {ReactNode, useState} from "react";
import {Alert, AlertColor, Snackbar} from "@mui/material";
import {SnackbarContext, SnackBarType} from "./snackbarContext.tsx";

export const SnackbarProvider = ({children}: { children: ReactNode }) => {
  const [snackbars, setSnackbars] = useState<SnackBarType[]>([])

  const handleAddSnackbar = (severity: AlertColor, text: string) => {
    setSnackbars(prevState => [...prevState, {
      severity, text
    }])
  }

  const handleDeleteSnackbar = (snackbar: SnackBarType) => {
    setSnackbars(prevState => prevState.filter(x => x != snackbar))
  }


  return (
      <SnackbarContext.Provider value={{
        active: snackbars,
        createSnackbar: handleAddSnackbar
      }}>
        {children}
        <>
          {
            snackbars.map((snackbar,i) => (
                <Snackbar 
                  key={i} 
                  open={snackbars.includes(snackbar)} 
                  autoHideDuration={6000}
                  // Asegurar que el Snackbar aparezca por encima de los Modals (z-index 1300)
                  // Material-UI Snackbar tiene z-index 1400 por defecto, pero lo hacemos explícito
                  // y aumentamos ligeramente para evitar conflictos con overlays
                  sx={{ zIndex: 1500 }}
                  // Configurar la duración de la transición para que Cypress pueda esperarla correctamente
                  TransitionProps={{ timeout: { enter: 225, exit: 195 } }}
                >
                  <Alert
                      onClose={() => handleDeleteSnackbar(snackbar)}
                      severity={snackbar.severity}
                      variant="filled"
                      sx={{width: '100%'}}
                  >
                    {snackbar.text}
                  </Alert>
                </Snackbar>
            ))
          }
        </>
      </SnackbarContext.Provider>
  )
}
