import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { CheckCircle, Error } from "@mui/icons-material";

const SONAR_URL='https://sonarqube.int.zone';
const AUTH_HEADER = 'Basic c3F1X2NkY2M2NTRhMzk5M2Y1NDM4ZTgxZjNkZWYwMTkyMjEzYWRiMDRkOTY6';

async function xhr(url) {
    const response = await fetch(url, {
        headers: {
            'Authorization': AUTH_HEADER
        }
    })
        .catch(error => {
            console.log(error);
            return null;
        });

    return response ? response.json : {};
}


function QualityGateStatus({ data }) {
    const [status, setStatus] = useState("");
    const [color, setColor] = useState(Button.color);
    const [icon, setIcon] = useState();

    const sonarProjectId = data.sonarProjectId;


    const processQualityGateStatus = async () => {
        const url = `${SONAR_URL}/api/project_branches/list?project=${sonarProjectId}`;
        const response = await xhr(url);

        const branches = (response.branches || []);
        let branch = (
            branches.filter((branche => {
                return ["master", "unstable"].includes(branche.name); // try master and unstable branches
            }))
            ||
            branches.filter((branch) => {
                return branch.isMain;                                   // then use "isMain" = true
            })
        );

        const isPassed = ((branch || {}).status || {}).qualityGateStatus == "OK";

        if (isPassed) {
            setStatus('passed');
            setColor('success');
            setIcon(React.createElement(CheckCircle));
        } else {
            setStatus('failed');
            setColor('error');
            setIcon(React.createElement(Error));
        }
    }

    useEffect(() => {
        processQualityGateStatus();
    }, []);

    if (!data) {
        return "";
    }



    return (
        <Button variant="text" color={color} size="small" startIcon={icon}>
            {
                status
            }
        </Button>
    )
}

export default QualityGateStatus;