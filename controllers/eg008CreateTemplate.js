/**
 * @file
 * Example 008: create a template if it doesn't already exist
 * @author DocuSign
 */
const docusign = require('docusign-esign')
const eg008CreateTemplate = exports,
  eg = 'eg008', // This example reference.
  minimumBufferMin = 3,
  db = require('../db'),
  SiteLicenceDocument = db.models.siteLicenceDocument
let templateName
/**
 * Create a template
 * @param {object} req Request obj
 * @param {object} res Response obj
 */
eg008CreateTemplate.createController = async (req, res) => {
  // Step 1. Check the token
  // At this point we should have a good token. But we
  // double-check here to enable a better UX to the user.
  let tokenOK = req.dsAuth.checkToken(minimumBufferMin)
  if (!tokenOK) {
    req.flash('info', 'Sorry, you need to re-authenticate.')
    // Save the current operation so it will be resumed after authentication
    req.dsAuth.setEg(req, eg)
  }

  // Step 2. Call the worker method
  templateName = req.template.name
  let args = {
      accessToken: req.user.accessToken,
      basePath: req.session.basePath,
      accountId: req.session.accountId,
      templateName: templateName
    },
    results = null

  try {
    results = await eg008CreateTemplate.worker(args, req.template)
  } catch (error) {
    let errorBody = error && error.response && error.response.body,
      // we can pull the DocuSign error code and message from the response body
      errorCode = errorBody && errorBody.errorCode,
      errorMessage = errorBody && errorBody.message
    // In production, may want to provide customized error messages and
    // remediation advice to the user.
    console.log(errorCode, errorMessage)
    res.status(errorCode).json({ message: errorMessage })
  }
  if (results) {
    // Save the templateId in the session so they can be used in future examples
    req.session.templateId = results.templateId
    let msg = results.createdNewTemplate
    if (msg === 'Done. The template already existed in your account.') {
      res.status(400).json({ message: 'The template already existed in your account.'})
    } else {
      const {siteLicenceTemplateId, name, description, docUrl, isDocuSign} = req.template
      let newSiteLicenceDocument = new SiteLicenceDocument()
      newSiteLicenceDocument.siteLicenceTemplateId = siteLicenceTemplateId
      newSiteLicenceDocument.name = name
      newSiteLicenceDocument.description = description
      newSiteLicenceDocument.docUrl = docUrl
      newSiteLicenceDocument.isDocuSign = isDocuSign
      newSiteLicenceDocument.docuSignTemplateRef = results.templateId
      await newSiteLicenceDocument.save()    
      res.status(200).json(newSiteLicenceDocument)
    }
  }
}

/**
 * This function does the work of checking to see if the template exists and creating it if not.
 */
// ***DS.snippet.0.start
eg008CreateTemplate.worker = async (args, templateDoc) => {
  // Data for this method
  // args.basePath
  // args.accessToken
  // args.accountId

  let dsApiClient = new docusign.ApiClient()
  dsApiClient.setBasePath(args.basePath)
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken)
  let templatesApi = new docusign.TemplatesApi(dsApiClient),
    results = null,
    templateId = null, // the template that exists or will be created.
    resultsTemplateName = null,
    createdNewTemplate = null
  // Step 1. See if the template already exists
  // Exceptions will be caught by the calling function
  results = await templatesApi.listTemplates(args.accountId, {
    searchText: args.templateName
  })

  if (results.resultSetSize > 0) {
    templateId = results.envelopeTemplates[0].templateId
    resultsTemplateName = results.envelopeTemplates[0].name
    createdNewTemplate = false
  } else {
    // Template doesn't exist. Therefore create it...
    // Step 2 Create the template
    let templateReqObject = makeTemplate(templateDoc)
    results = await templatesApi.createTemplate(args.accountId, {
      envelopeTemplate: templateReqObject
    })
    createdNewTemplate = true
    // Retrieve the new template Name / TemplateId
    results = await templatesApi.listTemplates(args.accountId, {
      searchText: args.templateName
    })
    templateId = results.envelopeTemplates[0].templateId
    resultsTemplateName = results.envelopeTemplates[0].name
  }

  return {
    templateId: templateId,
    templateName: resultsTemplateName,
    createdNewTemplate: createdNewTemplate
  }
}

