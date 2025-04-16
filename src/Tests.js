import React, { useState, useEffect, useMemo } from "react";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";

import {
  Stack,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  tableCellClasses,
} from "@mui/material";
import Status from "./Status";
import MaterialUISwitch from "./MaterialUISwitch";

const DASHBOARDS = {
  unstable: [
    "https://jenkins.com.int.zone/view/Tests/view/master/view/abondarenko/",
    "https://jenkins.com.int.zone/view/Tests/view/master/view/eoktyabrskiy/",
    //    "https://jenkins.com.int.zone/view/Tests/view/master/view/rbesolov/",
    "https://jenkins.com.int.zone/view/Tests/view/master/view/nnetesov/",
    "https://jenkins.com.int.zone/view/Tests/view/master/view/vkopchenin/",

    "https://jenkins.com.int.zone/job/idp-backend/job/master/job/tests/job/master/view/%20 All-launches",
    "https://jenkins.com.int.zone/job/idp-backend/job/release-5.0/job/tests/job/master/view/%20 All-launches",
    "https://jenkins.com.int.zone/job/idp-backend/job/release-4.2/job/tests/job/master/view/%20 All-launches",

    "https://jenkins.com.int.zone/job/uam/job/master/job/tests/job/master/view/%20 All-launches",
    "https://jenkins.com.int.zone/job/uam/job/release-3.0/job/tests/job/master/view/%20 All-launches",
    "https://jenkins.com.int.zone/job/uam/job/release-2.1/job/tests/job/master/view/%20 All-launches",

    "https://jenkins.com.int.zone/job/gdpr-backend/job/master/job/tests/job/master/view/%20 All-launches",

    // "https://jenkins.com.int.zone/job/inhouse-products/job/master/job/tests/job/master/view/%20 All-launches",
    // "https://jenkins.com.int.zone/job/inhouse-products/job/3.0/job/tests/job/master/view/%20 All-launches",
    // "https://jenkins.com.int.zone/job/inhouse-products/job/2.4/job/tests/job/master/view/%20 All-launches",
  ],
  "cb-21": [
    "https://jenkins.com.int.zone/view/Tests/view/21/view/abondarenko/",
    "https://jenkins.com.int.zone/view/Tests/view/21/view/eoktyabrskiy/",
    //    "https://jenkins.com.int.zone/view/Tests/view/21/view/rbesolov/",
    "https://jenkins.com.int.zone/view/Tests/view/21/view/nnetesov/",
    "https://jenkins.com.int.zone/view/Tests/view/21/view/vkopchenin/",

    "https://jenkins.com.int.zone/job/idp-backend/job/master/job/tests/job/21/view/%20 All-launches",
    "https://jenkins.com.int.zone/job/idp-backend/job/release-5.0/job/tests/job/21/view/%20 All-launches",
    "https://jenkins.com.int.zone/job/idp-backend/job/release-4.2/job/tests/job/21/view/%20 All-launches",

    "https://jenkins.com.int.zone/job/uam/job/master/job/tests/job/21/view/%20 All-launches",
    "https://jenkins.com.int.zone/job/uam/job/release-3.0/job/tests/job/21/view/%20 All-launches",
    "https://jenkins.com.int.zone/job/uam/job/release-2.1/job/tests/job/21/view/%20 All-launches",

    "https://jenkins.com.int.zone/job/gdpr-backend/job/master/job/tests/job/21/view/%20 All-launches",

    // "https://jenkins.com.int.zone/job/inhouse-products/job/master/job/tests/job/21/view/%20 All-launches",
    // "https://jenkins.com.int.zone/job/inhouse-products/job/3.0/job/tests/job/21/view/%20 All-launches",
    // "https://jenkins.com.int.zone/job/inhouse-products/job/2.4/job/tests/job/21/view/%20 All-launches",
  ],
};

const TEST_NAME_CORRECTIONS = {
  //'IDP : upgrade-idp-backend': 'IDP : idp-upgrade'
};

function fix_url(url) {
  url = url.replace(
    "https://jenkins.com.int.zone",
    "https://dashboard.cloud-blue.online/jenkins",
  );
  return url;
}

function comporator(field, order) {
  function nameComporator(a, b) {
    return a.testName.localeCompare(b.testName);
  }

  function weightComporator(a, b) {
    const aWeight = a.weightHolder.weight;
    const bWeight = b.weightHolder.weight;
    if (aWeight === bWeight) {
      return 0;
    } else {
      return aWeight > bWeight ? -1 : 1;
    }
  }

  const sign = order === "asc" ? 1 : -1;

  return (a, b) => {
    switch (field) {
      case "name": {
        const result = nameComporator(a, b);
        if (result === 0) {
          return weightComporator(a, b) * sign;
        }
        return result * sign;
      }

      case "weight":
      default: {
        const result = weightComporator(a, b);
        if (result === 0) {
          return nameComporator(a, b) * sign;
        }

        return result * sign;
      }
    }
  };
}

