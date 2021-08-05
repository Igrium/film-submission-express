import { ApprovalState, FilmInfo, UploadState } from 'fse-shared/dist/meta'


export const uploadStateMap = {
    [UploadState.Uploading]: 'Uploading',
    [UploadState.Processing]: 'Processing',
    [UploadState.ProcessingPreview]: 'Processing Preview',
    [UploadState.Ready]: 'Ready'
}

export const approvalStateMap = {
    [ApprovalState.Pending]: 'Pending',
    [ApprovalState.Approved]: 'Approved',
    [ApprovalState.Rejected]: 'Rejected'
}