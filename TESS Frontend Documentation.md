# TESS Frontend Documentation

## Code structures

./src holds all the important codes

* ./src/app: **visuals** corresponding to major components or entire pages on frontend
* ./src/assets: static images and fonts
* ./src/features: core **logics** decoupled from **visuals**. 
  * Powered by redux
  * Organized as separate redux slices
* ./src/common: reusable singular visual components
  * Note: most of the components are reusable and can remain the same across frontends. 
  * Most of the time, dispatch will only be sent from ./src/app/* but not from ./src/common/*; sometimes, components will directly make dispatch calls to slice out of necessity or convenience.
* ./src/index.tsx: Entry point of frontend app, where React is mounted
* ./src/env.ts: Overridden during Amplify deployment to dynamically Server API base.
* ./src/Variables.ts: Defines App Name, *bug report page*, and API routes. The API routes extend the API base imported from env.ts.

## Visuals (./src/app)

* Entry Point: ./src/app/TESS.tsx->./src/app/MainRouter.tsx

  * TESS.tsx binds state Provider, ThemeProvider, and PersistGate into all subsequent components. 

  * MainRouter is the "actual" entry point of all visuals, containing the following component children:

    ![](C:\Users\Quali\AppData\Roaming\Typora\typora-user-images\image-20240604143012553.png)

    * <BugReport/> page is not included as the link in Header points directly to the *bug report page* defined in ./src/Variables.ts.

* ./src/app/main/Main.tsx - provides and visualizes routing into three subcomponents: 

  * <Home/> - ./src/app/home/Home.tsx
  * <Setup/> -  ./src/app/setup/Setup.tsx
  * <Results/> -  ./src/app/results/Results.tsx
  * Also controls the horizontal expansion of entire container when <Results/> tab is selected.

  ![image-20240604144357163](C:\Users\Quali\AppData\Roaming\Typora\typora-user-images\image-20240604144357163.png)

* ./signin/Signin.tsx - Signin Page. Calls back `dispatch(getAccessToken(credentials))` located in ./src/app/MainRouter.tsx.

  ![image-20240604144832107](C:\Users\Quali\AppData\Roaming\Typora\typora-user-images\image-20240604144832107.png)

## <Home/>

![image-20240604145205738](C:\Users\Quali\AppData\Roaming\Typora\typora-user-images\image-20240604145205738.png)

## <Setup/>

![image-20240604145251759](C:\Users\Quali\AppData\Roaming\Typora\typora-user-images\image-20240604145251759.png)

## <Results/>

![image-20240604145334570](C:\Users\Quali\AppData\Roaming\Typora\typora-user-images\image-20240604145334570.png)

## <Results/>/Results Panel

When the green "play button" is clicked inside the results tab, a dispatch call is made to load the contents of the result from upstream, the result is loaded into `activeJob` through redux appSelector.

![image-20240604153223574](C:\Users\Quali\AppData\Roaming\Typora\typora-user-images\image-20240604153223574.png)

## <Results/>/<Niivue/>



The Inspection Panel of <Results/> contains the following major component as its only effective child. <Niivue/> located at src/common/components/NiivueTools/Niivue.jsx serves all the functionalities of visualizing, drawing, and interacting with .nii volumetric files. 

```tsx
{activeJob != undefined &&
    <NiiVue niis={niis}
            warn={warn}
            setWarning={setWarning}
            setWarningOpen={setWarningOpen}
            setSelectedVolume={(index: number) => {
                dispatch(resultActions.selectVolume(index));
            }} selectedVolume={selectedVolume} key={pipelineID} rois={rois} pipelineID={pipelineID}
            saveROICallback={() => {
                if(pipelineID)
                    dispatch(getPipelineROI({
                        pipeline: pipelineID,
                        accessToken: accessToken
                    }));
            }}
            accessToken={accessToken}/>}
```

![image-20240604150100246](C:\Users\Quali\AppData\Roaming\Typora\typora-user-images\image-20240604150100246.png)

When `activeJob` is not undefined, the <NiiVue/> component is rendered.

![image-20240604153934091](C:\Users\Quali\AppData\Roaming\Typora\typora-user-images\image-20240604153934091.png)

## File Uploading

The file uploader comprises of the <CMRUpload/> component (*src/common/components/Cmr-components/upload/Upload.tsx*) with rich functionalities, and the cooperating redux async-thunks (e.g.  *src/features/data/dataActionCreation.ts/uploadData(...)* )

* A default uploader is built into the UI component, but it can be overridden with custom uploaders. For large files, the three stage uploader is utilized, located at `src/features/data/dataActionCreation.ts/uploadData(...)`, which
  * Makes an uploadInit POST request to TESS_SERVER to create a record of file in upstream database, and pre-designate `k` chunk upload urls that the file will be uploaded through.
  * Slice the file in to `k` chunks and upload each chunk using PUT calls on the designated urls.
  * Make an uploadFinalize POST request to TESS_SERVER to signal the completion of upload and server-side assembly of the file chunks into a complete file.

* Additional complexities to the uploadData(...) async thunk are caused by the need to track uploading progress, and signal the right reducer of the successful upload when uploaders are used at multiple locations of the UI. 
  * onProgress: call back for updating upload progressions
  * onUploaded: call back for a successful upload
  * uploadTarget: a string value to be caught in the slices listening for uploader.fulfilled, to inform the purpose of the uploaded file, (for instance: 'mask' for mask upload, 'md' for material density), so that the reducer can decide to update a corresponding value in the slice.
* To improve the ease of use of the `src/features/data/dataActionCreation.ts/uploadData(...)` async thunk, an `uploadHandlerFactory(...)` wrapper is provided in src/features/SystemUtilities.ts.

Sometimes selection from a range of available files will preceding uploading. The <CMRSelectUpload/> component (*src/common/components/Cmr-components/select-upload/SelectUpload.tsx*) which utilizes around <CMRUpload/> can provide such functionalities.