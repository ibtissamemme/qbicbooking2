
export class Site {
    Id: string;
    name: string;
    slides: string[];
    constructor(Id: string, name: string) {
        this.Id = Id;
        this.name = name;
    }
}



// Address: null
// City: "Grenoble"
// Country: ""
// Description: "Gemblou"
// PostalCode: "38000"
// SiteId: "Gb4FmP9wa6tL3"

export function siteFromJson(input: Object): Site {
  return new Site(input['siteId'] || input['SiteId'], input['description'] || input['Description']);
}