/**
 * Creates the template request object
 * @function
 * @returns {template} An template definition
 * @private
 */
function makeTemplate (templateDoc) {
  // Data for this method

  // document 1 (pdf) has tag /sn1/
  //
  // The template has two recipient roles.
  // recipient 1 - signer
  // recipient 2 - cc
  // The template will be sent first to the signer.
  // After it is signed, a copy is sent to the cc person.

  const documentId = templateDoc.siteLicenceTemplateId

  const buf = Buffer.from(templateDoc.docB64, 'base64')
  let base64 = buf.toString()
  base64 = base64.replace('data:application/pdf;base64,', '')

  // add the documents
  let doc = new docusign.Document()
  doc.documentBase64 = base64
  doc.name = templateDoc.title // can be different from actual file name
  doc.fileExtension = 'pdf'
  doc.documentId = documentId

  // create a signer recipient to sign the document, identified by name and email
  // We're setting the parameters via the object creation
  let signer1 = docusign.Signer.constructFromObject({
    roleName: 'signer',
    recipientId: '1',
    routingOrder: '1'
  })
  // routingOrder (lower means earlier) determines the order of deliveries
  // to the recipients. Parallel routing order is supported by using the
  // same integer as the order for two or more recipients.

  // create a cc recipient to receive a copy of the documents, identified by name and email
  // We're setting the parameters via setters
  let cc1 = new docusign.CarbonCopy()
  cc1.roleName = 'cc'
  cc1.routingOrder = '2'
  cc1.recipientId = '2'

  // Create fields using absolute positioning:
  let signHere = docusign.SignHere.constructFromObject({
      documentId: documentId,
      pageNumber: '1',
      xPosition: '160',
      yPosition: '275'
    }),
    primaryContact = docusign.Text.constructFromObject({
      documentId: documentId,
      pageNumber: '1',
      xPosition: '188',
      yPosition: '131',
      font: 'helvetica',
      fontSize: 'size14',
      tabLabel: 'primaryContact',
      height: '23',
      width: '84',
      required: 'false'
    }),
    companyName = docusign.Text.constructFromObject({
      documentId: documentId,
      pageNumber: '1',
      xPosition: '238',
      yPosition: '200',
      font: 'helvetica',
      fontSize: 'size14',
      tabLabel: 'companyName',
      height: '23',
      width: '84',
      required: 'false'
    }),
    dateOfSign = docusign.Text.constructFromObject({
      documentId: documentId,
      pageNumber: '1',
      xPosition: '128',
      yPosition: '335',
      font: 'helvetica',
      fontSize: 'size14',
      tabLabel: 'dateOfSign',
      height: '23',
      width: '84',
      required: 'false'
    })
  // Tabs are set per recipient / signer
  let signer1Tabs = docusign.Tabs.constructFromObject({
    signHereTabs: [signHere],
    textTabs: [primaryContact, companyName, dateOfSign]
  })
  signer1.tabs = signer1Tabs

  // Add the recipients to the env object
  let recipients = docusign.Recipients.constructFromObject({
    signers: [signer1],
    carbonCopies: [cc1]
  })

  // create the overall template definition
  let template = new docusign.EnvelopeTemplate.constructFromObject({
    // The order in the docs array determines the order in the env
    documents: [doc],
    emailSubject: templateDoc.emailSubject,
    description: templateDoc.description,
    name: templateName,
    shared: 'true',
    recipients: recipients,
    status: 'created'
  })

  return template
}
// ***DS.snippet.0.end

/**
 * Form page for this application
 */
