import React from 'react';
import {
  CheckCircle2,
  Clock,
  Compass,
  Lightbulb,
  MapPin,
  Quote,
  ShieldCheck,
  Sparkles,
  Sun,
} from 'lucide-react';
import type { ArticleBlock, GuideSection } from '../../types/guide';

interface BlogContentRendererProps {
  sections?: GuideSection[];
  contentHtml?: string;
}

const PracticalIcon: React.FC<{ name?: string; className?: string }> = ({
  name,
  className = 'w-5 h-5',
}) => {
  switch (name) {
    case 'Sun':
      return <Sun className={className} />;
    case 'Clock':
      return <Clock className={className} />;
    case 'CheckCircle2':
      return <CheckCircle2 className={className} />;
    case 'Compass':
      return <Compass className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} />;
    case 'MapPin':
      return <MapPin className={className} />;
    default:
      return <Sparkles className={className} />;
  }
};

const renderBlock = (block: ArticleBlock, index: number) => {
  switch (block.type) {
    case 'text':
      return block.content ? (
        <p key={index} className="text-base text-[#2F3A44] leading-relaxed">
          {block.content}
        </p>
      ) : null;

    case 'heading':
      return block.subheading ? (
        <h3
          key={index}
          className="font-serif text-xl sm:text-2xl font-bold text-[#0B5E8E] pt-3 leading-snug"
        >
          {block.subheading}
        </h3>
      ) : null;

    case 'bullet_list':
      return block.items && block.items.length > 0 ? (
        <ul
          key={index}
          className="space-y-3 bg-[#FAF9F6] p-5 rounded-2xl border border-gray-200/80"
        >
          {block.items.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-sm sm:text-base text-[#2F3A44]"
            >
              <CheckCircle2 className="w-4 h-4 text-[#0B5E8E] shrink-0 mt-1" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      ) : null;

    case 'image':
      return block.imageUrl ? (
        <figure
          key={index}
          className="my-6 rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs bg-gray-50"
        >
          <img
            src={block.imageUrl}
            alt={block.imageAlt || 'Victoria Falls travel photography'}
            loading="lazy"
            className="w-full h-auto max-h-[480px] object-cover"
          />
          {(block.imageCaption || block.imageCredit) && (
            <figcaption className="px-4 py-3 bg-[#FAF9F6] border-t border-gray-100 text-xs text-gray-600 flex flex-wrap justify-between gap-2">
              <span>{block.imageCaption}</span>
              {block.imageCredit && (
                <span className="font-semibold text-gray-500">
                  Photo: {block.imageCredit}
                </span>
              )}
            </figcaption>
          )}
        </figure>
      ) : null;

    case 'callout':
      if (!block.callout) return null;
      return (
        <aside
          key={index}
          className={`p-5 sm:p-6 rounded-2xl border ${
            block.callout.type === 'advice'
              ? 'bg-[#0B5E8E]/5 border-[#0B5E8E]/30 text-[#0B5E8E]'
              : block.callout.type === 'recommendation'
              ? 'bg-[#E67E22]/5 border-[#E67E22]/30 text-[#8E4B10]'
              : 'bg-[#C9A66B]/10 border-[#C9A66B]/40 text-[#5E4A28]'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm mb-2">
            {block.callout.type === 'advice' ? (
              <ShieldCheck className="w-5 h-5 text-[#0B5E8E]" />
            ) : block.callout.type === 'recommendation' ? (
              <Sparkles className="w-5 h-5 text-[#E67E22]" />
            ) : (
              <Lightbulb className="w-5 h-5 text-[#C9A66B]" />
            )}
            <span className="font-serif text-base">{block.callout.title}</span>
          </div>
          <p className="text-sm leading-relaxed text-[#2F3A44]">
            {block.callout.content}
          </p>
        </aside>
      );

    case 'pullquote':
      if (!block.pullQuote) return null;
      return (
        <blockquote
          key={index}
          className="my-6 rounded-2xl bg-[#0D2833] text-white p-6 sm:p-8 border-l-4 border-[#C9A66B] space-y-3"
        >
          <Quote className="w-6 h-6 text-[#C9A66B]" />
          <p className="font-serif text-lg sm:text-xl italic leading-relaxed text-white/95">
            &ldquo;{block.pullQuote.quote}&rdquo;
          </p>
          {(block.pullQuote.author || block.pullQuote.title) && (
            <footer className="text-xs text-[#E5C989] font-semibold">
              {block.pullQuote.author}
              {block.pullQuote.title ? ` — ${block.pullQuote.title}` : ''}
            </footer>
          )}
        </blockquote>
      );

    case 'practical_info':
      if (!block.practicalPanel) return null;
      return (
        <div
          key={index}
          className="rounded-2xl border border-gray-200 bg-[#FAF9F6] p-5 sm:p-6 space-y-4"
        >
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#0B5E8E]">
              {block.practicalPanel.title}
            </h3>
            {block.practicalPanel.subtitle && (
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {block.practicalPanel.subtitle}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {block.practicalPanel.items.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-4 border border-gray-200/70 space-y-1.5"
              >
                <div className="flex items-center gap-2 text-[#0B5E8E] font-bold text-sm">
                  <PracticalIcon
                    name={item.iconName}
                    className="w-4 h-4 text-[#C9A66B] shrink-0"
                  />
                  <span>{item.heading}</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'table':
      if (!block.table) return null;
      return (
        <div
          key={index}
          className="overflow-x-auto my-6 rounded-2xl border border-gray-200 bg-white shadow-xs"
        >
          {block.table.title && (
            <div className="p-4 bg-[#0D2833] text-white font-bold text-sm font-serif">
              {block.table.title}
            </div>
          )}
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FAF9F6] text-[#0B5E8E] font-bold border-b border-gray-200">
              <tr>
                {block.table.headers.map((h, hIdx) => (
                  <th key={hIdx} className="p-3.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {block.table.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-gray-50/80 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-3.5 text-gray-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'pricing_cards':
      if (!block.pricingCards || block.pricingCards.length === 0) return null;
      return (
        <div
          key={index}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4"
        >
          {block.pricingCards.map((card, cIdx) => (
            <div
              key={cIdx}
              className={`rounded-2xl border p-5 space-y-3 ${
                card.highlight
                  ? 'border-[#C9A66B] bg-[#FAF9F6] shadow-sm'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#0B5E8E]">
                    {card.title}
                  </h4>
                  <p className="text-xs text-[#8E713E] font-semibold">
                    {card.idealFor}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-[#1A2E35]">
                    {card.price}
                  </div>
                  <div className="text-[11px] text-gray-500">{card.period}</div>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {card.description}
              </p>
              <ul className="space-y-1.5 pt-1">
                {card.features.map((feat, fIdx) => (
                  <li
                    key={fIdx}
                    className="flex items-start gap-2 text-xs text-gray-700"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0B5E8E] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );

    case 'timeline':
      if (!block.timeline) return null;
      return (
        <div
          key={index}
          className="rounded-2xl border border-gray-200 bg-[#FAF9F6] p-5 sm:p-6 space-y-5 my-4"
        >
          <div className="border-b border-gray-200 pb-4 space-y-1.5">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#0B5E8E]">
              {block.timeline.title}
            </h3>
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <span className="bg-white px-2.5 py-1 rounded-full border border-gray-200 font-semibold">
                {block.timeline.duration}
              </span>
              <span className="bg-white px-2.5 py-1 rounded-full border border-gray-200">
                Ideal for: {block.timeline.idealFor}
              </span>
              {block.timeline.bestTime && (
                <span className="bg-white px-2.5 py-1 rounded-full border border-gray-200">
                  Best time: {block.timeline.bestTime}
                </span>
              )}
            </div>
          </div>
          <div className="space-y-4">
            {block.timeline.items.map((dayItem, dIdx) => (
              <div
                key={dIdx}
                className="bg-white rounded-xl p-4 border border-gray-200/80 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#0B5E8E]/10 text-[#0B5E8E]">
                    {dayItem.day}
                  </span>
                  <h4 className="font-serif font-bold text-sm sm:text-base text-[#1A2E35]">
                    {dayItem.title}
                  </h4>
                </div>
                <ul className="space-y-1.5 pl-1">
                  {dayItem.activities.map((act, aIdx) => (
                    <li
                      key={aIdx}
                      className="flex items-start gap-2 text-xs sm:text-sm text-gray-700"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A66B] shrink-0 mt-1" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {block.timeline.whyRecommend && (
            <p className="text-xs sm:text-sm text-[#0B5E8E] font-medium bg-white p-3.5 rounded-xl border border-[#0B5E8E]/20">
              {block.timeline.whyRecommend}
            </p>
          )}
        </div>
      );

    default:
      return null;
  }
};

/**
 * Sanitizes basic inline event handlers/scripts out of WordPress HTML while preserving
 * headings, paragraphs, lists, links, blockquotes, and embedded figures.
 */
const sanitizeWordPressHtml = (rawHtml: string): string =>
  rawHtml
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '');

export const BlogContentRenderer: React.FC<BlogContentRendererProps> = ({
  sections,
  contentHtml,
}) => {
  if (contentHtml) {
    return (
      <div
        className="space-y-5 text-base text-[#2F3A44] leading-relaxed [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:font-bold [&_h2]:text-[#0B5E8E] [&_h2]:pt-6 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-[#0B5E8E] [&_h3]:pt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_a]:text-[#0B5E8E] [&_a]:underline [&_img]:rounded-2xl [&_img]:my-6 [&_img]:w-full [&_img]:object-cover [&_blockquote]:border-l-4 [&_blockquote]:border-[#C9A66B] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-700"
        dangerouslySetInnerHTML={{ __html: sanitizeWordPressHtml(contentHtml) }}
      />
    );
  }

  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className="scroll-mt-24 space-y-5 pt-2"
        >
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E] leading-tight pb-2 border-b border-gray-200/80">
            {section.heading}
          </h2>
          <div className="space-y-5">
            {section.blocks.map((block, bIdx) => renderBlock(block, bIdx))}
          </div>
        </section>
      ))}
    </div>
  );
};
