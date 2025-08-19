import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {Job} from "../jobs/jobsSlice";
import {getUpstreamJobs} from "../jobs/jobActionCreation";
import {JOBS_API} from "../../Variables";
import { API_TOKEN } from '../../env';

export const submitJobs = createAsyncThunk('SUBMIT_JOBS',
    async ({accessToken,jobQueue}:{accessToken:string, jobQueue:(Job|undefined)[]}, thunkAPI) => {
    let responses = [];

    console.log(API_TOKEN);

    for(let job of jobQueue){
        if(job==undefined)
            continue;
        console.log(job);
        console.log( JSON.stringify(job.setup));
        let res = await axios.post(JOBS_API, JSON.stringify(job.setup), {headers:{Authorization:`Bearer ${accessToken}`,
                accept: '*/*','X-Api-Key': API_TOKEN,'Content-Type': 'application/json'}});
        responses.push({
            id: job.id,
            status: res.status
        })
    }
    // //Update upstream jobs right after submission
    thunkAPI.dispatch(getUpstreamJobs(accessToken));
    // Return whether the submission was successful
    return responses;
});
