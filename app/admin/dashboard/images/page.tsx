import { getAllSiteImages } from "@/lib/siteImages";
import ImageManager from "./ImageManager";

export const dynamic = "force-dynamic";

export default function ImagesPage() {
  const images = getAllSiteImages();
  return (
    <div className="min-h-screen bg-[#111111] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Site Images</h1>
          <p className="text-gray-500 text-sm mt-1">
            {images.length} images across all pages — upload a file or paste a URL to update any image instantly.
          </p>
        </div>
        <ImageManager images={images} />
      </div>
    </div>
  );
}
