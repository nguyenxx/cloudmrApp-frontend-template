import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import { getPipelineROI,loadResult } from './resultActionCreation';
import {UploadedFile} from "../data/dataSlice";
import {Job} from "../jobs/jobsSlice";
import {RootState} from "../store";
import {FileReference} from "../setup/setupSlice";

export interface ROI {
    id: number;
    created_at: string;
    updated_at: string;
    location: string;
    link: string;
    filename: string;
    size: null | number;
    md5: null | string;
    status: string;
    database: string;
    type: string;
    pivot: {
        pipeline_id: string;
        roi_id: string;
    };
}

export interface Volume{
    name:string;
    url:string;
    alias:string;
}

export interface NiiFile {
    filename:string;
    id:number;
    dim:number;
    name:string;
    type:string;
    link:string;
}

export interface ROIState{
    rois: {[pipeline_id:string]:ROI[]};
    resultLoading: number;
    loading:boolean;
    niis:{[pipeline_id:string]:NiiFile[]};
    activeJob?: Job;
    selectedVolume: number;
    openPanel: number[];
}

const initialState: ROIState = {
    rois:{},
    niis:{'-1':[]},
    resultLoading: -1,
    loading:false,
    activeJob:undefined,
    selectedVolume:2,
    openPanel:[0]
};


export const resultGetters = {

    getMask: (state: RootState): FileReference | undefined => {
        return state.result.activeJob?.setup.task.options.mask;
    },

    getMaterialDensity: (state: RootState): FileReference | undefined => {
        return state.result.activeJob?.setup.task.options.materialDensity;
    },

    getBloodPerfusion: (state: RootState): FileReference | undefined => {
        return state.result.activeJob?.setup.task.options.bloodPerfusion;
    },

    getHeatCapacity: (state: RootState): FileReference | undefined => {
        return state.result.activeJob?.setup.task.options.heatCapacity;
    },

    getThermalConductivity: (state: RootState): FileReference | undefined => {
        return state.result.activeJob?.setup.task.options.thermalConductivity;
    },

    getMetabolismHeat: (state: RootState): FileReference | undefined => {
        return state.result.activeJob?.setup.task.options.metabolismHeat;
    },

    getSAR: (state: RootState): FileReference | undefined => {
        return state.result.activeJob?.setup.task.options.SAR;
    },

    getTOld: (state: RootState): FileReference | undefined => {
        return state.result.activeJob?.setup.task.options.tOld;
    },

    getAirTemperature: (state: RootState) => {

        return state.result.activeJob?.setup.task.options.air?.temperature;
    },

    getBloodTemperature: (state: RootState) => {
        return state.result.activeJob?.setup.task.options.blood?.temperature;
    },

    getBloodCapacity: (state: RootState) => {
        return state.result.activeJob?.setup.task.options.blood?.capacity;
    },

    getBloodDensity: (state: RootState) => {
        return state.result.activeJob?.setup.task.options.blood?.density;
    },

    getHeatingTime: (state: RootState) =>{
        return state.result.activeJob?.setup.task.options?.heatingtime;
    }
};

export const resultSlice = createSlice({
    name: 'job',
    initialState,
    reducers: {
        setPipelineID(state:ROIState,action:PayloadAction<Job>){
            state.activeJob = action.payload;
        },
        selectVolume(state:ROIState,action:PayloadAction<number>){
            state.selectedVolume = action.payload;
        },
        setOpenPanel(state:ROIState,action:PayloadAction<number[]>){
            state.openPanel = action.payload;
        }
    },
    extraReducers: (builder) => (
        builder.addCase(getPipelineROI.pending, (state, action) => {
            state.loading = true;
        }),
        builder.addCase(getPipelineROI.fulfilled, (state, action) => {
            const {rois, pipeline_id}: {rois:ROI[] ,pipeline_id:string}= action.payload;
            state.rois[pipeline_id] = [];
            if (rois.length > 0) {
                rois.forEach((element) => {
                    if(state.rois[pipeline_id]==undefined)
                        state.rois[pipeline_id] = []
                    state.rois[pipeline_id].push(element);
                });
            }
            state.loading = false;
        }),
        builder.addCase(loadResult.pending,(state:ROIState, action) => {
            // @ts-ignore
            state.resultLoading = action.meta.jobId;
        }),
        builder.addCase(
            loadResult.fulfilled, (state:ROIState,action)=>{
                state.activeJob=action.payload.job;
                //@ts-ignore
                state.activeJob.setup = {alias:'-',version:'v0'};
                //@ts-ignore
                state.activeJob.setup.task = action.payload.result.headers.options;
                //@ts-ignore
                state.activeJob.logs = action.payload.result.log;
                //@ts-ignore
                state.activeJob.slices = action.payload.result.info?.slices;
                state.niis[state.activeJob.pipeline_id] = action.payload.niis;
                state.selectedVolume = 1;
                state.resultLoading = -1;
        })
    ),
});
export const resultActions = resultSlice.actions;