import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { Resident } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { useLocation } from "wouter"
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { QueryClient, useQueryClient } from "@tanstack/react-query";

export default function ResidentsPage() {
  const [_, navigate] = useLocation();
  const [selectedResidents, setSelectedResidents] = useState<Resident[]>([]);
  const [source, setSource] = useState<"all" | "internal" | "external">("all");

  // Markdown state
  const [mdContent, setMdContent] = useState<string>("");
  const [driveUrl, setDriveUrl] = useState<string>("");

  const queryClient = useQueryClient()

  useEffect(() => {
    fetch('https://quiet-evident-hookworm.ngrok-free.app/api/reports')
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
    })

  }, [])

  const { data: residents = [], isLoading } = useQuery<Resident[], Error>({
    queryKey: ["/api/residents", source !== "all" ? `?source=${source}` : ""],
  });

  const filteredResidents = source === "all"
    ? residents
    : residents.filter(r => r.source === source);

  const handleSelectResident = (resident: Resident) => {
    setSelectedResidents(prev =>
      prev.some(r => r.id === resident.id)
        ? prev.filter(r => r.id !== resident.id)
        : [...prev, resident]
    );
  };

  const handleSelectAll = () => {
    setSelectedResidents(prev =>
      prev.length === filteredResidents.length ? [] : [...filteredResidents]
    );
  };

  const handleProceedToFieldSelection = () => {
    if (selectedResidents.length > 0) {
      navigate("/field-selection");
    }
  };

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

  // Load from Drive handler
  const handleLoadFromDrive = async () => {
    // extract file ID (25+ alphanumeric/–/_ chars)
    const idMatch = driveUrl.match(/[-\w]{25,}/);
    if (!idMatch) {
      alert("Couldn't find a Drive file ID in that URL.");
      return;
    }
    const fileId = idMatch[0];
    const rawUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    try {
      const res = await fetch(rawUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      setMdContent(text);
    } catch (err) {
      console.error(err);
      alert("Failed to load from Drive. Check permissions or URL.");
    }
  };

  const columns = [
    {
      header: "",
      accessorKey: (row: Resident) => row.id,
      cell: (row: Resident) => (
        <Checkbox
          checked={selectedResidents.some(r => r.id === row.id)}
          onCheckedChange={() => handleSelectResident(row)}
        />
      ),
    },
    { header: "Name", accessorKey: "name", cell: (r: Resident) => <span className="font-medium">{r.name}</span> },
    { header: "ID", accessorKey: "residentId" },
    { header: "Address", accessorKey: "address" },
    {
      header: "Registration Date",
      accessorKey: "registrationDate",
      cell: (r: Resident) => formatDate(r.registrationDate),
    },
    {
      header: "Source",
      accessorKey: "source",
      cell: (r: Resident) => (
        <Badge
          variant="outline"
          className={r.source === "internal" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}
        >
          {r.source}
        </Badge>
      ),
    },
  ];

  return (
    <MainLayout
      breadcrumbItems={[{ label: "Residents Data" }]}
      title="Residents Database"
      description="View and manage resident records from both internal and external registries."
    >
      {/* ── Source Tabs & Table ── */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <Tabs defaultValue="all" onValueChange={v => setSource(v as any)}>
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="all">All Sources</TabsTrigger>
                <TabsTrigger value="internal">Internal Registry</TabsTrigger>
                <TabsTrigger value="external">External Registry</TabsTrigger>
              </TabsList>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={isLoading || filteredResidents.length === 0}
                >
                  {selectedResidents.length === filteredResidents.length && filteredResidents.length > 0
                    ? "Deselect All"
                    : "Select All"}
                </Button>
                <Button
                  size="sm"
                  onClick={handleProceedToFieldSelection}
                  disabled={selectedResidents.length === 0}
                >
                  <Icon name="chevron-right" className="mr-1 h-4 w-4" />
                  Proceed to Field Selection
                </Button>
              </div>
            </div>

            {["all", "internal", "external"].map(tab => (
              <TabsContent key={tab} value={tab} className="pt-4">
                {isLoading ? (
                  <div className="space-y-3">
                    {Array(5).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : (
                  <DataTable data={filteredResidents} columns={columns} searchField="name" />
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardHeader>
      </Card>

      {/* ── Markdown Upload, Drive Load, Edit & Preview ── */}
      <Card className="mb-6">
        <CardHeader>
          <h3 className="text-lg font-medium">Markdown Editor & Preview</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Local Upload */}
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
              onChange={e => setDriveUrl(e.target.value)}
              className="flex-1 p-2 border rounded-md text-sm"
            />
            <Button size="sm" onClick={handleLoadFromDrive}>
              Load
            </Button>
          </div>

          {/* Editor */}
          <textarea
            value={mdContent}
            onChange={e => setMdContent(e.target.value)}
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

      {/* ── Selected Residents ── */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">
            Selected Residents ({selectedResidents.length})
          </h3>
        </CardHeader>
        <CardContent>
          {selectedResidents.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <Icon name="users" className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No residents selected. Select residents from the table above to proceed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedResidents.map(r => (
                <div
                  key={r.id}
                  className="border rounded-md p-3 bg-gray-50 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{r.name}</p>
                    <p className="text-sm text-gray-500">{r.residentId}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleSelectResident(r)}>
                    <Icon name="x-circle" className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedResidents.length > 0 && (
        <div className="mt-6 flex justify-end">
          <Button onClick={handleProceedToFieldSelection}>
            Continue to Field Selection
            <Icon name="chevron-right" className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </MainLayout>
  );
}
