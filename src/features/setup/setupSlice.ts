import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from '../store';
import { UploadedFile } from "../data/dataSlice";
import { Job } from "../jobs/jobsSlice";
import moment from "moment/moment";
import { submitJobs } from "./setupActionCreation";
import { getUploadedData, uploadData } from "../data/dataActionCreation";
import { formatBytes } from "../../common/utilities";
import { AxiosResponse } from "axios/index";

interface SetupState {
    loading: boolean;
    activeSetup: TE;
    editInProgress: boolean;
    queuedJobs: Job[];
    idGenerator: number;
    maskUploadProgress: number;
    mdUploadProgress: number;
    bpUploadProgress: number;
    hcUploadProgress: number;
    tcUploadProgress: number;
    mhUploadProgress: number;
    sarUploadProgress: number;
    tOldUploadProgress: number;
    outputSettings: OutputInterface;
}
interface OutputInterface {
    matlab: boolean
}

export interface TETask {
    version: string,
    alias: string,
    output: {
        matlab: boolean
    }
    task: TE;
}
interface TE {
    queued: boolean;
    version: string;
    type: string;
    name: string;
    id?: number;
    options: TEOptions;
    files: string[];
}

interface TEOptions {
    air: {
        capacity: null,
        density: null,
        temperature: number;
    },
    blood: {
        capacity: number,
        density: number,
        temperature: number;
    },
    heatingtime: number;
    // Moved file references into options
    mask?: FileReference;
    materialDensity?: FileReference;
    bloodPerfusion?: FileReference;
    heatCapacity?: FileReference;
    thermalConductivity?: FileReference;
    metabolismHeat?: FileReference;
    SAR?: FileReference;
    tOld?: FileReference;
}

interface Reconstructor {
    type: string;
    name?: string;
    id?: number;
    options: ReconstructorOptions;
}

interface ReconstructorOptions {
    signalMultiRaid?: boolean;
    accelerations?: number[];
    kernelSize?: [number, number];
    acl?: (number | null)[];
    sensitivityMap: SensitivityMap;
    correction: CorrectionOptions;
    decimate?: boolean;
    gfactor: boolean;
}

// interface FileReference {
//     type: string;
//     id: number;
//     options: FileOptions;
// }

interface FileReference {
    type: string;
    id: number;
    fileName: string;
    link: string;    // added for viewer
    options: FileOptions;
}

interface FileOptions {
    type: string;  // "local" or "s3"
    filename: string;
    bucket: string;
    key: string;
    options: Record<string, unknown> | undefined; // Empty object, could define more strictly if needed.
}

interface SensitivityMap {
    type: string;
    id?: number;
    name?: string;
    options: SensitivityMapOptions;
}

interface SensitivityMapOptions {
    loadSensitivity: boolean;
    sensitivityMapSource?: FileReference;
    sensitivityMapMethod: string;
}

interface CorrectionOptions {
    useCorrection: boolean;
    faCorrection?: FileReference;
}

// Defaults can be defined as constant objects:

export const defaultTE: TE = {
    name: 'TESS',
    queued: false,
    version: 'v0',
    type: "TE",
    files: [''],
    options: {
        air: {
            capacity: null,
            density: null,
            temperature: 296
        },
        blood: {
            capacity: 1057.0,
            density: 3600,
            temperature: 200
        },
        heatingtime: 50,
    },
};

const initialState: SetupState = {
    activeSetup: <TE>JSON.parse(JSON.stringify(defaultTE)),
    loading: false,
    queuedJobs: [],
    idGenerator: 0,
    editInProgress: false,
    maskUploadProgress: -1,
    mdUploadProgress: -1,
    bpUploadProgress: -1,
    hcUploadProgress: -1,
    tcUploadProgress: -1,
    mhUploadProgress: -1,
    sarUploadProgress: -1,
    tOldUploadProgress: -1,
    outputSettings: {
        matlab: true,
    }
};

