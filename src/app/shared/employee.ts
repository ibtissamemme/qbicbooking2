interface ConstructorType {
  id: number
  corporateID: string
  firstName: string
  lastName: string
  company: string
  type: any
  status: any
}

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

  constructor(input:ConstructorType){
    this.id = input.id;
    this.corporateID = input.corporateID;
    this.firstName = input.firstName;
    this.lastName = input.lastName;
    this.company = input.company;
    this.type = input.type;
    this.status = input.status;
  }

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

  isPresent(): boolean {
    if (this.corporateID)
      return null;
    if (this.status === -1)
      return false;
    if (this.status === 1)
      return true;
    if (this.status === "Present") {
      return true;
    }
    else return null;
  }
}

export function EmployeeFromJSON(json: Object): Employee {
  if(json === undefined){
    return undefined;
  }

  let input:ConstructorType = {
    id: json['userId']?json['userId']:json['employeeId'] || json['attendeeId'],
    corporateID: json['corporateId'],
    firstName: json['firstName'],
    lastName: json['lastName'],
    company: json['company'],
    type: json['attendeeType'],
    status: json['attendeeStatus']
  }
  return new Employee(input);
}
