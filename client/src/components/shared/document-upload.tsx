import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { formatFileSize } from "@/lib/utils";

export function DocumentUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("document", file);

      return await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        });
        
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(xhr.statusText || "Upload failed"));
          }
        });
        
        xhr.addEventListener("error", () => {
          reject(new Error("Network error occurred"));
        });
        
        xhr.open("POST", "/api/documents/upload");
        xhr.setRequestHeader("Accept", "application/json");
        xhr.withCredentials = true;
        
        xhr.send(formData);
      });
    },
    onSuccess: () => {
      setSelectedFile(null);
      setUploadProgress(0);
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Upload successful",
        description: "Your document has been uploaded successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file type
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ];
      
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select only .xlsx or .docx files",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleSelectFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    return extension === "xlsx" ? "file-spreadsheet" : "file-text";
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Upload Document
        </h3>
        
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx,.docx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        />
        
        {!selectedFile ? (
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer"
            onClick={handleSelectFile}
          >
            <Icon name="upload" className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4 flex text-sm text-gray-600">
              <p className="pl-1">
                <span className="text-primary font-medium">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Only .xlsx and .docx files up to 10MB
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-primary-50 rounded-lg">
              <div className="mr-4 bg-white p-2 rounded-full">
                <Icon 
                  name={getFileIcon(selectedFile.name)} 
                  className={`h-6 w-6 ${getFileIcon(selectedFile.name) === "file-spreadsheet" ? "text-green-600" : "text-blue-600"}`} 
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <button
                className="ml-4 text-gray-400 hover:text-gray-500"
                onClick={handleCancel}
              >
                <Icon name="x-circle" className="h-5 w-5" />
              </button>
            </div>
            
            {uploadMutation.isPending ? (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-gray-500 text-center">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Button className="flex-1" onClick={handleUpload}>
                  <Icon name="upload" className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