function UFtoFR(uploadedFile: UploadedFile): FileReference {
    try {
        let { Bucket, Key } = JSON.parse(uploadedFile.location);
        return {
            type: 'file',
            id: uploadedFile.id,
            fileName: uploadedFile.fileName,
            link: uploadedFile.link,
            options: {
                type: uploadedFile.database,
                filename: uploadedFile.fileName,
                options: {},
                bucket: Bucket,
                key: Key,
            }
        };
    } catch (e) {
        return {
            type: 'file',
            id: uploadedFile.id,
            fileName: uploadedFile.fileName,
            link: uploadedFile.link,
            options: {
                type: uploadedFile.database,
                filename: uploadedFile.fileName,
                options: {},
                bucket: 'unknown',
                key: 'unknown',
            }
        };
    }
}

function createSetup(te: TE, alias: string, output: { matlab: boolean }): TETask {
    getFiles(te);
    return {
        version: "v0",
        alias: alias,
        output: output,
        task: te
    };
}


function createJob(TE: TE, setupState: SetupState, alias = `${TE.options.mask?.options.filename}-${TE.name}`): Job {

    return {
        alias: alias,
        createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        files: [],
        id: setupState.idGenerator++,
        setup: createSetup(TE, alias, setupState.outputSettings),
        status: "not submitted",
        updatedAt: "",
        pipeline_id: ""
    };
}

