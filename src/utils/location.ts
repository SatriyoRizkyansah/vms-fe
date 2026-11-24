export type DoorDevice = {
  id: string;
  room_name: string;
  is_active: boolean;
  battery_level?: number | null;
  connection_status: string;
};

export type DoorRecord = {
  id: string;
  name: string;
  code?: string | null;
  is_active: boolean;
  devices: DoorDevice[];
};

export type RoomRecord = {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  is_active: boolean;
  doors: DoorRecord[];
};

export type FloorRecord = {
  id: string;
  name: string;
  floor_number?: number | null;
  is_active: boolean;
  rooms: RoomRecord[];
};

export type BuildingRecord = {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  is_active: boolean;
  floors: FloorRecord[];
};

export type VisitLocationOption = {
  room_device_id: string;
  label: string;
};

export type AvailableDoor = {
  id: string;
  label: string;
};

export function getAvailableDoors(buildings: BuildingRecord[]): AvailableDoor[] {
  return buildings.flatMap((building) =>
    building.floors.flatMap((floor) =>
      floor.rooms.flatMap((room) =>
        room.doors
          .filter((door) => building.is_active && floor.is_active && room.is_active && door.is_active && door.devices.length === 0)
          .map((door) => ({
            id: door.id,
            label: [building.name, floor.name, room.name, door.name].join(" / "),
          })),
      ),
    ),
  );
}

export function getDeviceLocationLabel(device: {
  room_name?: string | null;
  door?: {
    name: string;
    room: {
      name: string;
      floor: { name: string; building: { name: string } };
    };
  } | null;
}) {
  if (!device.door) return device.room_name || "Lokasi belum ditentukan";
  return [
    device.door.room.floor.building.name,
    device.door.room.floor.name,
    device.door.room.name,
    device.door.name,
  ].join(" / ");
}

export function getVisitLocationLabel(room?: {
  room_name?: string | null;
  door?: {
    name: string;
    room?: {
      name: string;
      floor?: { name: string; building?: { name: string } | null } | null;
    } | null;
  } | null;
} | null) {
  const door = room?.door;
  const floor = door?.room?.floor;
  const buildingName = floor?.building?.name;
  if (door?.room?.name && floor?.name && buildingName) {
    return [buildingName, floor.name, door.room.name, door.name].join(" / ");
  }
  return room?.room_name || "Lokasi belum ditentukan";
}
