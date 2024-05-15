import React from "react";
import { Box, Collapse, IconButton, Table, TableCell, TableHead, TableRow } from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import Status from "./Status";

function CollapsibleRow({ dashboards, tests, isStable, isOpen }) {
  const [open, setOpen] = React.useState(isOpen);

  return (
    <React.Fragment>
      <TableRow>
        <TableCell>
          <IconButton
            size="small"
            onClick={() => setOpen(!open)}
          >
            {
              open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />
            }
          </IconButton>
        </TableCell>
        <TableCell>
          {
            isStable ? "Passed Tests" : "Failed Tests"
          }
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box>
              <Table size="small">
                <TableHead>
                  <TableCell />
                  {dashboards.map((key) => {
                    return <TableCell key={key}>{key}</TableCell>
                  })}
                </TableHead>
                {tests.map((test) => (
                  <TableRow key={test.name}>
                    <TableCell>
                      {test.name}
                    </TableCell>
                    {
                      test.boards.map((board) => {
                        if (board) {
                          return (
                            <TableCell key={board.buildUrl} >
                              <Status board={board} />
                            </TableCell>
                          );
                        } else {
                          return (<TableCell />);
                        }
                      })
                    }
                  </TableRow>
                ))}
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default CollapsibleRow;