export const setupSlice = createSlice({
    name: 'setup',
    initialState,
    reducers: {
        setMask(state: SetupState, action: PayloadAction<UploadedFile | undefined>) {
            if (action.payload == undefined) {
                state.activeSetup.options.mask = undefined;
                state.editInProgress = true;
                return;
            }
            state.activeSetup.options.mask = UFtoFR(action.payload);
            state.editInProgress = true;
        },
        setMaterialDensity(state: SetupState, action: PayloadAction<UploadedFile | undefined>) {
            if (action.payload == undefined) {
                state.activeSetup.options.materialDensity = undefined;
                state.editInProgress = true;
                return;
            }
            state.activeSetup.options.materialDensity = UFtoFR(action.payload);
            state.editInProgress = true;
        },
        setBloodPerfusion(state: SetupState, action: PayloadAction<UploadedFile | undefined>) {
            if (action.payload == undefined) {
                state.activeSetup.options.bloodPerfusion = undefined;
                state.editInProgress = true;
                return;
            }
            state.activeSetup.options.bloodPerfusion = UFtoFR(action.payload);
            state.editInProgress = true;
        },
        setHeatCapacity(state: SetupState, action: PayloadAction<UploadedFile | undefined>) {
            if (action.payload === undefined) {
                state.activeSetup.options.heatCapacity = undefined;
            } else {
                state.activeSetup.options.heatCapacity = UFtoFR(action.payload);
            }
            state.editInProgress = true;
        },

        setThermalConductivity(state: SetupState, action: PayloadAction<UploadedFile | undefined>) {
            if (action.payload === undefined) {
                state.activeSetup.options.thermalConductivity = undefined;
            } else {
                state.activeSetup.options.thermalConductivity = UFtoFR(action.payload);
            }
            state.editInProgress = true;
        },

        setMetabolismHeat(state: SetupState, action: PayloadAction<UploadedFile | undefined>) {
            if (action.payload === undefined) {
                state.activeSetup.options.metabolismHeat = undefined;
            } else {
                state.activeSetup.options.metabolismHeat = UFtoFR(action.payload);
            }
            state.editInProgress = true;
        },

        setSAR(state: SetupState, action: PayloadAction<UploadedFile | undefined>) {
            if (action.payload === undefined) {
                state.activeSetup.options.SAR = undefined;
            } else {
                state.activeSetup.options.SAR = UFtoFR(action.payload);
            }
            state.editInProgress = true;
        },

        setTOld(state: SetupState, action: PayloadAction<UploadedFile | undefined>) {
            if (action.payload === undefined) {
                state.activeSetup.options.tOld = undefined;
            } else {
                state.activeSetup.options.tOld = UFtoFR(action.payload);
            }
            state.editInProgress = true;
        },

        setAirTemperature(state: SetupState, action: PayloadAction<number>) {
            if (state.activeSetup.options.air === undefined) {
                state.activeSetup.options.air = {
                    capacity: null,
                    density: null,
                    temperature: 296
                };
            }
            state.activeSetup.options.air.temperature = action.payload
        },

        setBloodTemperature(state: SetupState, action: PayloadAction<number>) {
            if (state.activeSetup.options.blood === undefined) {
                state.activeSetup.options.blood = {
                    capacity: 1057.0,
                    density: 3600,
                    temperature: 200
                };
            }
            state.activeSetup.options.blood.temperature = action.payload;
        },

        setBloodCapacity(state: SetupState, action: PayloadAction<number>) {
            if (state.activeSetup.options.blood === undefined) {
                state.activeSetup.options.blood = {
                    capacity: 1057.0,
                    density: 3600,
                    temperature: 200
                };
            }
            state.activeSetup.options.blood.capacity = action.payload;
        },

        setBloodDensity(state: SetupState, action: PayloadAction<number>) {
            if (state.activeSetup.options.blood === undefined) {
                state.activeSetup.options.blood = {
                    capacity: 1057.0,
                    density: 3600,
                    temperature: 200
                };
            }
            state.activeSetup.options.blood.density = action.payload;
        },

        setHeatingTime(state: SetupState, action: PayloadAction<number>) {
            state.activeSetup.options.heatingtime = action.payload;
        },

        setOutputMatlab(state: SetupState, action: PayloadAction<boolean>) {
            state.outputSettings.matlab = action.payload;
        },
        compileTESettings(state: SetupState, action: PayloadAction<string>) {
            let TESpec = state.activeSetup;
            let maskCache = TESpec.options.mask;
            let materialDensityCache = TESpec.options.materialDensity;
            let bloodPerfusionCache = TESpec.options.bloodPerfusion;
            let heatCapacityCache = TESpec.options.heatCapacity;
            let thermalConductivityCache = TESpec.options.thermalConductivity;
            let metabolismHeatCache = TESpec.options.metabolismHeat;
            let SARCache = TESpec.options.SAR;
            let TOldCache = TESpec.options.tOld;

            state.queuedJobs.push(createJob(TESpec, state, action.payload));
            //Deep copy default TE
            state.activeSetup = <TE>JSON.parse(JSON.stringify(defaultTE));
            state.outputSettings = { matlab: true };

            state.activeSetup.options.mask = maskCache;
            state.activeSetup.options.materialDensity = materialDensityCache;
            state.activeSetup.options.bloodPerfusion = bloodPerfusionCache;
            state.activeSetup.options.heatCapacity = heatCapacityCache;
            state.activeSetup.options.thermalConductivity = thermalConductivityCache;
            state.activeSetup.options.metabolismHeat = metabolismHeatCache;
            state.activeSetup.options.SAR = SARCache;
            state.activeSetup.options.tOld = TOldCache;
            state.editInProgress = false;
        },
        completeTEEditing(state: SetupState, action: PayloadAction<{ id: number, alias: string }>) {
            let TESpec = state.activeSetup;
            let index = -1;
            for (let i in state.queuedJobs) {
                if (state.queuedJobs[i].id == action.payload.id) {
                    index = Number(i);
                    break;
                }
            }
            state.queuedJobs[index].setup = createSetup(TESpec, action.payload.alias, state.outputSettings);
            state.queuedJobs[index].alias = action.payload.alias;
            state.queuedJobs[index].status = 'modified';
            //Deep copy default TE
            state.activeSetup = <TE>JSON.parse(JSON.stringify(defaultTE));
            state.outputSettings = { matlab: true };
            state.editInProgress = false;
            console.log(state.queuedJobs[index]);
        },
        rename(state: SetupState, action: PayloadAction<{ id: number, alias: string }>) {
            let index = -1;
            for (let i in state.queuedJobs) {
                if (state.queuedJobs[i].id == action.payload.id) {
                    index = Number(i);
                    break;
                }
            }
            state.queuedJobs[index].alias = action.payload.alias;
            state.queuedJobs[index].setup.alias = action.payload.alias;
        },
        queueTEJob(state: SetupState, action: PayloadAction<{ te: TE, name: string }>) {
            state.queuedJobs.push(createJob(action.payload.te, state, action.payload.name));
        },
        loadTESettings(state: SetupState, action: PayloadAction<{ te: TE, output: OutputInterface }>) {
            state.activeSetup = action.payload.te;
            state.outputSettings = action.payload.output;
            // TE.options.reconstructor.options.signalMultiRaid
            //     = !!(TE.options.reconstructor.options.signal?.options.multiraid);
            state.editInProgress = true;
        },
        deleteQueuedJob(state: SetupState, action: PayloadAction<number>) {
            let index = -1;
            for (let i in state.queuedJobs) {
                if (state.queuedJobs[i].id == action.payload) {
                    index = Number(i);
                    break;
                }
            }
            state.queuedJobs.splice(index, 1);
        },
        bulkDeleteQueuedJobs(state: SetupState, action: PayloadAction<number[]>) {
            for (let i = 0; i < state.queuedJobs.length;) {
                if (action.payload.indexOf(state.queuedJobs[i].id) >= 0) {
                    state.queuedJobs.splice(i, 1);
                } else i++;
            }
        },
        bulkDeleteAllJobs(state: SetupState) {
            for (let i = 0; i < state.queuedJobs.length;) {
                state.queuedJobs.splice(i, 1);
            }
        },
        setUploadProgress(state: SetupState, action: PayloadAction<{ target?: string, progress: number }>) {
            if (action.payload.target == 'mask') {
                state.maskUploadProgress = action.payload.progress;
            }
            if (action.payload.target == 'md') {
                state.mdUploadProgress = action.payload.progress;
            }
            if (action.payload.target == 'md') {
                state.mdUploadProgress = action.payload.progress;
            }
            if (action.payload.target == 'bp') {
                state.bpUploadProgress = action.payload.progress;
            }
            if (action.payload.target == 'hc') {
                state.hcUploadProgress = action.payload.progress;
            }
            if (action.payload.target == 'tc') {
                state.tcUploadProgress = action.payload.progress;
            }
            if (action.payload.target == 'mh') {
                state.mhUploadProgress = action.payload.progress;
            }
            if (action.payload.target == 'sar') {
                state.sarUploadProgress = action.payload.progress;
            }
            if (action.payload.target == 'tOld') {
                state.tOldUploadProgress = action.payload.progress;
            }
        },
    },
    extraReducers: (builder) => {
        builder.addCase(submitJobs.fulfilled, (state, responses) => {
            console.log(responses.payload);
            for (let response of responses.payload) {
                //@ts-ignore
                let id = response.id;
                for (let job of state.queuedJobs) {
                    if (job.id == id) {
                        //@ts-ignore
                        if (response.status == 200) {
                            job.status = 'submitted';
                        } else {
                            job.status = 'failed to submit';
                        }
                    }
                }
            }
        });
        builder.addCase(uploadData.fulfilled, (state: SetupState, action) => {
            let { code, response, file, uploadTarget } = action.payload;
            if (code == 200 && file != undefined) {
                const uploadedFile: UploadedFile = {
                    id: response.id,
                    fileName: response.filename,
                    createdAt: response.created_at,
                    updatedAt: response.updated_at,
                    size: file.filesize,
                    status: response.status,
                    md5: response.md5,
                    database: 's3',
                    location: response.location,
                    link: response.access_link
                };
                if (uploadTarget == 'mask') {
                    state.maskUploadProgress = -1;
                    state.activeSetup.options.mask = UFtoFR(uploadedFile);
                }
                if (uploadTarget == 'md') {
                    state.mdUploadProgress = -1;
                    state.activeSetup.options.materialDensity = UFtoFR(uploadedFile);
                }
                if (uploadTarget == 'bp') {
                    state.bpUploadProgress = -1;
                    state.activeSetup.options.bloodPerfusion = UFtoFR(uploadedFile);
                }
                if (uploadTarget == 'hc') {
                    state.hcUploadProgress = -1;
                    state.activeSetup.options.heatCapacity = UFtoFR(uploadedFile);
                }
                if (uploadTarget == 'tc') {
                    state.tcUploadProgress = -1
                    state.activeSetup.options.thermalConductivity = UFtoFR(uploadedFile);
                }
                if (uploadTarget == 'mh') {
                    state.mhUploadProgress = -1;
                    state.activeSetup.options.metabolismHeat = UFtoFR(uploadedFile);
                }
                if (uploadTarget == 'sar') {
                    state.sarUploadProgress = -1;
                    state.activeSetup.options.SAR = UFtoFR(uploadedFile);
                }
                if (uploadTarget == 'tOld') {
                    state.tOldUploadProgress = -1;
                    state.activeSetup.options.tOld = UFtoFR(uploadedFile);
                }
            }
        });
        builder.addCase('persist/REHYDRATE', (state, action) => {
            if ((<PayloadAction<RootState>>action).payload == undefined) {
                return
            }
            let setupState = (<PayloadAction<RootState>>action).payload.setup;
            // When rehydrating, only take the accessToken from the persisted state
            state.maskUploadProgress = -1;
            state.mdUploadProgress = -1;
            state.bpUploadProgress = -1;
            state.hcUploadProgress = -1;
            state.tcUploadProgress = -1;
            state.mhUploadProgress = -1;
            state.sarUploadProgress = -1;
            state.tOldUploadProgress = -1;
            state.activeSetup = setupState.activeSetup;
            state.editInProgress = setupState.editInProgress;
            state.idGenerator = setupState.idGenerator;
            state.queuedJobs = setupState.queuedJobs;
            state.loading = false;
        })
    },
});

