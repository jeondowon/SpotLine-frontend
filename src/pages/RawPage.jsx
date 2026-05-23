import { useSearchParams } from "react-router-dom";

export default function RawPage() {
  const [params] = useSearchParams();
  const videoId = params.get("videoid");

  return (
    <div style={{ padding: 40 }}>
      <h1>Video #{videoId}</h1>
    </div>
  );
}
