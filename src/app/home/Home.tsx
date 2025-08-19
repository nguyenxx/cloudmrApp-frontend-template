import { Fragment, useEffect, useState } from 'react';
import './Home.scss';
import { CmrTable, CmrCollapse, CmrPanel } from 'cloudmr-ux';
import { useAppDispatch, useAppSelector } from '../../features/hooks';
import { UploadedFile } from '../../features/data/dataSlice';
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import GetAppIcon from "@mui/icons-material/GetApp";
import DeleteIcon from "@mui/icons-material/Delete";
import { CmrNameDialog } from 'cloudmr-ux';
import { getUpstreamJobs, renameUpstreamJob } from "../../features/jobs/jobActionCreation";
import {
    deleteUploadedData,
    getUploadedData,
    renameUploadedData,
    uploadData
} from '../../features/data/dataActionCreation';
import { deleteUpstreamJob } from '../../features/jobs/jobActionCreation';
import { jobsSlice } from "../../features/jobs/jobsSlice";
import { CmrConfirmation } from 'cloudmr-ux';
import { Button, CircularProgress } from "@mui/material";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { CMRUpload, LambdaFile } from 'cloudmr-ux';
import { getFileExtension } from "../../common/utilities";
import { is_safe_twix } from "../../common/utilities/file-transformation/anonymize";
// import { DATA_UPLOAD_API } from "../../Variables";
import { AxiosRequestConfig } from "axios";
import { uploadHandlerFactory } from "../../features/SystemUtilities";

