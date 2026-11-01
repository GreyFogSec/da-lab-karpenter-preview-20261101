import fs from 'node:fs'
import path from 'node:path'
import {pathToFileURL} from 'node:url'

const [name, archivePath] = process.argv.slice(2)
if (!name || !archivePath) throw new Error('usage: upload-raw-artifact.mjs NAME ZIP')
if (!fs.statSync(archivePath).isFile()) throw new Error('archive path is not a file')

const artifactLib = path.resolve('node_modules/@actions/artifact/lib')
const importFromArtifact = relative => import(pathToFileURL(path.join(artifactLib, relative)).href)
const {internalArtifactTwirpClient} = await importFromArtifact('internal/shared/artifact-twirp-client.js')
const {getBackendIdsFromToken} = await importFromArtifact('internal/shared/util.js')
const {uploadToBlobStorage} = await importFromArtifact('internal/upload/blob-upload.js')
const {StringValue} = await importFromArtifact('generated/index.js')

const ids = getBackendIdsFromToken()
const client = internalArtifactTwirpClient()
const create = await client.CreateArtifact({
  workflowRunBackendId: ids.workflowRunBackendId,
  workflowJobRunBackendId: ids.workflowJobRunBackendId,
  name,
  mimeType: StringValue.create({value: 'application/zip'}),
  version: 7,
})
if (!create.ok) throw new Error('artifact creation failed')

const uploaded = await uploadToBlobStorage(
  create.signedUploadUrl,
  fs.createReadStream(archivePath),
  'application/zip',
)
const finalized = await client.FinalizeArtifact({
  workflowRunBackendId: ids.workflowRunBackendId,
  workflowJobRunBackendId: ids.workflowJobRunBackendId,
  name,
  size: String(uploaded.uploadSize || 0),
  hash: StringValue.create({value: `sha256:${uploaded.sha256Hash}`}),
})
if (!finalized.ok) throw new Error('artifact finalization failed')
console.log(`Finalized synthetic artifact ID ${finalized.artifactId}`)
