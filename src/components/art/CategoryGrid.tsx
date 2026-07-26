import React from 'react';
import { ART_CATEGORIES } from '../../data/artData';
import { 
  Palette, 
  Shapes, 
  Smile, 
  Scissors, 
  Coffee, 
  Sparkles, 
  Home, 
  Package, 
  ArrowRight 
} from 'lucide-react';

interface CategoryGridProps {
  selectedCategorySlug: string | null;
  onSelectCategory: (slug: string | null) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  selectedCategorySlug,
  onSelectCategory,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Palette': return <Palette className="w-5 h-5 text-[#0B5E8E]" />;
      case 'Shapes': return <Shapes className="w-5 h-5 text-[#0B5E8E]" />;
      case 'Smile': return <Smile className="w-5 h-5 text-[#0B5E8E]" />;
      case 'Scissors': return <Scissors className="w-5 h-5 text-[#0B5E8E]" />;
      case 'Coffee': return <Coffee className="w-5 h-5 text-[#0B5E8E]" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-[#0B5E8E]" />;
      case 'Home': return <Home className="w-5 h-5 text-[#0B5E8E]" />;
      default: return <Package className="w-5 h-5 text-[#0B5E8E]" />;
    }
  };

  return (
    <section id="art-categories" className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-widest block mb-1">
              Curated Mediums
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0B5E8E] font-serif">
              Featured Art Categories
            </h2>
          </div>

          {selectedCategorySlug && (
            <button
              onClick={() => onSelectCategory(null)}
              className="text-xs font-bold text-[#0B5E8E] underline hover:text-[#E67E22]"
            >
              Show All Categories
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {ART_CATEGORIES.map((cat) => {
            const isSelected = selectedCategorySlug === cat.slug;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(isSelected ? null : cat.slug)}
                className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? 'border-[#0B5E8E] ring-2 ring-[#0B5E8E] shadow-md bg-[#0B5E8E]/5'
                    : 'border-gray-200 bg-white hover:border-[#C9A66B] hover:shadow-md'
                }`}
              >
                <div className="h-32 overflow-hidden bg-gray-100 relative">
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-[#2F3A44] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {cat.itemCount} items
                  </span>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-[#0B5E8E]/10">
                      {getIcon(cat.iconName)}
                    </div>
                    <h3 className="font-bold text-sm text-[#2F3A44] group-hover:text-[#0B5E8E]">
                      {cat.name}
                    </h3>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#0B5E8E] transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