const Home = () => {

    const renamingProxy = (newName: string, proxyCallback: () => void) => {
        return new Promise<boolean>(resolve => {
            let originalExt = originalName.split('.').pop();
            if (newName.split('.').length == 1) {
                setMessage(`Missing file extension in '${newName}'.`);
                setColor('error');
                setConfirmCallback(() => () => {
                    resolve(false);
                });
                setCancelCallback(() => () => {
                    resolve(false);
                })
                setOpen(true);
            } else if (newName.split('.').pop() != originalExt) {
                let newExt = newName.split('.').pop();
                let orgExt = originalExt ?? '?';
                setMessage(`Changing file extension from ${orgExt} to ${newExt}.`);
                setColor('primary');
                setConfirmCallback(() => () => {
                    proxyCallback();
                    resolve(true);
                });
                setCancelCallback(() => () => {
                    resolve(false);
                })
                setOpen(true);
            } else {
                proxyCallback();
                resolve(true);
            }
        })
    }
    const uploadedFilesColumns = [

        {
            headerName: 'File Name',
            dataIndex: 'fileName',
            field: 'fileName',
            editable: true,
            flex: 1,
        },
        {
            headerName: 'Date Submitted',
            dataIndex: 'createdAt',
            field: 'createdAt',
            flex: 1,
        },
        {
            headerName: 'Status',
            dataIndex: 'status',
            field: 'status',
            flex: 1,
        },
        {
            field: 'actions',
            headerName: 'Edit File Name',
            sortable: false,
            width: 160,
            disableClickEventBubbling: true,
            renderCell: (params: any) => {
                let index = files.findIndex(row => row.id === params.id);
                return (
                    <div>
                        <IconButton onClick={() => {
                            setOriginalName(files[index].fileName);
                            setNameDialogOpen(true);
                            setRenamingCallback(() => (newName: string) => {
                                return renamingProxy(newName, () => {
                                    // In case of working API
                                    let dataReference = files[index];
                                    //@ts-ignore
                                    dispatch(renameUploadedData({
                                        accessToken,
                                        fileId: dataReference.id,
                                        fileName: newName
                                    }));
                                });
                                // In case of non-working API, change name locally
                                // dispatch(dataSlice.actions.renameData({index:index,alias:newName}));
                            });
                        }}>
                            {params.row.renamingPending ? <CircularProgress size={20} /> : <EditIcon />}
                        </IconButton>
                        {/* Download logic here  */}
                        {/* <IconButton onClick={(e) => {
                            let url = params.row.link;
                            e.stopPropagation();
                            e.preventDefault();
                            if (url == "unknown")
                                return;
                            // Create an anchor element
                            const a = document.createElement('a');
                            a.href = url;

                            console.log(params.row.fileName);

                            // Extract the file name from the URL, if possible
                            a.download = params.row.fileName;

                            // Append the anchor to the body (this is necessary to programmatically trigger the click event)
                            document.body.appendChild(a);

                            // Trigger a click event to start the download
                            a.click();

                            // Remove the anchor from the body
                            document.body.removeChild(a)
                        }}>
                            <GetAppIcon />
                        </IconButton> */}
                        {/* <IconButton onClick={(e) => {
                            setName(`Deleting data`);
                            setMessage(`Please confirm that you are deleting: ${params.row.fileName}.`);
                            setColor('error');
                            setConfirmCallback(() => () => {
                                // dispatch(dataSlice.actions.deleteData({index}));
                                //@ts-ignore
                                dispatch(deleteUploadedData({ accessToken: accessToken, fileId: params.row.id }));
                            })
                            setCancelCallback(() => { });
                            setOpen(true);
                            e.stopPropagation();
                        }}>
                            {params.row.deletionPending ? <CircularProgress size={20} /> : <DeleteIcon />}
                        </IconButton> */}
                    </div>
                );
            },
        }
    ];

    const jobsColumns = [
        {
            headerName: 'Job ID',
            dataIndex: 'id',
            field: 'id',
            flex: 1,
        },
        {
            headerName: 'Alias',
            dataIndex: 'alias',
            field: 'alias',
            flex: 3,
        },
        {
            headerName: 'Date Submitted',
            dataIndex: 'createdAt',
            field: 'createdAt',
            flex: 2,
        },
        {
            headerName: 'Status',
            dataIndex: 'status',
            field: 'status',
            flex: 1,
        },
        {
            field: 'actions',
            headerName: 'Actions',
            sortable: false,
            width: 160,
            disableClickEventBubbling: true,
            renderCell: (params: any) => {
                let index = jobsData.findIndex(row => row.id === params.id);
                return (
                    <div>
                        <IconButton onClick={() => {
                            setOriginalName(jobsData[index].alias);
                            setNameDialogOpen(true);
                            setRenamingCallback(() => async (newName: string) => {
                                // In case of working API
                                // let jobReference = jobsData[renameFileIndex];
                                // jobReference.alias = newName;
                                // renameUpstreamJob({accessToken, jobReference});

                                // In case of non-working API, change name locally
                                dispatch(jobsSlice.actions.renameJob({ index: index, alias: newName }));
                                return true;
                            });
                        }}>
                            <EditIcon />
                        </IconButton>
                        <IconButton onClick={(e) => {/* Download logic here */
                            e.stopPropagation();
                            e.preventDefault();
                            console.log(params.row.files);
                            params.row.files.forEach((file: UploadedFile) => {
                                let url = file.link;
                                if (url == "unknown")
                                    return;
                                // Create an anchor element
                                const a = document.createElement('a');
                                a.href = url;

                                // Extract the file name from the URL, if possible
                                a.download = `${file.fileName}.${url.split('.').pop()}`;

                                // Append the anchor to the body (this is necessary to programmatically trigger the click event)
                                document.body.appendChild(a);

                                // Trigger a click event to start the download
                                a.click();

                                // Remove the anchor from the body
                                document.body.removeChild(a);
                            });
                        }}>
                            <GetAppIcon />
                        </IconButton>
                        <IconButton onClick={() => {
                            setName(`Deleting Data`);
                            setMessage(`Please confirm that you are deleting data ${params.row.id}.`);
                            setColor('error');
                            setConfirmCallback(() => () => {
                                console.log(index);
                                dispatch(deleteUpstreamJob({ accessToken, jobId: params.row.id }));
                                dispatch(jobsSlice.actions.deleteJob({ index }));
                            });
                            setCancelCallback(() => { });
                            setOpen(true);
                        }}>
                            <DeleteIcon />
                        </IconButton>
                    </div>
                );
            },
        }
    ];

    const dispatch = useAppDispatch();
    const { accessToken, uploadToken } = useAppSelector((state) => state.authenticate);
    const { files } = useAppSelector((state) => state.data);
    const jobsData = useAppSelector((state) => state.jobs.jobs);
    const [nameDialogOpen, setNameDialogOpen] = useState(false);
    const [renamingCallback, setRenamingCallback] = useState<(alias: string) => Promise<boolean>>(async () => true);
    const [originalName, setOriginalName] = useState('');

    const [name, setName] = useState<string | undefined>(undefined);
    const [message, setMessage] = useState<string | undefined>(undefined);
    const [color, setColor] = useState<"inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning" | undefined>(undefined);
    const [open, setOpen] = useState<boolean>(false);
    const [confirmCallback, setConfirmCallback] = useState<() => void>(() => { });
    const [cancelCallback, setCancelCallback] = useState<() => void>(() => { });

    const [selectedData, setSelectedData] = useState<GridRowSelectionModel>([]);

    useEffect(() => {
        //@ts-ignore
        dispatch(getUploadedData(accessToken));
        //@ts-ignore
        dispatch(getUpstreamJobs(accessToken));
        console.log("dispatched");
    }, []);


    const [uploadKey, setUploadKey] = useState(0);
    const UploadHeaders: AxiosRequestConfig = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
    };

    
    function downloadSelectedValues() {
        let downloadPending: UploadedFile[] = [];
        selectedData.map((id) => {
            for (let file of files) {
                if (file.id == id)
                    downloadPending.push(file);
            }
        });
        console.log(selectedData);
        function downloadMultipleFiles(files: UploadedFile[]) {
            // This function creates an anchor and triggers a download
            function triggerDownload(url: string, fileName: string) {
                const anchor = document.createElement('a');
                anchor.href = url;
                console.log(url);
                anchor.download = fileName;
                document.body.appendChild(anchor);
                anchor.click();
                document.body.removeChild(anchor);
            }

            // Iterate over the files array
            files.forEach((file, index) => {
                // Set a timeout to space out the downloads
                setTimeout(() => {
                    triggerDownload(file.link, file.fileName);
                }, index * 1000); // Delay each download by 1 second
            });
        }
        downloadMultipleFiles(downloadPending);
    }
    return (
        <Fragment>
            <CmrCollapse accordion={false} defaultActiveKey={[0, 1]} expandIconPosition="right">
                <CmrPanel key="0" header="Uploaded Data" className='mb-2'>
                    <CmrTable dataSource={[...files]
                        .filter(file => {
                            const name = file.fileName.toLowerCase();
                            return !name.endsWith('.zip') && !name.endsWith('.nii');
                        })
                        .reverse()
                    } rowSelectionModel={selectedData} onRowSelectionModelChange={(rowSelectionModel) => {
                        setSelectedData(rowSelectionModel);
                    }} columns={uploadedFilesColumns} />
                    
                    <div className="row mt-2">
                        <div className="col-4">
                            <Button color={'error'} style={{ textTransform: 'none' }} variant={'contained'} fullWidth={true} onClick={() => {
                                setName(`Deleting Data`);
                                setMessage(`Please confirm that you are deleting the selected data.`);
                                setColor('error');
                                setConfirmCallback(() => () => {
                                    for (let id of selectedData) {
                                        let index = files.findIndex(row => row.id === id);
                                        // dispatch(jobsSlice.actions.deleteJob({index}));
                                        // @ts-ignore
                                        dispatch(deleteUploadedData({ accessToken, fileId: id }))
                                    }
                                });
                                setOpen(true);
                            }} disabled={selectedData.length === 0}> <DeleteIcon className='me-2'/>Delete</Button>
                        </div>
                        <div className="col-4">
                            <Button color={'success'} style={{ textTransform: 'none' }} variant={'contained'} fullWidth={true} onClick={() => {
                                downloadSelectedValues();
                            }} disabled={selectedData.length === 0}><GetAppIcon className='me-2'/>Download</Button>
                        </div>

                        <div className="col-4">
                            {/* TOBREMOVED AFTER THE BETA TESTING */}
                            {/* <Button color={'primary'} style={{textTransform:'none'}} variant={'contained'} fullWidth={true} disabled={true}> Upload </Button> */}
                            {/* TOBEACTIVATED AFTER THE BETA TESTING */}
                            <CMRUpload fileExtension={['.nii', '.nii.gz', '.mha', '.mhd', '.npx', '.npy', '.pkl', '.mat']} 
                                key={uploadKey} fullWidth
                                onUploaded={(res, file) => {
                                    dispatch(getUploadedData(accessToken));
                                    setUploadKey(uploadKey + 1);
                                }}
                                uploadHandler={uploadHandlerFactory(accessToken, uploadToken, dispatch, uploadData)}
                                maxCount={1}></CMRUpload>
                        </div>
                    </div>
                </CmrPanel>
                <CmrNameDialog open={nameDialogOpen} setOpen={setNameDialogOpen} originalName={originalName}
                    renamingCallback={renamingCallback} />

                <CmrConfirmation
                    name={name}
                    message={message}
                    color={color}
                    open={open}
                    setOpen={setOpen}
                    confirmCallback={confirmCallback}
                    cancelCallback={cancelCallback}
                    cancellable={true}
                    width={450}
                />
            </CmrCollapse>
            <div style={{ height: '69px' }}></div>
        </Fragment>
    );
};

export default Home;
