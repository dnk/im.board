import Table from '@mui/material/Table';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Status from "./Status";

const RELEASES = [
	{
		name: "OSS",
        board: {
            "buildUrl": "https://jenkins.com.int.zone/job/oss/job/unstable/job/validate-and-promote/",
            "imageUrl": "https://jenkins.com.int.zone/job/oss/job/unstable/job/validate-and-promote/badge/icon?&subject=${params.BUILD_NAME}"
        },
		qualityGate: "https://sonarqube.int.zone/api/project_badges/measure?project=com.parallels.poa.platform.bvt%3Aplatform-coverage&metric=alert_status&token=sqb_97bfab629a698f7abf87bc5af7e07efa2764dbda"
	},
	{
		name: "BSS",
		board: {
            "buildUrl": "https://jenkins.com.int.zone/job/bss/job/unstable/job/validate-and-promote/",
            "imageUrl": "https://jenkins.com.int.zone/job/bss/job/unstable/job/validate-and-promote/badge/icon?&subject=${params.BUILD_NAME}"
        }
	},
	{
        name: "Branding UI Cluster", 
        board: {
            "buildUrl": "https://jenkins.com.int.zone/job/branding-ui-cluster/job/unstable/job/validate-and-promote/",
            "imageUrl": "https://jenkins.com.int.zone/job/branding-ui-cluster/job/unstable/job/validate-and-promote/badge/icon?&subject=${params.BUILD_NAME}"
        }
    },
	{
		name: "IDP",
        board: {
            "buildUrl": "https://jenkins.com.int.zone/job/idp-backend/job/master/job/validate-and-promote/",
            "imageUrl": "https://jenkins.com.int.zone/job/idp-backend/job/master/job/validate-and-promote/badge/icon?&subject=${params.BUILD_NAME}"
        },
		qualityGate: "https://sonarqube.int.zone/api/project_badges/measure?project=com.odin.idp%3Aidp-backend&metric=alert_status&token=sqb_e483fbb106e86c618eec3a4ad7a6df87f0a5ade0"
	},
	{
		name: "Rating Engine",
        board: {
            "buildUrl": "https://jenkins.com.int.zone/job/ratingengine-backend/job/master/job/validate-and-promote/",
            "imageUrl": "https://jenkins.com.int.zone/job/ratingengine-backend/job/master/job/validate-and-promote/badge/icon?&subject=${params.BUILD_NAME}"
        },
		qualityGate: "https://sonarqube.int.zone/api/project_badges/measure?project=com.ingrammicro.bss%3Aratingengine-backend&metric=alert_status&token=sqb_d75c12fcb769db163f2ec1f6072849397f3c1a68"
	},
	{
		name: "Discount Manager",
        board: {
            "buildUrl": "https://jenkins.com.int.zone/job/discountmanager/job/master/job/validate-and-promote/",
            "imageUrl": "https://jenkins.com.int.zone/job/discountmanager/job/master/job/validate-and-promote/badge/icon?&subject=${params.BUILD_NAME}"
        },
		qualityGate: "https://sonarqube.int.zone/api/project_badges/measure?project=com.odin.marketing%3Adiscountmanager-backend&metric=alert_status&token=sqb_2364a2c3973e6d393722f9c1eb8536ddfaf35fe6"
	},
	{
		name: "UAM",
		board: {
            "buildUrl": "https://jenkins.com.int.zone/job/uam/job/master/job/validate-and-promote/",
            "imageUrl": "https://jenkins.com.int.zone/job/uam/job/master/job/validate-and-promote/badge/icon?&subject=${params.BUILD_NAME}"
        },
		qualityGate: "https://sonarqube.int.zone/api/project_badges/measure?project=com.cloudblue.uam%3Auam-backend%3A1.2&metric=alert_status&token=sqb_0cb0313824d712efd291c33fb48b270a35e233e4"
	},
	{ 
        name: "E2E SDK", 
        owner: "", job: "e2e-tests-v2/unstable/validate-and-promote", 
        board: {
            "buildUrl": "https://jenkins.com.int.zone/job/e2e-tests-v2/job/unstable/job/validate-and-promote/",
            "imageUrl": "https://jenkins.com.int.zone/job/e2e-tests-v2/job/unstable/job/validate-and-promote/badge/icon?&subject=${params.BUILD_NAME}"
        }
    },
];


function Releases() {
    return (
        <TableContainer component={Paper} >
            <Table sx={{
                    [`& .${tableCellClasses.root}`]: {
                        border: "none"
                    }
                }}
            >
                {
                    RELEASES.map((row) => {
                        return (
                            <TableRow key={row.name}>
                                <TableCell>
                                    {row.name}
                                </TableCell>
                                <TableCell>
                                    <Status board={row.board}/>
                                </TableCell>
                            </TableRow>
                        )
                    })
                }
            </Table>
        </TableContainer>
    );
}
export default Releases;