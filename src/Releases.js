import Table from '@mui/material/Table';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Status from "./Status";
import { Container, Typography } from '@mui/material';

const COMPONENTS = {
    "OSS": {
        "unstable": {
            board: {
                "buildUrl": "https://jenkins.com.int.zone/job/oss/job/unstable/job/validate-and-promote/",
                "imageUrl": "https://jenkins.com.int.zone/job/oss/job/unstable/job/validate-and-promote/badge/icon?&subject=${params.BUILD_NAME}"
            },
            qualityGate: "https://sonarqube.int.zone/api/project_badges/measure?project=com.parallels.poa.platform.bvt%3Aplatform-coverage&metric=alert_status&token=sqb_97bfab629a698f7abf87bc5af7e07efa2764dbda"
        }
    },
    "BSS": {
        "unstable": {
            board: {
                "buildUrl": "https://jenkins.com.int.zone/job/bss/job/unstable/job/validate-and-promote/",
                "imageUrl": "https://jenkins.com.int.zone/job/bss/job/unstable/job/validate-and-promote/badge/icon?&subject=${params.BUILD_NAME}"
            }
        }
    },
    "Branding UI Cluster": {
        "unstable": {
            board: {
                "buildUrl": "https://jenkins.com.int.zone/job/branding-ui-cluster/job/unstable/job/validate-and-promote/",
                "imageUrl": "https://jenkins.com.int.zone/job/branding-ui-cluster/job/unstable/job/validate-and-promote/badge/icon?&subject=${params.BUILD_NAME}"
            }
        }
    },
    "IDP": {
        "unstable": {
            board: {
                "buildUrl": "https://jenkins.com.int.zone/job/idp-backend/job/master/job/validate-and-promote/",
                "imageUrl": "https://jenkins.com.int.zone/job/idp-backend/job/master/job/validate-and-promote/badge/icon?&subject=${params.BUILD_NAME}"
            },
            qualityGate: "https://sonarqube.int.zone/api/project_badges/measure?project=com.odin.idp%3Aidp-backend&metric=alert_status&token=sqb_e483fbb106e86c618eec3a4ad7a6df87f0a5ade0"
        },
        // "4.0": {
        //     board: {
        //         "buildUrl": "https://jenkins.com.int.zone/job/idp-backend/job/release-4.0/job/validate-and-promote/",
        //         "imageUrl": "https://jenkins.com.int.zone/job/idp-backend/job/release-4.0/job/validate-and-promote/badge/icon?&subject=${params.BUILD_NAME}"
        //     },
        //     qualityGate: "https://sonarqube.int.zone/api/project_badges/measure?project=com.odin.idp%3Aidp-backend&metric=alert_status&token=sqb_e483fbb106e86c618eec3a4ad7a6df87f0a5ade0"
        // }
    },
    "Rating Engine": {
        "unstable": {
            board: {
                "buildUrl": "https://jenkins.com.int.zone/job/ratingengine-backend/job/master/job/validate-and-promote/",
                "imageUrl": "https://jenkins.com.int.zone/job/ratingengine-backend/job/master/job/validate-and-promote/badge/icon?&subject=${params.BUILD_NAME}"
            },
            qualityGate: "https://sonarqube.int.zone/api/project_badges/measure?project=com.ingrammicro.bss%3Aratingengine-backend&metric=alert_status&token=sqb_d75c12fcb769db163f2ec1f6072849397f3c1a68"
        }
    },
    "Discount Manager": {
        "unstable": {
            board: {
                "buildUrl": "https://jenkins.com.int.zone/job/discountmanager/job/master/job/validate-and-promote/",
                "imageUrl": "https://jenkins.com.int.zone/job/discountmanager/job/master/job/validate-and-promote/badge/icon?&subject=${params.BUILD_NAME}"
            },
            qualityGate: "https://sonarqube.int.zone/api/project_badges/measure?project=com.odin.marketing%3Adiscountmanager-backend&metric=alert_status&token=sqb_2364a2c3973e6d393722f9c1eb8536ddfaf35fe6"
        },
        // "1.4": {
        //     board: {
        //         "buildUrl": "https://jenkins.com.int.zone/job/discountmanager/job/release-1.4/job/validate-and-promote/",
        //         "imageUrl": "https://jenkins.com.int.zone/job/discountmanager/job/release-1.4/job/validate-and-promote/badge/icon?&subject=${params.BUILD_NAME}"
        //     }
        // }
    },
    "UAM": {
        "unstable": {
            board: {
                "buildUrl": "https://jenkins.com.int.zone/job/uam/job/master/job/validate-and-promote/",
                "imageUrl": "https://jenkins.com.int.zone/job/uam/job/master/job/validate-and-promote/badge/icon?&subject=${params.BUILD_NAME}"
            }
        },
        // "2.0": {
        //     board: {
        //         "buildUrl": "https://jenkins.com.int.zone/job/uam/job/release-2.0/job/validate-and-promote/",
        //         "imageUrl": "https://jenkins.com.int.zone/job/uam/job/release-2.0/job/validate-and-promote/badge/icon?&subject=${params.BUILD_NAME}"
        //     }
        // }
    },
    "E2E SDK": {
        "unstable": {
            board: {
                "buildUrl": "https://jenkins.com.int.zone/job/e2e-tests-v2/job/unstable/job/validate-and-promote/",
                "imageUrl": "https://jenkins.com.int.zone/job/e2e-tests-v2/job/unstable/job/validate-and-promote/badge/icon?&subject=${params.BUILD_NAME}"
            }
        }
    },
};


function Releases() {

    const singleVersionComponents = Object.keys(COMPONENTS)
        .map((key) => {
            const component = COMPONENTS[key];
            const keys = Object.keys(component);
            if (keys.length > 1 || keys.length === 0) {
                return null;
            }

            let result = {};
            result[key] = component[keys[0]];

            return result;
        })
        .filter((value) => {
            return !!value;
        })
        .reduce((result, current) => {
            return Object.assign(result, current);
        });

    const multiVersionComponents = Object.keys(COMPONENTS)
        .map((key) => {
            const component = COMPONENTS[key];
            const keys = Object.keys(component);
            if (keys.length <= 1) {
                return null;
            }

            let result = {};
            result[key] = component;

            return result;
        })
        .filter((value) => {
            return !!value;
        })
        .reduce((result, current) => {
            return Object.assign(result, current);
        }, {});


    return (
        <Container sx={{
            [`& .${tableCellClasses.root}`]: {
                border: "none",
            }
        }}>
            <TableContainer component={Paper} >
                <Table>
                    {
                        Object.keys(singleVersionComponents).map((key) => {
                            const name = key;
                            const value = singleVersionComponents[key];
                            return (
                                <TableRow key={name}>
                                    <TableCell>
                                        {name}
                                    </TableCell>
                                    <TableCell>
                                        <Status board={value.board} />
                                    </TableCell>
                                </TableRow>
                            )
                        })
                    }
                </Table>
            </TableContainer>
            {
                Object.keys(multiVersionComponents).map((key) => {
                    const name = key;
                    const values = multiVersionComponents[key];
                    return (
                        <Container component={Paper}>
                            <Typography noWrap>{name}</Typography>
                            <TableContainer>
                                <Table>
                                    {
                                        Object.keys(values).map((key) => {
                                            const version = `${key}`;
                                            const value = values[key];
                                            return (
                                                <TableRow key={version}>
                                                    <TableCell>
                                                        {version}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Status board={value.board} />
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    }
                                </Table>
                            </TableContainer>
                        </Container>
                    )
                })
            }
        </Container>
    );
}
export default Releases;