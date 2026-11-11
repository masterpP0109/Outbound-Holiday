import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Search,
  Sparkles,
  Tag,
  X,
} from 'lucide-react';
import {
  getBlogCategories,
  getFeaturedBlogStories,
  getPublishedBlogPosts,
} from '../../data/blogData';
import { blogPath, sectionPath } from '../../routes';
import type { BlogCategory, BlogPost } from '../../types/blog';
import { Newsletter } from '../common/Newsletter';
import { PageLink } from '../common/PageLink';

interface BlogListingPageProps {
  onSelectPost: (post: BlogPost) => void;
  onNavigateHome: () => void;
  onOpenPlanHoliday: () => void;
  initialPosts?: BlogPost[];
  initialCategories?: BlogCategory[];
}

const POSTS_PER_PAGE = 6;

export const BlogListingPage: React.FC<BlogListingPageProps> = ({
  onSelectPost,
  onNavigateHome,
  onOpenPlanHoliday,
  initialPosts,
  initialCategories,
}) => {
  const posts = initialPosts ?? getPublishedBlogPosts();
  const categories = initialCategories ?? getBlogCategories();
  const featured = useMemo(() => getFeaturedBlogStories(posts), [posts]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const isFiltered = selectedCategory !== 'all' || normalizedQuery.length > 0;

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        post.categories.some((cat) => cat.slug === selectedCategory);
      if (!matchesCategory) return false;

      if (!normalizedQuery) return true;
      const haystack = [
        post.title,
        post.excerpt,
        post.location || '',
        ...post.categories.map((c) => c.name),
        ...post.tags.map((t) => t.name),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [posts, selectedCategory, normalizedQuery]);

  const featuredSlugs = useMemo(() => {
    const slugs = new Set<string>();
    if (featured.main) slugs.add(featured.main.slug);
    for (const item of featured.secondary) slugs.add(item.slug);
    return slugs;
  }, [featured]);

  const listCandidates = useMemo(() => {
    if (!isFiltered && featured.main) {
      return filteredPosts.filter((post) => !featuredSlugs.has(post.slug));
    }
    return filteredPosts;
  }, [filteredPosts, featured.main, featuredSlugs, isFiltered]);

  const totalPages = Math.max(
    1,
    Math.ceil(listCandidates.length / POSTS_PER_PAGE),
  );
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPosts = listCandidates.slice(
    (safePage - 1) * POSTS_PER_PAGE,
    safePage * POSTS_PER_PAGE,
  );

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A2E35]">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="bg-white border-b border-gray-200/80 py-2.5 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto flex items-center text-xs font-medium text-gray-500">
          <PageLink
            href={sectionPath('home')}
            onClick={onNavigateHome}
            className="hover:text-[#0B5E8E] transition-colors cursor-pointer"
          >
            Home
          </PageLink>
          <ChevronRight className="w-3.5 h-3.5 mx-2 text-gray-400 shrink-0" />
          <span className="text-[#0B5E8E] font-bold">Blog</span>
        </div>
      </nav>

      {/* Editorial Journal Header */}
      <header className="bg-[#0D2833] text-white py-12 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-[#C9A66B]/30">
        <div className="max-w-7xl mx-auto space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A66B]/20 text-[#E5C989] text-xs font-bold uppercase tracking-wider border border-[#C9A66B]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>Victoria Falls Travel Blog</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Victoria Falls Travel Journal
          </h1>
          <p className="text-sm sm:text-base text-gray-200 max-w-2xl leading-relaxed">
            Local stories, travel guides and inspiration to help you plan your next Victoria Falls adventure.
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-12">
        {/* Section 1: Featured Stories (1 Main + 2 Smaller Stories) */}
        {!isFiltered && featured.main && (
          <section aria-label="Featured stories" className="space-y-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#C9A66B] block mb-1">
                  Editor&apos;s Selection
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  Featured Stories
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Main Featured Article */}
              <article className="lg:col-span-7 bg-white rounded-3xl border border-gray-200/90 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                <div>
                  <div className="relative h-64 sm:h-80 overflow-hidden bg-gray-100">
                    <PageLink
                      href={blogPath(featured.main)}
                      onClick={() => onSelectPost(featured.main!)}
                      className="block w-full h-full"
                    >
                      <img
                        src={featured.main.featuredImage.url}
                        alt={featured.main.featuredImage.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </PageLink>
                    <span className="absolute top-4 left-4 bg-[#E67E22] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                      Main Featured Story
                    </span>
                  </div>

                  <div className="p-6 sm:p-8 space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {featured.main.categories.slice(0, 2).map((cat) => (
                        <span
                          key={cat.slug}
                          className="px-2.5 py-0.5 rounded-full bg-[#C9A66B]/15 text-[#8E713E] font-bold"
                        >
                          {cat.name}
                        </span>
                      ))}
                      {featured.main.readingTime && (
                        <span className="text-gray-500 flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-[#C9A66B]" />
                          {featured.main.readingTime}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E] leading-snug">
                      <PageLink
                        href={blogPath(featured.main)}
                        onClick={() => onSelectPost(featured.main!)}
                        className="hover:text-[#E67E22] transition-colors"
                      >
                        {featured.main.title}
                      </PageLink>
                    </h3>

                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed line-clamp-3">
                      {featured.main.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-6 sm:px-8 pb-6 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5 text-[#C9A66B]" />
                    <time dateTime={featured.main.publishedIso}>
                      {featured.main.publishedDate}
                    </time>
                    {featured.main.author?.name && (
                      <span>&bull; {featured.main.author.name}</span>
                    )}
                  </div>

                  <PageLink
                    href={blogPath(featured.main)}
                    onClick={() => onSelectPost(featured.main!)}
                    className="inline-flex items-center gap-1.5 bg-[#0B5E8E] hover:bg-[#08486e] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors"
                  >
                    <span>Read Story</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </PageLink>
                </div>
              </article>

              {/* Two Companion Featured Stories */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                {featured.secondary.map((story) => (
                  <article
                    key={story.slug}
                    className="flex-1 bg-white rounded-2xl border border-gray-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-[#C9A66B]/60 transition-all grid grid-cols-1 sm:grid-cols-12 group"
                  >
                    <PageLink
                      href={blogPath(story)}
                      onClick={() => onSelectPost(story)}
                      className="sm:col-span-5 h-44 sm:h-auto overflow-hidden bg-gray-100 block"
                    >
                      <img
                        src={story.featuredImage.url}
                        alt={story.featuredImage.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </PageLink>

                    <div className="sm:col-span-7 p-5 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="font-bold text-[#8E713E]">
                            {story.categories[0]?.name}
                          </span>
                          {story.readingTime && (
                            <span className="text-gray-400 shrink-0">
                              {story.readingTime}
                            </span>
                          )}
                        </div>

                        <h3 className="font-serif text-lg font-bold text-[#0B5E8E] leading-snug">
                          <PageLink
                            href={blogPath(story)}
                            onClick={() => onSelectPost(story)}
                            className="hover:text-[#E67E22] transition-colors"
                          >
                            {story.title}
                          </PageLink>
                        </h3>

                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                          {story.excerpt}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                        <time
                          dateTime={story.publishedIso}
                          className="text-gray-500"
                        >
                          {story.publishedDate}
                        </time>
                        <PageLink
                          href={blogPath(story)}
                          onClick={() => onSelectPost(story)}
                          className="inline-flex items-center gap-1 font-bold text-[#0B5E8E] hover:text-[#E67E22]"
                        >
                          <span>Read More</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </PageLink>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Section 2: Explore Our Articles (Search & Category Filtering) */}
        <section
          aria-label="Explore our articles"
          className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-7 shadow-xs space-y-5"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-gray-100 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#C9A66B] block mb-1">
                Browse by Topic
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0B5E8E]">
                Explore Our Articles
              </h2>
            </div>
            <p className="text-xs font-semibold text-gray-500">
              Showing {filteredPosts.length}{' '}
              {filteredPosts.length === 1 ? 'article' : 'articles'}
            </p>
          </div>

          <div className="relative max-w-xl">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search Victoria Falls articles, tips, stays or seasons..."
              aria-label="Search blog articles"
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-[#FAF9F6] text-sm text-[#1A2E35] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]/30 focus:border-[#0B5E8E]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                aria-label="Clear blog search"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Data-driven category buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleCategoryChange('all')}
              className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                selectedCategory === 'all'
                  ? 'bg-[#0B5E8E] text-white border-[#0B5E8E] shadow-xs'
                  : 'bg-[#FAF9F6] text-[#2F3A44] border-gray-200 hover:border-[#0B5E8E]/50'
              }`}
            >
              All Articles ({posts.length})
            </button>
            {categories.map((category) => (
              <button
                key={category.slug}
                type="button"
                onClick={() => handleCategoryChange(category.slug)}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                  selectedCategory === category.slug
                    ? 'bg-[#0B5E8E] text-white border-[#0B5E8E] shadow-xs'
                    : 'bg-[#FAF9F6] text-[#2F3A44] border-gray-200 hover:border-[#0B5E8E]/50'
                }`}
              >
                {category.name}
                {typeof category.count === 'number' ? ` (${category.count})` : ''}
              </button>
            ))}
          </div>
        </section>

        {/* Section 3: Latest Travel Stories (3-column uniform card grid + pagination) */}
        {paginatedPosts.length > 0 ? (
          <section aria-label="Latest travel stories" className="space-y-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#C9A66B] block mb-1">
                  Local Guides &amp; Practical Advice
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  {isFiltered ? 'Matching Travel Stories' : 'Latest Travel Stories'}
                </h2>
              </div>

              {isFiltered && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="text-xs font-bold text-[#0B5E8E] hover:text-[#E67E22] underline cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPosts.map((post) => (
                <article
                  key={post.slug}
                  className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-[#C9A66B]/60 transition-all flex flex-col justify-between h-full group"
                >
                  <div>
                    <PageLink
                      href={blogPath(post)}
                      onClick={() => onSelectPost(post)}
                      className="block h-52 overflow-hidden bg-gray-100"
                    >
                      <img
                        src={post.featuredImage.url}
                        alt={post.featuredImage.alt}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </PageLink>

                    <div className="p-5 sm:p-6 space-y-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {post.categories.map((cat) => (
                          <span
                            key={cat.slug}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF9F6] border border-gray-200 text-[#0B5E8E] text-[11px] font-bold"
                          >
                            <Tag className="w-3 h-3 text-[#C9A66B]" />
                            {cat.name}
                          </span>
                        ))}
                      </div>

                      <h3 className="font-serif text-xl font-bold text-[#0B5E8E] leading-snug">
                        <PageLink
                          href={blogPath(post)}
                          onClick={() => onSelectPost(post)}
                          className="hover:text-[#E67E22] transition-colors"
                        >
                          {post.title}
                        </PageLink>
                      </h3>

                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-gray-100 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Calendar className="w-3.5 h-3.5 text-[#C9A66B]" />
                      <time dateTime={post.publishedIso}>
                        {post.publishedDate}
                      </time>
                    </div>

                    <PageLink
                      href={blogPath(post)}
                      onClick={() => onSelectPost(post)}
                      className="inline-flex items-center gap-1 font-bold text-[#0B5E8E] hover:text-[#E67E22] transition-colors"
                    >
                      <span>Read More</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </PageLink>
                  </div>
                </article>
              ))}
            </div>

            {/* Simple Final Pagination Controls */}
            {totalPages > 1 && (
              <nav
                aria-label="Blog pagination"
                className="flex flex-wrap items-center justify-center gap-2 pt-2"
              >
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    safePage === 1
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-[#0B5E8E] border-gray-200 hover:border-[#0B5E8E]'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                  (pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setCurrentPage(pageNumber)}
                      aria-current={safePage === pageNumber ? 'page' : undefined}
                      className={`w-9 h-9 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        safePage === pageNumber
                          ? 'bg-[#0B5E8E] text-white border-[#0B5E8E]'
                          : 'bg-white text-[#2F3A44] border-gray-200 hover:border-[#0B5E8E]'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={safePage === totalPages}
                  className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    safePage === totalPages
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-[#0B5E8E] border-gray-200 hover:border-[#0B5E8E]'
                  }`}
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </nav>
            )}
          </section>
        ) : (
          <section className="bg-white rounded-3xl border border-gray-200/80 p-8 sm:p-12 text-center space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#0B5E8E]">
              {selectedCategory !== 'all' && !normalizedQuery
                ? 'Articles Coming Soon in This Category'
                : 'No Matching Articles Found'}
            </h2>
            <p className="text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
              {selectedCategory !== 'all' && !normalizedQuery
                ? 'New specialist posts for this category will appear here as soon as they are published from WordPress.'
                : 'Try clearing your search terms or switching back to all Victoria Falls travel categories.'}
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="bg-[#0B5E8E] hover:bg-[#08486e] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                View All Articles
              </button>
              <button
                type="button"
                onClick={onOpenPlanHoliday}
                className="bg-[#E67E22] hover:bg-[#d36e17] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Ask a Local Specialist
              </button>
            </div>
          </section>
        )}

        {/* Section 4: Victoria Falls Travel Club (Compact Newsletter Subscription) */}
        <Newsletter
          compact
          headingOverride="Get Victoria Falls Travel Guides & Seasonal Updates"
        />
      </div>
    </div>
  );
};
