import ServiceVisual3D from "@/components/service-3d/ServiceVisual";
import { sceneForService } from "@/components/service-3d/serviceConfig";

// Per-row visual on the Services page: the matching 3D scene for this
// service (chosen from its CMS icon/name). The 3D canvas lazy-loads and
// only renders while the row is on screen, so a long list stays cheap.
export default function ServiceVisual({ icon, name }: { icon?: string; name: string }) {
  return (
    <ServiceVisual3D
      service={sceneForService(icon, name)}
      showCaption={false}
      className="aspect-[4/3] rounded-2xl"
    />
  );
}
