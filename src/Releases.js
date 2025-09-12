import Table from "@mui/material/Table";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import { buildSvgText, evaluateBuildData, Status } from "./Status";
import { TableBody } from "@mui/material";
import { useEffect, useState } from "react";

import { DYNAMIC_COMPONENTS, fetchComponentValidateAndPromodeJobs } from "./dynamicComponents";

const DYNAMIC_RELEASES = {
  OSS: ['https://jenkins.com.int.zone/job/oss', 'https://jenkins.com.int.zone/job/oss/job/release'],
  BSS: ['https://jenkins.com.int.zone/job/bss', 'https://jenkins.com.int.zone/job/bss/job/release'],
  "Branding UI": ['https://jenkins.com.int.zone/job/branding-ui-cluster', 'https://jenkins.com.int.zone/job/branding-ui-cluster/job/release'],
  E2E: ['https://jenkins.com.int.zone/job/e2e-tests-v2', 'https://jenkins.com.int.zone/job/e2e-tests-v2/job/release']
};


function Releases() {

  const [dynamicReleases, setDynamicReleases] = useState({});

  useEffect(() => {
    if (Object.keys(dynamicReleases).length !== 0) {
      return;
    }

    async function wrapper() {
      const validateAndPromodeJobs = await fetchComponentValidateAndPromodeJobs({ ...DYNAMIC_RELEASES, ...DYNAMIC_COMPONENTS })

      const releasesPromises = Object.entries(validateAndPromodeJobs)
        .map(async ([name, validateAndPromoteJobs]) => {
          const buildsDataPromises = validateAndPromoteJobs
            .map(async (validateAndPromoteJob) => {
              const builds = validateAndPromoteJob["builds"] || [];
              const data = await evaluateBuildData(builds, false);
              const svgText = buildSvgText(data)
              return {
                buildUrl: validateAndPromoteJob.url,
                svgText: svgText,
              };
            });

          const data = await Promise.all(buildsDataPromises);
          const result = {};
          result[name] = data;

          return result;
        })
        .reduce(async (acc, value) => {
          const resolvedAcc = await acc;
          const resoledValue = await value;
          return { ...resolvedAcc, ...resoledValue };
        });


      const releases = await releasesPromises;

      setDynamicReleases(releases);
    }

    wrapper();
  }, [dynamicReleases]);


  console.log(dynamicReleases);

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
        <TableBody key="releases-body">
          {Object.entries({ ...dynamicReleases }).map(([name, components]) => {
            return (
              <TableRow key={name}>
                <TableCell>{name}</TableCell>
                {(Array.isArray(components) ? components : [components]).map(
                  (component, index) => {

                    const buildStatus = {
                      buildUrl: component.buildUrl,
                      svgText: component.svgText
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
