import {
  Briefcase, BusFront, Fingerprint, GraduationCap, HandHelping, HeartPulse, House, Landmark,
  MapPinned, Scale, Smartphone, Store, Wheat, type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  fingerprint: Fingerprint,
  landmark: Landmark,
  "heart-pulse": HeartPulse,
  "graduation-cap": GraduationCap,
  briefcase: Briefcase,
  wheat: Wheat,
  "bus-front": BusFront,
  house: House,
  "hand-helping": HandHelping,
  scale: Scale,
  store: Store,
  smartphone: Smartphone,
  "map-pinned": MapPinned,
};

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? Landmark;
  return <Icon className={className} aria-hidden />;
}
