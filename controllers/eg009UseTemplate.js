/**
 * @file
 * Example 009: Send envelope using a template
 * @author DocuSign
 */
const docusign = require('docusign-esign'),
  validator = require('validator')
const eg009UseTemplate = exports,
  eg = 'eg009', // This example reference.
  mustAuthenticate = '/ds/mustAuthenticate',
  minimumBufferMin = 3,
  moment = require('moment'),
  db = require('../db'),
  LicenceDocument = db.models.licenceDocument
/**
 * Send envelope with a template
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg009UseTemplate.createController = async (req, res) => {
  // Step 1. Check the token
  // At this point we should have a good token. But we
  // double-check here to enable a better UX to the user.
  let tokenOK = req.dsAuth.checkToken(minimumBufferMin)
  if (!tokenOK) {
    req.flash('info', 'Sorry, you need to re-authenticate.')
    // Save the current operation so it will be resumed after authentication
    req.dsAuth.setEg(req, eg)
    res.redirect(mustAuthenticate)
  }
  let now = new moment(new Date()).format('YYYY-MM-DD')
  // Step 2. Call the worker method
  let body = {
    signerEmail: req.signer.email,
    signerName: req.signer.fullName,
    ccEmail: req.user.email,
    ccName: req.user.fullName
  }
  // Additional data validation might also be appropriate
  let signerEmail = validator.escape(body.signerEmail),
    signerName = validator.escape(body.signerName),
    ccEmail = validator.escape(body.ccEmail),
    ccName = validator.escape(body.ccName)
  await Promise.all(
    req.signer.docs.map(async doc => {
      let envelopeArgs = {
          templateId: doc.templateId,
          signerEmail: signerEmail,
          signerName: signerName,
          ccEmail: ccEmail,
          ccName: ccName,
          textTabs: [
            {
              tabLabel: 'primaryContact',
              value: req.signer.primaryContact
            },
            {
              tabLabel: 'companyName',
              value: req.signer.companyName
            },
            {
              tabLabel: 'dateOfSign',
              value: now
            }
          ]
        },
        args = {
          accessToken: req.user.accessToken,
          basePath: req.session.basePath,
          accountId: req.session.accountId,
          envelopeArgs: envelopeArgs
        },
        results = null
      try {
        results = await eg009UseTemplate.worker(args)
      } catch (error) {
        let errorBody = error && error.response && error.response.body,
          // we can pull the DocuSign error code and message from the response body
          errorCode = errorBody && errorBody.errorCode,
          errorMessage = errorBody && errorBody.message
        console.log(errorCode, errorMessage)
        res.status(errorCode).json({ message: errorMessage })
      }
      if (results) {
        req.session.envelopeId = results.envelopeId // Save for use by other examples
        console.log(results.envelopeId)
        await LicenceDocument.update(
          { docuSignDocumentRef: results.envelopeId },
          {
            where: {
              licenceDocumentId: doc.newLicenceDocument.licenceDocumentId
            }
          }
        )
      }
    })
  )
  let newLicence = req.signer.newLicence
  res.status(200).json(newLicence)
}

/**
 * This function does the work of creating the envelope
 * @param {object} args object
 */
// ***DS.snippet.0.start
eg009UseTemplate.worker = async args => {
  console.log('worker')
  // Data for this method
  // args.basePath
  // args.accessToken
  // args.accountId

  let dsApiClient = new docusign.ApiClient()
  dsApiClient.setBasePath(args.basePath)
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken)
  let envelopesApi = new docusign.EnvelopesApi(dsApiClient)

  // Step 1. Make the envelope request body
  let envelope = makeEnvelope(args.envelopeArgs)

  // Step 2. call Envelopes::create API method
  // Exceptions will be caught by the calling function
  let results = await envelopesApi.createEnvelope(args.accountId, {
    envelopeDefinition: envelope
  })

  return results
}

/**
 * Creates envelope from the template
 * @function
 * @param {Object} args object
 * @returns {Envelope} An envelope definition
 * @private
 */
function makeEnvelope (args) {
  console.log('makeEnvelope')
  // Data for this method
  // args.signerEmail
  // args.signerName
  // args.ccEmail
  // args.ccName
  // args.templateId

  // The envelope has two recipients.
  // recipient 1 - signer
  // recipient 2 - cc

  // create the envelope definition
  let env = new docusign.EnvelopeDefinition()
  env.templateId = args.templateId

  // Create template role elements to connect the signer and cc recipients
  // to the template
  // We're setting the parameters via the object creation
  let signer1 = docusign.TemplateRole.constructFromObject({
    email: args.signerEmail,
    name: args.signerName,
    roleName: 'signer'
  })

  let primaryContact = docusign.Text.constructFromObject(args.textTabs[0]),
    companyName = docusign.Text.constructFromObject(args.textTabs[1]),
    dateOfSign = docusign.Text.constructFromObject(args.textTabs[2])

  let signer1Tabs = docusign.Tabs.constructFromObject({
    textTabs: [primaryContact, companyName, dateOfSign]
  })
  signer1.tabs = signer1Tabs

  // Create a cc template role.
  // We're setting the parameters via setters
  let cc1 = new docusign.TemplateRole()
  cc1.email = args.ccEmail
  cc1.name = args.ccName
  cc1.roleName = 'cc'

  // Add the TemplateRole objects to the envelope object
  env.templateRoles = [signer1, cc1]
  env.status = 'sent' // We want the envelope to be sent
  
  return env
}
// ***DS.snippet.0.end
