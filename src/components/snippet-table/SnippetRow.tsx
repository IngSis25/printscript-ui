import {alpha, Skeleton, styled, TableRow, TableRowProps} from "@mui/material";
import {StyledTableCell} from "./SnippetTable.tsx";
import {Snippet} from "../../utils/snippet.ts";

const StyledTableRow = styled(TableRow)(({theme}) => ({
  backgroundColor: 'white',
  border: 0,
  height: '75px',
  cursor: 'pointer',
  '& td': {
    borderTop: '2px solid transparent',
    borderBottom: '2px solid transparent',
  },
  '& td:first-of-type': {
    borderLeft: '2px solid transparent',
    borderTopLeftRadius: theme.shape.borderRadius,
    borderBottomLeftRadius: theme.shape.borderRadius,
  },
  '& td:last-of-type': {
    borderRight: '2px solid transparent',
    borderTopRightRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
  },
  '&:hover > td': {
    borderTop: `2px ${theme.palette.primary.light} solid`,
    borderBottom: `2px ${theme.palette.primary.light} solid`,
    backgroundColor: alpha(theme.palette.primary.light, 0.2)
  },
  '&:hover > td:first-of-type': {
    borderLeft: `2px ${theme.palette.primary.light} solid`,
  },
  '&:hover > td:last-of-type': {
    borderRight: `2px ${theme.palette.primary.light} solid`
  },
}));


// Función para formatear el compliance de forma más legible
const formatCompliance = (compliance?: string): string => {
  if (!compliance) return '-';
  switch (compliance.toLowerCase()) {
    case 'pending':
      return 'Pendiente';
    case 'failed':
      return 'Fallido';
    case 'not-compliant':
    case 'not_compliant':
      return 'No conforme';
    case 'compliant':
    case 'success':
      return 'Conforme';
    default:
      return compliance;
  }
};

export const SnippetRow = ({snippet, onClick, ...props}: { snippet: Snippet, onClick: () => void } & TableRowProps) => {
  return (
      <StyledTableRow onClick={onClick} sx={{backgroundColor: 'white', border: 0, height: '75px'}} {...props}>
        <StyledTableCell>{snippet.name}</StyledTableCell>
        <StyledTableCell>{snippet.language}</StyledTableCell>
        <StyledTableCell>{snippet.author || snippet.owner || '-'}</StyledTableCell>
        <StyledTableCell>{formatCompliance(snippet.compliance || snippet.status)}</StyledTableCell>
      </StyledTableRow>
  )
}

export const LoadingSnippetRow = () => {
  return (
      <TableRow sx={{height: '75px', padding: 0}}>
        <StyledTableCell colSpan={4} sx={{
          padding: 0
        }}>
          <Skeleton height={"75px"} width={"100%"} variant={"rectangular"}/>
        </StyledTableCell>
      </TableRow>
  )
}

