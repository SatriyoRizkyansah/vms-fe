import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  DoorOpen,
  Layers3,
  MapPin,
  Plus,
  Power,
  Smartphone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/vms/primitives";
import { cn } from "@/lib/utils";
import type { BuildingRecord, DoorRecord, FloorRecord, RoomRecord } from "@/utils/location";

const LOCATION_ICONS: Record<LocationKind, LucideIcon> = {
  building: Building2,
  floor: Layers3,
  room: MapPin,
  door: DoorOpen,
};

export type LocationKind = "building" | "floor" | "room" | "door";
export type LocationRef = { kind: LocationKind; id: string };
export type CreateLocationTarget =
  | { kind: "building" }
  | { kind: "floor"; parentId: string; parentName: string }
  | { kind: "room"; parentId: string; parentName: string }
  | { kind: "door"; parentId: string; parentName: string };

type ResolvedLocation = {
  kind: LocationKind;
  id: string;
  name: string;
  is_active: boolean;
  path: string[];
  building: BuildingRecord;
  floor?: FloorRecord;
  room?: RoomRecord;
  door?: DoorRecord;
};

type FlatLocation = LocationRef & {
  name: string;
  is_active: boolean;
  depth: number;
  ancestors: string[];
  hasChildren: boolean;
  addTarget?: CreateLocationTarget;
  addDisabled?: boolean;
};

type LocationBrowserProps = {
  buildings: BuildingRecord[];
  isAdmin: boolean;
  onCreate: (target: CreateLocationTarget) => void;
  onStatusChange: (kind: LocationKind, id: string, isActive: boolean) => void;
};

