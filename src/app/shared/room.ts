export enum RoomType {
  Meeting = 0,
  Training = 1
}


export class Room {

  Id: string;
  name: string;
  localization: string;
  roomType: number;
  constructor(Id: string, name: string, localization: string, roomType: number) {
    this.Id = Id;
    this.name = name;
    this.localization = localization;
    this.roomType = roomType;
  };

}
