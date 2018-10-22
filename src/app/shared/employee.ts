export class Employee {

  // Old API
  id: number;
  corporateID: string;
  firstName: string;
  lastName: string;
  company: string;
  type: any;
  status: any;

  // new API
  CorporateId: string;
  FirstName: string;
  LastName: string;
  CompanyId: string;
  Email: string;
  Login: string;
  PersonVisitedId: string;
  SiteId: string;


  // constructor(id: number, corporateID: string, firstName: string, lastName: string, company: string, type: any, status: any) {
  //   this.id = id;
  //   this.corporateID = corporateID;
  //   this.firstName = firstName;
  //   this.lastName = lastName;
  //   this.company = company;
  //   this.type = type;
  //   this.status = status;
  // }

  get _corporateId() {
    return this.corporateID ? this.corporateID : this.CorporateId;
  };

  get _firstName() {
    return this.firstName ? this.firstName : this.FirstName;
  };

  get _lastName() {
    return this.lastName ? this.lastName : this.LastName;
  };
  get _id(){
    return this.id ? this.id : this.PersonVisitedId;
  }
}
