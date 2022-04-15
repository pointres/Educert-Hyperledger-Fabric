
const crypto = require('crypto');

class Applicant {

    constructor(applicantId , email , password, name , address , pin , state , country , contact , dateOfBirth, currentOrganization, updatedBy)
    {
        this.applicantId = applicantId
        this.email = email,
        this.password= password,
        this.name = name,
        this.address= address,
        this.pin = pin,
        this.state = state,
        this.country = country,
        this.contact = contact,
        this.dateOfBirth = dateOfBirth,
        this.documentIds = [],
        this.currentOrganization = currentOrganization,
        this.organizationsEnrolledIn = [currentOrganization],
        this.permissionGranted= [currentOrganization],
        this.updatedBy = updatedBy
        return this;
    }
}
module.exports = Applicant