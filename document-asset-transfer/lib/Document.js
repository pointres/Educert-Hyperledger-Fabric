class Document {

    constructor(documentId , documentHash , applicantId, applicantName , applicantOrganizationNumber , organizationId , documentName , description , dateOfAccomplishment, tenure, percentage, outOfPercentage, status, documentURL, updatedBy)
    {
        this.documentId = documentId
        this.documentHash = documentHash,
        this.applicantId= applicantId,
        this.applicantName = applicantName,
        this.applicantOrganizationNumber = applicantOrganizationNumber,
        this.organizationId = organizationId,
        this.documentName = documentName,
        this.description = description,
        this.dateOfAccomplishment = dateOfAccomplishment,
        this.tenure = tenure,
        this.percentage = percentage,
        this.outOfPercentage = outOfPercentage,
        this.status = status,
        this.documentURL = documentURL,
        this.permissionGranted = [organizationId],
        this.updatedBy = updatedBy
        return this;
    }
}
module.exports = Document