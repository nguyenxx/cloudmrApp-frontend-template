import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {SIGNIN, PROFILE, APP_NAME} from "../../Variables";
import {getUpstreamJobs} from "../jobs/jobActionCreation";
import {API_URL} from "../../env";

export interface SigninDataType {
    email: string;
    password: string;
}

export const getAccessToken = createAsyncThunk('SIGN_IN', async (signinData: SigninDataType,thunkAPI) => {
    const response = await axios.post(SIGNIN, signinData);
    // console.log(response);
    // console.log(response.data);
    if(response.data.access_token!=undefined)
        thunkAPI.dispatch(getProfile(response.data.access_token));
    return Object.assign(signinData, response.data);
});

export const signOut = createAsyncThunk('SIGN_OUT', async (accessToken: string) => {
    const config = {
        headers: { Authorization: `Bearer ${accessToken}` },
    };
    // const response = await axios.post(SIGNOUT, null, config);
    // return response.data;
    return {message:"Successfully logged out"};
});



export const getFineGrainToken = createAsyncThunk('FINE_GRAIN',
    async ({accessToken, categories={app: APP_NAME, activities:['queue','upload']}}:{accessToken:string, categories?: {
            app: string,
            activities: string[]
        }}, ) => {
        if(API_URL == null)
            return;
        try{
            const response = await axios.post(API_URL, categories, {headers:{
                    Authorization:`Bearer ${accessToken}`
                }});
            return response.data;
        }catch (e) {
            return undefined;
        }
    });

export const webSignin = createAsyncThunk('WEB_SIGN_IN',
    async (accessToken:string, thunkAPI) => {
        //Update upstream jobs right after submission
        thunkAPI.dispatch(getUpstreamJobs(accessToken));

        if(accessToken!=undefined)
            thunkAPI.dispatch(getProfile(accessToken));

        //Return whether the submission was successful
        return {
            "access_token": accessToken,
            "token_type": "bearer",
            "expires_in": "1440"
        };
    });

export const getProfile =  createAsyncThunk('GET_PROFILE',
    async (id_token:string) => {
        try{
            const response = await axios.get(PROFILE, {headers:{
                    Authorization:`Bearer ${id_token}`
                },
                timeout: 5000,
            });
            // console.log(response);
            // console.log(response.data);
            if(response.data[0] === '<'){
                return {error:'user not recognized'}
            }
            return response.data;
        }catch(e){
            return undefined;
        }
    });