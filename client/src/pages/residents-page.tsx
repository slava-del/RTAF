import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Icon } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ResidentsPage() {
  const [mdContent, setMdContent] = useState<string>("");
  const [driveUrl, setDriveUrl] = useState<string>("");
  const [selectedReportId, setSelectedReportId] = useState<string>("");

  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/reports/?format=json")
      .then((response) => response.json())
      .then((data) => {
        setReports(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching reports:", error);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    console.log("Reports:", reports);
  }, [reports]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const columns = [
    {
      header: "ID",
      accessorKey: "id",
      cell: (row: any) => row.id ?? "",
    },
    {
      header: "File URL",
      accessorKey: "file_url",
      cell: (row: any) =>
        row.file_url ? (
          <button
            onClick={() => {
              setDriveUrl(row.file_url);
              loadDriveFileByUrl(row.file_url);
            }}
            className="text-blue-600 underline"
          >
            Open
          </button>
        ) : (
          <span className="text-gray-400 italic">No file</span>
        ),
    },
    {
      header: "Emergency Situation",
      accessorKey: "emergency_situation",
      cell: (row: any) => {
        const value = row?.emergency_situation;
        return value ? (
          String(value)
        ) : (
          <span className="text-gray-400 italic">N/A</span>
        );
      },
    },
    {
      header: "Created By",
      accessorKey: "created_by",
      cell: (row: any) => (row.created_by != null ? row.created_by : ""),
    },
    {
      header: "Created At",
      accessorKey: "created_at",
      cell: (row: any) => (row.created_at ? formatDate(row.created_at) : ""),
    },
    {
      header: "Updated At",
      accessorKey: "updated_at",
      cell: (row: any) => (row.updated_at ? formatDate(row.updated_at) : ""),
    },
    {
      header: "Viewed By",
      accessorKey: "viewed_by",
      cell: (row: any) => (row.viewed_by != null ? row.viewed_by : ""),
    },
    {
      header: "Viewed At",
      accessorKey: "viewed_at",
      cell: (row: any) => (row.viewed_at ? formatDate(row.viewed_at) : ""),
    },
  ];

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "text/markdown" && !file.name.endsWith(".md")) {
      alert("Please upload a Markdown (.md) file");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setMdContent(reader.result as string);
    reader.readAsText(file);
  };

  const loadDriveFileByUrl = async (url: string) => {
    const idMatch = url.match(/[-\w]{25,}/);
    if (!idMatch) {
      alert("Couldn't find a Drive file ID in that URL.");
      return;
    }
    const fileId = idMatch[0];
    const rawUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
        rawUrl
      )}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      setMdContent(text);
    } catch (err) {
      console.error(err);
      alert("Failed to load from Drive. Make sure the file is public.");
    }
  };

  // Fixed Google Drive handler
  const handleLoadFromDrive = async () => {
    const idMatch = driveUrl.match(/[-\w]{25,}/);
    if (!idMatch) {
      alert("Couldn't find a Drive file ID in that URL.");
      return;
    }
    const fileId = idMatch[0];
    const rawUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
        rawUrl
      )}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      setMdContent(text);
    } catch (err) {
      console.error(err);
      alert("Failed to load from Drive. Make sure the file is public.");
    }
  };

  const handleLinkEmergency = () => {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications.");
      return;
    }

    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification("EMERGENCY SITUATION!!", {
          body: `Document Linked: ${selectedReportId}`,
        });
      }
    });
  };

  const handleEmergencyPush = async () => {
    alert("Situatie de urgenta raportata. Document atasat: NR. 1");
  };

  return (
    <MainLayout
      breadcrumbItems={[{ label: "Reports" }]}
      title="Reports Dashboard"
      description="View and manage uploaded report files and their metadata."
    >
      {/* ── Reports Table ── */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <h3 className="text-lg font-medium">Uploaded Reports</h3>
          <Button>Create report</Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
            </div>
          ) : (
            <DataTable data={reports} columns={columns} searchField="id" />
          )}
        </CardContent>
      </Card>

      {/* ── Markdown Upload, Drive Load, Edit & Preview ── */}
      <Card className="mb-6">
        <CardHeader>
          <h3 className="text-lg font-medium">Markdown Editor & Preview</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload */}
          <input
            id="md-upload"
            type="file"
            accept=".md,text/markdown"
            className="hidden"
            onChange={handleFileUpload}
          />
          <label htmlFor="md-upload">
            <Button asChild>
              <span>Upload .md File</span>
            </Button>
          </label>

          {/* Load from Drive */}
          <div className="flex space-x-2 items-center">
            <input
              type="text"
              placeholder="Paste Drive URL or file ID"
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              className="flex-1 p-2 border rounded-md text-sm"
            />
            <Button size="sm" onClick={handleLoadFromDrive}>
              Load
            </Button>
          </div>

          {/* Select Report */}
          <div className="flex space-x-4 items-center">
            <select
              value={selectedReportId}
              onChange={(e) => setSelectedReportId(e.target.value)}
              className="p-2 border rounded-md text-sm"
            >
              <option value="">Select report...</option>
              {reports.map((r) => (
                <option key={r.id} value={r.id}>
                  Report #{r.id}
                </option>
              ))}
            </select>
            <select
              value={selectedReportId}
              onChange={(e) => setSelectedReportId(e.target.value)}
              className="p-2 border rounded-md text-sm"
            >
              <option value="">Select emergency situation...</option>
              <option value="1" key="1">
                Efecte imprevizibile ale regulilor pietei energetice electrice -
                Nr. Sc. Reg. 25
              </option>
              <option value="2" key="2">
                Atacul din interior, actiuni de sabotaj ale angajatilor pe
                intern - Nr. Sc. Reg. 4
              </option>
              <option value="3" key="3">
                Amenintare pentru angajatii cheie - Nr. Sc. Reg. 5
              </option>{" "}
              <option value="4" key="4">
                Furtuna solara - Nr. Sc. Reg. 7
              </option>
            </select>
            <Button onClick={handleEmergencyPush}>
              Link Emergency Situation
            </Button>
          </div>

          {/* Editor */}
          <textarea
            value={mdContent}
            onChange={(e) => setMdContent(e.target.value)}
            placeholder="Write or edit Markdown here…"
            className="w-full h-40 p-2 border rounded-md font-mono text-sm"
          />

          {/* Preview */}
          <div className="prose max-w-none border p-4 rounded-md bg-white">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {mdContent}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
