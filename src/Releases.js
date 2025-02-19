import Table from "@mui/material/Table";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import Status from "./Status";
import { TableBody, TableHead } from "@mui/material";

const CB_VERSIONS = ["unstable", "21.19", "21.18"];
const IDP_VERSIONS = ["master", "release-5.0", "release-4.2"];
const UAM_VERSIONS = ["master", "release-3.0", "release-2.1"];
const INHOUSE_VERSIONS = ["master", "3.1", "3.0"];

const COMPONENTS = {
  OSS: CB_VERSIONS.map((version) => {
    return {
      buildUrl: `https://jenkins.com.int.zone/job/oss/job/${version}/job/validate-and-promote/`,
    };
  }),
  BSS: CB_VERSIONS.map((version) => {
    return {
      buildUrl: `https://jenkins.com.int.zone/job/bss/job/${version}/job/validate-and-promote/`,
    };
  }),
  "Branding UI Cluster": CB_VERSIONS.map((version) => {
    return {
      buildUrl: `https://jenkins.com.int.zone/job/branding-ui-cluster/job/${version}/job/validate-and-promote/`,
    };
  }),
  IDP: IDP_VERSIONS.map((version) => {
    return {
      buildUrl: `https://jenkins.com.int.zone/job/idp-backend/job/${version}/job/validate-and-promote/`,
    };
  }),
  UAM: UAM_VERSIONS.map((version) => {
    return {
      buildUrl: `https://jenkins.com.int.zone/job/uam/job/${version}/job/validate-and-promote/`,
    };
  }),
  GDPR: {
    buildUrl:
      "https://jenkins.com.int.zone/job/gdpr-backend/job/master/job/validate-and-promote/",
  },
  INHOUSE: INHOUSE_VERSIONS.map((version) => {
    return {
      buildUrl: `https://jenkins.com.int.zone/job/inhouse-products/job/${version}/job/validate-and-promote/`,
    };
  }),
  "E2E SDK": CB_VERSIONS.map((version) => {
    return {
      buildUrl: `https://jenkins.com.int.zone/job/e2e-tests-v2/job/${version}/job/validate-and-promote/`,
    };
  }),
};

function Releases() {
  return (
    <TableContainer component={Paper} key="releases-table-container">
      <Table
        sx={{
          [`& .${tableCellClasses.root}`]: {
            border: "none",
          },
        }}
        size="small"
        key="releases-table"
      >
        <TableHead key="releases-head">
          <TableRow>
            <TableCell key="releases-head-name"></TableCell>
            <TableCell key="releases-head-unstable">Unstable</TableCell>
            <TableCell key="releases-head-realeases">Releases</TableCell>
          </TableRow>
        </TableHead>
        <TableBody key="releases-body">
          {Object.entries(COMPONENTS).map(([name, components]) => {
            return (
              <TableRow key={name}>
                <TableCell>{name}</TableCell>
                {(Array.isArray(components) ? components : [components]).map(
                  (component, index) => {
                    const buildStatus = {
                      buildUrl: component.buildUrl,
                      imageUrl:
                        component.buildUrl +
                        `badge/icon?&subject=\${params.BUILD_NAME}`,
                    };

                    const key = `${name}-${index}`;

                    return (
                      <TableCell key={key}>
                        <Status board={buildStatus} key={key + "-status"} />
                      </TableCell>
                    );
                  },
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
export default Releases;
