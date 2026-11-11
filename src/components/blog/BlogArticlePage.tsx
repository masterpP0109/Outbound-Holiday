import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CalendarCheck,
  Check,
  ChevronRight,
  Clock,
  Compass,
  MapPin,
  Share2,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { getRelatedBlogPosts } from '../../data/blogData';
import { blogPath, sectionPath, SITE_URL } from '../../routes';
import type { BlogPost } from '../../types/blog';
import { getWhatsAppSpecialistUrl } from '../../utils/whatsapp';
import { Newsletter } from '../common/Newsletter';
import { PageLink } from '../common/PageLink';
import { WhatsAppIcon } from '../common/WhatsAppButton';
import { BlogContentRenderer } from './BlogContentRenderer';

interface BlogArticlePageProps {
  post: BlogPost;
  onSelectPost: (post: BlogPost) => void;
  onBackToBlog: () => void;
  onNavigateHome: () => void;
  onOpenPlanHoliday: () => void;
}

const toAbsoluteUrl = (url: string) =>
  /^https?:\/\//i.test(url)
    ? url
    : `${SITE_URL}${url.startsWith('/') ? url : `/${url}`}`;

export const BlogArticlePage: React.FC<BlogArticlePageProps> = ({
  post,
  onSelectPost,
  onBackToBlog,
  onNavigateHome,
  onOpenPlanHoliday,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const relatedPosts = getRelatedBlogPosts(post, 3);
  const articleUrl = `${SITE_URL}${blogPath(post)}`;

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.seo.metaDescription || post.excerpt,
      image: [toAbsoluteUrl(post.featuredImage.url)],
      datePublished: post.publishedIso,
      dateModified: post.modifiedIso,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': articleUrl,
      },
      author: post.author
        ? {
            '@type': 'Person',
            name: post.author.name,
            ...(post.author.role ? { jobTitle: post.author.role } : {}),
          }
        : {
            '@type': 'Organization',
            name: 'Outbound Holidays',
          },
      publisher: {
        '@type': 'Organization',
        name: 'Outbound Holidays',
        url: SITE_URL,
      },
      articleSection: post.categories[0]?.name || 'Victoria Falls Travel Guides',
      keywords: post.tags.map((t) => t.name).join(', '),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${SITE_URL}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: `${SITE_URL}${sectionPath('blog')}`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: post.title,
          item: articleUrl,
        },
      ],
    },
  ];

  const handleCopyLink = () => {
    if (typeof window === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleShare = async () => {
    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to copying link if user cancels or share fails
      }
    }
    handleCopyLink();
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A2E35]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replaceAll('<', '\\u003c'),
        }}
      />

      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="bg-white border-b border-gray-200/80 py-2.5 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-5xl mx-auto flex items-center text-xs font-medium text-gray-500 overflow-x-auto whitespace-nowrap">
          <PageLink
            href={sectionPath('home')}
            onClick={onNavigateHome}
            className="hover:text-[#0B5E8E] transition-colors cursor-pointer"
          >
            Home
          </PageLink>
          <ChevronRight className="w-3.5 h-3.5 mx-2 text-gray-400 shrink-0" />
          <PageLink
            href={sectionPath('blog')}
            onClick={onBackToBlog}
            className="hover:text-[#0B5E8E] transition-colors cursor-pointer"
          >
            Blog
          </PageLink>
          <ChevronRight className="w-3.5 h-3.5 mx-2 text-gray-400 shrink-0" />
          <span className="text-[#0B5E8E] font-bold truncate max-w-[220px] sm:max-w-md">
            {post.title}
          </span>
        </div>
      </nav>

      <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Back to Blog & Categories */}
        <div className="space-y-4">
          <PageLink
            href={sectionPath('blog')}
            onClick={onBackToBlog}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B5E8E] hover:text-[#E67E22] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Articles</span>
          </PageLink>

          <div className="flex flex-wrap items-center gap-2">
            {post.categories.map((cat) => (
              <span
                key={cat.slug}
                className="px-3 py-1 rounded-full bg-[#C9A66B]/20 text-[#8E713E] text-xs font-bold uppercase tracking-wider border border-[#C9A66B]/30"
              >
                {cat.name}
              </span>
            ))}
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B5E8E] leading-tight">
            {post.title}
          </h1>

          {post.subtitle && (
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-3xl">
              {post.subtitle}
            </p>
          )}

          {/* Meta Row: Author, Publication Date, Reading Time, Share */}
          <div className="pt-4 border-t border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
              {post.author && (
                <div className="flex items-center gap-2.5">
                  {post.author.avatarUrl && (
                    <img
                      src={post.author.avatarUrl}
                      alt={post.author.name}
                      className="w-9 h-9 rounded-full object-cover border-2 border-[#C9A66B]"
                    />
                  )}
                  <div>
                    <div className="font-bold text-[#1A2E35] flex items-center gap-1">
                      <span>{post.author.name}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-[#C9A66B]" />
                    </div>
                    {post.author.role && (
                      <div className="text-[11px] text-gray-500">
                        {post.author.role}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C9A66B]" />
                <span>
                  Published{' '}
                  <time dateTime={post.publishedIso}>{post.publishedDate}</time>
                </span>
              </div>

              {post.readingTime && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#C9A66B]" />
                  <span>{post.readingTime}</span>
                </div>
              )}

              {post.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#C9A66B]" />
                  <span>{post.location}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 hover:border-[#0B5E8E] text-xs font-bold text-[#0B5E8E] transition-colors cursor-pointer"
              >
                {copiedLink ? (
                  <Check className="w-3.5 h-3.5 text-[#3F6B3C]" />
                ) : (
                  <Share2 className="w-3.5 h-3.5 text-[#C9A66B]" />
                )}
                <span>{copiedLink ? 'Link Copied' : 'Share Article'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <figure className="rounded-3xl overflow-hidden border border-gray-200/80 shadow-sm bg-white">
          <img
            src={post.featuredImage.url}
            alt={post.featuredImage.alt}
            className="w-full h-[260px] sm:h-[400px] lg:h-[460px] object-cover"
          />
          {post.featuredImage.caption && (
            <figcaption className="px-5 py-3 text-xs text-gray-500 border-t border-gray-100">
              {post.featuredImage.caption}
            </figcaption>
          )}
        </figure>

        {/* Article Body Content */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-10 shadow-xs space-y-8">
          <BlogContentRenderer
            sections={post.sections}
            contentHtml={post.contentHtml}
          />

          {/* Tags & Contextual Internal Links */}
          <div className="pt-6 border-t border-gray-100 space-y-5">
            {post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">
                  Topics:
                </span>
                {post.tags.map((tag) => (
                  <span
                    key={tag.slug}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF9F6] border border-gray-200 text-xs text-gray-700 font-medium"
                  >
                    <Tag className="w-3 h-3 text-[#C9A66B]" />
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            <div className="bg-[#FAF9F6] rounded-2xl border border-gray-200/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C9A66B]">
                  Continue Planning Your Trip
                </span>
                <p className="text-xs sm:text-sm text-[#2F3A44] font-medium">
                  Explore handpicked stays, Victoria Falls experiences and local holiday itineraries.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <PageLink
                  href={sectionPath('travel-packages')}
                  className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:border-[#0B5E8E] text-xs font-bold text-[#0B5E8E] transition-colors"
                >
                  Holiday Packages
                </PageLink>
                <PageLink
                  href={sectionPath('accommodation')}
                  className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:border-[#0B5E8E] text-xs font-bold text-[#0B5E8E] transition-colors"
                >
                  Where to Stay
                </PageLink>
                <PageLink
                  href={sectionPath('travel-experiences')}
                  className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:border-[#0B5E8E] text-xs font-bold text-[#0B5E8E] transition-colors"
                >
                  Things to Do
                </PageLink>
              </div>
            </div>
          </div>
        </div>

        {/* Holiday Planning CTA + WhatsApp Specialist Enquiry */}
        <section className="rounded-3xl bg-gradient-to-r from-[#0D2833] via-[#0B5E8E] to-[#0D2833] text-white p-6 sm:p-10 shadow-lg space-y-5">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9A66B]/20 text-[#E5C989] text-xs font-bold uppercase tracking-wider border border-[#C9A66B]/30">
              <Compass className="w-3.5 h-3.5 text-[#C9A66B]" />
              <span>Local Victoria Falls Specialists</span>
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Ready to Plan Your Victoria Falls Holiday?
            </h2>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
              Speak directly with our Victoria Falls team for honest advice on accommodation, seasonal timing, transfers and tailored itineraries.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={onOpenPlanHoliday}
              className="bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Plan Your Holiday</span>
            </button>

            <a
              href={getWhatsAppSpecialistUrl(post.title)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <WhatsAppIcon className="w-4 h-4 shrink-0" />
              <span>WhatsApp a Travel Specialist</span>
            </a>
          </div>
        </section>

        {/* Compact Newsletter Subscription Section (Reused) */}
        <Newsletter
          compact
          headingOverride="Get Victoria Falls Travel Articles & Seasonal Updates"
        />

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section aria-label="Related articles" className="space-y-6 pt-2">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                Related Articles
              </h2>
              <PageLink
                href={sectionPath('blog')}
                onClick={onBackToBlog}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#0B5E8E] hover:text-[#E67E22] transition-colors"
              >
                <span>View All Articles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </PageLink>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((rel) => (
                <article
                  key={rel.slug}
                  className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <PageLink
                      href={blogPath(rel)}
                      onClick={() => onSelectPost(rel)}
                      className="block h-44 overflow-hidden bg-gray-100"
                    >
                      <img
                        src={rel.featuredImage.url}
                        alt={rel.featuredImage.alt}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </PageLink>
                    <div className="p-5 space-y-2">
                      <span className="text-[11px] font-bold text-[#8E713E]">
                        {rel.categories[0]?.name}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-[#0B5E8E] leading-snug">
                        <PageLink
                          href={blogPath(rel)}
                          onClick={() => onSelectPost(rel)}
                          className="hover:text-[#E67E22] transition-colors"
                        >
                          {rel.title}
                        </PageLink>
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {rel.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-4 pt-2 flex items-center justify-between text-xs text-gray-500">
                    <time dateTime={rel.publishedIso}>{rel.publishedDate}</time>
                    <PageLink
                      href={blogPath(rel)}
                      onClick={() => onSelectPost(rel)}
                      className="inline-flex items-center gap-1 font-bold text-[#0B5E8E] hover:text-[#E67E22]"
                    >
                      <span>Read More</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </PageLink>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
};
