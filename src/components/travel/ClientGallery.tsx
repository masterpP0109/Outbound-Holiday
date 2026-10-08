import { getClientImage } from '../../runtime/catalog';
import { editorial } from "../../runtime/catalog";
import { PageLink } from '../common/PageLink';
import { sectionPath } from '../../routes';
import React,{ useState } from 'react';
import { Camera } from 'lucide-react';
import { clientGalleryImages } from '../../data/clientGalleryImages';
import { GalleryLightbox } from './GalleryLightbox';

interface ClientGalleryProps {
  preview?: boolean;
  onSeeGallery?: () => void;
  onNavigateHome?: () => void;
}

export const ClientGallery: React.FC<ClientGalleryProps> = ({ preview = false, onSeeGallery, onNavigateHome }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [previewImages] = useState(() => {
    // Sample across the collection so adjacent photos from one outing don't dominate.
    const count = Math.min(5, clientGalleryImages.length);
    return Array.from({ length: count }, (_, index) => {
      const start = Math.floor(index * clientGalleryImages.length / count);
      const end = Math.floor((index + 1) * clientGalleryImages.length / count);
      return clientGalleryImages[start + Math.floor(Math.random() * (end - start))];
    });
  });
  const images = preview ? previewImages : clientGalleryImages;
  const Heading = preview ? 'h2' : 'h1';
  const renderPhoto = (index: number) => (
    <button
      key={images[index]}
      type="button"
      onClick={() => setSelectedIndex(index)}
      aria-label={`Enlarge client gallery photo ${index + 1}`}
      className="block w-full mb-4 break-inside-avoid overflow-hidden rounded-xl bg-gray-100 shadow-sm cursor-zoom-in hover:shadow-lg transition-shadow focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B5E8E]"
    >
      <img src={images[index]} alt={getClientImage(images[index])?.alt ?? `Client holiday photo ${index + 1}`} loading="lazy" decoding="async" className={preview ? 'block w-full aspect-[5/6] object-cover object-center' : 'block w-full h-auto'} />
    </button>
  );

  return (
    <section id="client-gallery" aria-labelledby="client-gallery-title" className="bg-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {!preview && (
          <PageLink href={'/'} onClick={onNavigateHome} className="mb-6 text-sm font-semibold text-[#0B5E8E] hover:underline cursor-pointer">
            {editorial("travel/ClientGallery.text1")}</PageLink>
        )}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#C9A66B]/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#0B5E8E]">
            <Camera className="w-4 h-4" aria-hidden="true" />
            {editorial("travel/ClientGallery.text2")}</span>
          <Heading id="client-gallery-title" className="text-3xl sm:text-4xl font-bold font-serif text-[#0B5E8E]">{editorial("travel/ClientGallery.text3")}</Heading>
          <p className="text-sm sm:text-base text-gray-600">{editorial("travel/ClientGallery.text4")}</p>
        </div>

        {images.length===0&&<p role="status" className="text-center">No published gallery photos are available yet.</p>}
        {preview ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 items-start">
            {images.map((_, index) => renderPhoto(index))}
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {images.map((_, index) => renderPhoto(index))}
          </div>
        )}

        {preview && (
          <div className="mt-8 text-center">
            <PageLink href={sectionPath('client-gallery')} onClick={onSeeGallery} className="rounded-xl bg-[#0B5E8E] hover:bg-[#094c73] px-6 py-3 font-semibold text-sm text-white transition-colors cursor-pointer">
              {editorial("travel/ClientGallery.text5")}</PageLink>
          </div>
        )}

        {selectedIndex !== null && (
          <GalleryLightbox metadata={images.map(url=>getClientImage(url))} images={images} initialIndex={selectedIndex} onClose={() => setSelectedIndex(null)} />
        )}
      </div>
    </section>
  );
};
