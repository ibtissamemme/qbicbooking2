export enum RoomType {
  Meeting = 0,
  Training = 1
}

export class Room {

  Id: string;
  name: string;
  localization: string;
  roomType: RoomType;
  capacity: number = 8;
  constructor(Id: string, name: string, localization: string, roomType: number, capacity: number) {
    this.Id = Id;
    this.name = name;
    this.localization = localization;
    if(roomType) {
      this.roomType = roomType;
    } else {
      this.roomType = RoomType.Meeting;
    }
    if(capacity){
      this.capacity = capacity;
    }
  };

}


// CompanyId: null
// ControlStatus: null
// Description: "SHIATSU"
// Email: null
// ExternalId: null
// RoomId: "01gCrw9vWLN10"
// RoomNumber: "Bien Etre"
// SiteId: "VPARDEFAUT"

export function roomFromJSON(jsonInput:Object):Room {
  return new Room(jsonInput['roomId'] || jsonInput['RoomId'],
  jsonInput['description'] || jsonInput['Description'],
  jsonInput['roomNumber'] || jsonInput['RoomNumber'],
  jsonInput['roomType'] || jsonInput['RoomType'], 8);
}
