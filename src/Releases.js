import Table from '@mui/material/Table';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Status from "./Status";
import { TableBody, TableHead } from '@mui/material';

const STABLE_VERSION_21_18 = "21.18";
const STABLE_VERSION_21_17 = "21.17";
const UNSTABLE_VERSION = "unstable"

const IDP_UNSTABLE_VERSION = "master";
const IDP_STABLE_VERSION_4_2 = "release-4.2";
const IDP_STABLE_VERSION_4_1 = "release-4.1";

const UAM_UNSTABLE_VERSION = "master";
const UAM_STABLE_VERSION_3_0 = "release-3.0";
const UAM_STABLE_VERSION_2_1 = "release-2.1";

const DM_UNSTABLE_VERSION = "master";
const DM_STABLE_VERSION_1_5 = "release-1.5";
const DM_STABLE_VERSION_1_4 = "release-1.4";

const INHOUSE_UNSTABLE_VERSION = "master";
const INHOUSE_VERSION_3_0 = "3.0";
const INHOUSE_VERSION_2_4 = "2.4";


const COMPONENTS = {
    "OSS": [
        {
            "buildUrl": `https://jenkins.com.int.zone/job/oss/job/${UNSTABLE_VERSION}/job/validate-and-promote/`,
        },
        {
            "buildUrl": `https://jenkins.com.int.zone/job/oss/job/${STABLE_VERSION_21_18}/job/validate-and-promote/`,
        },
        {
            "buildUrl": `https://jenkins.com.int.zone/job/oss/job/${STABLE_VERSION_21_17}/job/validate-and-promote/`,
        }
    ],
    "BSS": [
        {
            "buildUrl": `https://jenkins.com.int.zone/job/bss/job/${UNSTABLE_VERSION}/job/validate-and-promote/`,
        },
        {
            "buildUrl": `https://jenkins.com.int.zone/job/bss/job/${STABLE_VERSION_21_18}/job/validate-and-promote/`,
        },
        {
            "buildUrl": `https://jenkins.com.int.zone/job/bss/job/${STABLE_VERSION_21_17}/job/validate-and-promote/`,
        }
    ],
    "Branding UI Cluster": [
        {
            "buildUrl": `https://jenkins.com.int.zone/job/branding-ui-cluster/job/${UNSTABLE_VERSION}/job/validate-and-promote/`,
        },
        {
            "buildUrl": `https://jenkins.com.int.zone/job/branding-ui-cluster/job/${STABLE_VERSION_21_18}/job/validate-and-promote/`,
        },
        {
            "buildUrl": `https://jenkins.com.int.zone/job/branding-ui-cluster/job/${STABLE_VERSION_21_17}/job/validate-and-promote/`,
        }
    ],
    "Rating Engine": {
        "buildUrl": "https://jenkins.com.int.zone/job/ratingengine-backend/job/master/job/validate-and-promote/",
    },
    "Discount Manager": [
        {
            "buildUrl": `https://jenkins.com.int.zone/job/discountmanager/job/${DM_UNSTABLE_VERSION}/job/validate-and-promote/`
        },
        {
            "buildUrl": `https://jenkins.com.int.zone/job/discountmanager/job/${DM_STABLE_VERSION_1_5}/job/validate-and-promote/`
        },
        {
            "buildUrl": `https://jenkins.com.int.zone/job/discountmanager/job/${DM_STABLE_VERSION_1_4}/job/validate-and-promote/`
        }
    ],
    "Product Registry": [
        {
            "buildUrl": `https://jenkins.com.int.zone/job/product-registry/job/master/job/validate-and-promote/`,
        }
    ],
    "Inhouse Products": [
        {
            "buildUrl": `https://jenkins.com.int.zone/job/inhouse-products/job/${INHOUSE_UNSTABLE_VERSION}/job/validate-and-promote/`
        },
        {
            "buildUrl": `https://jenkins.com.int.zone/job/inhouse-products/job/${INHOUSE_VERSION_3_0}/job/validate-and-promote/`
        },
        {
            "buildUrl": `https://jenkins.com.int.zone/job/inhouse-products/job/${INHOUSE_VERSION_2_4}/job/validate-and-promote/`
        },
    ],
    "IDP": [
        {
            "buildUrl": `https://jenkins.com.int.zone/job/idp-backend/job/${IDP_UNSTABLE_VERSION}/job/validate-and-promote/`,
        },
        {
            "buildUrl": `https://jenkins.com.int.zone/job/idp-backend/job/${IDP_STABLE_VERSION_4_2}/job/validate-and-promote/`,
        },
        {
            "buildUrl": `https://jenkins.com.int.zone/job/idp-backend/job/${IDP_STABLE_VERSION_4_1}/job/validate-and-promote/`,
        }
    ],
    "UAM": [
        {
            "buildUrl": `https://jenkins.com.int.zone/job/uam/job/${UAM_UNSTABLE_VERSION}/job/validate-and-promote/`
        },
        {
            "buildUrl": `https://jenkins.com.int.zone/job/uam/job/${UAM_STABLE_VERSION_3_0}/job/validate-and-promote/`
        },
        {
            "buildUrl": `https://jenkins.com.int.zone/job/uam/job/${UAM_STABLE_VERSION_2_1}/job/validate-and-promote/`
        }
    ],
    "GDPR": {
        "buildUrl": "https://jenkins.com.int.zone/job/gdpr-backend/job/master/job/validate-and-promote/",
    },
    "E2E SDK": [
        {
            "buildUrl": `https://jenkins.com.int.zone/job/e2e-tests-v2/job/${UNSTABLE_VERSION}/job/validate-and-promote/`
        },
        {
            "buildUrl": `https://jenkins.com.int.zone/job/e2e-tests-v2/job/${STABLE_VERSION_21_18}/job/validate-and-promote/`
        },
        {
            "buildUrl": `https://jenkins.com.int.zone/job/e2e-tests-v2/job/${STABLE_VERSION_21_17}/job/validate-and-promote/`
        }
    ],
};


function Releases() {

    return (
        <TableContainer component={Paper} key="releases-table-container">
            <Table sx={{
                [`& .${tableCellClasses.root}`]: {
                    border: "none"
                }
            }} size="small" key='releases-table'>
                <TableHead key='releases-head'>
                    <TableRow>
                        <TableCell key='releases-head-name'></TableCell>
                        <TableCell key='releases-head-unstable'>Unstable</TableCell>
                        <TableCell key='releases-head-realeases'>Releases</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody key='releases-body'>
                    {
                        Object.entries(COMPONENTS).map(([name, components]) => {
                            return (
                                <TableRow key={name}>
                                    <TableCell>
                                        {name}
                                    </TableCell>
                                    {
                                        (Array.isArray(components) ? components : [components])
                                            .map((component, index) => {
                                                const buildStatus = {
                                                    "buildUrl": component.buildUrl,
                                                    "imageUrl": component.buildUrl + `badge/icon?&subject=\${params.BUILD_NAME}`
                                                };

                                                const key = `${name}-${index}`;

                                                return (
                                                    <TableCell key={key} >
                                                        <Status board={buildStatus} key={key + "-status"} />
                                                    </TableCell>
                                                );
                                            })
                                    }
                                </TableRow>
                            )
                        })
                    }
                </TableBody>
            </Table>
        </TableContainer>
    );
}
export default Releases;