const SetupGetters = {

    getMask: (state: RootState): FileReference | undefined => {
        return state.setup.activeSetup?.options.mask;
    },

    getMaterialDensity: (state: RootState): FileReference | undefined => {
        return state.setup.activeSetup?.options.materialDensity;
    },

    getBloodPerfusion: (state: RootState): FileReference | undefined => {
        return state.setup.activeSetup?.options.bloodPerfusion;
    },

    getHeatCapacity: (state: RootState): FileReference | undefined => {
        return state.setup.activeSetup?.options.heatCapacity;
    },

    getThermalConductivity: (state: RootState): FileReference | undefined => {
        return state.setup.activeSetup?.options.thermalConductivity;
    },

    getMetabolismHeat: (state: RootState): FileReference | undefined => {
        return state.setup.activeSetup?.options.metabolismHeat;
    },

    getSAR: (state: RootState): FileReference | undefined => {
        return state.setup.activeSetup?.options.SAR;
    },

    getTOld: (state: RootState): FileReference | undefined => {
        return state.setup.activeSetup?.options.tOld;
    },

    getAirTemperature: (state: RootState) => {

        return state.setup.activeSetup.options.air?.temperature;
    },

    getBloodTemperature: (state: RootState) => {
        return state.setup.activeSetup.options.blood?.temperature;
    },

    getBloodCapacity: (state: RootState) => {
        return state.setup.activeSetup.options.blood?.capacity;
    },

    getBloodDensity: (state: RootState) => {
        return state.setup.activeSetup.options.blood?.density;
    },

    getHeatingTime: (state: RootState) => {
        return state.setup.activeSetup.options?.heatingtime;
    }
};

export function getFiles(te: TE): void {
    // List of all possible FileReference fields in TE
    const fileReferenceFields: Array<keyof TEOptions> = [
        'mask',
        'materialDensity',
        'bloodPerfusion',
        'heatCapacity',
        'thermalConductivity',
        'metabolismHeat',
        'SAR',
        'tOld'
    ];

    let files = [];

    // Iterate over each field and check if it's not undefined
    for (const field of fileReferenceFields) {
        if (te.options[field]) {
            files.push(field);
        }
    }
    te.files = files;
}

export type { TE, FileReference, FileOptions };
export const setupSetters = setupSlice.actions;
export const setupGetters = SetupGetters;