export function LocationBrowser({ buildings, isAdmin, onCreate, onStatusChange }: LocationBrowserProps) {
  const [selectedRef, setSelectedRef] = useState<LocationRef | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const tree = useMemo(() => flattenLocations(buildings), [buildings]);
  const defaultRef = selectedRef ?? (buildings[0] ? { kind: "building" as const, id: buildings[0].id } : null);
  const selected = defaultRef ? resolveLocation(buildings, defaultRef) : null;
  const visibleTree = tree.filter((item) => !item.ancestors.some((id) => collapsed[id]));

  function toggleCollapsed(id: string) {
    setCollapsed((current) => ({ ...current, [id]: !current[id] }));
  }

  function selectLocation(ref: LocationRef) {
    setSelectedRef(ref);
    const node = resolveLocation(buildings, ref);
    if (!node) return;
    setCollapsed((current) => ({
      ...current,
      [node.building.id]: false,
      ...(node.floor ? { [node.floor.id]: false } : {}),
      ...(node.room ? { [node.room.id]: false } : {}),
    }));
  }

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <Card className="overflow-hidden lg:sticky lg:top-4">
        <CardHeader className="border-b px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm">Struktur lokasi</CardTitle>
              <CardDescription className="mt-1">{buildings.length} gedung</CardDescription>
            </div>
            {isAdmin && (
              <Button size="icon-sm" variant="outline" aria-label="Tambah gedung" title="Tambah gedung" onClick={() => onCreate({ kind: "building" })}>
                <Plus className="size-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="max-h-[calc(100svh-16rem)] overflow-y-auto p-2">
          <div className="grid gap-0.5">
            {visibleTree.map((item) => (
              <TreeItem
                key={item.kind + item.id}
                item={item}
                selected={selected?.kind === item.kind && selected.id === item.id}
                expanded={!collapsed[item.id]}
                isAdmin={isAdmin}
                onSelect={() => selectLocation({ kind: item.kind, id: item.id })}
                onToggle={() => toggleCollapsed(item.id)}
                onAdd={item.addTarget ? () => onCreate(item.addTarget!) : undefined}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {selected ? (
        <LocationDetails
          node={selected}
          isAdmin={isAdmin}
          canActivate={canActivate(selected)}
          onSelect={selectLocation}
          onCreate={onCreate}
          onStatusChange={onStatusChange}
        />
      ) : (
        <Card>
          <EmptyState icon={<Building2 className="size-5" />} title="Belum ada lokasi" description="Buat gedung terlebih dahulu, lalu tambahkan lantai, ruangan, dan pintu." />
        </Card>
      )}
    </div>
  );
}

function TreeItem({
  item,
  selected,
  expanded,
  isAdmin,
  onSelect,
  onToggle,
  onAdd,
}: {
  item: FlatLocation;
  selected: boolean;
  expanded: boolean;
  isAdmin: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onAdd?: () => void;
}) {
  const Icon = LOCATION_ICONS[item.kind];
  return (
    <div className={cn("group flex min-w-0 items-center gap-0.5 rounded-md pr-1", selected ? "bg-accent text-accent-foreground" : "hover:bg-muted/70")}>
      <span className="shrink-0" style={{ width: 8 + item.depth * 12 }} />
      <button
        type="button"
        aria-label={(expanded ? "Ciutkan " : "Perluas ") + item.name}
        aria-expanded={item.hasChildren ? expanded : undefined}
        disabled={!item.hasChildren}
        onClick={onToggle}
        className="grid size-6 shrink-0 place-items-center rounded text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-0"
      >
        {item.hasChildren ? expanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" /> : <span className="size-3.5" />}
      </button>
      <button
        type="button"
        aria-current={selected ? "page" : undefined}
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-2 py-2 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate">{item.name}</span>
        <span title={item.is_active ? "Aktif" : "Nonaktif"} className={cn("size-1.5 shrink-0 rounded-full", item.is_active ? "bg-foreground" : "bg-muted-foreground/40")} />
      </button>
      {isAdmin && item.addTarget && (
        <Button
          size="icon-xs"
          variant="ghost"
          aria-label={"Tambah " + locationKindName(item.addTarget.kind) + " di " + item.name}
          title={"Tambah " + locationKindName(item.addTarget.kind)}
          disabled={item.addDisabled}
          onClick={onAdd}
          className="shrink-0 opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
        >
          <Plus className="size-3.5" />
        </Button>
      )}
    </div>
  );
}

function LocationDetails({
  node,
  isAdmin,
  canActivate: canEnable,
  onSelect,
  onCreate,
  onStatusChange,
}: {
  node: ResolvedLocation;
  isAdmin: boolean;
  canActivate: boolean;
  onSelect: (location: LocationRef) => void;
  onCreate: (target: CreateLocationTarget) => void;
  onStatusChange: (kind: LocationKind, id: string, isActive: boolean) => void;
}) {
  const Icon = LOCATION_ICONS[node.kind];
  const children = getChildren(node);
  const createTarget = getCreateTarget(node);
  const canAddChild = node.is_active && canActivate(node);
  const doorCount = countDoors(node);
  const deviceCount = countDevices(node);

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="border-b px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <nav aria-label="Lokasi induk" className="mb-3 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              {node.path.map((part, index) => (
                <span key={part + index} className="inline-flex items-center gap-1">
                  {index > 0 && <ChevronRight className="size-3" />}
                  <span className={index === node.path.length - 1 ? "font-medium text-foreground" : ""}>{part}</span>
                </span>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted"><Icon className="size-5" /></div>
              <div className="min-w-0">
                <CardTitle className="truncate text-lg">{node.name}</CardTitle>
                <CardDescription className="mt-1">{getDescription(node)}</CardDescription>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={node.is_active ? "secondary" : "outline"}>{node.is_active ? "Aktif" : "Nonaktif"}</Badge>
            {isAdmin && (
              <Button variant="outline" size="sm" disabled={!node.is_active && !canEnable} onClick={() => onStatusChange(node.kind, node.id, !node.is_active)}>
                <Power className="size-3.5" />{node.is_active ? "Nonaktifkan" : "Aktifkan"}
              </Button>
            )}
            {isAdmin && createTarget && (
              <Button size="sm" disabled={!canAddChild} onClick={() => onCreate(createTarget)}>
                <Plus className="size-3.5" />Tambah {childName(node.kind)}
              </Button>
            )}
            {node.kind === "door" && <Button variant="outline" size="sm" render={<Link to="/app/devices" />}>Kelola perangkat</Button>}
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {getMetrics(node, doorCount, deviceCount).map((metric) => (
            <div key={metric.label} className="rounded-lg border bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <p className="mt-1 text-lg font-semibold tabular-nums">{metric.value}</p>
            </div>
          ))}
        </div>

        {node.kind === "building" && node.building.address && <DetailRow label="Alamat" value={node.building.address} />}
        {node.kind === "room" && node.room?.description && <DetailRow label="Keterangan" value={node.room.description} />}
        {node.kind === "door" && <DoorDevice door={node.door} />}

        <section>
          <div className="mb-3">
            <h2 className="text-sm font-semibold">{node.kind === "door" ? "Kode pintu" : "Isi lokasi"}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {children.length ? children.length + " " + childName(node.kind, children.length !== 1) : node.kind === "door" ? (node.door?.code || "Kode belum diatur") : "Belum ada " + childName(node.kind, true) + "."}
            </p>
          </div>
          {children.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {children.map((child) => {
                const ChildIcon = LOCATION_ICONS[child.kind];
                return (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => onSelect({ kind: child.kind, id: child.id })}
                    className="flex min-w-0 items-center gap-3 rounded-lg border bg-card p-3 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="grid size-9 shrink-0 place-items-center rounded-md bg-muted"><ChildIcon className="size-4 text-muted-foreground" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{child.name}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{child.meta}</p>
                    </div>
                    <Badge variant={child.is_active ? "secondary" : "outline"} className="shrink-0">{child.is_active ? "Aktif" : "Nonaktif"}</Badge>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          ) : node.kind !== "door" ? (
            <div className="rounded-lg border border-dashed p-5 text-center">
              <p className="text-sm text-muted-foreground">Belum ada {childName(node.kind)}.</p>
              {isAdmin && createTarget && <Button className="mt-3" size="sm" variant="outline" disabled={!canAddChild} onClick={() => onCreate(createTarget)}><Plus className="size-3.5" />Tambah {childName(node.kind, false)}</Button>}
            </div>
          ) : null}
        </section>
      </CardContent>
    </Card>
  );
}

function DoorDevice({ door }: { door?: DoorRecord }) {
  const device = door?.devices[0];
  return (
    <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
      <div className="grid size-9 shrink-0 place-items-center rounded-md bg-background"><Smartphone className="size-4 text-muted-foreground" /></div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{device ? device.room_name : "Smart lock belum terdaftar"}</p>
        <p className="mt-1 text-xs text-muted-foreground">{device ? "Koneksi " + device.connection_status + (device.battery_level == null ? "" : " · baterai " + device.battery_level + "%") : "Daftarkan perangkat dari halaman Perangkat."}</p>
      </div>
      {device && <Badge variant={device.is_active ? "secondary" : "outline"}>{device.is_active ? "Terhubung" : "Nonaktif"}</Badge>}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <div className="flex flex-wrap gap-x-3 gap-y-1 rounded-lg bg-muted/50 px-4 py-3 text-sm"><span className="font-medium">{label}</span><span className="text-muted-foreground">{value}</span></div>;
}

function flattenLocations(buildings: BuildingRecord[]): FlatLocation[] {
  const rows: FlatLocation[] = [];
  for (const building of buildings) {
    rows.push({ kind: "building", id: building.id, name: building.name, is_active: building.is_active, depth: 0, ancestors: [], hasChildren: building.floors.length > 0, addTarget: { kind: "floor", parentId: building.id, parentName: building.name }, addDisabled: !building.is_active });
    for (const floor of building.floors) {
      rows.push({ kind: "floor", id: floor.id, name: floor.name, is_active: floor.is_active, depth: 1, ancestors: [building.id], hasChildren: floor.rooms.length > 0, addTarget: { kind: "room", parentId: floor.id, parentName: building.name + " / " + floor.name }, addDisabled: !building.is_active || !floor.is_active });
      for (const room of floor.rooms) {
        rows.push({ kind: "room", id: room.id, name: room.name, is_active: room.is_active, depth: 2, ancestors: [building.id, floor.id], hasChildren: room.doors.length > 0, addTarget: { kind: "door", parentId: room.id, parentName: building.name + " / " + floor.name + " / " + room.name }, addDisabled: !building.is_active || !floor.is_active || !room.is_active });
        for (const door of room.doors) {
          rows.push({ kind: "door", id: door.id, name: door.name, is_active: door.is_active, depth: 3, ancestors: [building.id, floor.id, room.id], hasChildren: false });
        }
      }
    }
  }
  return rows;
}

function resolveLocation(buildings: BuildingRecord[], ref: LocationRef): ResolvedLocation | null {
  for (const building of buildings) {
    if (ref.kind === "building" && building.id === ref.id) return { kind: "building", id: building.id, name: building.name, is_active: building.is_active, path: [building.name], building };
    for (const floor of building.floors) {
      if (ref.kind === "floor" && floor.id === ref.id) return { kind: "floor", id: floor.id, name: floor.name, is_active: floor.is_active, path: [building.name, floor.name], building, floor };
      for (const room of floor.rooms) {
        if (ref.kind === "room" && room.id === ref.id) return { kind: "room", id: room.id, name: room.name, is_active: room.is_active, path: [building.name, floor.name, room.name], building, floor, room };
        for (const door of room.doors) {
          if (ref.kind === "door" && door.id === ref.id) return { kind: "door", id: door.id, name: door.name, is_active: door.is_active, path: [building.name, floor.name, room.name, door.name], building, floor, room, door };
        }
      }
    }
  }
  return null;
}

function getDescription(node: ResolvedLocation) {
  if (node.kind === "building") return "Kode " + node.building.code;
  if (node.kind === "floor") return node.floor?.floor_number == null ? "Lantai gedung" : "Lantai " + node.floor.floor_number;
  if (node.kind === "room") return node.room?.code ? "Kode ruangan " + node.room.code : "Ruangan di " + node.floor?.name;
  return node.door?.code ? "Kode pintu " + node.door.code : "Pintu di " + node.room?.name;
}

function canActivate(node: ResolvedLocation) {
  if (node.kind === "building") return true;
  if (node.kind === "floor") return node.building.is_active;
  if (node.kind === "room") return Boolean(node.building.is_active && node.floor?.is_active);
  return Boolean(node.building.is_active && node.floor?.is_active && node.room?.is_active);
}

function getChildren(node: ResolvedLocation) {
  if (node.kind === "building") return node.building.floors.map((floor) => ({ id: floor.id, kind: "floor" as const, name: floor.name, is_active: floor.is_active, meta: floor.rooms.length + " ruangan" }));
  if (node.kind === "floor") return (node.floor?.rooms ?? []).map((room) => ({ id: room.id, kind: "room" as const, name: room.name, is_active: room.is_active, meta: room.doors.length + " pintu" + (room.code ? " · " + room.code : "") }));
  if (node.kind === "room") return (node.room?.doors ?? []).map((door) => ({ id: door.id, kind: "door" as const, name: door.name, is_active: door.is_active, meta: door.devices.length ? "Smart lock · " + door.devices[0].connection_status : "Belum ada smart lock" }));
  return [];
}

function childName(kind: LocationKind, plural = false) {
  if (kind === "building") return plural ? "lantai" : "lantai";
  if (kind === "floor") return plural ? "ruangan" : "ruangan";
  if (kind === "room") return plural ? "pintu" : "pintu";
  return "smart lock";
}

function locationKindName(kind: LocationKind) {
  if (kind === "building") return "gedung";
  if (kind === "floor") return "lantai";
  if (kind === "room") return "ruangan";
  return "pintu";
}

function getCreateTarget(node: ResolvedLocation): CreateLocationTarget | null {
  if (node.kind === "building") return { kind: "floor", parentId: node.id, parentName: node.building.name };
  if (node.kind === "floor" && node.floor) return { kind: "room", parentId: node.floor.id, parentName: node.building.name + " / " + node.floor.name };
  if (node.kind === "room" && node.room) return { kind: "door", parentId: node.room.id, parentName: node.building.name + " / " + node.floor?.name + " / " + node.room.name };
  return null;
}

function getRooms(node: ResolvedLocation): RoomRecord[] {
  if (node.kind === "room" && node.room) return [node.room];
  if (node.kind === "floor") return node.floor?.rooms ?? [];
  return node.building.floors.flatMap((floor) => floor.rooms);
}

function countDoors(node: ResolvedLocation) {
  if (node.kind === "door") return Number(Boolean(node.building.is_active && node.floor?.is_active && node.room?.is_active && node.door?.is_active));
  return getRooms(node).reduce((count, room) => {
    const floor = node.kind === "floor" ? node.floor : node.building.floors.find((item) => item.rooms.some((entry) => entry.id === room.id));
    const parentsAreActive = node.building.is_active && Boolean(floor?.is_active) && room.is_active;
    return count + room.doors.filter((door) => parentsAreActive && door.is_active).length;
  }, 0);
}

function countDevices(node: ResolvedLocation) {
  if (node.kind === "door") return node.door?.devices.length ?? 0;
  return getRooms(node).reduce((count, room) => count + room.doors.reduce((sum, door) => sum + door.devices.length, 0), 0);
}

function getMetrics(node: ResolvedLocation, doors: number, devices: number) {
  if (node.kind === "building") return [
    { label: "Lantai", value: node.building.floors.length },
    { label: "Ruangan", value: node.building.floors.reduce((sum, floor) => sum + floor.rooms.length, 0) },
    { label: "Pintu aktif", value: doors },
  ];
  if (node.kind === "floor") return [
    { label: "Ruangan", value: node.floor?.rooms.length ?? 0 },
    { label: "Pintu aktif", value: doors },
    { label: "Smart lock", value: devices },
  ];
  if (node.kind === "room") return [
    { label: "Pintu", value: node.room?.doors.length ?? 0 },
    { label: "Pintu aktif", value: doors },
    { label: "Smart lock", value: devices },
  ];
  return [
    { label: "Status pintu", value: node.door?.is_active ? "Aktif" : "Nonaktif" },
    { label: "Smart lock", value: devices ? "Terdaftar" : "Belum ada" },
    { label: "Koneksi", value: node.door?.devices[0]?.connection_status ?? "—" },
  ];
}
