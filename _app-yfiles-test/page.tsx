import dynamic from "next/dynamic";

const FlowMapClient = dynamic(() => import("./FlowMapClient"), { ssr: false });

export default function FlowMapPage() {
  return (
    <div style={{ height: "100vh" }}>
      <FlowMapClient />
    </div>
  );
}