async function xhr(url) {
  url = fix_url(url);
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.log(error);
    return {};
  }
}

async function fetchSvgText(buildUrl, preferStableBuild, timestamp) {
  const urlStable = new URL(fix_url(buildUrl) + "badge/icon");
  urlStable.searchParams.append("timestamp", timestamp);
  urlStable.searchParams.append("link", `${buildUrl}/\${buildId}`);
  urlStable.searchParams.append("build", "last:${params.BUILD_NAME=}");

  const urlComponent = new URL(fix_url(buildUrl) + "badge/icon");
  urlComponent.searchParams.append("link", `${buildUrl}/\${buildId}`);
  urlComponent.searchParams.append(
    "subject",
    "${params.COMPONENT_NAME}-${params.BUILD_NAME}",
  );

  const prferableUrl = preferStableBuild ? urlStable : urlComponent;

  const preferableResponsePromise = fetch(prferableUrl).then((response) =>
    response.text(),
  );
  const preferableResponseText = await preferableResponsePromise;

  const isPreferebleNOK =
    preferableResponseText.includes("not run</text>") ||
    preferableResponseText.includes("-</text>");
  if (isPreferebleNOK) {
    const alternativeUrl = !preferStableBuild ? urlStable : urlComponent;
    const alternativeResponsePromise = fetch(alternativeUrl).then((response) =>
      response.text(),
    );
    const alternativeResponseText = await alternativeResponsePromise;

    // const isAlternativeNOK = alternativeResponseText.includes("not run</text>") || alternativeResponseText.includes('>params.'); // there is unresolved param in alternative response. not applicable for when stable is alternative
    // if (isAlternativeNOK) {
    //   return [prferableUrl, preferableResponseText];
    // } else {
    if (alternativeResponseText.includes("not run</text>")) {
      return preferStableBuild
        ? [prferableUrl, preferableResponseText.replace("/buildId", "")]
        : [alternativeUrl, alternativeResponseText.replace("/buildId", "")];
    } else {
      return [alternativeUrl, alternativeResponseText];
    }
    //}
  }

  return [prferableUrl, preferableResponseText];
}

function getStatus(svgText) {
  const running = svgText.includes(">running</text>");
  const stable =
    svgText.includes('fill="#44cc11"/>') || svgText.includes(">not run</text>");
  return { running: running, stable: stable };
}

const CORE_COMPONENTS = ["OSS", "BSS", "BRANDING"];
function jobName(name, url) {
  const parts = url.split("/job/");
  const branch = parts[2];
  const branch_parts = branch.split("-");
  const version = branch_parts[branch_parts.length - 1];

  const group = parts[1].split("-")[0].toUpperCase();
  if (CORE_COMPONENTS.includes(group)) {
    return `${group} : ${name}`;
  } else {
    return `${group}/${version} : ${name}`;
  }
}

function toRows(tests) {
  const rows = Object.entries(tests).map(([testName, boards]) => {
    const weightHolder = {
      weight: -1,
    };

    const statuses = Object.entries(boards).map(([dashboardId, data]) => {
      const rowKeyTemplate = testName + "-" + dashboardId;

      if (data) {
        const weight =
          (data.status.stable ? 0 : 10) + (data.status.running ? 5 : 0);
        weightHolder.weight = Math.max(weightHolder.weight, weight);
        const board = {
          svgText: data.svgText,
          imageUrl: data.url,
          buildUrl: data.buildUrl,
        };
        return <Status key={rowKeyTemplate + "-status"} board={board} />;
      } else {
        return "";
      }
    });

    return {
      testName: testName,
      status: statuses,
      weightHolder: weightHolder,
    };
  });

  return rows;
}

