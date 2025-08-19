import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {ROI_GET, ROI_UPLOAD, UNZIP} from '../../Variables';
import {NiiFile, resultActions, ROI, Volume} from "./resultSlice";
import {Job, sampleJob} from "../jobs/jobsSlice";



export const getPipelineROI = createAsyncThunk('GetROI', async ({accessToken, pipeline}:{accessToken:string, pipeline:string}) => {
    const config = {
        headers: {
            Authorization:`Bearer ${accessToken}`
        },
        params: {
            pipeline_id: pipeline,
        },
        timeout: 5000,
    };
    const response = await axios.get(ROI_GET, config);
    console.log(response);
    return {rois:response.data, pipeline_id:pipeline};
});


export function niiToVolume(nii:NiiFile){
    return {
        //URL is for NiiVue blob loading
        url: nii.link,
        //name is for NiiVue name replacer (needs proper extension like .nii)
        name: (nii.filename.split('/').pop() as string),
        //alias is for user selection in toolbar
        alias: nii.name
    };
}

export const loadResult = createAsyncThunk('LoadResult', async ({accessToken,job}:{accessToken:string,job:Job})=>{
    if(job.pipeline_id==sampleJob.pipeline_id){
        return sampleResult;
    }
    let volumes:Volume[] = [];
    let file = job.files[0];
    // console.log(file);
    let result = (await axios.post(UNZIP, JSON.parse(file.location),{
        headers: {
            Authorization:`Bearer ${accessToken}`
        }
    })).data;
    console.log(result);
    let niis = <NiiFile[]> result.data;
    niis.forEach((value)=>{
        volumes.push({
            //URL is for NiiVue blob loading
            url: value.link,
            //name is for NiiVue name replacer (needs proper extension like .nii)
            name: (value.filename.split('/').pop() as string),
            //alias is for user selection in toolbar
            alias: value.name
        });
    });
    return {pipelineID:job.pipeline_id, job:job,volumes,niis,result};
    // Set pipeline ID
},{
    // Adding extra information to the meta field
    getPendingMeta: ({ arg, requestId }) => {
        return {
            jobId: arg.job.id, // 'arg' is your original payload
            requestId
        };
    }
});
// export const uploadROI = createAsyncThunk('PostROI', async(accessToken:string, roiFile: File)=>{
//     const config = {
//         headers: {
//             Authorization: `Bearer ${accessToken}`,
//         },
//     };
//     const response = await axios.post(ROI_UPLOAD,{
//
//     })
// });

// For local testing purposes:
let sampleResult = {
    job: <typeof sampleJob>JSON.parse(JSON.stringify(sampleJob)),
    result:{
        "headers": {
            "options": {
                "token": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9jYW5jZWxpdC1lbnYtMS5lYmEtcG1hbWN1djUudXMtZWFzdC0xLmVsYXN0aWNiZWFuc3RhbGsuY29tXC9hcGlcL2F1dGhcL2xvZ2luIiwiaWF0IjoxNzE1ODY4Mzc5LCJleHAiOjE3MTU5NTQ3NzksIm5iZiI6MTcxNTg2ODM3OSwianRpIjoiS0o0eFNaTERJdW5heWFrWCIsInN1YiI6OTk5OSwicHJ2IjoiODdlMGFmMWVmOWZkMTU4MTJmZGVjOTcxNTNhMTRlMGIwNDc1NDZhYSJ9.jjQANcJGw1ibtXkQu8S1JcEmzH73omWKqyQNgz-jC6s",
                "pipeline": "6a34a445-41b4-35a0-abad-98236ff49796",
                "pipelineid": "6a34a445-41b4-35a0-abad-98236ff49796",
                "air": {
                    "capacity": null,
                    "density": null,
                    "temperature": 296
                },
                "blood": {
                    "capacity": 1057,
                    "density": 3600,
                    "temperature": 200
                },
                "heatingtime": 50,
                "materialDensity": {
                    "type": "file",
                    "id": 5,
                    "options": {
                        "type": "s3",
                        "filename": "MaterialDensity.nii.gz",
                        "options": {},
                        "bucket": "tess-d",
                        "key": "e50422ad-1808-467a-9a87-39c3157b57c2_MaterialDensity.nii.gz"
                    }
                },
                "bloodPerfusion": {
                    "type": "file",
                    "id": 4,
                    "options": {
                        "type": "s3",
                        "filename": "BloodPerfusion.nii.gz",
                        "options": {},
                        "bucket": "tess-d",
                        "key": "efe7b2e1-9896-476c-b9b6-edf47c9cd9b5_BloodPerfusion.nii.gz"
                    }
                },
                "heatCapacity": {
                    "type": "file",
                    "id": 6,
                    "options": {
                        "type": "s3",
                        "filename": "HeatCapacity.nii.gz",
                        "options": {},
                        "bucket": "tess-d",
                        "key": "cb116957-ad20-43df-b1ea-4ef437ffffdc_HeatCapacity.nii.gz"
                    }
                },
                "thermalConductivity": {
                    "type": "file",
                    "id": 7,
                    "options": {
                        "type": "s3",
                        "filename": "ThermalConductivity.nii.gz",
                        "options": {},
                        "bucket": "tess-d",
                        "key": "60c69765-1ef0-43d0-b8dd-92b2bffffe11_ThermalConductivity.nii.gz"
                    }
                },
                "metabolismHeat": {
                    "type": "file",
                    "id": 8,
                    "options": {
                        "type": "s3",
                        "filename": "Metabolism.nii.gz",
                        "options": {},
                        "bucket": "tess-d",
                        "key": "e15648ce-330c-488f-81d9-daf6948f496f_Metabolism.nii.gz"
                    }
                },
                "SAR": {
                    "type": "file",
                    "id": 9,
                    "options": {
                        "type": "s3",
                        "filename": "SAR.nii.gz",
                        "options": {},
                        "bucket": "tess-d",
                        "key": "4c4dc18c-7866-4f05-9313-fb094e0af48e_SAR.nii.gz"
                    }
                },
                "tOld": {
                    "type": "file",
                    "id": 10,
                    "options": {
                        "type": "s3",
                        "filename": "TOld.nii.gz",
                        "options": {},
                        "bucket": "tess-d",
                        "key": "8ba5e046-9ead-4931-8000-38964f31b577_TOld.nii.gz"
                    }
                }
            }
        }
    },
    volumes: [
        {
            name: 'Brain.nii',
            url: './mni.nii',
            alias: 'Brain'
        },{
            name: 'Hippocampus.nii',
            url: './hippo.nii',
            alias: 'Hippocampus',
        }],
    niis:[
        {
            filename: 'Brain.nii',
            link: './mni.nii',
            name: 'Brain',
            dim:3,
            type:'output',
            id:1

        },{
            filename: 'Hippocampus.nii',
            link: './hippo.nii',
            name: 'Hippocampus',
            dim:3,
            type:'output',
            id:2
        }
    ]
}