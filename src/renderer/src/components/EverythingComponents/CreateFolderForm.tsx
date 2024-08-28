

import { useState } from "react";

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";

export default function CreateFolderForm() {
  const [folderName, setFolderName] = useState("");
  const [result, setResult] = useState<{
    message?: string;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const folder = await window.electrons.createFolder(folderName);
      if (!folder.success) {
        toast.error(folder.error)
        return;
      }
      setResult({ message: `Folder '${folder.success.name}' created successfully!` });
      toast.success("folder created succesfully")
    } catch (error) {
      setResult({ error: (error as Error).message });
    } finally {
      setLoading(false);
      setFolderName("");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="Enter Folder Name"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Folder"}
        </Button>
      </form>
      {result?.error && <p>Error: {result.error}</p>}
      {result?.message && <p>{result.message}</p>}
    </div>
  );
}
