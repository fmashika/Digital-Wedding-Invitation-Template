import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ResilientImage } from './ResilientImage';
import { ScrollReveal } from './ScrollReveal';

type GalleryCategory = 'All' | 'Engagement' | 'Opal Retreat' | 'Details';

interface GalleryPhoto {
  id: string;
  src: string;
  title: string;
  category: Exclude<GalleryCategory, 'All'>;
  location: string;
  caption: string;
  gridClass: string;
  imgClass?: string;
}

const GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: 'courtyard-walk',
    src: '/src/assets/images/hero_couple_retreat_1794819811766.jpg',
    title: 'Limestone Archway Stroll',
    category: 'Engagement',
    location: 'Opal Retreat Courtyard · Tucson',
    caption: 'Late afternoon light across the south courtyard arches where the ceremony processional begins.',
    gridClass: 'md:col-span-7 md:row-span-2 min-h-[340px]',
  },
  {
    id: 'olive-grove',
    src: '/src/assets/images/gallery_engagement_walk_1794819812035.jpg',
    title: 'Olive Grove Walk',
    category: 'Engagement',
    location: 'Sabino Foothills · Arizona',
    caption: 'An unhurried morning walk along the desert olive pathway during our autumn engagement session.',
    gridClass: 'md:col-span-5 min-h-[220px]',
  },
  {
    id: 'tablescape',
    src: '/src/assets/images/gallery_reception_table_1794819812328.jpg',
    title: 'Slate & Linen Tablescape',
    category: 'Details',
    location: 'Glass Pavilion · Reception',
    caption: 'Dusty slate-blue linens, white garden roses, and taper candles set for our evening dinner.',
    gridClass: 'md:col-span-5 min-h-[260px]',
  },
  {
    id: 'reflecting-pool',
    src: '/src/assets/images/gallery_opal_venue_1794819812741.jpg',
    title: 'Reflecting Pool Terrace',
    category: 'Opal Retreat',
    location: 'Opal Retreat · Catalina Views',
    caption: 'The reflecting pool and mountain horizon where cocktail hour will be hosted at 3:30 PM.',
    gridClass: 'md:col-span-7 min-h-[260px]',
  },
  {
    id: 'rings-ribbon',
    src: '/src/assets/images/gallery_rings_keepsake_1794819813262.jpg',
    title: 'Heirloom Bands & Slate Silk',
    category: 'Details',
    location: 'Bridal Suite · Morning Study',
    caption: 'Wedding bands paired with slate silk ribbon and white ranunculus blooms.',
    gridClass: 'md:col-span-5 min-h-[260px]',
    imgClass: 'object-cover object-top',
  },
];

const CATEGORIES: GalleryCategory[] = ['All', 'Engagement', 'Opal Retreat', 'Details'];

export function GallerySection() {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>('All');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const visiblePhotos =
    activeCategory === 'All'
      ? GALLERY_PHOTOS
      : GALLERY_PHOTOS.filter((photo) => photo.category === activeCategory);

  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) =>
          prev === null ? null : (prev + 1) % visiblePhotos.length
        );
      }
      if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) =>
          prev === null
            ? null
            : (prev - 1 + visiblePhotos.length) % visiblePhotos.length
        );
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedIndex, visiblePhotos.length]);

  const activePhoto = selectedIndex !== null ? visiblePhotos[selectedIndex] : null;

  return (
    <section id="gallery" className="bg-white border-y border-[#DCE4EC]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <ScrollReveal direction="left" distance={40} blur={10}>
            <p className="text-xs font-medium text-[#53667A]">
              Engagement &amp; Venue Monograph
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl text-[#1A2B3C] text-balance">
              Photo Gallery
            </h2>
            <p className="mt-2 text-[15px] text-[#425569] max-w-xl">
              Quiet moments from our engagement in Tucson and glimpses of Opal Retreat before we welcome you in December.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.08} distance={36} blur={8}>
            <div
              role="tablist"
              aria-label="Filter gallery photos"
              className="inline-flex items-center gap-1 p-1 bg-[#EEF3F7] rounded-lg self-start"
            >
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === category}
                  onClick={() => {
                    setActiveCategory(category);
                    setSelectedIndex(null);
                  }}
                  className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeCategory === category
                      ? 'bg-white text-[#1A2B3C] shadow-xs'
                      : 'text-[#53667A] hover:text-[#1A2B3C]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </ScrollReveal>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-12 gap-5">
          {visiblePhotos.map((photo, index) => (
            <ScrollReveal
              key={`${activeCategory}-${photo.id}`}
              direction={index % 2 === 0 ? 'left' : 'right'}
              delay={0.06 * index}
              distance={42}
              blur={10}
              className={
                activeCategory === 'All'
                  ? `h-[250px] sm:h-[300px] md:h-auto ${photo.gridClass}`
                  : 'h-[250px] sm:h-[280px] md:col-span-6 md:min-h-[280px]'
              }
            >
              <button
                type="button"
                onClick={() => setSelectedIndex(index)}
                className="group relative w-full h-full overflow-hidden rounded-2xl border border-[#DCE4EC] bg-[#F4F7FA] text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#23374B]"
              >
                <ResilientImage
                  src={photo.src}
                  alt={photo.title}
                  fallbackTitle={photo.title}
                  className={`w-full h-full transition-transform duration-500 ease-out group-hover:scale-[1.03] ${
                    photo.imgClass ?? 'object-cover'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E1924]/80 via-[#0E1924]/20 to-transparent opacity-90 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <p className="text-xs text-white/80">
                    {photo.category} · {photo.location}
                  </p>
                  <h3 className="mt-1 font-display text-2xl text-white">
                    {photo.title}
                  </h3>
                </div>
              </button>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {activePhoto && selectedIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.title}
          className="fixed inset-0 z-50 bg-[#0E1924]/92 backdrop-blur-xs flex items-center justify-center p-4 sm:p-8"
          onClick={() => setSelectedIndex(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-[#13212E] border border-white/15 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 text-white">
              <span className="text-xs text-white/75 tabular-nums">
                {selectedIndex + 1} / {visiblePhotos.length} · {activePhoto.location}
              </span>
              <button
                type="button"
                onClick={() => setSelectedIndex(null)}
                aria-label="Close photo viewer"
                className="w-11 h-11 inline-flex items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative bg-[#0B141D] flex items-center justify-center max-h-[68dvh]">
              <ResilientImage
                src={activePhoto.src}
                alt={activePhoto.title}
                fallbackTitle={activePhoto.title}
                className="max-h-[68dvh] w-auto object-contain"
              />
              {visiblePhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous photo"
                    onClick={() =>
                      setSelectedIndex(
                        (selectedIndex - 1 + visiblePhotos.length) %
                          visiblePhotos.length
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 inline-flex items-center justify-center rounded-full bg-[#0E1924]/75 text-white hover:bg-[#0E1924] border border-white/15 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next photo"
                    onClick={() =>
                      setSelectedIndex((selectedIndex + 1) % visiblePhotos.length)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 inline-flex items-center justify-center rounded-full bg-[#0E1924]/75 text-white hover:bg-[#0E1924] border border-white/15 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            <div className="px-6 py-4 text-white">
              <h3 className="font-display text-2xl">{activePhoto.title}</h3>
              <p className="mt-1 text-sm text-white/80">{activePhoto.caption}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
