
const crypto = require('crypto');

class Applicant {

    constructor(applicantId , email , password, name , address , pin , state , country , contact , dateOfBirth, documentId, document)
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
        this.documentId = documentId,
        this.document = document,
        this.permissionGranted= [],
        this.updatedBy = this.updatedBy
        return this;
    }
}
module.exports = Applicant