function Tests() {
  const [loaded, setLoaded] = useState(false);
  const [rows, setRows] = useState([]);
  const defaultSort = { field: "weight", order: "asc" };
  const [sort, setSort] = useState(defaultSort);
  const sortComporator = useMemo(
    () => comporator(sort.field, sort.order),
    [sort],
  );
  const [amountOfFailedTests, setAmountOfFailedTests] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(0);

  async function fetchTests() {
    const dashboardsPromises = Object.entries(DASHBOARDS).map(async (e) => {
      const [dashboardId, views] = e;
      const viewPromises = views.map((viewUrl) => {
        let url = viewUrl + "/api/json?tree=jobs[name,url,lastBuild[timestamp]]";
        return xhr(url).then((response) => {
          const jobs = response["jobs"] || [];
          const promises = jobs.map(async (job) => {
            let name = jobName(job.name, job.url);
            name = TEST_NAME_CORRECTIONS[name] || name;

            const timestamp = (job.lastBuild || {}).timestamp || Date.now();

            const preferStableBuild = dashboardId === "unstable";
            const [url, svgText] = await fetchSvgText(
              job.url,
              preferStableBuild,
              timestamp
            );
            const status = getStatus(svgText);

            return [name, url, job.url, svgText, status];
          });
          return Promise.all(promises);
        });
      });

      const viewTests = await Promise.all(viewPromises);

      const boardTests = viewTests.reduce((acc, value) => {
        acc = acc || {};
        value.forEach((item) => {
          const [name, url, buildUrl, svgText, status] = item;
          acc[name] = {
            url: url,
            buildUrl: buildUrl,
            svgText: svgText,
            status: status,
          };
        });

        return acc;
      }, {});

      return [dashboardId, boardTests];
    });

    const dashboardsValues = await Promise.all(dashboardsPromises);

    const dashboardTests = dashboardsValues.reduce((acc, value) => {
      const [dashboardId, tests] = value;
      Object.entries(tests).reduce((acc, e) => {
        const [testName, data] = e;
        let boards = acc[testName] || {};
        boards[dashboardId] = data;
        acc[testName] = boards;
        return acc;
      }, acc);

      return acc;
    }, {});

    const amountOfFailedTests = Object.entries(dashboardTests).reduce(
      (acc, [name, tests]) => {
        const amount = Object.entries(tests).reduce((acc, [_, data]) => {
          if (acc !== 0) {
            return acc;
          } else {
            const amount = data.status.stable ? 0 : 1;
            return acc + amount;
          }
        }, 0);

        return acc + amount;
      },
      0,
    );

    setAmountOfFailedTests(amountOfFailedTests);
    const rows = toRows(dashboardTests);
    setRows(rows);
    setRowsPerPage(
      amountOfFailedTests !== 0 ? amountOfFailedTests : rows.length,
    );
  }

  useEffect(() => {
    if (!loaded) {
      setLoaded(true);
      fetchTests();
    }
  }, [loaded]);

  const visibleRows = useMemo(
    () =>
      rows
        .toSorted(sortComporator)
        .map((row) => {
          return [row.testName, ...row.status];
        })
        .slice(0, rowsPerPage),
    [rows, rowsPerPage, sortComporator],
  );

  if (!loaded || rows.length === 0) {
    return false;
  }

  const dashboards = Object.keys(DASHBOARDS);

  return (
    <TableContainer component={Paper} key="tests-TableContainer">
      <Table
        size="small"
        sx={{
          [`& .${tableCellClasses.root}`]: {
            border: "none",
          },
        }}
        key="tests-Table"
      >
        <TableHead key="tests-head">
          <TableRow>
            <TableCell key="tests-name">
              <TableSortLabel
                active={sort.field === "name"}
                direction={sort.field === "name" ? sort.order : "asc"}
                onClick={() => {
                  const currentDirection =
                    sort.field === "name" ? sort.order : "desc";
                  const order = currentDirection === "desc" ? "asc" : "desc";
                  setRowsPerPage(rows.length);
                  setSort({ field: "name", order: order });
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <MaterialUISwitch
                    size="small"
                    onChange={() => {
                      if (rowsPerPage === amountOfFailedTests) {
                        setRowsPerPage(rows.length);
                      } else {
                        setSort(defaultSort);
                        setRowsPerPage(amountOfFailedTests);
                      }
                    }}
                    disabled={amountOfFailedTests === 0}
                    checked={rowsPerPage !== amountOfFailedTests}
                  />
                </Stack>
              </TableSortLabel>
            </TableCell>
            {dashboards.map((key) => {
              return (
                <TableCell key={key}>
                  <TableSortLabel
                    active={sort.field === key}
                    direction={sort.field === key ? sort.order : "asc"}
                    onClick={() => {
                      const currentDirection =
                        sort.field === key ? sort.order : "desc";
                      const order =
                        currentDirection === "desc" ? "asc" : "desc";
                      setRowsPerPage(rows.length);
                      setSort({ field: key, order: order });
                    }}
                  >
                    {key}
                  </TableSortLabel>
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody key="tests-body">
          {visibleRows.map((row) => {
            return (
              <TableRow>
                {row.map((column) => {
                  return <TableCell>{column}</TableCell>;
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
export default Tests;
