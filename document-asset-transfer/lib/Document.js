class Document {

    constructor(documentId , documentHash , applicantId, applicantName , applicantOrganizationNumber , organizationId , organizationName , documentName , description , dateOfAccomplishment, tenure, percentage, outOfPercentage, status, documentURL, updatedBy)
    {
        this.documentId = documentId
        this.documentHash = documentHash,
        this.applicantId= applicantId,
        this.applicantName = applicantName,
        this.applicantOrganizationNumber = applicantOrganizationNumber,
        this.organizationId = organizationId,
        this.organizationName = organizationName,
        this.documentName = documentName,
        this.description = description,
        this.dateOfAccomplishment = dateOfAccomplishment,
        this.tenure = tenure,
        this.percentage = percentage,
        this.outOfPercentage = outOfPercentage,
        this.status = status,
        this.documentURL = documentURL,
        this.updatedBy = updatedBy
        return this;
    }
}
module.exports = Document