export class Employee {

    id: number;
    corporateID: string;
    firstName: string;
    lastName: string;
    company: string;
    type: any;
    status: any;

    constructor(id: number, corporateID: string, firstName: string, lastName: string, company: string, type: any, status: any) {
        this.id = id;
        this.corporateID = corporateID;
        this.firstName = firstName;
        this.lastName = lastName;
        this.company = company;
        this.type = type;
        this.status = status;
    }

}
