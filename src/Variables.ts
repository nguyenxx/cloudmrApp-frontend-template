
import {CLOUDMR_SERVER} from './env';

export const SIGNIN = `${CLOUDMR_SERVER}/login`;//'http://cancelit-env.eba-pmamcuv5.us-east-1.elasticbeanstalk.com/api/auth/login';//'https://cloudmrhub.com/api/auth/login';
export const SIGNOUT = `${CLOUDMR_SERVER}/logout`;//https://cloudmrhub.com/api/auth/logout';
export const PROFILE = `${CLOUDMR_SERVER}/profile`;

export const ROI_GET = `${CLOUDMR_SERVER}/roi/list`;
export const ROI_UPLOAD = `${CLOUDMR_SERVER}/roi/upload`;

export const DATA_API = `${CLOUDMR_SERVER}/data/read`;
export const DATA_DELETE_API = `${CLOUDMR_SERVER}/data/delete`;
export const DATA_RENAME_API = `${CLOUDMR_SERVER}/data/update`;

export const DATA_UPLOAD_INIT = `${CLOUDMR_SERVER}/upload_initiate`;
export const DATA_UPLOAD_FINALIZE = `${CLOUDMR_SERVER}/upload_finalize`;

export const JOB_UPLOAD_INIT = `${CLOUDMR_SERVER}/upload_initiate/results`;
export const JOB_UPLOAD_FINALIZE = `${CLOUDMR_SERVER}/upload_finalize/results`;
export const JOBS_RETRIEVE_API = `${CLOUDMR_SERVER}/pipeline/list/14cf5503-b1e4-47dc-9f87-69d3e1b095ee`;
export const JOBS_DELETE_API = `${CLOUDMR_SERVER}/pipeline/delete`;
export const JOBS_API = `${CLOUDMR_SERVER}/pipeline/queue_job`;

export const UNZIP = `${CLOUDMR_SERVER}/unzip`;

// APP Name
export const APP_NAME = 'TESS';

// API_TOKEN
// export const API_TOKEN = ''

export const APP_BUG_REPORT = 'https://github.com/cloudmrhub-com/tess/issues';
// Obsolete routes
export const JOBS_RENAME_API = 'http://localhost:5010/jobs/rename';
// export const JOBS_DELETE_API =  'http://localhost:5010/jobs/delete';
// export const HOST = 'cancelit-env.eba-pmamcuv5.us-east-1.elasticbeanstalk.com';
export const FILE_CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunk size

