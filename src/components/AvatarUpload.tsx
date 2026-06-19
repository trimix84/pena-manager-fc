"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  playerId: string;
  currentUrl: string | null;
  onUpload: (url: string) => void;
};

export default function AvatarUpload({ playerId, currentUrl, onUpload }: Props) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `${playerId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      alert("Error al subir la foto.");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const publicUrl = data.publicUrl + "?t=" + Date.now();

    const { error: updateError } = await supabase
      .from("players")
      .update({ photo_url: publicUrl })
      .eq("id", playerId);

    if (updateError) {
      alert("Error al guardar la foto.");
      setUploading(false);
      return;
    }

    onUpload(publicUrl);
    setUploading(false);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {currentUrl ? (
          <img
            src={currentUrl}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border-2 border-green-500"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600">
            <span className="text-gray-400 text-3xl">?</span>
          </div>
        )}
      </div>

      <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-xl transition-colors border border-gray-700">
        {uploading ? "Subiendo..." : "Cambiar foto"}
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
      </label>
    </div>
  );
}